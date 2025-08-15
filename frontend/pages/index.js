import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import PropertyTable from "../components/PropertyTable";
import RentChart from "../components/RentChart";
import UploadBar from "../components/UploadBar";
import { ingest, getProperties, analyze, forecast, rank, reportUrl } from "../services/api";

export default function Home() {
  const [file, setFile] = useState(null);
  const [propsRaw, setPropsRaw] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [forecastData, setForecastData] = useState({ points: [], total_growth_pct: 0 });

  const refreshProps = async () => {
    const data = await getProperties();
    setPropsRaw(data);
  };

  useEffect(() => {
    refreshProps();
    (async () => {
      const fc = await forecast();
      setForecastData(fc);
    })();
  }, []);

  const doIngest = async () => {
    if (!file) return alert("Choose a CSV first.");
    await ingest(file);
    await refreshProps();
    alert("Ingested!");
  };

  const doAnalyze = async () => {
    const res = await analyze();
    setAnalysis(res.results || []);
  };

  const doRank = async () => {
    const res = await rank();
    setAnalysis(res.results || []);
  };

  const totalProps = propsRaw.length;
  const avgPrice = totalProps
    ? Math.round(propsRaw.reduce((s, p) => s + Number(p.price || 0), 0) / totalProps)
    : 0;
  const avgBeds = totalProps
    ? (propsRaw.reduce((s, p) => s + Number(p.beds || 0), 0) / totalProps).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <div className="bg-purple-800 rounded-lg shadow-lg p-4 mt-4">
          <UploadBar onFile={(f) => setFile(f)} />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Properties" value={totalProps} />
          <StatCard label="Avg Price" value={`$${avgPrice.toLocaleString()}`} />
          <StatCard label="Avg Beds" value={avgBeds} />
          <StatCard
            label="12-mo Rent Growth"
            value={`${forecastData.total_growth_pct}%`}
            sub="Projected"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-purple-800 rounded-lg shadow-lg p-4">
            <RentChart points={forecastData.points} />
          </div>

          <div className="bg-purple-800 rounded-lg shadow-lg p-5 flex flex-col gap-3">
            <div className="text-sm text-purple-200 uppercase tracking-wide">Actions</div>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
              onClick={doIngest}
            >
              Ingest Data
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
              onClick={doAnalyze}
            >
              Analyze
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
              onClick={doRank}
            >
              Rank Deals
            </button>
            <a
              className="bg-purple-600 hover:bg-purple-700 text-center text-white font-semibold py-2 px-4 rounded"
              href={reportUrl()}
            >
              Download Daily Report (CSV)
            </a>
            <div className="text-xs text-purple-300 mt-2 leading-snug">
              Ingest merges your CSV into storage. Analyze computes NOI, Cap, CoC, RRR, Risk, and AI
              Score.
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm text-purple-200 mb-2">Property Underwriting</div>
          <div className="bg-purple-800 rounded-lg shadow-lg p-4">
            <PropertyTable rows={analysis.length ? analysis : propsRaw} />
          </div>
        </div>
      </div>
    </div>
  );
}
