export default function StatCard({ label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-brand-200">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-xs text-white/70 mt-1">{sub}</div>}
    </div>
  );
}
