import React from 'react';
import { CheckCircle2, XCircle, FileText, Check, AlertTriangle, FileWarning, HelpCircle } from 'lucide-react';

export default function ScanResult({ scan }) {
  if (!scan) return null;

  const { matchScore, matchingKeywords, missingKeywords, suggestions, resumeFileName } = scan;

  // SVG Configuration for radial progress
  const radius = 55;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~345.57
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;

  // Get color and label for the score
  let scoreClass = 'low';
  let scoreColor = 'var(--danger)';
  let scoreLabel = 'Needs Improvement';

  if (matchScore >= 70) {
    scoreClass = 'high';
    scoreColor = 'var(--success)';
    scoreLabel = 'Strong Match';
  } else if (matchScore >= 45) {
    scoreClass = 'medium';
    scoreColor = 'var(--warning)';
    scoreLabel = 'Moderate Match';
  }

  // Get icons based on recommendation category
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'skills':
        return <CheckCircle2 size={18} className="suggestion-icon" />;
      case 'formatting':
        return <AlertTriangle size={18} className="suggestion-icon" />;
      case 'contact info':
      case 'contact':
        return <FileWarning size={18} className="suggestion-icon" />;
      default:
        return <HelpCircle size={18} className="suggestion-icon" />;
    }
  };

  return (
    <div className="results-container fade-in">
      <div className="results-top-row">
        {/* Radial Score Gauge */}
        <div className="score-card glass-panel">
          <div className="radial-progress-wrapper">
            <svg className="radial-svg" viewBox="0 0 130 130">
              <circle
                className="radial-bg"
                cx="65"
                cy="65"
                r={radius}
              />
              <circle
                className={`radial-bar ${scoreClass}`}
                cx="65"
                cy="65"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="score-text" style={{ color: scoreColor }}>
              <span>{matchScore}</span>
              <span className="score-pct">% Match</span>
            </div>
          </div>
          <div className="score-label">{scoreLabel}</div>
          <div className="score-description">
            For: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{resumeFileName}</span>
          </div>
        </div>

        {/* Keyword Overlap Analysis */}
        <div className="keywords-card glass-panel">
          <h3>Keyword Coverage</h3>

          <div className="keyword-section" style={{ marginTop: '0.5rem' }}>
            <div className="keyword-section-title">
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>Matching Keywords ({matchingKeywords.length})</span>
            </div>
            {matchingKeywords.length > 0 ? (
              <div className="keywords-list">
                {matchingKeywords.map((kw, index) => (
                  <span key={`match-${index}`} className="keyword-pill matched">
                    <Check size={12} /> {kw.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <span className="scan-date">No matching keywords were found. This resume has a low match score.</span>
            )}
          </div>

          <div className="keyword-section" style={{ marginTop: '1rem' }}>
            <div className="keyword-section-title">
              <XCircle size={16} style={{ color: 'var(--danger)' }} />
              <span>Missing Key Keywords ({missingKeywords.length})</span>
            </div>
            {missingKeywords.length > 0 ? (
              <div className="keywords-list">
                {missingKeywords.map((kw, index) => (
                  <span key={`missing-${index}`} className="keyword-pill missing">
                    {kw.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <span className="scan-date" style={{ color: 'var(--success)' }}>Great job! This resume matches all of the extracted keywords.</span>
            )}
          </div>
        </div>
      </div>

      {/* Structured Suggestions Card */}
      <div className="suggestions-card glass-panel">
        <h2>
          <FileText size={22} style={{ color: 'var(--primary-end)' }} />
          Actionable suggestions to improve your resume
        </h2>

        {suggestions && suggestions.length > 0 ? (
          <div className="suggestions-grid">
            {suggestions.map((suggestion, idx) => {
              const categoryLower = suggestion.category.toLowerCase();
              const categoryClass = categoryLower.includes('contact') ? 'contact' : categoryLower;
              return (
                <div key={`sug-${idx}`} className={`suggestion-item ${categoryClass}`}>
                  <div className={`suggestion-icon-wrapper ${categoryClass}`}>
                    {getCategoryIcon(suggestion.category)}
                  </div>
                  <div className="suggestion-content">
                    <span className="suggestion-category">{suggestion.category}</span>
                    <span className="suggestion-text">{suggestion.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
            <p>Your resume is fully optimized for this job description! No immediate improvements needed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
