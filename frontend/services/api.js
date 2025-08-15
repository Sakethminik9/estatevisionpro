const API = "http://localhost:5001";

export async function ingest(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/ingest`, { method: "POST", body: fd });
  return res.json();
}
export async function getProperties() {
  const res = await fetch(`${API}/properties`);
  return res.json();
}
export async function analyze() {
  const res = await fetch(`${API}/analyze`);
  return res.json();
}
export async function forecast() {
  const res = await fetch(`${API}/forecast`);
  return res.json();
}
export async function rank() {
  const res = await fetch(`${API}/rank`);
  return res.json();
}
export function reportUrl() {
  return `${API}/reports/daily.csv`;
}
