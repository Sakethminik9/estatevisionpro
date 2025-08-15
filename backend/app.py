from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

app = FastAPI(title="EstateVisionAI - AI Service")

class Property(BaseModel):
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    price: float = Field(..., gt=0)
    beds: Optional[int] = None
    baths: Optional[float] = None
    sqft: Optional[float] = None
    lot_sqft: Optional[float] = None
    year_built: Optional[int] = None
    property_type: Optional[str] = None
    taxes_annual: float = 0.0
    insurance_annual: float = 0.0
    hoa_monthly: float = 0.0
    vacancy_rate: float = 0.05
    maintenance_pct: float = 0.05   # as fraction of gross
    management_pct: float = 0.08    # as fraction of gross
    rent_estimate: float = 0.0
    other_income: float = 0.0
    tax_zone: Optional[str] = None
    zoning_code: Optional[str] = None
    code_violations: int = 0
    foreclosure_flag: int = 0
    lien_flag: int = 0

def calc_noi(p: Property) -> float:
    gross = p.rent_estimate * 12.0 + p.other_income
    vacancy_loss = gross * p.vacancy_rate
    operating = (
        p.taxes_annual +
        p.insurance_annual +
        p.hoa_monthly * 12.0 +
        gross * p.maintenance_pct +
        gross * p.management_pct
    )
    return float(gross - vacancy_loss - operating)

def calc_cap_rate(noi: float, price: float) -> float:
    if price <= 0:
        return 0.0
    return float(noi / price * 100.0)

def calc_coc(noi: float, price: float, down_payment_pct: float = 0.25, interest_rate: float = 0.065) -> float:
    dp = price * down_payment_pct
    loan = price - dp
    annual_debt_service = loan * interest_rate  # simple approximation
    annual_cashflow = noi - annual_debt_service
    return float(annual_cashflow / dp * 100.0) if dp > 0 else 0.0

def risk_score(p: Property) -> float:
    score = 0.0
    if p.code_violations > 0:
        score += 3
    if p.foreclosure_flag == 1:
        score += 4
    if p.lien_flag == 1:
        score += 3
    if p.year_built and p.year_built < 1990:
        score += 1
    if p.vacancy_rate and p.vacancy_rate > 0.07:
        score += 1
    return float(score)

def calc_rrr(coc: float, risk: float) -> float:
    base = 8.0
    adj = min(max(risk, 0.0), 10.0) * 0.5
    return float(base + adj - 0.10 * max(coc, 0.0))

def ai_score(cap_rate: float, coc: float, risk: float, rrr: float) -> float:
    return float(0.35*cap_rate + 0.45*coc - 0.4*risk - 0.15*rrr)

@app.post("/analyze")
def analyze(properties: List[Property]):
    out = []
    for p in properties:
        noi = calc_noi(p)
        cap = calc_cap_rate(noi, p.price)
        coc = calc_coc(noi, p.price)
        risk = risk_score(p)
        rrr = calc_rrr(coc, risk)
        score = ai_score(cap, coc, risk, rrr)
        timeline = 12 if risk <= 3 else 24
        out.append({
            **p.dict(),
            "noi": round(noi, 2),
            "cap_rate": round(cap, 2),
            "coc": round(coc, 2),
            "rrr": round(rrr, 2),
            "risk_score": round(risk, 2),
            "ai_score": round(score, 2),
            "timeline_months": timeline
        })
    return {"count": len(out), "results": out}

@app.get("/forecast")
def forecast():
    # simple synthetic macro and rent index projection for next 12 months
    today = pd.Timestamp.today().normalize() + pd.offsets.MonthBegin(1)
    dates = pd.date_range(today, periods=12, freq="MS")
    base = 100.0
    trend = np.linspace(0, 3.0, 12)  # ~3% over 12 months
    season = np.sin(np.linspace(0, 2*np.pi, 12)) * 0.3
    rent_idx = base + trend + season
    growth_pct = (rent_idx[-1] - rent_idx[0]) / rent_idx[0] * 100.0
    points = [{"date": str(d.date()), "rent_index": float(v)} for d, v in zip(dates, rent_idx)]
    return {"points": points, "total_growth_pct": round(float(growth_pct), 2)}
