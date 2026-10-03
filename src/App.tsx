import React, { useState, useMemo, useEffect } from 'react';
import { useGameState } from './core/hooks/useGameState';
import { TopBar } from './components/common/TopBar';
import { TrackHeader } from './components/common/TrackHeader';
import { MissionCard, MissionTelemetry } from './components/common/MissionCard';
import { SuccessModal } from './components/common/SuccessModal';
import { EducationalPopup, EducationalPopupType } from './components/common/EducationalPopup';
import { TRACK_INTROS, COMPONENT_HELP } from './core/educationData';

import { HomeView } from './components/views/HomeView';
import { TracksView } from './components/views/TracksView';
import { ProgressView } from './components/views/ProgressView';
import { AchievementsView } from './components/views/AchievementsView';
import { ProfileView } from './components/views/ProfileView';
import { DebugQAView } from './components/views/DebugQAView';

import { Track1Game } from './components/tracks/Track1Bloch/Track1Game';
import { Track2Game } from './components/tracks/Track2Gates/Track2Game';
import { Track3Game } from './components/tracks/Track3Interference/Track3Game';
import { Track4Game } from './components/tracks/Track4Tunneling/Track4Game';
import { Track5Game } from './components/tracks/Track5PhaseEstimation/Track5Game';

import { Sparkles, X } from 'lucide-react';
import { soundEngine } from './core/audio/soundEngine';
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
    markTrackIntroSeen,
    hasSeenTrackIntro,
    markComponentIntroSeen,
    hasSeenComponentIntro,
    newlyUnlockedAchievements,
    clearToastAchievement,
  } = useGameState();

  // Unified Educational Popup State
  const [eduPopup, setEduPopup] = useState<{
    isOpen: boolean;
    type: EducationalPopupType;
    trackIntro?: any;
    componentHelp?: any;
    hintData?: any;
  }>({
    isOpen: false,
    type: 'track-intro',
  });

  const [successModalDismissed, setSuccessModalDismissed] = useState(false);

  // Play achievement sound when newly unlocked
  useEffect(() => {
    if (newlyUnlockedAchievements.length > 0) {
      soundEngine.playAchievement();
    }
  }, [newlyUnlockedAchievements]);

  // Trigger track intro automatically on first visit to any track
  useEffect(() => {
    if (currentView === 'game' && activeTrackId) {
      if (!hasSeenTrackIntro(activeTrackId)) {
        setEduPopup({
          isOpen: true,
          type: 'track-intro',
          trackIntro: TRACK_INTROS[activeTrackId],
        });
      }
    }
  }, [currentView, activeTrackId, hasSeenTrackIntro]);

  // Open Track Introduction explicitly (? How to Play button)
  const handleOpenHowToPlay = () => {
    setEduPopup({
      isOpen: true,
      type: 'track-intro',
      trackIntro: TRACK_INTROS[activeTrackId],
    });
  };

  // Open Interactive Walkthrough
  const handleStartWalkthrough = () => {
    setEduPopup(prev => ({
      ...prev,
      type: 'walkthrough',
      trackIntro: TRACK_INTROS[activeTrackId],
    }));
  };

  // Close Educational Popup and record persistence
  const handleCloseEduPopup = () => {
    if (eduPopup.type === 'track-intro' || eduPopup.type === 'walkthrough') {
      markTrackIntroSeen(activeTrackId);
    }
    setEduPopup(prev => ({ ...prev, isOpen: false }));
  };

  // Trigger state-aware Hint (consumes 1 Energy Point)
  const handleOpenHint = () => {
    const res = useHint();
    if (res.reason === 'no-energy') {
      soundEngine.playError();
      setEduPopup({
        isOpen: true,
        type: 'no-energy',
      });
    } else if (res.allowed && res.hintData) {
      soundEngine.playEnergyHint();
      setEduPopup({
        isOpen: true,
        type: 'hint',
        hintData: res.hintData,
      });
    }
  };

  // Open concept help from Mission Card
  const handleOpenConceptHelp = () => {
    if (!currentLevel) return;
    setEduPopup({
      isOpen: true,
      type: 'component-help',
      componentHelp: {
        name: currentLevel.educationalConcept,
        shortDesc: `${currentLevel.title} — ${currentLevel.subtitle}`,
        detailedDesc: currentLevel.description,
      },
    });
  };

  // Open individual component help popup
  const handleOpenComponentHelp = (componentId: string) => {
    const item = COMPONENT_HELP[componentId];
    if (item) {
      setEduPopup({
        isOpen: true,
        type: 'component-help',
        componentHelp: item,
      });
      markComponentIntroSeen(componentId);
    }
  };

  // Standardized Mission Telemetry across all 5 tracks
  const missionTelemetry: MissionTelemetry | undefined = useMemo(() => {
    if (!currentLevel) return undefined;

    if (activeTrackId === 'bloch-sphere') {
      const targetDegTheta = ((currentLevel.targetTheta * 180) / Math.PI).toFixed(0);
      const targetDegPhi = ((currentLevel.targetPhi * 180) / Math.PI).toFixed(0);
      const errDeg = evaluation.details?.errorDegrees !== undefined
        ? `${evaluation.details.errorDegrees}°`
        : `Tol ±${currentLevel.toleranceDegrees || 5}°`;
      const isMatched = evaluation.status === 'success';

      return {
        targetLabel: 'TARGET DIRECTION',
        targetValue: `θ=${targetDegTheta}°, φ=${targetDegPhi}°`,
        currentLabel: 'RESULTANT DIRECTION',
        currentValue: evaluation.details?.resultant
          ? `θ=${evaluation.details.resultant.thetaDeg}°, φ=${evaluation.details.resultant.phiDeg}°`
          : 'Adjusting Spheres',
        errorLabel: 'ANGULAR ERROR',
        errorValue: errDeg,
        statusLabel: 'STATUS',
        statusValue: isMatched ? '✓ TARGET MATCHED' : (evaluation.status === 'unstarted' ? 'START DRAGGING' : 'ADJUSTING'),
        isMatched,
      };
    }

    if (activeTrackId === 'quantum-gates') {
      const isMatched = evaluation.status === 'success';
      const fid = evaluation.details?.fidelity !== undefined
        ? (evaluation.details.fidelity * 100).toFixed(0)
        : undefined;

      return {
        targetLabel: 'TARGET QUANTUM STATE',
        targetValue: `|${currentLevel.gateLevel?.targetName || currentLevel.subtitle || '1'}⟩`,
        currentLabel: 'CURRENT STATE FIDELITY',
        currentValue: fid !== undefined ? `${fid}% Fidelity` : 'Circuit in Progress',
        errorLabel: 'FIDELITY DISTANCE',
        errorValue: fid !== undefined ? `${100 - Number(fid)}% away` : 'Run Circuit',
        statusLabel: 'STATUS',
        statusValue: isMatched ? '✓ TARGET MATCHED' : 'KEEP BUILDING',
        isMatched,
      };
    }

    if (activeTrackId === 'quantum-interference') {
      const isMatched = evaluation.status === 'success';
      const targetA = (currentLevel.interferenceLevel?.targetDetectorA * 100).toFixed(0);
      const targetB = (currentLevel.interferenceLevel?.targetDetectorB * 100).toFixed(0);
      const currentA = evaluation.details?.probA !== undefined ? (evaluation.details.probA * 100).toFixed(1) : undefined;
      const currentB = evaluation.details?.probB !== undefined ? (evaluation.details.probB * 100).toFixed(1) : undefined;
      const err = evaluation.details?.error !== undefined
        ? `${(evaluation.details.error * 100).toFixed(1)} pp`
        : `Tol ±${(currentLevel.interferenceLevel?.tolerance * 100).toFixed(0)}%`;

      return {
        targetLabel: 'TARGET DETECTOR PROBABILITY',
        targetValue: `A: ${targetA}% / B: ${targetB}%`,
        currentLabel: 'CURRENT DETECTOR PROBABILITY',
        currentValue: currentA !== undefined ? `A: ${currentA}% / B: ${currentB}%` : 'Turn Phase Dial',
        errorLabel: 'PROBABILITY ERROR',
        errorValue: err,
        statusLabel: 'STATUS',
        statusValue: isMatched ? '✓ TARGET MATCHED' : 'KEEP ADJUSTING',
        isMatched,
      };
    }

    if (activeTrackId === 'quantum-tunneling' || activeTrackId === 'error-correction') {
      const isMatched = evaluation.status === 'success';
      const targetT = currentLevel.tunnelingLevel?.targetTransmission ?? 0.70;
      const tol = currentLevel.tunnelingLevel?.targetTolerance ?? 0.03;
      const currentT = evaluation.details?.currentTransmission;
      const err = evaluation.details?.error !== undefined
        ? `${(evaluation.details.error * 100).toFixed(1)} pp`
        : `Tol ±${(tol * 100).toFixed(0)}%`;

      return {
        targetLabel: 'TARGET TRANSMISSION',
        targetValue: `${(targetT * 100).toFixed(0)}% ± ${(tol * 100).toFixed(0)}%`,
        currentLabel: 'CURRENT TRANSMISSION',
        currentValue: currentT !== undefined ? `${(currentT * 100).toFixed(1)}%` : 'Adjust Parameters',
        errorLabel: 'PROBABILITY ERROR',
        errorValue: err,
        statusLabel: 'STATUS',
        statusValue: isMatched ? '✓ TARGET MATCHED' : (evaluation.status === 'incorrect' ? 'NOT IN RANGE' : 'KEEP ADJUSTING'),
        isMatched,
      };
    }

    if (activeTrackId === 'phase-estimation') {
      const isMatched = evaluation.status === 'success';
      const truePh = (currentLevel.phaseLevel?.truePhase ?? currentLevel.truePhase ?? 0.25).toFixed(3);
      const tol = currentLevel.phaseLevel?.tolerance ?? currentLevel.tolerance ?? 0.05;
      const currentEst = evaluation.details?.playerEstimate !== undefined ? evaluation.details.playerEstimate.toFixed(3) : undefined;
      const err = evaluation.details?.error !== undefined ? `Δθ = ${evaluation.details.error.toFixed(3)}` : `Tol ±${tol}`;

      return {
        targetLabel: 'TARGET EIGENPHASE θ',
        targetValue: `θ = ${truePh} (±${tol})`,
        currentLabel: 'ESTIMATED PHASE',
        currentValue: currentEst !== undefined ? `θ = ${currentEst}` : 'Adjust Calibration Dial',
        errorLabel: 'PHASE ERROR',
        errorValue: err,
        statusLabel: 'STATUS',
        statusValue: isMatched ? '✓ TARGET MATCHED' : 'ESTIMATING',
        isMatched,
      };
    }

    return undefined;
  }, [activeTrackId, currentLevel, evaluation]);

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
            onToggleTutorial={handleOpenHowToPlay}
          />

          {/* Mission & Standardized Target Hierarchy Card */}
          <MissionCard
            level={currentLevel}
            telemetry={missionTelemetry}
            onOpenHint={handleOpenHint}
            onReset={resetCurrentLevel}
            energy={stats.quantumEnergy}
            onOpenConceptHelp={handleOpenConceptHelp}
          />

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

          {(activeTrackId === 'quantum-tunneling' || activeTrackId === 'error-correction') && (
            <Track4Game
              level={currentLevel}
              evaluation={evaluation}
              onEvaluate={handleEvaluationSuccess}
              onRecordInteraction={recordInteraction}
              onNextLevel={handleNextLevel}
              onOpenComponentHelp={handleOpenComponentHelp}
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

      {/* Unified Educational & Hint Popup */}
      <EducationalPopup
        isOpen={eduPopup.isOpen}
        onClose={handleCloseEduPopup}
        type={eduPopup.type}
        trackIntro={eduPopup.trackIntro}
        componentHelp={eduPopup.componentHelp}
        hintData={eduPopup.hintData}
        onStartWalkthrough={handleStartWalkthrough}
        onFinish={handleCloseEduPopup}
      />
    </div>
  );
}

export default App;
