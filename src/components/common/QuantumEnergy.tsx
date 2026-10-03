import React from 'react';
import { Zap } from 'lucide-react';

interface QuantumEnergyProps {
  energy: number; // 0 to 5 points
  maxEnergy?: number;
}

export const QuantumEnergy: React.FC<QuantumEnergyProps> = ({ energy, maxEnergy = 5 }) => {
  const clampedEnergy = Math.max(0, Math.min(maxEnergy, energy));

  return (
    <div
      title={`Quantum Energy: ${clampedEnergy}/${maxEnergy} points\n(1 Point = 1 Level Hint. Recharges on level completion)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: clampedEnergy > 0 ? '#B45309' : 'var(--text-muted)',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <Zap
        size={14}
        style={{
          fill: clampedEnergy > 0 ? '#F59E0B' : 'none',
          color: clampedEnergy > 0 ? '#D97706' : 'var(--text-muted)',
        }}
      />
      <span>⚡ {clampedEnergy}/{maxEnergy}</span>
      <div
        style={{
          display: 'flex',
          gap: '3px',
          marginLeft: '4px',
        }}
      >
        {Array.from({ length: maxEnergy }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: i < clampedEnergy ? '#F59E0B' : 'var(--border-medium)',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

