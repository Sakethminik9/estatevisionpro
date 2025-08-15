export default function Navbar() {
  return (
    <div className="card px-6 py-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold">EV</div>
        <h1 className="text-xl font-semibold">EstateVisionAI</h1>
      </div>
      <div className="text-sm text-brand-200">AI Real Estate Investing Dashboard</div>
    </div>
  );
}
