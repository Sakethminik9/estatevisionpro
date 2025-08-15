export default function UploadBar({ onFile }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <input type="file" accept=".csv" onChange={(e) => onFile(e.target.files?.[0] || null)} className="text-white" />
      <button className="btn-primary" onClick={() => onFile(null)}>Clear</button>
      <span className="text-sm text-brand-200">Upload CSV to ingest MLS/off‑market data</span>
    </div>
  );
}
