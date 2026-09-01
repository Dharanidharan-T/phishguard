import uuid
from datetime import datetime
from typing import Dict, Any, List

def generate_incident_report_data(analysis_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates structured Incident Report data from an email analysis result.
    """
    report_id = f"INC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    # Extract IoCs
    sender = analysis_result.get("sender_analysis", {}).get("sender", "")
    sender_domain = analysis_result.get("sender_analysis", {}).get("domain", "")
    
    suspicious_urls = [
        u["url"] for u in analysis_result.get("url_analysis", []) 
        if u.get("suspicious")
    ]
    
    iocs = {
        "sender_domains": [sender_domain] if sender_domain else [],
        "suspicious_urls": suspicious_urls,
        "suspicious_email_addresses": [sender] if sender else []
    }

    # Recommended Actions based on risk level
    risk_level = analysis_result.get("risk_level", "LOW")
    actions = []

    if risk_level == "CRITICAL":
        actions = [
            "Do NOT interact with this email under any circumstances.",
            "Quarantine or delete the message from the email server immediately.",
            "Block the sender email address and domain at the email gateway.",
            "Block all extracted malicious URLs on corporate web filters and firewalls.",
            "Escalate incident to SOC Tier 2 / Incident Response Team.",
            "Audit logs for any user clicks or credential entries within the last 24 hours."
        ]
    elif risk_level == "HIGH":
        actions = [
            "Do not click any embedded links or download attachments.",
            "Report the email to your organization's IT Security / Phishing Desk.",
            "Verify the sender identity through an out-of-band communication channel (e.g., official phone number).",
            "Quarantine message pending security administrator review."
        ]
    elif risk_level == "MEDIUM":
        actions = [
            "Exercise heightened caution before taking action on this email.",
            "Do not enter passwords or sensitive credentials on any linked pages.",
            "Cross-check official domain names before proceeding."
        ]
    else:
        actions = [
            "No immediate malicious activity detected.",
            "Continue following standard organizational security awareness practices.",
            "Verify senders whenever unexpected requests or links are received."
        ]

    return {
        "report_id": report_id,
        "generated_at": timestamp,
        "email_details": {
            "sender": sender,
            "receiver": analysis_result.get("receiver", "Recipient"),
            "subject": analysis_result.get("subject", "(No Subject)")
        },
        "risk_assessment": {
            "risk_score": analysis_result.get("risk_score", 0),
            "risk_level": risk_level,
            "ml_probability": analysis_result.get("ml_probability", 0.0),
            "summary": analysis_result.get("summary", "")
        },
        "detected_indicators": analysis_result.get("indicators", []),
        "url_analysis": analysis_result.get("url_analysis", []),
        "domain_analysis": analysis_result.get("sender_analysis", {}),
        "brand_impersonation": analysis_result.get("brand_impersonation", []),
        "iocs": iocs,
        "recommended_actions": actions
    }
