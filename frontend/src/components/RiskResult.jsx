import React from 'react';
import RiskGauge from './RiskGauge';
import { HelpCircle, Brain, AlertOctagon, Link2, ShieldAlert } from 'lucide-react';

const RiskResult = ({ result }) => {
  if (!result) return null;

  const {
    risk_score,
    risk_level,
    ml_probability,
    summary,
    indicators = [],
    url_analysis = [],
    brand_impersonation = [],
    score_breakdown = {},
    explainability = {}
  } = result;

  const ml_percentage = Math.round(ml_probability * 100);
  const suspicious_urls_count = url_analysis.filter(u => u.suspicious).length;

  return (
    <div className="panel-card">
      <div className="panel-header">
        <h2 className="panel-title">
          <ShieldAlert size={20} /> Threat Analysis Assessment
        </h2>
        <span className="gauge-level-badge level-{risk_level}">
          {risk_level} THREAT
        </span>
      </div>

      {/* Risk Gauge */}
      <RiskGauge score={risk_score} level={risk_level} />

      {/* Summary */}
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', margin: '14px 0 20px' }}>
        {summary}
      </p>

      {/* Quick Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{ml_percentage}%</div>
          <div className="metric-label">ML Confidence</div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: indicators.length > 0 ? '#ffb703' : '#00ff9d' }}>
            {indicators.length}
          </div>
          <div className="metric-label">Indicators</div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: suspicious_urls_count > 0 ? '#ff2a6d' : '#00ff9d' }}>
            {suspicious_urls_count}
          </div>
          <div className="metric-label">Suspicious URLs</div>
        </div>

        <div className="metric-card">
          <div className="metric-value" style={{ color: brand_impersonation.length > 0 ? '#ff2a6d' : '#00ff9d' }}>
            {brand_impersonation.length}
          </div>
          <div className="metric-label">Brand Alert</div>
        </div>
      </div>

      {/* Hybrid Score Breakdown Bar */}
      <div className="breakdown-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Score Breakdown (Max 100):</span>
          <span>
            ML: <strong style={{ color: '#00f0ff' }}>{score_breakdown.machine_learning || 0}</strong> | 
            Rules: <strong style={{ color: '#ffb703' }}>{score_breakdown.rules || 0}</strong> | 
            URL/Domain: <strong style={{ color: '#ff2a6d' }}>{score_breakdown.url_domain || 0}</strong>
          </span>
        </div>
        <div className="breakdown-bar-container">
          <div className="bar-ml" style={{ width: `${(score_breakdown.machine_learning || 0)}%` }} />
          <div className="bar-rules" style={{ width: `${(score_breakdown.rules || 0)}%` }} />
          <div className="bar-url" style={{ width: `${(score_breakdown.url_domain || 0)}%` }} />
        </div>
      </div>

      {/* Explainability Section */}
      <div className="explain-card">
        <h3 className="explain-title">
          <HelpCircle size={18} /> Why was this email flagged?
        </h3>
        <div className="explain-list">
          <div className="explain-item">
            <Brain size={16} style={{ color: '#00f0ff', shrink: 0 }} />
            <div>
              <strong>ML Analysis:</strong> {explainability.ml_reason || 'ML vector evaluation complete.'}
            </div>
          </div>

          <div className="explain-item">
            <AlertOctagon size={16} style={{ color: '#ffb703', shrink: 0 }} />
            <div>
              <strong>Rule Engine:</strong> {explainability.rule_reason || 'Rule engine evaluation complete.'}
            </div>
          </div>

          <div className="explain-item">
            <ShieldAlert size={16} style={{ color: '#ff7043', shrink: 0 }} />
            <div>
              <strong>Domain Check:</strong> {explainability.domain_reason || 'Sender domain check complete.'}
            </div>
          </div>

          <div className="explain-item">
            <Link2 size={16} style={{ color: '#ff2a6d', shrink: 0 }} />
            <div>
              <strong>URL Inspection:</strong> {explainability.url_reason || 'URL structure check complete.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskResult;
