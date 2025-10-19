export async function generatePlan(payload: any) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error(data?.error || "Unknown error");
  }
  return data;
}
