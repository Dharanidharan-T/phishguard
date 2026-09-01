import re
from urllib.parse import urlparse
from typing import List, Dict, Any

URL_SHORTENERS = {
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly',
    'ow.ly', 'rb.gy', 'tiny.cc', 'rebrand.ly'
}

SUSPICIOUS_KEYWORDS = {
    'login', 'verify', 'secure', 'account', 'update', 'password',
    'signin', 'banking', 'confirm', 'auth', 'credential', 'wallet'
}

DANGEROUS_EXTENSIONS = {
    '.exe', '.scr', '.bat', '.js', '.vbs', '.ps1', '.zip', '.iso', '.cmd'
}

def extract_urls(text: str) -> List[str]:
    """
    Regex to extract URLs starting with http://, https://, or www.
    """
    if not text:
        return []
    
    pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    urls = re.findall(pattern, text)
    cleaned_urls = []
    for u in urls:
        u_strip = u.rstrip('.,);:]}')
        if u_strip and u_strip not in cleaned_urls:
            cleaned_urls.append(u_strip)
    return cleaned_urls

def analyze_urls(text: str) -> List[Dict[str, Any]]:
    """
    Extracts and performs complete security analysis on all URLs in the email body.
    Returns structured results per URL.
    """
    raw_urls = extract_urls(text)
    results = []

    for raw_url in raw_urls:
        full_url = raw_url
        if raw_url.startswith('www.'):
            full_url = 'http://' + raw_url

        try:
            parsed = urlparse(full_url)
            domain = parsed.netloc.lower()
            if ':' in domain:
                domain = domain.split(':')[0]
        except Exception:
            domain = raw_url

        reasons = []
        suspicious = False
        is_https = full_url.startswith('https://')

        # 1. HTTP vs HTTPS
        if not is_https:
            suspicious = True
            reasons.append("Insecure HTTP connection (lacks SSL encryption)")

        # 2. IP Address in URL
        ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
        if re.match(ip_pattern, domain):
            suspicious = True
            reasons.append("URL uses raw IP address instead of trusted domain")

        # 3. Very long URLs
        if len(full_url) > 75:
            suspicious = True
            reasons.append("Excessively long URL (often used to hide actual target)")

        # 4. Excessive subdomains
        if domain.count('.') > 3:
            suspicious = True
            reasons.append("Excessive subdomain levels (e.g. paypal.security.verify.attacker.com)")

        # 5. Suspicious keywords in domain or path
        found_kw = []
        url_lower = full_url.lower()
        for kw in SUSPICIOUS_KEYWORDS:
            if kw in url_lower:
                found_kw.append(kw)
        if found_kw:
            suspicious = True
            reasons.append(f"URL contains sensitive security keywords: {', '.join(found_kw[:3])}")

        # 6. URL shortener check
        if domain in URL_SHORTENERS:
            suspicious = True
            reasons.append(f"Uses known URL shortener ({domain}) to obscure true destination")

        # 7. Punycode check
        if 'xn--' in domain or 'xn--' in full_url.lower():
            suspicious = True
            reasons.append("Punycode detected (potential IDN homograph spoofing attack)")

        # 8. @ symbol inside URL
        if '@' in full_url:
            suspicious = True
            reasons.append("Contains '@' symbol (credential injection / domain obfuscation technique)")

        # 9. Multiple hyphens in domain
        if domain.count('-') > 1:
            suspicious = True
            reasons.append("Domain contains multiple hyphens (common in typosquatting)")

        # 10. Suspicious file extensions
        path_lower = parsed.path.lower()
        for ext in DANGEROUS_EXTENSIONS:
            if path_lower.endswith(ext):
                suspicious = True
                reasons.append(f"Direct link to dangerous file extension ({ext})")
                break

        results.append({
            "url": raw_url,
            "domain": domain,
            "is_https": is_https,
            "suspicious": suspicious,
            "reasons": reasons
        })

    return results
