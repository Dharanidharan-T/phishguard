import React, { useEffect, useState } from 'react';
import StatsCards from '../components/StatsCards';
import { Activity, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    // Load local history or fallback to demo items
    const saved = localStorage.getItem('phishguard_scans');
    if (saved) {
      try {
        setScans(JSON.parse(saved));
      } catch (e) {
        setScans(getInitialDemoScans());
      }
    } else {
      const initial = getInitialDemoScans();
      setScans(initial);
      localStorage.setItem('phishguard_scans', JSON.stringify(initial));
    }
  }, []);

  const getInitialDemoScans = () => [
    { id: 1, sender: 'security@paypa1-login.com', subject: 'URGENT: Your PayPal Account Will Be Suspended', score: 92, level: 'CRITICAL', timestamp: '10:42 AM' },
    { id: 2, sender: 'professor@university.edu', subject: 'Project Review Meeting Tomorrow', score: 12, level: 'LOW', timestamp: '09:15 AM' },
    { id: 3, sender: 'billing@micr0soft-update.org', subject: 'Action Required: Office365 Subscription Renewal', score: 78, level: 'HIGH', timestamp: 'Yesterday' },
    { id: 4, sender: 'hr@company.com', subject: 'Updated Q3 Leave Policy Document', score: 8, level: 'LOW', timestamp: 'Yesterday' },
    { id: 5, sender: 'lottery@free-millions-prize.net', subject: 'CONGRATULATIONS! You won $1,000,000', score: 88, level: 'CRITICAL', timestamp: '2 days ago' }
  ];

  const handleClearHistory = () => {
    localStorage.removeItem('phishguard_scans');
    setScans([]);
  };

  const highRiskCount = scans.filter(s => s.level === 'HIGH' || s.level === 'CRITICAL').length;
  const mediumRiskCount = scans.filter(s => s.level === 'MEDIUM').length;
  const safeCount = scans.filter(s => s.level === 'LOW').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#fff' }}>
            Threat Intelligence Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Real-time analytics and history of investigated email payloads.
          </p>
        </div>

        {scans.length > 0 && (
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleClearHistory}>
            <Trash2 size={14} /> Clear Scan Log
          </button>
        )}
      </div>

      {/* Analytics Cards */}
      <StatsCards
        stats={{
          total: 120 + scans.length,
          highRisk: 28 + highRiskCount,
          mediumRisk: 15 + mediumRiskCount,
          safe: 77 + safeCount,
          detectionRate: "99.5%"
        }}
      />

      {/* Recent Scans Table */}
      <div className="panel-card">
        <div className="panel-header">
          <h3 className="panel-title">
            <Activity size={18} /> Recent Investigation Activity Log
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Showing {scans.length} recent events
          </span>
        </div>

        {scans.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No recent scans recorded yet. Perform an email analysis in the console to populate history.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="scan-table">
              <thead>
                <tr>
                  <th>Sender Email</th>
                  <th>Subject Line</th>
                  <th>Risk Score</th>
                  <th>Status Level</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <code style={{ color: '#00f0ff' }}>{scan.sender}</code>
                    </td>
                    <td style={{ color: '#fff', fontWeight: '500' }}>{scan.subject}</td>
                    <td>
                      <strong style={{
                        color: scan.score >= 80 ? '#ff2a6d' : scan.score >= 60 ? '#ff7043' : scan.score >= 30 ? '#ffb703' : '#00ff9d'
                      }}>
                        {scan.score} / 100
                      </strong>
                    </td>
                    <td>
                      <span className={`sev-badge sev-${scan.level}`}>
                        {scan.level}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{scan.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
