import React, { useState } from 'react';
import { useGameState } from './core/hooks/useGameState';
import { TopBar } from './components/common/TopBar';
import { TrackHeader } from './components/common/TrackHeader';
import { MissionCard } from './components/common/MissionCard';
import { SuccessModal } from './components/common/SuccessModal';
import { HintModal } from './components/common/HintModal';
import { TutorialModal } from './components/common/TutorialModal';

import { HomeView } from './components/views/HomeView';
import { TracksView } from './components/views/TracksView';
import { ProgressView } from './components/views/ProgressView';
import { AchievementsView } from './components/views/AchievementsView';
import { ProfileView } from './components/views/ProfileView';
import { DebugQAView } from './components/views/DebugQAView';

import { Track1Game } from './components/tracks/Track1Bloch/Track1Game';
import { Track2Game } from './components/tracks/Track2Gates/Track2Game';
import { Track3Game } from './components/tracks/Track3Interference/Track3Game';
import { Track4Game } from './components/tracks/Track4ErrorCorrection/Track4Game';
import { Track5Game } from './components/tracks/Track5PhaseEstimation/Track5Game';

import { Sparkles, X } from 'lucide-react';
import './styles/index.css';
import './styles/layout.css';

export function App() {
  const {
    stats,
    currentView,
    setCurrentView,
    activeTrackId,
    setActiveTrackId,
    activeLevelId,
    currentLevel,
    activeTrackMeta,
    evaluation,
    selectLevel,
    recordInteraction,
    resetCurrentLevel,
    handleEvaluationSuccess,
    useHint,
    proceedToNextLevel,
    isLevelUnlocked,
    handleFullReset,
    newlyUnlockedAchievements,
    clearToastAchievement,
  } = useGameState();

  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [currentHintText, setCurrentHintText] = useState('');
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [successModalDismissed, setSuccessModalDismissed] = useState(false);

  // Trigger hint
  const handleOpenHint = () => {
    const { allowed, hintText } = useHint();
    setCurrentHintText(hintText);
    setHintModalOpen(true);
  };

  // When level completes
  const isSuccessModalOpen = evaluation.status === 'success' && !successModalDismissed;

  const handleNextLevel = () => {
    setSuccessModalDismissed(true);
    proceedToNextLevel();
  };

  const handleReplay = () => {
    setSuccessModalDismissed(true);
    resetCurrentLevel();
  };

  // Reset modal dismissed state when active level changes
  React.useEffect(() => {
    setSuccessModalDismissed(false);
  }, [activeLevelId]);

  return (
    <div className="app-shell">
      {/* Universal TopBar */}
      <TopBar
        currentView={currentView}
        onNavigate={setCurrentView}
        stats={stats}
      />

      {/* Achievement Unlocked Toast Banner */}
      {newlyUnlockedAchievements.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {newlyUnlockedAchievements.map(ach => (
            <div
              key={ach.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                animation: 'modalFadeIn 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-amber-light)',
                  color: 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
                  Achievement Unlocked!
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {ach.title} (+{ach.xpReward} XP)
                </div>
              </div>
              <button
                onClick={() => clearToastAchievement(ach.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* View Routing */}
      {currentView === 'home' && (
        <HomeView
          onSelectTrack={tId => {
            setActiveTrackId(tId);
            setCurrentView('tracks');
          }}
          onSelectLevel={selectLevel}
          stats={stats}
        />
      )}

      {currentView === 'tracks' && (
        <TracksView
          initialTrackId={activeTrackId}
          onSelectLevel={selectLevel}
          isLevelUnlocked={isLevelUnlocked}
          stats={stats}
        />
      )}

      {currentView === 'progress' && <ProgressView stats={stats} />}

      {currentView === 'achievements' && <AchievementsView stats={stats} />}

      {currentView === 'profile' && (
        <ProfileView stats={stats} onFullReset={handleFullReset} />
      )}

      {currentView === 'debug' && <DebugQAView />}

      {/* Active Game Level View */}
      {currentView === 'game' && currentLevel && activeTrackMeta && (
        <div className="page-container" data-ui-zone="active-game-view">
          {/* Track Header Bar */}
          <TrackHeader
            trackMeta={activeTrackMeta}
            activeLevelId={activeLevelId}
            onSelectLevel={selectLevel}
            isLevelUnlocked={isLevelUnlocked}
            stats={stats}
            onReset={resetCurrentLevel}
            onOpenHint={handleOpenHint}
            onToggleTutorial={() => setTutorialModalOpen(true)}
          />

          {/* Mission & Quantum Concept Card */}
          <MissionCard level={currentLevel} />

          {/* Dedicated Track Gameplay */}
          {activeTrackId === 'bloch-sphere' && (
            <Track1Game
              level={currentLevel}
              evaluation={evaluation}
              onEvaluate={handleEvaluationSuccess}
              onRecordInteraction={recordInteraction}
              onNextLevel={handleNextLevel}
            />
          )}

          {activeTrackId === 'quantum-gates' && (
            <Track2Game
              level={currentLevel}
              evaluation={evaluation}
              onEvaluate={handleEvaluationSuccess}
              onRecordInteraction={recordInteraction}
              onNextLevel={handleNextLevel}
            />
          )}

          {activeTrackId === 'quantum-interference' && (
            <Track3Game
              level={currentLevel}
              evaluation={evaluation}
              onEvaluate={handleEvaluationSuccess}
              onRecordInteraction={recordInteraction}
              onNextLevel={handleNextLevel}
            />
          )}

          {activeTrackId === 'error-correction' && (
            <Track4Game
              level={currentLevel}
              evaluation={evaluation}
              onEvaluate={handleEvaluationSuccess}
              onRecordInteraction={recordInteraction}
              onNextLevel={handleNextLevel}
            />
          )}

          {activeTrackId === 'phase-estimation' && (
            <Track5Game
              level={currentLevel}
              evaluation={evaluation}
              onEvaluate={handleEvaluationSuccess}
              onRecordInteraction={recordInteraction}
              onNextLevel={handleNextLevel}
            />
          )}
        </div>
      )}

      {/* Success Modal */}
      {currentLevel && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setSuccessModalDismissed(true)}
          evaluation={evaluation}
          stars={stats.levelStars[`${activeTrackId}_${activeLevelId}`] || 3}
          xpEarned={150 + (stats.levelStars[`${activeTrackId}_${activeLevelId}`] || 3) * 35}
          educationalConcept={currentLevel.educationalConcept}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
        />
      )}

      {/* Hint Modal */}
      <HintModal
        isOpen={hintModalOpen}
        onClose={() => setHintModalOpen(false)}
        hintText={currentHintText}
        currentEnergy={stats.quantumEnergy}
      />

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={tutorialModalOpen}
        onClose={() => setTutorialModalOpen(false)}
        trackId={activeTrackId}
      />
    </div>
  );
}

export default App;
