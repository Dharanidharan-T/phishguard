import re
from typing import Dict, Any

SUSPICIOUS_DOMAIN_KEYWORDS = [
    'login', 'verify', 'update', 'secure', 'account', 'support',
    'security', 'service', 'billing', 'auth', 'portal', 'alert'
]

def extract_domain(email_str: str) -> str:
    """
    Extracts domain from email string e.g. "Security Team <security@paypa1-login.com>" -> "paypa1-login.com"
    """
    if not email_str:
        return ""
    
    match = re.search(r'[\w\.-]+@([\w\.-]+)', email_str)
    if match:
        return match.group(1).lower()
    
    # If standard email format wasn't matched, try basic strip
    email_clean = email_str.strip().lower()
    if '@' in email_clean:
        return email_clean.split('@')[-1]
    
    return email_clean

def analyze_domain(sender_email: str) -> Dict[str, Any]:
    """
    Analyzes sender email address and domain structure for phishing risk indicators.
    """
    domain = extract_domain(sender_email)
    reasons = []
    suspicious = False

    if not domain:
        return {
            "sender": sender_email,
            "domain": "",
            "suspicious": True,
            "reasons": ["Invalid or missing sender email address"]
        }

    # 1. Hyphen count
    hyphen_count = domain.count('-')
    if hyphen_count >= 2:
        suspicious = True
        reasons.append(f"Domain contains multiple hyphens ({hyphen_count} hyphens)")

    # 2. Leetspeak / Numbers replacing letters
    # E.g. paypa1, micr0soft, g00gle
    if re.search(r'[a-z][0-9][a-z]', domain) or re.search(r'0|1|3|5', domain):
        # Exclude legitimate numeric domains if needed, but flag potential homoglyph substitution
        suspicious = True
        reasons.append("Domain contains numbers substituting letters (potential homoglyph spoofing)")

    # 3. Suspicious keywords in domain name
    found_keywords = [kw for kw in SUSPICIOUS_DOMAIN_KEYWORDS if kw in domain]
    if found_keywords:
        suspicious = True
        reasons.append(f"Domain contains suspicious security/action keywords: {', '.join(found_keywords)}")

    # 4. Domain length check
    domain_name = domain.split('.')[0] if '.' in domain else domain
    if len(domain_name) > 25:
        suspicious = True
        reasons.append("Unusually long domain name (common in deceptive phishing domains)")

    # 5. Unusual subdomains count
    subdomain_count = domain.count('.')
    if subdomain_count >= 3:
        suspicious = True
        reasons.append(f"Unusual number of subdomain levels ({subdomain_count})")

    return {
        "sender": sender_email,
        "domain": domain,
        "suspicious": suspicious,
        "reasons": reasons
    }
