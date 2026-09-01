from difflib import SequenceMatcher
from typing import List, Dict, Any
from app.utils.text_utils import normalize_leetspeak

TARGET_BRANDS = {
    "paypal": "paypal.com",
    "google": "google.com",
    "microsoft": "microsoft.com",
    "amazon": "amazon.com",
    "apple": "apple.com",
    "netflix": "netflix.com",
    "facebook": "facebook.com",
    "instagram": "instagram.com",
    "linkedin": "linkedin.com",
    "dropbox": "dropbox.com",
    "dhl": "dhl.com",
    "fedex": "fedex.com"
}

def calculate_similarity(s1: str, s2: str) -> float:
    """
    Computes sequence similarity ratio using difflib.SequenceMatcher
    """
    return SequenceMatcher(None, s1, s2).ratio()

def detect_brand_impersonation(sender_domain: str, url_domains: List[str]) -> List[Dict[str, Any]]:
    """
    Detects brand impersonation using difflib.SequenceMatcher and Leetspeak normalization.
    Compares sender domain and extracted URL domains against official brand domains.
    """
    all_domains = set()
    if sender_domain:
        all_domains.add(sender_domain.lower())
    for d in url_domains:
        if d:
            all_domains.add(d.lower())

    results = []
    seen_matches = set()

    for brand_key, official_domain in TARGET_BRANDS.items():
        brand_name = brand_key.capitalize()

        for domain in all_domains:
            # Skip if it is the legitimate official domain or subdomain ending with official domain
            if domain == official_domain or domain.endswith("." + official_domain):
                continue

            # Normalize leetspeak numbers (e.g. paypa1-login.com -> paypal-login.com)
            normalized_domain = normalize_leetspeak(domain)

            # Check if brand keyword is in normalized domain, or compare similarity
            contains_brand = brand_key in normalized_domain
            similarity = calculate_similarity(official_domain, normalized_domain)

            # If brand keyword is present in non-official domain OR similarity >= 0.65
            if contains_brand or similarity >= 0.65:
                match_key = (brand_name, domain)
                if match_key not in seen_matches:
                    seen_matches.add(match_key)
                    
                    # Round similarity score
                    score = round(max(similarity, 0.78 if contains_brand else similarity), 2)
                    
                    results.append({
                        "brand": brand_name,
                        "official_domain": official_domain,
                        "detected_domain": domain,
                        "similarity": score,
                        "suspicious": True
                    })

    return results
