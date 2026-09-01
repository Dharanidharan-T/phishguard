import React, { useState } from 'react';
import EmailAnalyzer from '../components/EmailAnalyzer';
import RiskResult from '../components/RiskResult';
import IndicatorsPanel from '../components/IndicatorsPanel';
import URLAnalysis from '../components/URLAnalysis';
import DomainAnalysis from '../components/DomainAnalysis';
import RecommendationCard from '../components/RecommendationCard';
import IncidentReport from '../components/IncidentReport';
import { analyzeEmail } from '../services/api';
import { ShieldAlert, Info } from 'lucide-react';

const Analyze = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeEmail(formData);
      setAnalysisResult(data);

      // Save to localStorage history
      const newScan = {
        id: Date.now(),
        sender: formData.sender,
        subject: formData.subject,
        score: data.risk_score,
        level: data.risk_level,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const existingScans = JSON.parse(localStorage.getItem('phishguard_scans') || '[]');
      const updatedScans = [newScan, ...existingScans.slice(0, 19)];
      localStorage.setItem('phishguard_scans', JSON.stringify(updatedScans));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#fff' }}>
          Interactive Email Investigation Console
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Submit an email header and body payload to execute hybrid AI + rule-based threat classification.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,42,109,0.15)', border: '1px solid var(--accent-crimson)', color: '#ff4d8d', padding: '14px 18px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} />
          <div>{error}</div>
        </div>
      )}

      <div className="analyze-grid">
        {/* LEFT COLUMN: Input Form */}
        <div>
          <EmailAnalyzer onAnalyze={handleAnalyze} isLoading={loading} />
        </div>

        {/* RIGHT COLUMN: Live Analysis Results */}
        <div>
          {!analysisResult && !loading && (
            <div className="panel-card" style={{ textStyle: 'center', padding: '60px 20px', textAlign: 'center' }}>
              <Info size={40} style={{ color: 'var(--accent-cyan)', opacity: 0.6, margin: '0 auto 14px' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>
                Ready for Analysis
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '360px', margin: '0 auto' }}>
                Enter email details on the left or click <strong>"Load Demo Phishing Email"</strong> to trigger real-time threat investigation.
              </p>
            </div>
          )}

          {loading && (
            <div className="panel-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>
                Executing Hybrid Threat Intelligence...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                Running TF-IDF Vectorizer, Rule Engine, URL Extraction, & Brand Impersonation Checks
              </p>
            </div>
          )}

          {analysisResult && !loading && (
            <div>
              {/* High-level Risk Score & Breakdown */}
              <RiskResult result={analysisResult} />

              {/* Recommendation Card */}
              <RecommendationCard
                level={analysisResult.risk_level}
                recommendation={analysisResult.recommendation}
              />

              {/* Triggered Indicators */}
              <IndicatorsPanel indicators={analysisResult.indicators} />

              {/* Domain Analysis & Brand Alert */}
              <DomainAnalysis
                senderAnalysis={analysisResult.sender_analysis}
                brandImpersonation={analysisResult.brand_impersonation}
              />

              {/* URL Analysis */}
              <URLAnalysis urls={analysisResult.url_analysis} />

              {/* Incident Report Generator */}
              <IncidentReport analysisResult={analysisResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;
