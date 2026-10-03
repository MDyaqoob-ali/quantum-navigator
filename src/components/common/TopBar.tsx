import React from 'react';
import {
  Compass,
  Layers,
  BarChart2,
  Award,
  User,
  FlaskConical,
  Flame,
} from 'lucide-react';
import { ActiveView } from '../../core/hooks/useGameState';
import { PlayerStats } from '../../core/types';
import { calculatePlayerLevel } from '../../core/gamification/scoringEngine';
import { QuantumEnergy } from './QuantumEnergy';

interface TopBarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  stats: PlayerStats;
}

export const TopBar: React.FC<TopBarProps> = ({ currentView, onNavigate, stats }) => {
  const levelInfo = calculatePlayerLevel(stats.xp);

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar-brand" onClick={() => onNavigate('home')}>
        <div className="topbar-logo-icon">
          <Compass size={20} />
        </div>
        <div>
          <div className="topbar-title">QUANTUM NAVIGATOR</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1 }}>
            Learn Quantum Computing by Playing
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="topbar-nav">
        <button
          className={`topbar-nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          className={`topbar-nav-item ${currentView === 'tracks' || currentView === 'game' ? 'active' : ''}`}
          onClick={() => onNavigate('tracks')}
        >
          Tracks
        </button>
        <button
          className={`topbar-nav-item ${currentView === 'progress' ? 'active' : ''}`}
          onClick={() => onNavigate('progress')}
        >
          Progress
        </button>
        <button
          className={`topbar-nav-item ${currentView === 'achievements' ? 'active' : ''}`}
          onClick={() => onNavigate('achievements')}
        >
          Achievements
        </button>
        <button
          className={`topbar-nav-item ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          Profile
        </button>
        <button
          className={`topbar-nav-item ${currentView === 'debug' ? 'active' : ''}`}
          onClick={() => onNavigate('debug')}
          title="Internal QA Test Suite & Overlap Inspector"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <FlaskConical size={14} />
          <span>QA & Debug</span>
        </button>
      </nav>

      {/* Stats Bar */}
      <div className="topbar-stats">
        {/* Streak */}
        <div
          title={`${stats.streakDays} Day Learning Streak`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#B45309',
            backgroundColor: '#FEF3C7',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(180, 83, 9, 0.2)',
          }}
        >
          <Flame size={14} style={{ fill: '#F59E0B', color: '#D97706' }} />
          <span>{stats.streakDays}d</span>
        </div>

        {/* Quantum Energy */}
        <QuantumEnergy energy={stats.quantumEnergy} />

        {/* Player Level & XP */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
            Lv.{levelInfo.currentLevel}
          </span>
          <div
            style={{
              width: '45px',
              height: '6px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${levelInfo.progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--accent-blue)',
              }}
            />
          </div>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {stats.xp} XP
          </span>
        </div>
      </div>
    </header>
  );
};
