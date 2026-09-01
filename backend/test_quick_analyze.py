import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.services.phishing_detector import PhishingDetector

def run_tests():
    model_path = os.path.join(CURRENT_DIR, "app", "ml", "model.pkl")
    vectorizer_path = os.path.join(CURRENT_DIR, "app", "ml", "vectorizer.pkl")
    
    print("[+] Loading PhishingDetector...")
    detector = PhishingDetector(model_path, vectorizer_path)
    
    test_cases = [
        {
            "name": "TEST 1 – SAFE",
            "sender": "professor@university.example",
            "subject": "Project Review Meeting Tomorrow",
            "snippet": "The project review meeting is scheduled tomorrow at 10:30 AM in Lab 3.",
            "expected_status": "SAFE"
        },
        {
            "name": "TEST 2 – PHISHING",
            "sender": "security@paypa1-login.example",
            "subject": "URGENT: Your PayPal Account Has Been Suspended",
            "snippet": "Verify your identity immediately within 24 hours to prevent permanent suspension.",
            "expected_status": "PHISHING"
        },
        {
            "name": "TEST 3 – REWARD SCAM",
            "sender": "rewards@amaz0n-prize.example",
            "subject": "Congratulations! You Have Won a Reward",
            "snippet": "Claim your reward immediately before this offer expires.",
            "expected_status": ["PHISHING", "SUSPICIOUS"]
        },
        {
            "name": "TEST 4 – NORMAL JOB ALERT",
            "sender": "jobs@company.example",
            "subject": "New Software Developer Job Openings",
            "snippet": "New job opportunities matching your saved preferences are available.",
            "expected_status": "SAFE"
        }
    ]

    all_passed = True
    for test in test_cases:
        res = detector.analyze_quick_email(
            sender=test["sender"],
            subject=test["subject"],
            snippet=test["snippet"]
        )
        print(f"\n--- {test['name']} ---")
        print(f"Risk Score: {res['risk_score']} | Risk Level: {res['risk_level']} | Status: {res['status']}")
        print(f"Primary Reason: {res['primary_reason']}")
        print(f"Indicators: {res['indicators']}")
        
        expected = test["expected_status"]
        passed = (res['status'] in expected) if isinstance(expected, list) else (res['status'] == expected)
        if passed:
            print("=> PASS")
        else:
            print(f"=> FAIL (Expected {expected}, got {res['status']})")
            all_passed = False

    if all_passed:
        print("\nALL QUICK ANALYSIS BACKEND TESTS PASSED SUCCESSFULLY!")
    else:
        print("\nSOME TESTS FAILED!")

if __name__ == "__main__":
    run_tests()
