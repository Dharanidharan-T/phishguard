import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const {
    total = 124,
    highRisk = 31,
    mediumRisk = 18,
    safe = 75,
    detectionRate = "99.5%"
  } = stats || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <span className="nav-status" style={{ fontSize: '0.85rem' }}>
          ML Model Accuracy Rate: <strong>{detectionRate}</strong>
        </span>
      </div>
      <div className="features-grid" style={{ marginTop: '10px', marginBottom: '30px' }}>
      <div className="feature-card">
        <div className="feature-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff' }}>
          <Activity size={24} />
        </div>
        <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', color: '#fff' }}>
          {total}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
          Total Emails Analyzed
        </div>
      </div>

      <div className="feature-card">
        <div className="feature-icon" style={{ background: 'rgba(255, 42, 109, 0.12)', color: '#ff2a6d' }}>
          <ShieldAlert size={24} />
        </div>
        <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', color: '#ff2a6d' }}>
          {highRisk}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
          High / Critical Threats
        </div>
      </div>

      <div className="feature-card">
        <div className="feature-icon" style={{ background: 'rgba(255, 183, 3, 0.12)', color: '#ffb703' }}>
          <AlertTriangle size={24} />
        </div>
        <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', color: '#ffb703' }}>
          {mediumRisk}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
          Medium Risk Warnings
        </div>
      </div>

      <div className="feature-card">
        <div className="feature-icon" style={{ background: 'rgba(0, 255, 157, 0.12)', color: '#00ff9d' }}>
          <ShieldCheck size={24} />
        </div>
        <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', color: '#00ff9d' }}>
          {safe}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
          Safe Legitimate Emails
        </div>
      </div>
    </div>
    </div>
  );
};

export default StatsCards;
