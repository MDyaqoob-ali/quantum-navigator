// Local Persistence Layer for Quantum Navigator Player Data

import { PlayerStats } from '../types';

const STORAGE_KEY = 'quantum_navigator_player_v1';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  xp: 0,
  level: 1,
  totalStars: 0,
  streakDays: 1,
  quantumEnergy: 100, // Starts full for assistance & hints
  lastPlayedDate: new Date().toISOString().split('T')[0],
  completedLevels: {},
  levelScores: {},
  levelStars: {},
  levelAttempts: {},
  unlockedAchievements: [],
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_PLAYER_STATS };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PLAYER_STATS,
      ...parsed,
      // Verify streak dates
      streakDays: calculateStreak(parsed.lastPlayedDate, parsed.streakDays || 1),
      lastPlayedDate: new Date().toISOString().split('T')[0],
    };
  } catch (err) {
    console.warn('Failed to load player stats from storage, using defaults:', err);
    return { ...INITIAL_PLAYER_STATS };
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save player stats to storage:', err);
  }
}

export function resetPlayerStats(): PlayerStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear player storage:', err);
  }
  return { ...INITIAL_PLAYER_STATS };
}

function calculateStreak(lastDateStr?: string, currentStreak = 1): number {
  if (!lastDateStr) return 1;
  const today = new Date().toISOString().split('T')[0];
  if (lastDateStr === today) return currentStreak;

  const lastDate = new Date(lastDateStr);
  const nowDate = new Date(today);
  const diffDays = Math.round((nowDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 1) {
    return currentStreak + 1;
  } else if (diffDays > 1) {
    return 1;
  }
  return currentStreak;
}
