// Global Game State and Progression Hook

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  PlayerStats,
  TrackId,
  LevelAttempt,
  EvaluationResult,
  Achievement,
} from '../types';
import {
  loadPlayerStats,
  savePlayerStats,
  resetPlayerStats,
} from '../gamification/persistence';
import {
  calculateScoreAndStars,
} from '../gamification/scoringEngine';
import {
  checkNewAchievements,
} from '../gamification/progressionEngine';
import { ACTIVE_TRACKS, getTrackLevels, getLevelById } from '../levels';

export type ActiveView = 'home' | 'tracks' | 'progress' | 'achievements' | 'profile' | 'game' | 'debug';

export function useGameState() {
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [activeTrackId, setActiveTrackId] = useState<TrackId>('bloch-sphere');
  const [activeLevelId, setActiveLevelId] = useState<string>('t1_l1');
  const [activeTutorial, setActiveTutorial] = useState<boolean>(false);
  
  // Recent unlocked achievements for toast banner
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);

  // Current level attempt state
  const [attempt, setAttempt] = useState<LevelAttempt>({
    attemptId: 'att_' + Date.now(),
    trackId: 'bloch-sphere',
    levelId: 't1_l1',
    startTime: Date.now(),
    interactionCount: 0,
    hasInteracted: false,
  });

  // Current evaluation result
  const [evaluation, setEvaluation] = useState<EvaluationResult>({
    status: 'unstarted',
    score: 0,
    progress: 0,
    feedback: 'Awaiting your interaction.',
    details: {},
  });

  // Save stats on change
  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  // Active level data
  const currentLevel = useMemo(() => {
    return getLevelById(activeTrackId, activeLevelId);
  }, [activeTrackId, activeLevelId]);

  const activeTrackMeta = useMemo(() => {
    return ACTIVE_TRACKS.find(t => t.id === activeTrackId);
  }, [activeTrackId]);

  // Start / switch level
  const selectLevel = useCallback((trackId: TrackId, levelId: string) => {
    setActiveTrackId(trackId);
    setActiveLevelId(levelId);
    setCurrentView('game');
    setAttempt({
      attemptId: `att_${trackId}_${levelId}_${Date.now()}`,
      trackId,
      levelId,
      startTime: Date.now(),
      interactionCount: 0,
      hasInteracted: false,
    });
    setEvaluation({
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Level initialized in unsolved state. Begin your interaction.',
      details: {},
    });
  }, []);

  // Record player interaction
  const recordInteraction = useCallback(() => {
    setAttempt(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      hasInteracted: true,
    }));
  }, []);

  // Reset current level (clears current attempt without wiping global achievements)
  const resetCurrentLevel = useCallback(() => {
    setAttempt({
      attemptId: `att_${activeTrackId}_${activeLevelId}_${Date.now()}`,
      trackId: activeTrackId,
      levelId: activeLevelId,
      startTime: Date.now(),
      interactionCount: 0,
      hasInteracted: false,
    });
    setEvaluation({
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Level reset to initial state. Make your adjustments.',
      details: {},
    });
  }, [activeTrackId, activeLevelId]);

  // Handle successful evaluation submission
  const handleEvaluationSuccess = useCallback((result: EvaluationResult) => {
    setEvaluation(result);

    if (result.status === 'success') {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - attempt.startTime) / 1000));
      const breakdown = calculateScoreAndStars(
        'success',
        result.score,
        attempt.interactionCount,
        3, // baseline optimal moves
        elapsedSeconds
      );

      const levelKey = `${activeTrackId}_${activeLevelId}`;
      const prevStars = stats.levelStars[levelKey] || 0;
      const prevScore = stats.levelScores[levelKey] || 0;

      const newLevelStars = Math.max(prevStars, breakdown.stars);
      const newLevelScore = Math.max(prevScore, breakdown.totalScore);
      const starDifference = Math.max(0, newLevelStars - prevStars);

      // Regenerate up to 15 Quantum Energy on success
      const updatedEnergy = Math.min(100, stats.quantumEnergy + 15);

      const updatedStats: PlayerStats = {
        ...stats,
        xp: stats.xp + breakdown.xpEarned,
        totalStars: stats.totalStars + starDifference,
        quantumEnergy: updatedEnergy,
        completedLevels: {
          ...stats.completedLevels,
          [levelKey]: true,
        },
        levelStars: {
          ...stats.levelStars,
          [levelKey]: newLevelStars,
        },
        levelScores: {
          ...stats.levelScores,
          [levelKey]: newLevelScore,
        },
        levelAttempts: {
          ...stats.levelAttempts,
          [levelKey]: (stats.levelAttempts[levelKey] || 0) + 1,
        },
      };

      // Check achievements
      const { updatedStats: finalizedStats, newlyUnlocked } = checkNewAchievements(updatedStats);
      setStats(finalizedStats);
      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
      }
    }
  }, [activeTrackId, activeLevelId, attempt, stats]);

  // Request hint (consumes 15 Quantum Energy)
  const useHint = useCallback((): { allowed: boolean; hintText: string } => {
    if (!currentLevel || !currentLevel.hints || currentLevel.hints.length === 0) {
      return { allowed: false, hintText: 'No hint available for this level.' };
    }
    if (stats.quantumEnergy < 15) {
      return { allowed: false, hintText: 'Not enough Quantum Energy. Complete levels to recharge energy!' };
    }

    setStats(prev => ({
      ...prev,
      quantumEnergy: Math.max(0, prev.quantumEnergy - 15),
    }));

    const randomHint = currentLevel.hints[Math.floor(Math.random() * currentLevel.hints.length)];
    return { allowed: true, hintText: randomHint };
  }, [currentLevel, stats.quantumEnergy]);

  // Navigate to next level in current track
  const proceedToNextLevel = useCallback(() => {
    const levels = getTrackLevels(activeTrackId);
    const currentIndex = levels.findIndex(l => l.id === activeLevelId);
    if (currentIndex >= 0 && currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      selectLevel(activeTrackId, nextLevel.id);
    } else {
      // Completed all levels in track, go to tracks overview
      setCurrentView('tracks');
    }
  }, [activeTrackId, activeLevelId, selectLevel]);

  // Check if a level is unlocked
  const isLevelUnlocked = useCallback((trackId: TrackId, levelId: string): boolean => {
    const levels = getTrackLevels(trackId);
    const index = levels.findIndex(l => l.id === levelId);
    if (index <= 0) return true; // Level 1 is always unlocked

    // Previous level must be completed
    const prevLevel = levels[index - 1];
    const prevKey = `${trackId}_${prevLevel.id}`;
    return !!stats.completedLevels[prevKey];
  }, [stats.completedLevels]);

  // Full reset with user confirmation
  const handleFullReset = useCallback(() => {
    const fresh = resetPlayerStats();
    setStats(fresh);
    setCurrentView('home');
    setActiveTrackId('bloch-sphere');
    setActiveLevelId('t1_l1');
    setEvaluation({
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'All progress reset.',
      details: {},
    });
  }, []);

  return {
    stats,
    currentView,
    setCurrentView,
    activeTrackId,
    setActiveTrackId,
    activeLevelId,
    currentLevel,
    activeTrackMeta,
    activeTutorial,
    setActiveTutorial,
    attempt,
    evaluation,
    setEvaluation,
    selectLevel,
    recordInteraction,
    resetCurrentLevel,
    handleEvaluationSuccess,
    useHint,
    proceedToNextLevel,
    isLevelUnlocked,
    handleFullReset,
    newlyUnlockedAchievements,
    clearToastAchievement: (id: string) => {
      setNewlyUnlockedAchievements(prev => prev.filter(a => a.id !== id));
    },
  };
}
