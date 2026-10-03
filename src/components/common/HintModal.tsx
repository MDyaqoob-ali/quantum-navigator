import React from 'react';
import { Lightbulb, Zap, X } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintText: string;
  energyCost?: number;
  currentEnergy: number;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  hintText,
  energyCost = 15,
  currentEnergy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-amber-light)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lightbulb size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Quantum Assistance</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Pedagogical guidance & mathematical relationships
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}
        >
          {hintText}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Zap size={14} style={{ color: '#F59E0B' }} />
            <span>Energy used: {energyCost}% (Remaining: {currentEnergy}%)</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
