import React from 'react';
import { Flag, CheckCircle2 } from 'lucide-react';

const IndicatorsPanel = ({ indicators = [] }) => {
  return (
    <div className="panel-card" style={{ marginTop: '24px' }}>
      <div className="panel-header">
        <h3 className="panel-title">
          <Flag size={18} /> Flagged Threat Indicators ({indicators.length})
        </h3>
      </div>

      {indicators.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={32} style={{ color: 'var(--accent-green)', margin: '0 auto 8px' }} />
          <p>No rule-based threat indicators were triggered for this message.</p>
        </div>
      ) : (
        indicators.map((ind, idx) => (
          <div key={idx} className={`indicator-item sev-${ind.severity}`}>
            <div className="indicator-top">
              <span className="indicator-name">{ind.indicator}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Weight: +{ind.weight}
                </span>
                <span className={`sev-badge sev-${ind.severity}`}>
                  {ind.severity}
                </span>
              </div>
            </div>
            <p className="indicator-desc">{ind.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default IndicatorsPanel;
