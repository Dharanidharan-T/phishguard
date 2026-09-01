import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

const RecommendationCard = ({ level, recommendation }) => {
  const getIcon = (lvl) => {
    switch (lvl) {
      case 'CRITICAL': return <Zap size={22} style={{ color: 'var(--accent-crimson)' }} />;
      case 'HIGH': return <ShieldAlert size={22} style={{ color: '#ff7043' }} />;
      case 'MEDIUM': return <AlertTriangle size={22} style={{ color: 'var(--accent-amber)' }} />;
      default: return <ShieldCheck size={22} style={{ color: 'var(--accent-green)' }} />;
    }
  };

  return (
    <div
      className="panel-card"
      style={{
        marginTop: '24px',
        borderLeft: `4px solid ${
          level === 'CRITICAL' ? 'var(--accent-crimson)' :
          level === 'HIGH' ? '#ff7043' :
          level === 'MEDIUM' ? 'var(--accent-amber)' : 'var(--accent-green)'
        }`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        {getIcon(level)}
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff' }}>
          Recommended Defensive Action
        </h3>
      </div>
      <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
        {recommendation}
      </p>
    </div>
  );
};

export default RecommendationCard;
