import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#050811', borderTop: '1px solid var(--border-glow)', padding: '24px 20px', marginTop: 'auto' }}>
      <div style={{ maxWdith: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <ShieldAlert size={18} style={{ color: 'var(--accent-cyan)' }} />
          <strong>PhishGuard AI Platform</strong> &copy; {new Date().getFullYear()} - Explainable Phishing Attack Investigation
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
          <Cpu size={14} /> Hybrid ML Engine v1.0.0 | CEAS_08 Dataset
        </div>
      </div>
    </footer>
  );
};

export default Footer;
