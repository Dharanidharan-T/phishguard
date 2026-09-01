import React, { useState } from 'react';
import { Send, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const EmailAnalyzer = ({ onAnalyze, isLoading }) => {
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const loadDemoPhishing = () => {
    setSender('security@paypa1-login.com');
    setReceiver('employee@company.com');
    setSubject('URGENT: Your PayPal Account Will Be Suspended');
    setBody(
      'Dear Customer,\n\n' +
      'We noticed suspicious activity on your account.\n\n' +
      'Your PayPal account will be suspended unless you verify your information immediately.\n\n' +
      'Verify now:\nhttp://paypa1-login.com/verify-account\n\n' +
      'Failure to verify within 24 hours will result in permanent suspension.'
    );
  };

  const loadDemoSafe = () => {
    setSender('professor@university.edu');
    setReceiver('student@university.edu');
    setSubject('Project Review Meeting Tomorrow');
    setBody(
      'Hello,\n\n' +
      'The project review meeting is scheduled tomorrow at 10:30 AM in Lab 3.\n\n' +
      'Please bring your presentation.\n\n' +
      'Thank you.'
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sender.trim() || !subject.trim() || !body.trim()) {
      alert('Please complete all required fields (Sender, Subject, Body) to analyze.');
      return;
    }
    onAnalyze({ sender, receiver, subject, body });
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <h2 className="panel-title">
          <Send size={20} /> Email Threat Input
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          SOC Investigation Mode
        </span>
      </div>

      <div className="demo-triggers">
        <button type="button" className="btn-demo-phish" onClick={loadDemoPhishing}>
          <AlertTriangle size={15} /> Load Demo Phishing Email
        </button>
        <button type="button" className="btn-demo-safe" onClick={loadDemoSafe}>
          <ShieldCheck size={15} /> Load Safe Email
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Sender Email Address *</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. security@paypa1-login.com"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Receiver Email Address (Optional)</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. employee@company.com"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Subject *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. URGENT: Your PayPal Account Will Be Suspended"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Body Content *</label>
          <textarea
            className="form-textarea"
            placeholder="Paste raw email message content or body text here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="spinner" /> Analyzing Threat Intelligence...
            </>
          ) : (
            <>
              <RefreshCw size={18} /> Analyze Email
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailAnalyzer;
