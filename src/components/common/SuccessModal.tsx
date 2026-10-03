import React from 'react';
import { Award, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { StarRating } from './StarRating';
import { EvaluationResult } from '../../core/types';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationResult;
  stars: number;
  xpEarned: number;
  educationalConcept: string;
  onNextLevel: () => void;
  onReplay: () => void;
  isLastLevelInTrack?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  stars,
  xpEarned,
  educationalConcept,
  onNextLevel,
  onReplay,
  isLastLevelInTrack = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <CheckCircle size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ✓ Verified Quantum Success
          </h2>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Level Condition Mathematically Satisfied
          </div>
        </div>

        {/* Stars & Score Banner */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
          }}
        >
          <StarRating stars={stars} size={28} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '18px', fontWeight: 700 }}>
              {evaluation.score} Points
            </span>
            <span className="badge badge-amber" style={{ fontSize: '13px', padding: '4px 10px' }}>
              +{xpEarned} XP
            </span>
          </div>
        </div>

        {/* What You Learned Section */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Award size={16} style={{ color: 'var(--accent-blue)' }} />
            <strong style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              What You Learned
            </strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {educationalConcept}
          </p>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn" onClick={onReplay}>
            <RotateCcw size={16} />
            <span>Replay</span>
          </button>
          <button className="btn btn-primary" onClick={onNextLevel}>
            <span>{isLastLevelInTrack ? 'Complete Track' : 'Next Level'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
