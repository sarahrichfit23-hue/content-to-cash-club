// vite dev proxy fallback (mock)
app.post("/api/generate-plan", (req, res) => {
  res.json({
    summary: "Sample plan generated successfully!",
    days_plan: [],
    shopping_list: [],
    recipes: [],
  });
});
