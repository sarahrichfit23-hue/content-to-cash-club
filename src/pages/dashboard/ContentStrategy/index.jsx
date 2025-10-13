export default function ContentStrategy() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>🧠 AI Content Strategy Engine</h2>
      <p>This tool helps you plan 30 days of content ideas using AI.</p>

      <button
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "8px",
          marginTop: "10px",
          cursor: "pointer",
        }}
      >
        Generate 30-Day Content Plan
      </button>

      <div style={{ marginTop: "20px" }}>
        <p>✨ Your AI content ideas will show up here...</p>
      </div>
    </div>
  );
}
