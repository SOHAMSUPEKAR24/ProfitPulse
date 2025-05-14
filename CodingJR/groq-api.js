async function getGroqSuggestions(revenue, expenses, profit) {
  try {
    const res = await fetch("http://localhost:3000/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revenue, expenses, profit })
    });

    const data = await res.json();
    return data.suggestions;
  } catch (err) {
    return "Server error while fetching suggestions.";
  }
}
