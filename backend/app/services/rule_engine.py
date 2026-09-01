import re
from typing import List, Dict, Any

URGENCY_PATTERNS = [
    (r'\burgent\b', "Urgency Language", "Email contains urgent language pressuring recipient.", 10, "HIGH"),
    (r'\bimmediately\b', "Urgency Pressure", "Email attempts to pressure the recipient into acting immediately.", 10, "HIGH"),
    (r'\bact now\b', "Impulse Pressure", "Email demands immediate action without delay.", 10, "HIGH"),
    (r'\bwithin 24 hours\b', "Time Constraint", "Imposes strict deadline (within 24 hours) to induce panic.", 12, "HIGH"),
    (r'\baccount suspended\b', "Account Threat", "Threatens immediate account suspension.", 15, "CRITICAL"),
    (r'\baccount locked\b', "Account Lock Threat", "Claims recipient account has been locked.", 15, "CRITICAL"),
    (r'\bverify immediately\b', "Urgent Verification Request", "Demands instant account verification.", 12, "HIGH"),
    (r'\blimited time\b', "Artificial Scarcity", "Uses limited time pressure tactic.", 8, "MEDIUM"),
    (r'\bfinal warning\b', "Final Warning Threat", "Uses aggressive final warning language.", 15, "CRITICAL"),
    (r'\bsecurity alert\b', "Fake Security Alert", "Presents message as an urgent security alert.", 10, "HIGH"),
    (r'\bimportant notice\b', "Urgent Notice Flag", "Uses important notice keyword to draw urgency.", 6, "MEDIUM")
]

CREDENTIAL_PATTERNS = [
    (r'\bpassword\b', "Credential Solicitation", "Mentions or requests password credentials.", 12, "HIGH"),
    (r'\busername\b', "Username Request", "Mentions login usernames or credentials.", 8, "MEDIUM"),
    (r'\bverify your account\b', "Account Verification Request", "Directs recipient to verify account details.", 15, "CRITICAL"),
    (r'\bconfirm your identity\b', "Identity Confirmation", "Requests identity confirmation via external form.", 15, "CRITICAL"),
    (r'\botp\b', "OTP Solicitation", "Mentions One-Time Passwords (OTP).", 15, "CRITICAL"),
    (r'\bpin\b', "PIN Request", "Requests sensitive PIN numbers.", 15, "CRITICAL"),
    (r'\bcredit card\b', "Financial Data Solicitation", "Requests or references credit card details.", 15, "CRITICAL"),
    (r'\bbank account\b', "Banking Details Request", "Requests bank account information.", 15, "CRITICAL"),
    (r'\bssn\b', "Social Security Number Request", "Requests SSN or national identity numbers.", 20, "CRITICAL")
]

FINANCIAL_PATTERNS = [
    (r'\bwinner\b', "Lottery / Winner Scam", "Claims recipient is a winner or selected for prize.", 12, "HIGH"),
    (r'\blottery\b', "Lottery Scam", "References unverified lottery claims.", 15, "HIGH"),
    (r'\bclaim prize\b', "Prize Claim Hook", "Encourages claiming an unexpected prize.", 12, "HIGH"),
    (r'\bfree gift\b', "Free Gift Bait", "Offers free gift as social engineering lure.", 10, "MEDIUM"),
    (r'\brefund\b', "Refund Scam Lure", "Mentions unexpected refund process.", 12, "HIGH"),
    (r'\bpayment required\b', "Urgent Payment Demand", "Demands immediate payment.", 12, "HIGH"),
    (r'\bbank transfer\b', "Wire Transfer Request", "Requests wire or bank transfers.", 15, "CRITICAL"),
    (r'\binheritance\b', "Advance-Fee Scam", "References large inheritance payouts.", 18, "CRITICAL"),
    (r'\bmillion dollars\b', "High Value Money Lure", "Promises millions of dollars.", 18, "CRITICAL"),
    (r'\breward\b', "Reward Incentive Lure", "Offers monetary or gift reward.", 8, "MEDIUM")
]

THREAT_PATTERNS = [
    (r'\bsuspended\b', "Suspension Threat", "Email threatens account suspension.", 12, "HIGH"),
    (r'\bblocked\b', "Access Block Threat", "Claims account or access will be blocked.", 10, "HIGH"),
    (r'\bterminated\b', "Account Termination", "Threatens account or service termination.", 12, "HIGH"),
    (r'\blegal action\b', "Legal Action Threat", "Threatens recipient with legal action.", 15, "CRITICAL"),
    (r'\bunauthorized access\b', "Fake Breach Alert", "Claims unauthorized access was detected.", 12, "HIGH"),
    (r'\baccount disabled\b', "Account Disabled Threat", "Claims account is disabled.", 12, "HIGH")
]

def analyze_rules(subject: str, body: str) -> List[Dict[str, Any]]:
    """
    Executes rule-based checks on subject and body text.
    Returns list of triggered indicator dictionaries.
    """
    combined = f"{subject} {body}".lower()
    triggered_indicators = []
    seen_indicators = set()

    all_rule_groups = [
        URGENCY_PATTERNS,
        CREDENTIAL_PATTERNS,
        FINANCIAL_PATTERNS,
        THREAT_PATTERNS
    ]

    for group in all_rule_groups:
        for pattern, name, desc, weight, severity in group:
            if re.search(pattern, combined):
                if name not in seen_indicators:
                    seen_indicators.add(name)
                    triggered_indicators.append({
                        "indicator": name,
                        "description": desc,
                        "weight": weight,
                        "severity": severity
                    })

    return triggered_indicators
