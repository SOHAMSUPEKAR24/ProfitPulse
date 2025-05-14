let pieChart, barChart;

function addExpense() {
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="Category" class="cat">
                   <input type="number" placeholder="Amount" class="amt">`;
  document.getElementById("expenses").appendChild(div);
}

async function analyze() {
  const revenue = parseFloat(document.getElementById("revenue").value);
  const cats = Array.from(document.getElementsByClassName("cat"));
  const amts = Array.from(document.getElementsByClassName("amt"));

  const expenses = cats.map((cat, i) => ({
    category: cat.value,
    amount: parseFloat(amts[i].value || 0)
  }));

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = revenue - totalExpenses;

  drawCharts(expenses, revenue, totalExpenses);
  document.getElementById("summary").innerText =
    `Profit/Loss: ₹${profit} (${profit >= 0 ? "Profit" : "Loss"})`;

  const suggestion = await getGroqSuggestions(revenue, expenses, profit);
  document.getElementById("suggestions").innerText = `💡 Suggestions: ${suggestion}`;
}

function drawCharts(expenses, revenue, totalExpenses) {
  const labels = expenses.map(e => e.category);
  const data = expenses.map(e => e.amount);

  // Destroy previous charts if they exist
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  // Pie chart
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: 'pie',
    data: {
      labels,
      datasets: [{ 
        data,
        backgroundColor: getColors(data.length)
      }]
    }
  });

  // Bar chart for Revenue vs Expenses
  barChart = new Chart(document.getElementById("barChart"), {
    type: 'bar',
    data: {
      labels: ['Revenue', 'Expenses'],
      datasets: [{
        label: 'Amount',
        data: [revenue, totalExpenses],
        backgroundColor: ['#4caf50', '#f44336']
      }]
    }
  });
}

// Helper function to generate color scheme for pie chart
function getColors(n) {
  const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#f77825', '#8e44ad'];
  return Array.from({ length: n }, (_, i) => colors[i % colors.length]);
}

// Fetch suggestions from Groq API
async function getGroqSuggestions(revenue, expenses, profit) {
  const response = await fetch('http://localhost:3000/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ revenue, expenses, profit })
  });
  
  const data = await response.json();
  return data.suggestions || "No suggestions available.";
}
