import re

LEETSPEAK_MAP = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '@': 'a',
    '$': 's',
    '!': 'i'
}

def clean_text(text: str) -> str:
    """
    Clean email subject and body text for TF-IDF vectorization:
    - Handle empty/NaN values safely
    - Lowercase
    - Replace multiple spaces/newlines with single space
    - Preserve security terms and general punctuation structure where helpful
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def normalize_leetspeak(domain_or_text: str) -> str:
    """
    Convert common leetspeak substitutions to standard characters
    for enhanced brand impersonation matching.
    """
    if not domain_or_text:
        return ""
    
    result = []
    for char in domain_or_text.lower():
        result.append(LEETSPEAK_MAP.get(char, char))
    
    return "".join(result)
