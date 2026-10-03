import React from 'react';
import { Zap } from 'lucide-react';

interface QuantumEnergyProps {
  energy: number; // 0 to 100
  maxEnergy?: number;
}

export const QuantumEnergy: React.FC<QuantumEnergyProps> = ({ energy, maxEnergy = 100 }) => {
  const percent = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));

  return (
    <div
      title={`Quantum Energy: ${energy}/${maxEnergy} (Used for hints & guidance)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        color: energy >= 15 ? 'var(--accent-amber)' : 'var(--text-muted)',
      }}
    >
      <Zap size={14} style={{ fill: energy >= 15 ? '#F59E0B' : 'none', color: '#D97706' }} />
      <span>{energy}%</span>
      <div
        style={{
          width: '36px',
          height: '6px',
          backgroundColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginLeft: '2px',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: energy >= 15 ? '#F59E0B' : '#8C95A0',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
