# PhishGuard AI – Explainable Phishing Attack Investigation Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-99.5%25_Accuracy-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

> **Hackathon-Grade Cybersecurity Web Application** for analyzing suspicious emails, determining threat levels, and producing granular, explainable threat intelligence and automated SOC incident reports.

---

## 🎯 Problem Statement
Phishing attacks remain the leading entry vector for cyber breaches. Traditional email security solutions output binary predictions ("safe" or "phishing") without explainable context. Security analysts (SOC Tier 1/2) waste valuable time manually dissecting email headers, inspecting URLs, and analyzing typosquatted domains without transparent risk metrics.

## 🚀 Proposed Solution
**PhishGuard AI** provides an AI-powered, explainable threat investigation platform powered by a **Hybrid Detection Architecture**:
1. **Machine Learning Classifier** (99.5% F1 accuracy on CEAS_08 dataset)
2. **Transparent Rule Engine** (Urgency, credential harvesting, financial scams, threat language)
3. **URL & Domain Analysis Engine** (Insecure HTTP, IP-based links, Punycode, excessive subdomains)
4. **Brand Impersonation Detector** (`difflib.SequenceMatcher` + Leetspeak normalization)
5. **Hybrid Risk Scoring Engine** (0–100 score: 50% ML + 30% Rules + 20% Domain/URL)
6. **Automated Incident Report Generator** (Printable/Downloadable PDF SOC investigation reports)

---

## 📐 System Architecture & End-to-End Execution Flow

### Offline Training Pipeline (Run Once)
```
CEAS_08.csv
     │
     ▼
Data Preprocessing (subject + body text cleaning)
     │
     ▼
TF-IDF Vectorization (stop_words='english', max_features=30000, ngrams=(1,2))
     │
     ▼
Logistic Regression Classifier (class_weight='balanced')
     │
     ▼
Save Artifacts: [ model.pkl | vectorizer.pkl ]
```

### Runtime Analysis Pipeline (Per Request)
```
USER (Enters email details or clicks Demo Email)
     │
     ▼
React Frontend (Axios POST request to /api/analyze)
     │
     ▼
FastAPI Backend (Loads model.pkl & vectorizer.pkl on startup)
     │
     ├──► ML Classifier (predict_proba) ──────────────────────────┐
     │                                                            │
     └──► Security Analysis Engine ───────────────────────────────┼──► Hybrid Risk Scoring Engine
           ├── Rule Engine (Urgency, Credentials, Scams, Threat)  │    (50% ML, 30% Rules, 20% URL/Domain)
           ├── URL Analyzer (Regex, HTTP, IP, Punycode, Ext)      │                 │
           ├── Domain Analyzer (Hyphens, Length, Subdomains)      │                 ▼
           └── Brand Detector (SequenceMatcher + Leetspeak)──────┘          Risk Score (0 - 100)
                                                                                    │
                                                                                    ▼
                                                                Risk Classification (LOW / MEDIUM / HIGH / CRITICAL)
                                                                                    │
                                                                                    ▼
                                                                            Explainable Reasons
                                                                                    │
                                                                                    ▼
                                                                          Security Recommendation
                                                                                    │
                                                                                    ▼
                                                                           Incident Report
                                                                                    │
                                                                                    ▼
                                                                            Dashboard History
```

---

## 🛠️ Technology Stack

- **Frontend**: React.js 18, React Router v6, Axios, Lucide Icons, Vanilla CSS Design System (Dark Navy Cyber Theme)
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Machine Learning**: scikit-learn, TF-IDF Vectorizer, Logistic Regression, Pandas, NumPy, Joblib
- **Security & Text Processing**: Regex (`re`), `urllib.parse`, `difflib.SequenceMatcher`, Leetspeak Normalizer
- **Dataset**: `CEAS_08.csv` (39,000+ labeled email samples)

---

## ⚙️ Installation & Setup Guide

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Windows Activation:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Step 1: Train Model ONCE (Saves model.pkl and vectorizer.pkl)
python app/ml/train_model.py

# Step 2: Start FastAPI Server
uvicorn app.main:app --reload --port 8000
```

FastAPI server runs at: `http://localhost:8000`  
Swagger UI documentation: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start React Dev Server
npm start
```

React application runs at: `http://localhost:3000`

---

## 📊 Machine Learning Model Performance

Model trained on 80/20 train-test split of `CEAS_08.csv`:
- **Accuracy**: 99.53%
- **Precision**: 99.75%
- **Recall**: 99.40%
- **F1 Score**: 99.58%
- **Confusion Matrix**: `[[3451, 11], [26, 4343]]`

---

## 📬 Gmail Real-Time Threat Indicator (Chrome Extension Upgrade)

PhishGuard AI includes a Chrome Extension (Manifest V3) that injects dynamic threat indicator badges directly inside Gmail.

### 🌟 Badge Statuses
- 🟢 **SAFE**: Low risk score (0–29)
- 🟡 **SUSPICIOUS**: Medium risk score (30–59)
- 🔴 **PHISHING**: High/Critical risk score (60–100)
- ⚪ **SCANNING**: Analysis in progress
- ⚪ **OFFLINE**: Backend service unreachable

### 🚀 Quick Extension Setup

1. Ensure the FastAPI backend is running:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
2. Open Google Chrome and go to `chrome://extensions/`
3. Toggle **Developer mode** ON (top-right).
4. Click **Load unpacked** (top-left) and select the `phishguard-extension/` directory.
5. Open Gmail (`https://mail.google.com`).
6. Real-time threat badges automatically render next to visible inbox email rows!

---

## 🧪 Hackathon Demonstration Steps


1. Launch Frontend (`http://localhost:3000`) and Backend (`http://localhost:8000`).
2. Click **"Analyze"** in navigation bar.
3. Click **"Load Safe Email"** -> Click **"Analyze Email"**.
   - System outputs **LOW RISK** score.
4. Click **"Load Demo Phishing Email"** -> Click **"Analyze Email"**.
   - System outputs **CRITICAL/HIGH RISK** score (~92/100).
   - Displays **ML Confidence**: 84%.
   - Displays **Brand Impersonation**: Spoofed `paypa1-login.com` vs official `paypal.com` (78% SequenceMatcher similarity).
   - Displays **Urgency Indicators**: "immediately", "account suspended", "within 24 hours".
   - Displays **URL Threats**: Insecure HTTP link `http://paypa1-login.com/verify-account`.
5. Review **"Why was this email flagged?"** explainability section.
6. Click **"Generate Incident Report"** and **"Print / Download Report (PDF)"**.
7. Navigate to **"Dashboard"** to view real-time threat metrics and recent scan logs.
