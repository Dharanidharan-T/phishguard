import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

# Ensure app package is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.models.email_model import (
    EmailAnalysisRequest, 
    AnalysisResponse, 
    IncidentReportResponse,
    QuickEmailAnalysisRequest,
    QuickAnalysisResponse
)
from app.services.phishing_detector import PhishingDetector
from app.services.report_generator import generate_incident_report_data

app = FastAPI(
    title="PhishGuard AI - Phishing Attack Investigation API",
    description="Explainable Phishing Investigation Platform API using Hybrid ML + Rule Engine",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global PhishingDetector instance loaded once on backend startup
MODEL_PATH = os.path.join(CURRENT_DIR, "ml", "model.pkl")
VECTORIZER_PATH = os.path.join(CURRENT_DIR, "ml", "vectorizer.pkl")

print("[+] Initializing PhishGuard AI Backend Services...")
detector = PhishingDetector(MODEL_PATH, VECTORIZER_PATH)

@app.on_event("startup")
def startup_event():
    global detector
    if detector is None:
        detector = PhishingDetector(MODEL_PATH, VECTORIZER_PATH)

@app.get("/")
def read_root():
    return {"message": "PhishGuard AI API Running"}

@app.get("/health")
def health_check():
    model_loaded = detector is not None and detector.model is not None
    return {
        "status": "healthy",
        "service": "PhishGuard AI Backend",
        "model_loaded": model_loaded
    }

@app.post("/api/quick-analyze", response_model=QuickAnalysisResponse)
def quick_analyze_email_endpoint(payload: QuickEmailAnalysisRequest):
    if not detector:
        raise HTTPException(status_code=500, detail="Detector service not initialized")
    
    try:
        result = detector.analyze_quick_email(
            sender=payload.sender,
            subject=payload.subject,
            snippet=payload.snippet or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick analysis error: {str(e)}")

@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze_email_endpoint(payload: EmailAnalysisRequest):
    if not detector:
        raise HTTPException(status_code=500, detail="Detector service not initialized")
    
    try:
        result = detector.analyze_email(
            sender=payload.sender,
            receiver=payload.receiver or "",
            subject=payload.subject,
            body=payload.body
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.post("/api/generate-report", response_model=IncidentReportResponse)
def generate_report_endpoint(analysis_data: Dict[str, Any]):
    try:
        report_data = generate_incident_report_data(analysis_data)
        return report_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

