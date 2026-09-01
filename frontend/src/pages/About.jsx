import React from 'react';
import { Cpu, Lock, Globe, Award, HelpCircle } from 'lucide-react';

const About = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textStyle: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#fff', marginBottom: '8px' }}>
          About PhishGuard AI
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Explainable Phishing Attack Investigation Platform designed for SOC Teams and Security Analysts.
        </p>
      </div>

      <div className="panel-card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#00f0ff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} /> Innovation: Explainable Security over Black-Box ML
        </h2>
        <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.98rem' }}>
          Traditional spam filters output binary labels like "phishing" or "safe" without context. 
          <strong> PhishGuard AI</strong> bridges the transparency gap by implementing a <strong>Hybrid Detection Architecture</strong>. 
          Every threat score is backed by granular indicators, specific domain homoglyphs, extracted URL security flags, and brand impersonation metrics.
        </p>
      </div>

      <div className="panel-card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '16px' }}>
          Detection Pipeline Breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#060a17', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #00f0ff' }}>
            <h3 style={{ color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} style={{ color: '#00f0ff' }} /> 1. Machine Learning Classifier (50% Weight)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              Utilizes a Logistic Regression model trained on 39,000+ emails from the CEAS_08 dataset. Uses TF-IDF n-gram (1,2) features with 30,000 max features to achieve 99.5% accuracy.
            </p>
          </div>

          <div style={{ background: '#060a17', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ffb703' }}>
            <h3 style={{ color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: '#ffb703' }} /> 2. Transparent Rule Engine (30% Weight)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              Inspects subject lines and email text for urgency triggers ("within 24 hours"), credential harvesting ("verify password"), financial lure scams ("claim prize"), and account suspension threats.
            </p>
          </div>

          <div style={{ background: '#060a17', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ff7043' }}>
            <h3 style={{ color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: '#ff7043' }} /> 3. URL & Domain Analyzer (20% Weight)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              Regex link extraction inspecting HTTP protocols, raw IP address URLs, Punycode homographs (<code style={{ color: '#00f0ff' }}>xn--</code>), URL shorteners, and sender domain hyphenation.
            </p>
          </div>

          <div style={{ background: '#060a17', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ff2a6d' }}>
            <h3 style={{ color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#ff2a6d' }} /> 4. Brand Impersonation Detection
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              Applies <code style={{ color: '#00ff9d' }}>difflib.SequenceMatcher</code> similarity algorithms combined with Leetspeak normalization (<code style={{ color: '#00f0ff' }}>0-&gt;o, 1-&gt;l/i, 3-&gt;e, 5-&gt;s</code>) to catch typosquatted targets (e.g. spoofing PayPal, Microsoft, Google, DHL).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
