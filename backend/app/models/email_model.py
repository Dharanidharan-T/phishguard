from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EmailAnalysisRequest(BaseModel):
    sender: str = Field(..., example="security@paypa1-login.com")
    receiver: Optional[str] = Field("", example="employee@company.com")
    subject: str = Field(..., example="URGENT: Your PayPal Account Will Be Suspended")
    body: str = Field(..., example="Please verify your PayPal account immediately or it will be locked.")

class QuickEmailAnalysisRequest(BaseModel):
    sender: str = Field(..., example="Kaggle")
    subject: str = Field(..., example="New Badge Received")
    snippet: Optional[str] = Field("", example="Congratulations, you have received...")

class IndicatorModel(BaseModel):
    indicator: str
    description: str
    weight: int
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL

class QuickAnalysisResponse(BaseModel):
    risk_score: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    status: str      # SAFE, SUSPICIOUS, PHISHING
    ml_probability: float
    primary_reason: str
    indicators: List[IndicatorModel]


class SenderAnalysisResult(BaseModel):
    sender: str
    domain: str
    suspicious: bool
    reasons: List[str]

class URLAnalysisResult(BaseModel):
    url: str
    domain: str
    is_https: bool
    suspicious: bool
    reasons: List[str]

class BrandImpersonationResult(BaseModel):
    brand: str
    official_domain: str
    detected_domain: str
    similarity: float
    suspicious: bool

class ScoreBreakdown(BaseModel):
    machine_learning: float
    rules: float
    url_domain: float

class ExplainabilitySection(BaseModel):
    ml_reason: str
    rule_reason: str
    domain_reason: str
    url_reason: str

class AnalysisResponse(BaseModel):
    risk_score: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    ml_probability: float
    summary: str
    indicators: List[IndicatorModel]
    sender_analysis: SenderAnalysisResult
    url_analysis: List[URLAnalysisResult]
    brand_impersonation: List[BrandImpersonationResult]
    recommendation: str
    score_breakdown: ScoreBreakdown
    explainability: ExplainabilitySection

class IncidentReportResponse(BaseModel):
    report_id: str
    generated_at: str
    email_details: Dict[str, str]
    risk_assessment: Dict[str, Any]
    detected_indicators: List[IndicatorModel]
    url_analysis: List[URLAnalysisResult]
    domain_analysis: SenderAnalysisResult
    brand_impersonation: List[BrandImpersonationResult]
    iocs: Dict[str, List[str]]
    recommended_actions: List[str]
