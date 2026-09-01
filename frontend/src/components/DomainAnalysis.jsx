import React from 'react';
import { Globe, ShieldAlert, Award } from 'lucide-react';

const DomainAnalysis = ({ senderAnalysis = {}, brandImpersonation = [] }) => {
  const { sender, domain, suspicious, reasons = [] } = senderAnalysis;

  return (
    <div className="panel-card" style={{ marginTop: '24px' }}>
      <div className="panel-header">
        <h3 className="panel-title">
          <Globe size={18} /> Domain Reputation & Brand Impersonation
        </h3>
      </div>

      {/* Sender Domain Card */}
      <div
        style={{
          background: '#060a17',
          border: `1px solid ${suspicious ? 'rgba(255,183,3,0.4)' : 'var(--border-muted)'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Sender Domain
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              {domain || 'Unknown Domain'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`sev-badge sev-${suspicious ? 'HIGH' : 'LOW'}`}>
              {suspicious ? 'SUSPICIOUS DOMAIN' : 'STANDARD DOMAIN'}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Sender Address: <code style={{ color: '#00f0ff' }}>{sender}</code>
        </div>

        {reasons.length > 0 && (
          <ul style={{ paddingLeft: '20px', marginTop: '8px', fontSize: '0.83rem' }}>
            {reasons.map((r, i) => (
              <li key={i} style={{ color: '#ffb703', marginTop: '4px' }}>
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Brand Impersonation Alert Cards */}
      {brandImpersonation.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-crimson)', margin: '14px 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} /> Brand Impersonation Detected!
          </h4>

          {brandImpersonation.map((brand, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,42,109,0.08)',
                border: '1px solid rgba(255,42,109,0.3)',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} style={{ color: 'var(--accent-crimson)' }} />
                  Target Brand: {brand.brand}
                </div>
                <span className="sev-badge sev-CRITICAL">
                  {Math.round(brand.similarity * 100)}% Similarity
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Official Domain: <code style={{ color: '#00ff9d' }}>{brand.official_domain}</code>
                <br />
                Spoofed/Detected Domain: <code style={{ color: '#ff2a6d' }}>{brand.detected_domain}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DomainAnalysis;
