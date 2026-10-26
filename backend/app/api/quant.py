"""
Northgate AI Stock Predictor - Quant Lab & PRD Audit API Router
==============================================================
Exposes endpoints for:
1. Data Quality Audit Report (PRD Section 4)
2. Mathematical Foundations & Gradient Descent Verification (PRD Section 7)
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.data_pipeline import generate_data_quality_report
from app.services.math_foundations import verify_math_foundations

router = APIRouter(prefix="/quant", tags=["Quantitative Research & PRD Audit"])

@router.get("/data-quality-report")
def get_data_quality_report():
    """
    Returns the comprehensive Data Quality Audit Report covering the 10-stock PRD Universe,
    detailing raw vs cleaned rows, gap forward-fills, and outlier quarantining.
    Fulfills PRD Section 4 audit requirement.
    """
    try:
        return generate_data_quality_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate data audit: {str(e)}")

@router.get("/math-verify")
def get_math_verification():
    """
    Validates manual Gradient Descent linear regression against the analytical
    closed-form OLS solution (X^T X)^(-1) X^T y to mathematical tolerance.
    Fulfills PRD Section 7 first-principles mathematics requirement.
    """
    try:
        return verify_math_foundations()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Math verification failed: {str(e)}")
