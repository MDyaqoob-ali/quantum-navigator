import React, { useState } from 'react';
import { X, BookOpen, Lightbulb, HelpCircle, Check, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { TrackIntroData } from '../../core/educationData';

export type EducationalPopupType = 'track-intro' | 'walkthrough' | 'component-help' | 'hint' | 'no-energy';

export interface EducationalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: EducationalPopupType;
  trackIntro?: TrackIntroData;
  componentHelp?: {
    name: string;
    shortDesc: string;
    detailedDesc: string;
  };
  hintData?: {
    title: string;
    body: string;
    actionableDirection?: string;
    tier: number;
    maxTier: number;
    energyRemaining: number;
  };
  onStartWalkthrough?: () => void;
  onFinish?: () => void;
}

export const EducationalPopup: React.FC<EducationalPopupProps> = ({
  isOpen,
  onClose,
  type,
  trackIntro,
  componentHelp,
  hintData,
  onStartWalkthrough,
  onFinish,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  // -------------------------------------------------------------------
  // 1. TRACK INTRODUCTION POPUP
  // -------------------------------------------------------------------
  if (type === 'track-intro' && trackIntro) {
    return (
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '520px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="track-number-chip">TRACK {trackIntro.trackNumber}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {trackIntro.gameName}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.01em' }}>
            {trackIntro.title}
          </h3>

          {/* Section 1: WHAT IS THIS TRACK? */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '4px' }}>
              WHAT IS THIS TRACK?
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              {trackIntro.whatIsIt}
            </p>
          </div>

          {/* Section 2: HOW DO I PLAY? */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '4px' }}>
              HOW DO I PLAY?
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              {trackIntro.howDoIPlay}
            </p>
          </div>

          {/* Section 3: WHAT WILL I LEARN? */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: '6px' }}>
              WHAT WILL I LEARN?
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {trackIntro.whatWillILearn.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            {onStartWalkthrough && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onStartWalkthrough}
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <BookOpen size={14} />
                <span>Show Me How</span>
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={onClose}
              style={{ fontWeight: 700 }}
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // 2. "SHOW ME HOW" WALKTHROUGH MODE (2-4 Mini Steps)
  // -------------------------------------------------------------------
  if (type === 'walkthrough' && trackIntro) {
    const steps = trackIntro.walkthroughSteps;
    const currentStep = steps[currentStepIndex] || steps[0];
    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === steps.length - 1;

    return (
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Interactive Walkthrough
              </span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
            {currentStep.title}
          </h3>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            {currentStep.description}
          </div>

          {/* Step Progress Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === currentStepIndex ? '20px' : '8px',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: idx === currentStepIndex ? 'var(--accent-blue)' : 'var(--border-medium)',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={isFirst}
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              style={{ visibility: isFirst ? 'hidden' : 'visible' }}
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>

            {isLast ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  if (onFinish) onFinish();
                }}
                style={{ fontWeight: 700 }}
              >
                <Check size={14} />
                <span>Start Level</span>
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // 3. COMPONENT HELP / TOOLTIP EXPLANATION
  // -------------------------------------------------------------------
  if (type === 'component-help' && componentHelp) {
    return (
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '420px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-teal-light)',
                  color: 'var(--accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HelpCircle size={16} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                WHAT IS THIS?
              </span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
            {componentHelp.name}
          </h3>

          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {componentHelp.shortDesc}
          </div>

          <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-muted)', marginBottom: '18px' }}>
            {componentHelp.detailedDesc}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // 4. HINT POPUP (Small centered, collision-aware, consumes 1 Energy)
  // -------------------------------------------------------------------
  if (type === 'hint' && hintData) {
    return (
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '420px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-amber-light)',
                  color: 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lightbulb size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>💡 HINT</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Tier {hintData.tier} of {hintData.maxTier} • {hintData.title}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              marginBottom: '14px',
              whiteSpace: 'pre-line',
            }}
          >
            {hintData.body}
          </div>

          {hintData.actionableDirection && (
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-blue)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Direction:</span>
              <span>{hintData.actionableDirection}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#B45309', fontWeight: 600 }}>
              <Zap size={14} style={{ fill: '#F59E0B', color: '#D97706' }} />
              <span>Energy used: ⚡ -1 (Remaining: {hintData.energyRemaining}/5)</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onClose}>
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // 5. NO ENERGY POPUP
  // -------------------------------------------------------------------
  if (type === 'no-energy') {
    return (
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '380px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <Zap size={22} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
            NO ENERGY
          </h3>

          <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-muted)', marginBottom: '18px' }}>
            You have used all available Quantum Energy (0/5).<br />
            Complete any level to recharge your energy points!
          </p>

          <button className="btn btn-primary btn-sm" onClick={onClose} style={{ minWidth: '80px' }}>
            OK
          </button>
        </div>
      </div>
    );
  }

  return null;
};
