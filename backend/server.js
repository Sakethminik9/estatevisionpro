const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const chalk = require("chalk"); // for colored logs

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const STORE_PATH = path.join(DATA_DIR, "properties.json");
function loadStore() {
  if (!fs.existsSync(STORE_PATH)) return [];
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
function saveStore(props) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(props, null, 2));
}

let properties = loadStore();

// Ingest CSV
const upload = multer({ dest: UPLOADS_DIR });
app.post("/ingest", upload.single("file"), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on("data", (row) => {
      const num = (v) => (v === "" || v === undefined ? 0 : Number(v));
      results.push({
        address: row.address, city: row.city, state: row.state, zipcode: row.zipcode,
        price: num(row.price), beds: num(row.beds), baths: num(row.baths), sqft: num(row.sqft),
        lot_sqft: num(row.lot_sqft), year_built: num(row.year_built), property_type: row.property_type,
        taxes_annual: num(row.taxes_annual), insurance_annual: num(row.insurance_annual),
        hoa_monthly: num(row.hoa_monthly), vacancy_rate: num(row.vacancy_rate),
        maintenance_pct: num(row.maintenance_pct), management_pct: num(row.management_pct),
        rent_estimate: num(row.rent_estimate), other_income: num(row.other_income),
        tax_zone: row.tax_zone, zoning_code: row.zoning_code,
        code_violations: num(row.code_violations), foreclosure_flag: num(row.foreclosure_flag), lien_flag: num(row.lien_flag)
      });
    })
    .on("end", () => {
      properties = [...properties, ...results];
      saveStore(properties);
      res.json({ message: "Data ingested", count: results.length });
      fs.unlink(req.file.path, () => {});
    });
});

app.get("/properties", (req, res) => {
  res.json(properties);
});

app.get("/analyze", async (req, res) => {
  try {
    const aiRes = await fetch("http://localhost:8001/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(properties),
    });
    const data = await aiRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "AI service not reachable", details: String(err) });
  }
});

app.get("/forecast", async (req, res) => {
  try {
    const aiRes = await fetch("http://localhost:8001/forecast");
    const data = await aiRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "AI service not reachable", details: String(err) });
  }
});

app.get("/rank", async (req, res) => {
  try {
    const aiRes = await fetch("http://localhost:8001/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(properties),
    });
    const data = await aiRes.json();
    const ranked = [...data.results].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
    res.json({ results: ranked });
  } catch (err) {
    res.status(500).json({ error: "AI service not reachable", details: String(err) });
  }
});

app.get("/reports/daily.csv", async (req, res) => {
  try {
    const aiRes = await fetch("http://localhost:8001/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(properties),
    });
    const data = await aiRes.json();
    const ranked = [...data.results].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
    const cols = ["address","city","state","price","noi","cap_rate","coc","rrr","risk_score","ai_score","timeline_months","sqft","zoning_code"];
    const lines = [cols.join(",")].concat(ranked.map(r => cols.map(c => r[c]).join(",")));
    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=daily_report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "AI service not reachable", details: String(err) });
  }
});

// --- Auto Port Retry Logic ---
const PORT = process.env.PORT || 5000;

function startServer(port) {
  app.listen(port, () => {
    console.log(chalk.green.bold(`✅ Backend running at http://localhost:${port}`));
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      console.warn(chalk.yellow(`⚠️ Port ${port} in use, trying port ${nextPort}...`));
      startServer(nextPort);
    } else {
      throw err;
    }
  });
}

startServer(PORT);
