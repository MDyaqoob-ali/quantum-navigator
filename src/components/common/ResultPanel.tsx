import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Play } from 'lucide-react';
import { EvaluationResult } from '../../core/types';

interface ResultMetric {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

interface ResultPanelProps {
  evaluation: EvaluationResult;
  metrics: ResultMetric[];
  onSubmitOrRun: () => void;
  runButtonLabel?: string;
  runButtonDisabled?: boolean;
  onNextLevel?: () => void;
  showNextLevelButton?: boolean;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  evaluation,
  metrics,
  onSubmitOrRun,
  runButtonLabel = 'Evaluate & Verify',
  runButtonDisabled = false,
  onNextLevel,
  showNextLevelButton = false,
}) => {
  const getStatusClass = () => {
    switch (evaluation.status) {
      case 'success':
        return 'status-success';
      case 'incorrect':
        return 'status-incorrect';
      case 'incomplete':
      case 'invalid':
        return 'status-incomplete';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (evaluation.status) {
      case 'success':
        return <CheckCircle2 size={20} style={{ color: '#15803D' }} />;
      case 'incorrect':
        return <XCircle size={20} style={{ color: 'var(--vector-red)' }} />;
      case 'invalid':
      case 'incomplete':
        return <AlertTriangle size={20} style={{ color: '#B45309' }} />;
      default:
        return null;
    }
  };

  return (
    <div className="result-panel-container" data-ui-zone="result-panel">
      {/* Live Numerical Metrics */}
      <div className="result-metrics-grid">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="metric-pill"
            style={m.highlight ? { borderColor: 'var(--accent-blue)', backgroundColor: 'var(--accent-blue-light)' } : {}}
          >
            <span className="metric-label">{m.label}</span>
            <span className="metric-val">{m.value}</span>
            {m.subtext && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {m.subtext}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Evaluator Status & Action Bar */}
      <div className={`status-feedback-bar ${getStatusClass()}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getStatusIcon()}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Status: {evaluation.status.toUpperCase()}
            </div>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>
              {evaluation.feedback}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className={`btn ${evaluation.status === 'success' ? 'btn-success' : 'btn-primary'}`}
            onClick={onSubmitOrRun}
            disabled={runButtonDisabled}
          >
            <Play size={16} />
            <span>{runButtonLabel}</span>
          </button>

          {evaluation.status === 'success' && showNextLevelButton && onNextLevel && (
            <button className="btn btn-primary" onClick={onNextLevel}>
              <span>Next Level</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
