import React from 'react';
import { ALL_ACHIEVEMENTS } from '../../core/gamification/progressionEngine';
import { PlayerStats } from '../../core/types';
import {
  Sparkles,
  Compass,
  Cpu,
  Activity,
  ShieldCheck,
  Radio,
  Award,
  Layers,
  Star,
  Lock,
  Check,
} from 'lucide-react';

interface AchievementsViewProps {
  stats: PlayerStats;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ stats }) => {
  const unlockedSet = new Set(stats.unlockedAchievements);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles size={22} />;
      case 'Compass':
        return <Compass size={22} />;
      case 'Cpu':
        return <Cpu size={22} />;
      case 'Activity':
        return <Activity size={22} />;
      case 'ShieldCheck':
        return <ShieldCheck size={22} />;
      case 'Radio':
        return <Radio size={22} />;
      case 'Award':
        return <Award size={22} />;
      case 'Layers':
        return <Layers size={22} />;
      case 'Star':
        return <Star size={22} />;
      default:
        return <Award size={22} />;
    }
  };

  return (
    <div className="page-container" data-ui-zone="achievements-view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Quantum Achievements</h2>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Unlocked: {unlockedSet.size} / {ALL_ACHIEVEMENTS.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {ALL_ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedSet.has(ach.id);

          return (
            <div
              key={ach.id}
              className="card"
              style={{
                padding: '18px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                backgroundColor: isUnlocked ? '#FFFFFF' : 'var(--bg-card-subtle)',
                opacity: isUnlocked ? 1 : 0.65,
                border: isUnlocked ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isUnlocked ? 'var(--accent-blue-light)' : 'var(--bg-secondary)',
                  color: isUnlocked ? 'var(--accent-blue)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon(ach.icon)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{ach.title}</h4>
                  {isUnlocked ? (
                    <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                      <Check size={11} /> Unlocked
                    </span>
                  ) : (
                    <span className="badge" style={{ fontSize: '11px' }}>
                      <Lock size={11} /> Locked
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {ach.description}
                </p>

                <div style={{ marginTop: '8px' }}>
                  <span className="mono badge badge-amber" style={{ fontSize: '11px' }}>
                    +{ach.xpReward} XP
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
