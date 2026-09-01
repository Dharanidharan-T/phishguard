import React, { useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import { generateReport } from '../services/api';

const IncidentReport = ({ analysisResult }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateReport(analysisResult);
      setReportData(data);
    } catch (err) {
      alert('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ marginTop: '30px' }}>
      {!reportData ? (
        <button
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #00f0ff, #0077ff)' }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" /> Generating Official SOC Incident Report...
            </>
          ) : (
            <>
              <FileText size={18} /> Generate Incident Report
            </>
          )}
        </button>
      ) : (
        <div>
          <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={16} /> Print / Download Report (PDF)
            </button>
            <button className="btn-secondary" onClick={() => setReportData(null)}>
              Close Preview
            </button>
          </div>

          <div className="report-paper">
            <div className="report-header">
              <div>
                <div style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#0077ff', fontWeight: '800' }}>
                  PHISHGUARD AI INCIDENT INVESTIGATION REPORT
                </div>
                <div className="report-title">SOC Threat Analysis Report</div>
              </div>
              <div className="report-meta">
                <div><strong>Report ID:</strong> {reportData.report_id}</div>
                <div><strong>Generated:</strong> {reportData.generated_at}</div>
              </div>
            </div>

            {/* Email Details */}
            <div className="report-section">
              <div className="report-section-title">1. Email Header Details</div>
              <table className="report-table">
                <tbody>
                  <tr>
                    <td style={{ width: '30%' }}><strong>Sender:</strong></td>
                    <td>{reportData.email_details?.sender}</td>
                  </tr>
                  <tr>
                    <td><strong>Receiver:</strong></td>
                    <td>{reportData.email_details?.receiver || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Subject:</strong></td>
                    <td>{reportData.email_details?.subject}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Risk Assessment */}
            <div className="report-section">
              <div className="report-section-title">2. Risk Assessment</div>
              <table className="report-table">
                <tbody>
                  <tr>
                    <td style={{ width: '30%' }}><strong>Risk Score:</strong></td>
                    <td><strong>{reportData.risk_assessment?.risk_score} / 100</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Risk Level:</strong></td>
                    <td>
                      <span style={{ fontWeight: '800', color: reportData.risk_assessment?.risk_level === 'CRITICAL' ? '#ff2a6d' : '#00a86b' }}>
                        {reportData.risk_assessment?.risk_level}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>ML Phishing Probability:</strong></td>
                    <td>{Math.round((reportData.risk_assessment?.ml_probability || 0) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Executive Summary:</strong></td>
                    <td>{reportData.risk_assessment?.summary}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Indicators of Compromise */}
            <div className="report-section">
              <div className="report-section-title">3. Indicators of Compromise (IoCs)</div>
              <table className="report-table">
                <tbody>
                  <tr>
                    <td style={{ width: '30%' }}><strong>Sender Domains:</strong></td>
                    <td>{reportData.iocs?.sender_domains?.join(', ') || 'None'}</td>
                  </tr>
                  <tr>
                    <td><strong>Suspicious URLs:</strong></td>
                    <td>
                      {reportData.iocs?.suspicious_urls?.length > 0 ? (
                        reportData.iocs.suspicious_urls.map((u, i) => (
                          <div key={i} style={{ wordBreak: 'break-all', color: '#d97706' }}>{u}</div>
                        ))
                      ) : (
                        'None'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Triggered Rules */}
            <div className="report-section">
              <div className="report-section-title">4. Triggered Security Rules ({reportData.detected_indicators?.length || 0})</div>
              {reportData.detected_indicators?.length > 0 ? (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Indicator</th>
                      <th>Severity</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.detected_indicators.map((ind, i) => (
                      <tr key={i}>
                        <td><strong>{ind.indicator}</strong></td>
                        <td>{ind.severity}</td>
                        <td>{ind.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>No rules triggered.</p>
              )}
            </div>

            {/* Recommended Actions */}
            <div className="report-section">
              <div className="report-section-title">5. Recommended Remediation & Response</div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {reportData.recommended_actions?.map((act, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReport;
