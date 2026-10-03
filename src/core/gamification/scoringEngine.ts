// Shared Scoring and Progression Calculation Engine

export interface ScoreBreakdown {
  baseScore: number;
  accuracyBonus: number;
  efficiencyBonus: number;
  timeBonus: number;
  totalScore: number;
  stars: number; // 1 to 5
  xpEarned: number;
}

export function calculatePlayerLevel(xp: number): { currentLevel: number; currentXp: number; xpForNext: number; progressPercent: number } {
  // Each level requires progressively more XP: Level L requires L * 350 XP
  let level = 1;
  let remainingXp = xp;
  let required = 350;

  while (remainingXp >= required) {
    remainingXp -= required;
    level++;
    required = level * 350;
  }

  const progressPercent = Math.min(100, Math.round((remainingXp / required) * 100));

  return {
    currentLevel: level,
    currentXp: remainingXp,
    xpForNext: required,
    progressPercent,
  };
}

export function calculateScoreAndStars(
  status: string,
  rawScore: number,
  moves: number,
  optimalMoves: number,
  timeSeconds: number
): ScoreBreakdown {
  if (status !== 'success') {
    return {
      baseScore: 0,
      accuracyBonus: 0,
      efficiencyBonus: 0,
      timeBonus: 0,
      totalScore: 0,
      stars: 0,
      xpEarned: 0,
    };
  }

  const baseScore = 600;
  // Accuracy portion from evaluator raw score (0-400)
  const accuracyBonus = Math.max(0, Math.min(250, Math.round((rawScore - 600) * 0.7)));

  // Efficiency bonus (fewer moves/adjustments)
  let efficiencyRatio = optimalMoves / Math.max(optimalMoves, moves);
  if (isNaN(efficiencyRatio) || !isFinite(efficiencyRatio)) efficiencyRatio = 1;
  const efficiencyBonus = Math.round(efficiencyRatio * 100);

  // Time bonus: fast completion within 60s
  const timeBonus = Math.max(0, Math.min(50, Math.round((60 - timeSeconds) * 1.0)));

  const totalScore = Math.min(1000, baseScore + accuracyBonus + efficiencyBonus + timeBonus);

  // Star threshold:
  // 900+ -> 5 stars
  // 800-899 -> 4 stars
  // 700-799 -> 3 stars
  // 600-699 -> 2 stars
  // below 600 -> 1 star
  let stars = 1;
  if (totalScore >= 900) stars = 5;
  else if (totalScore >= 800) stars = 4;
  else if (totalScore >= 720) stars = 3;
  else if (totalScore >= 620) stars = 2;

  // XP is proportional to score and stars
  const xpEarned = Math.round(150 + (stars - 1) * 35 + totalScore * 0.1);

  return {
    baseScore,
    accuracyBonus,
    efficiencyBonus,
    timeBonus,
    totalScore,
    stars,
    xpEarned,
  };
}
