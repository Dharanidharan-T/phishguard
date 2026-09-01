import React from 'react';

const RiskGauge = ({ score, level }) => {
  // Score clamped between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score || 0));

  // Map score (0..100) to rotation angle (-90deg to +90deg)
  const angle = (clampedScore / 100) * 180 - 90;

  const getColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL': return '#ff2a6d';
      case 'HIGH': return '#ff7043';
      case 'MEDIUM': return '#ffb703';
      default: return '#00ff9d';
    }
  };

  const levelColor = getColor(level);

  return (
    <div className="risk-gauge-container">
      <svg className="gauge-svg" viewBox="0 0 200 120">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff9d" />
            <stop offset="35%" stopColor="#ffb703" />
            <stop offset="70%" stopColor="#ff7043" />
            <stop offset="100%" stopColor="#ff2a6d" />
          </linearGradient>
        </defs>

        {/* Background Track Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#0f172a"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Colored Gradient Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Needle */}
        <g transform={`translate(100, 100) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-65" stroke={levelColor} strokeWidth="4" strokeLinecap="round" />
          <circle cx="0" cy="0" r="8" fill={levelColor} />
          <circle cx="0" cy="0" r="4" fill="#060a17" />
        </g>
      </svg>

      <div className="gauge-score" style={{ color: levelColor }}>
        {clampedScore}
      </div>

      <div className={`gauge-level-badge level-${level}`}>
        {level || 'UNKNOWN'} RISK
      </div>
    </div>
  );
};

export default RiskGauge;
