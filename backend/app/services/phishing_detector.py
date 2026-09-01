import os
import joblib
from typing import Dict, Any, Tuple
from app.utils.text_utils import clean_text
from app.services.rule_engine import analyze_rules
from app.services.url_analyzer import analyze_urls
from app.services.domain_analyzer import analyze_domain
from app.services.brand_detector import detect_brand_impersonation

class PhishingDetector:
    def __init__(self, model_path: str, vectorizer_path: str):
        self.model_path = model_path
        self.vectorizer_path = vectorizer_path
        self.model = None
        self.vectorizer = None
        self.load_artifacts()

    def load_artifacts(self):
        """
        Loads pre-trained model.pkl and vectorizer.pkl artifacts.
        Never trains model during runtime!
        """
        if not os.path.exists(self.model_path) or not os.path.exists(self.vectorizer_path):
            print(f"[!] Warning: Model artifacts not found at {self.model_path} / {self.vectorizer_path}")
            return
        
        try:
            self.model = joblib.load(self.model_path)
            self.vectorizer = joblib.load(self.vectorizer_path)
            print("[+] Phishing ML model & vectorizer loaded successfully into memory.")
        except Exception as e:
            print(f"[!] Error loading model artifacts: {e}")

    def predict_ml(self, subject: str, body: str) -> float:
        """
        Predicts phishing probability between 0.0 and 1.0 using TF-IDF + LogisticRegression.
        """
        if not self.model or not self.vectorizer:
            # Fallback heuristic if model file is missing
            combined_raw = f"{subject} {body}".lower()
            if any(w in combined_raw for w in ["paypal", "verify", "suspended", "urgent", "login"]):
                return 0.85
            return 0.15

        cleaned = clean_text(f"{subject} {body}")
        tfidf_features = self.vectorizer.transform([cleaned])
        
        # predict_proba returns [[prob_class_0, prob_class_1]]
        probs = self.model.predict_proba(tfidf_features)[0]
        phishing_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        return round(phishing_prob, 4)

    def analyze_email(self, sender: str, receiver: str, subject: str, body: str) -> Dict[str, Any]:
        """
        Orchestrates full hybrid phishing analysis across ML, Rules, URLs, Domain & Brand Impersonation.
        """
        # 1. ML Classifier Prediction (50% max score)
        ml_prob = self.predict_ml(subject, body)
        ml_score = round(ml_prob * 50, 1)

        # 2. Rule Engine Checks (30% max score)
        indicators = analyze_rules(subject, body)
        total_rule_weight = sum(ind["weight"] for ind in indicators)
        rule_score = min(30.0, round(total_rule_weight * 0.8, 1))

        # 3. URL Analysis
        url_results = analyze_urls(body)
        suspicious_urls_count = sum(1 for u in url_results if u["suspicious"])
        url_domains = [u["domain"] for u in url_results if u.get("domain")]

        # 4. Sender Domain Analysis
        domain_result = analyze_domain(sender)

        # 5. Brand Impersonation Detection
        brand_results = detect_brand_impersonation(domain_result.get("domain", ""), url_domains)

        # 6. URL/Domain Score Calculation (20% max score)
        url_domain_pts = 0.0
        if domain_result.get("suspicious"):
            url_domain_pts += 7.0
        if suspicious_urls_count > 0:
            url_domain_pts += min(8.0, suspicious_urls_count * 4.0)
        if brand_results:
            url_domain_pts += 10.0
        url_domain_score = min(20.0, round(url_domain_pts, 1))

        # 7. Final Hybrid Risk Score (0 - 100)
        final_raw_score = ml_score + rule_score + url_domain_score
        final_risk_score = int(min(100, max(0, round(final_raw_score))))

        # 8. Risk Level Thresholds
        if final_risk_score >= 80:
            risk_level = "CRITICAL"
            summary = "Critical threat: Highly confident phishing attempt with active social engineering and suspicious domain/URL indicators."
            recommendation = "Do not interact with this email. Quarantine the message immediately, block the sender/domain, and escalate it to the security team."
        elif final_risk_score >= 60:
            risk_level = "HIGH"
            summary = "High threat: Multiple suspicious phishing indicators and elevated ML probability flagged."
            recommendation = "Do not click links or download attachments. Verify the sender and report the message to your security team."
        elif final_risk_score >= 30:
            risk_level = "MEDIUM"
            summary = "Medium threat: Email contains suspicious language or questionable URL patterns that warrant caution."
            recommendation = "Treat this email with caution. Verify the sender using an independent communication channel before clicking links."
        else:
            risk_level = "LOW"
            summary = "Low threat: No significant phishing signals or malicious indicators detected."
            recommendation = "No major phishing indicators were detected. Continue normal security practices."

        # 9. Explainability Reasons
        ml_percentage = int(ml_prob * 100)
        ml_reason = (
            f"The email text pattern exhibits a {ml_percentage}% machine learning probability match with known phishing campaigns in the dataset."
            if ml_prob >= 0.50 else
            f"The email language pattern aligns closely with legitimate communication ({100 - ml_percentage}% safe confidence)."
        )

        rule_reason = (
            f"{len(indicators)} social-engineering and urgency indicator(s) were flagged by the rule engine."
            if indicators else
            "No aggressive urgency, credential requests, or financial scam keywords were detected."
        )

        domain_reason = (
            f"Sender domain '{domain_result.get('domain')}' triggered {len(domain_result.get('reasons', []))} security anomaly flags."
            if domain_result.get("suspicious") else
            f"Sender domain '{domain_result.get('domain')}' appears standard with no character anomaly flags."
        )

        url_reason = (
            f"{suspicious_urls_count} suspicious link(s) were extracted from the body with security risks."
            if suspicious_urls_count > 0 else
            "No insecure (HTTP) or deceptive link structures were found."
        )

        return {
            "risk_score": final_risk_score,
            "risk_level": risk_level,
            "ml_probability": ml_prob,
            "summary": summary,
            "indicators": indicators,
            "sender_analysis": domain_result,
            "url_analysis": url_results,
            "brand_impersonation": brand_results,
            "recommendation": recommendation,
            "score_breakdown": {
                "machine_learning": ml_score,
                "rules": rule_score,
                "url_domain": url_domain_score
            },
            "explainability": {
                "ml_reason": ml_reason,
                "rule_reason": rule_reason,
                "domain_reason": domain_reason,
                "url_reason": url_reason
            },
            "receiver": receiver,
            "subject": subject
        }

    def analyze_quick_email(self, sender: str, subject: str, snippet: str = "") -> Dict[str, Any]:
        """
        Lightweight fast analysis for Gmail inbox badge indicators.
        Reuses core ML, rule engine, domain, URL, and brand detection logic.
        """
        text_content = f"{subject} {snippet}".strip()

        # 1. ML Classifier Prediction
        ml_prob = self.predict_ml(subject, snippet or "")
        ml_score = round(ml_prob * 50, 1)

        # 2. Rule Engine Checks
        indicators = analyze_rules(subject, snippet or "")
        total_rule_weight = sum(ind["weight"] for ind in indicators)
        rule_score = min(30.0, round(total_rule_weight * 0.8, 1))

        # 3. Domain Analysis
        domain_result = analyze_domain(sender) if sender else {"domain": "", "suspicious": False, "reasons": []}

        # 4. URL Analysis (only if URLs present in snippet)
        url_results = []
        if snippet and any(token in snippet.lower() for token in ["http://", "https://", "www.", ".com/", ".net/", ".org/", ".xyz/"]):
            url_results = analyze_urls(snippet)
        
        suspicious_urls_count = sum(1 for u in url_results if u.get("suspicious"))
        url_domains = [u["domain"] for u in url_results if u.get("domain")]

        # 5. Brand Impersonation
        brand_results = detect_brand_impersonation(domain_result.get("domain", ""), url_domains)

        # 6. URL/Domain Score Calculation
        url_domain_pts = 0.0
        if domain_result.get("suspicious"):
            url_domain_pts += 7.0
        if suspicious_urls_count > 0:
            url_domain_pts += min(8.0, suspicious_urls_count * 4.0)
        if brand_results:
            url_domain_pts += 10.0
        url_domain_score = min(20.0, round(url_domain_pts, 1))

        # 7. Final Risk Score & Levels
        final_raw_score = ml_score + rule_score + url_domain_score
        final_risk_score = int(min(100, max(0, round(final_raw_score))))

        if final_risk_score >= 80:
            risk_level = "CRITICAL"
            status = "PHISHING"
        elif final_risk_score >= 60:
            risk_level = "HIGH"
            status = "PHISHING"
        elif final_risk_score >= 30:
            risk_level = "MEDIUM"
            status = "SUSPICIOUS"
        else:
            risk_level = "LOW"
            status = "SAFE"

        # 8. Determine Primary Reason
        if brand_results:
            primary_reason = f"Potential brand impersonation detected ({brand_results[0]['brand']})."
        elif domain_result.get("suspicious"):
            reasons = domain_result.get("reasons", [])
            primary_reason = f"Suspicious sender domain: {reasons[0]}" if reasons else "Suspicious sender domain detected."
        elif indicators:
            primary_reason = f"Flagged indicator: {indicators[0]['description']}"
        elif suspicious_urls_count > 0:
            primary_reason = f"Contains {suspicious_urls_count} suspicious link(s)."
        elif ml_prob >= 0.60:
            primary_reason = f"High ML threat probability ({int(ml_prob * 100)}%)."
        else:
            primary_reason = "No strong phishing indicators detected."

        return {
            "risk_score": final_risk_score,
            "risk_level": risk_level,
            "status": status,
            "ml_probability": ml_prob,
            "primary_reason": primary_reason,
            "indicators": indicators
        }

