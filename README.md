# EstateVisionAI

Full-stack dynamic website for AI-powered real estate investing.

## Stack
- **Frontend:** Next.js + TailwindCSS (purple theme, charts & cards)
- **Backend:** Node.js (Express) for ingestion, storage, and proxying AI calls
- **AI Service:** Python FastAPI for underwriting (NOI, Cap Rate, CoC, RRR), risk scoring, ranking, and rent forecast

## Quick Start

### 1) Start AI Service (Python 3.9+)
```bash
cd ai_service
python -m venv .venv && source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### 2) Start Backend (Node 18+)
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`

### 3) Start Frontend (Node 18+)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

## CSV Schema
```
address,city,state,zipcode,price,beds,baths,sqft,lot_sqft,year_built,property_type,taxes_annual,insurance_annual,hoa_monthly,vacancy_rate,maintenance_pct,management_pct,rent_estimate,other_income,tax_zone,zoning_code,code_violations,foreclosure_flag,lien_flag
```

## How It Works
1. Upload CSV on the dashboard (top bar).
2. Backend ingests and stores properties (JSON file under `backend/data/properties.json`).
3. Click **Analyze** to call the AI service:
   - Computes NOI, Cap Rate, Cash-on-Cash, RRR, Risk score, AI score, timeline
4. **Forecast** renders a 12-month rent index projection chart.
5. **Rank** sorts deals by AI score and enables CSV report download.
