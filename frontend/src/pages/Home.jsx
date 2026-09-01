import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, ArrowRight, FileSearch, Zap, Lock, Globe, FileText } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Zap size={14} /> Hybrid AI + Rule-Based Cybersecurity Engine
        </div>
        <h1 className="hero-title">
          Detect Phishing Before the Click
        </h1>
        <p className="hero-subtitle">
          AI-powered email investigation platform with explainable threat intelligence, hybrid risk scoring, and automated SOC incident reporting.
        </p>
        <div className="hero-cta">
          <Link to="/analyze" className="btn-primary">
            <FileSearch size={18} /> Analyze Email Now
          </Link>
          <Link to="/about" className="btn-secondary">
            View Architecture & How It Works <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* System Flow Diagram */}
      <section style={{ margin: '50px 0', background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: '14px', padding: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', textAlign: 'center', marginBottom: '24px', color: '#fff' }}>
          Hybrid Threat Investigation Architecture
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', textOverflow: 'ellipsis' }}>
          <div style={{ background: '#060a17', border: '1px solid var(--border-muted)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>Step 1</div>
            <div style={{ fontWeight: '700', margin: '6px 0', color: '#fff' }}>Email Input</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Raw email text & headers</div>
          </div>

          <div style={{ background: '#060a17', border: '1px solid var(--border-muted)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>Step 2</div>
            <div style={{ fontWeight: '700', margin: '6px 0', color: '#fff' }}>Security Engines</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>ML + Rules + Domain + Brand</div>
          </div>

          <div style={{ background: '#060a17', border: '1px solid var(--border-muted)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>Step 3</div>
            <div style={{ fontWeight: '700', margin: '6px 0', color: '#fff' }}>Hybrid Scoring</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>0-100 score + Risk Level</div>
          </div>

          <div style={{ background: '#060a17', border: '1px solid var(--border-muted)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>Step 4</div>
            <div style={{ fontWeight: '700', margin: '6px 0', color: '#fff' }}>Explainability & Report</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Detailed reasons & SOC PDF</div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', textAlign: 'center', margin: '40px 0 20px', color: '#fff' }}>
        Key Defense Capabilities
      </h2>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon"><Cpu size={24} /></div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>ML Email Classification</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Trained on the CEAS_08 phishing dataset using TF-IDF n-gram vectorization and Logistic Regression (99.5% accuracy).
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon"><Lock size={24} /></div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>Rule Engine</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Detects social engineering triggers, urgency language, credential requests, and financial scam hooks.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon"><Globe size={24} /></div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>URL & Domain Inspection</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Extracts links, checks for insecure HTTP, raw IP usage, Punycode spoofing, and domain homoglyph anomalies.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon"><ShieldCheck size={24} /></div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>Brand Impersonation</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Uses SequenceMatcher string similarity and Leetspeak normalization to catch lookalike domains (e.g. paypa1-login.com).
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon"><Zap size={24} /></div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>Explainable Risk Score</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Transparent 0-100 score contribution breakdown across Machine Learning (50%), Rules (30%), and Domain/URL (20%).
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon"><FileText size={24} /></div>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>Automated Incident Report</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Generates downloadable PDF-ready SOC incident investigation reports complete with IoCs and remediation steps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
