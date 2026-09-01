import React from 'react';
import { Link2, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

const URLAnalysis = ({ urls = [] }) => {
  return (
    <div className="panel-card" style={{ marginTop: '24px' }}>
      <div className="panel-header">
        <h3 className="panel-title">
          <Link2 size={18} /> URL Security Analysis ({urls.length})
        </h3>
      </div>

      {urls.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldCheck size={32} style={{ color: 'var(--accent-green)', margin: '0 auto 8px' }} />
          <p>No embedded URLs found in the email body text.</p>
        </div>
      ) : (
        urls.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#060a17',
              border: `1px solid ${item.suspicious ? 'rgba(255,42,109,0.3)' : 'var(--border-muted)'}`,
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {item.suspicious ? (
                  <AlertTriangle size={16} style={{ color: 'var(--accent-crimson)', shrink: 0 }} />
                ) : (
                  <ShieldCheck size={16} style={{ color: 'var(--accent-green)', shrink: 0 }} />
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    color: item.suspicious ? '#ff4d8d' : '#00ff9d',
                    wordBreak: 'break-all'
                  }}
                >
                  {item.url}
                </span>
              </div>
              <ExternalLink size={14} style={{ color: 'var(--text-dim)', shrink: 0 }} />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Domain: <code style={{ color: '#00f0ff' }}>{item.domain}</code> | SSL: {item.is_https ? 'HTTPS (Encrypted)' : 'Insecure HTTP'}
            </div>

            {item.reasons && item.reasons.length > 0 && (
              <ul style={{ paddingLeft: '20px', fontSize: '0.83rem', color: '#cbd5e1' }}>
                {item.reasons.map((r, rIdx) => (
                  <li key={rIdx} style={{ color: '#ff4d8d', marginTop: '4px' }}>
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default URLAnalysis;
