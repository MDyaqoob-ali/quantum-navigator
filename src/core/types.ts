// Universal Game Types for Quantum Navigator

export type EvaluationStatus = 'unstarted' | 'incomplete' | 'invalid' | 'incorrect' | 'success';

export interface EvaluationResult {
  status: EvaluationStatus;
  score: number;
  progress: number;
  feedback: string;
  details: Record<string, any>;
}

export type TrackId = 
  | 'bloch-sphere' 
  | 'quantum-gates' 
  | 'quantum-interference' 
  | 'error-correction' 
  | 'phase-estimation';

export interface LevelDefinition {
  id: string;
  trackId: TrackId;
  trackNumber: number;
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  educationalConcept: string;
  hints: string[];
  initialState: any;
  targetState: any;
  tolerance: number; // Angular error in degrees, probability delta, or phase delta
  constraints?: {
    maxMoves?: number;
    maxGates?: number;
    allowedGates?: string[];
    fixedCount?: number;
  };
}

export interface PlayerStats {
  xp: number;
  level: number;
  totalStars: number;
  streakDays: number;
  quantumEnergy: number; // Discrete points: 0 to 5 (1 point per hint, max 5)
  lastPlayedDate: string;
  completedLevels: Record<string, boolean>; // key: `${trackId}_${levelId}`
  levelScores: Record<string, number>;
  levelStars: Record<string, number>;
  levelAttempts: Record<string, number>;
  unlockedAchievements: string[];
  seenTrackIntros?: Record<string, boolean>;
  seenComponentIntros?: Record<string, boolean>;
  hintTiers?: Record<string, number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  trackId?: TrackId;
  xpReward: number;
}

export interface LevelAttempt {
  attemptId: string;
  trackId: TrackId;
  levelId: string;
  startTime: number;
  interactionCount: number;
  hasInteracted: boolean;
}
