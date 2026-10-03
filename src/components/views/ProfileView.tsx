import React, { useState } from 'react';
import { PlayerStats } from '../../core/types';
import { calculatePlayerLevel } from '../../core/gamification/scoringEngine';
import { User, Flame, Zap, Award, RotateCcw, AlertTriangle } from 'lucide-react';

interface ProfileViewProps {
  stats: PlayerStats;
  onFullReset: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ stats, onFullReset }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const levelInfo = calculatePlayerLevel(stats.xp);

  return (
    <div className="page-container" data-ui-zone="profile-view">
      <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Player Profile</h2>

      <div
        className="card"
        style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-blue-light)',
            color: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User size={32} />
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Quantum Apprentice</h3>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Explorer of Quantum State Spaces
          </div>
        </div>
      </div>

      {/* Progress & Economy Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)' }}>
            <Award size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Rank & Level</span>
          </div>
          <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px' }}>
            Level {levelInfo.currentLevel}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {stats.xp} Total XP accumulated
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309' }}>
            <Flame size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Learning Streak</span>
          </div>
          <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: '#B45309' }}>
            {stats.streakDays} Day{stats.streakDays !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Daily practice streak
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)' }}>
            <Zap size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Quantum Energy</span>
          </div>
          <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px' }}>
            {stats.quantumEnergy}% / 100%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Recharges +15% per solved level
          </div>
        </div>
      </div>

      {/* Danger Zone: Full Progress Reset */}
      <div
        className="card"
        style={{
          padding: '20px',
          borderColor: 'rgba(211, 47, 47, 0.3)',
          backgroundColor: '#FFFBFB',
          marginTop: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vector-red)' }}>
          <AlertTriangle size={18} />
          <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Reset Progress</h4>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '600px' }}>
          Clear all saved level completions, earned stars, XP, and achievements to restart from the very beginning.
        </p>

        {!showConfirmReset ? (
          <button
            className="btn btn-sm btn-accent"
            onClick={() => setShowConfirmReset(true)}
            style={{ marginTop: '12px' }}
          >
            <RotateCcw size={14} />
            <span>Reset All Progress</span>
          </button>
        ) : (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-sm btn-accent"
              onClick={() => {
                onFullReset();
                setShowConfirmReset(false);
              }}
            >
              Confirm Full Reset
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setShowConfirmReset(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
