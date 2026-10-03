// Progression & Achievement Logic for Quantum Navigator

import { Achievement, PlayerStats, TrackId } from '../types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Quantum Leap',
    description: 'Successfully solve your very first quantum puzzle level.',
    icon: 'Sparkles',
    xpReward: 100,
  },
  {
    id: 'bloch_navigator',
    title: 'Bloch Sphere Navigator',
    description: 'Solve 3 levels in Track 1 (Qubits & Bloch Sphere).',
    icon: 'Compass',
    trackId: 'bloch-sphere',
    xpReward: 200,
  },
  {
    id: 'gate_architect',
    title: 'Quantum Gate Architect',
    description: 'Synthesize 3 verified circuits in Track 2 (Logic Gates).',
    icon: 'Cpu',
    trackId: 'quantum-gates',
    xpReward: 200,
  },
  {
    id: 'coherence_master',
    title: 'Wave Coherence Master',
    description: 'Tune 3 interference patterns in Track 3 (Interference).',
    icon: 'Activity',
    trackId: 'quantum-interference',
    xpReward: 200,
  },
  {
    id: 'first_tunnel',
    title: 'First Tunnel',
    description: 'Complete your first successful quantum tunneling transmission in Track 4.',
    icon: 'Zap',
    trackId: 'quantum-tunneling',
    xpReward: 150,
  },
  {
    id: 'barrier_tuner',
    title: 'Barrier Tuner',
    description: 'Successfully calibrate barrier width and height to hit the target probability.',
    icon: 'Sliders',
    trackId: 'quantum-tunneling',
    xpReward: 200,
  },
  {
    id: 'resonance_seeker',
    title: 'Resonant Explorer',
    description: 'Tune a multi-barrier potential system to achieve resonant transmission.',
    icon: 'Activity',
    trackId: 'quantum-tunneling',
    xpReward: 250,
  },
  {
    id: 'precision_navigator',
    title: 'Tunnel Precision',
    description: 'Attain high accuracy within the target transmission window.',
    icon: 'Award',
    trackId: 'quantum-tunneling',
    xpReward: 300,
  },
  {
    id: 'tunnel_master',
    title: 'Tunnel Master',
    description: 'Complete the final 4-barrier Track 4 Tunnel Master challenge!',
    icon: 'Award',
    trackId: 'quantum-tunneling',
    xpReward: 500,
  },
  {
    id: 'signal_hunter',
    title: 'Signal Scanner Pioneer',
    description: 'Estimate 3 quantum eigenphases in Track 5 (Phase Estimation).',
    icon: 'Radio',
    trackId: 'phase-estimation',
    xpReward: 200,
  },
  {
    id: 'perfectionist',
    title: 'Quantum Perfectionist',
    description: 'Attain a 5-star rating on any level with maximum precision.',
    icon: 'Award',
    xpReward: 250,
  },
  {
    id: 'quantum_polymath',
    title: 'Quantum Polymath',
    description: 'Complete at least one level in all five active learning tracks.',
    icon: 'Layers',
    xpReward: 500,
  },
  {
    id: 'five_star_collector',
    title: 'Constellation of Five Stars',
    description: 'Collect 15 or more total stars across all tracks.',
    icon: 'Star',
    xpReward: 400,
  },
];

export function checkNewAchievements(stats: PlayerStats): { updatedStats: PlayerStats; newlyUnlocked: Achievement[] } {
  const currentUnlocked = new Set(stats.unlockedAchievements);
  const newlyUnlocked: Achievement[] = [];
  let totalBonusXp = 0;

  const completedKeys = Object.keys(stats.completedLevels).filter(k => stats.completedLevels[k]);
  const totalCompleted = completedKeys.length;

  const track1Count = completedKeys.filter(k => k.startsWith('bloch-sphere_')).length;
  const track2Count = completedKeys.filter(k => k.startsWith('quantum-gates_')).length;
  const track3Count = completedKeys.filter(k => k.startsWith('quantum-interference_')).length;
  const track4Count = completedKeys.filter(k => k.startsWith('quantum-tunneling_') || k.startsWith('error-correction_')).length;
  const track5Count = completedKeys.filter(k => k.startsWith('phase-estimation_')).length;

  // 1. First step
  if (totalCompleted >= 1 && !currentUnlocked.has('first_step')) {
    currentUnlocked.add('first_step');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'first_step')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  // 2. Track milestones
  if (track1Count >= 3 && !currentUnlocked.has('bloch_navigator')) {
    currentUnlocked.add('bloch_navigator');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'bloch_navigator')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  if (track2Count >= 3 && !currentUnlocked.has('gate_architect')) {
    currentUnlocked.add('gate_architect');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'gate_architect')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  if (track3Count >= 3 && !currentUnlocked.has('coherence_master')) {
    currentUnlocked.add('coherence_master');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'coherence_master')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  // Track 4 milestones
  if (track4Count >= 1 && !currentUnlocked.has('first_tunnel')) {
    currentUnlocked.add('first_tunnel');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'first_tunnel')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  if (track4Count >= 3 && !currentUnlocked.has('barrier_tuner')) {
    currentUnlocked.add('barrier_tuner');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'barrier_tuner')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  const hasResonanceSolved = completedKeys.some(k => k.includes('t4_l7') || k.includes('t4_l9'));
  if (hasResonanceSolved && !currentUnlocked.has('resonance_seeker')) {
    currentUnlocked.add('resonance_seeker');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'resonance_seeker')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  if (track4Count >= 6 && !currentUnlocked.has('precision_navigator')) {
    currentUnlocked.add('precision_navigator');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'precision_navigator')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  const hasMasterSolved = completedKeys.some(k => k.includes('t4_l10'));
  if (hasMasterSolved && !currentUnlocked.has('tunnel_master')) {
    currentUnlocked.add('tunnel_master');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'tunnel_master')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  if (track4Count >= 2 && !currentUnlocked.has('zero_mistakes')) {
    currentUnlocked.add('zero_mistakes');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'zero_mistakes')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  if (stats.hintsUsed === 0 && totalCompleted >= 5 && !currentUnlocked.has('no_hints')) {
    currentUnlocked.add('no_hints');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'no_hints')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  if (track5Count >= 3 && !currentUnlocked.has('signal_hunter')) {
    currentUnlocked.add('signal_hunter');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'signal_hunter')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  // 3. Perfectionist
  const has5Star = Object.values(stats.levelStars).some(stars => stars === 5);
  if (has5Star && !currentUnlocked.has('perfectionist')) {
    currentUnlocked.add('perfectionist');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'perfectionist')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  // 4. Polymath (1 in all 5 tracks)
  if (
    track1Count >= 1 &&
    track2Count >= 1 &&
    track3Count >= 1 &&
    track4Count >= 1 &&
    track5Count >= 1 &&
    !currentUnlocked.has('quantum_polymath')
  ) {
    currentUnlocked.add('quantum_polymath');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'quantum_polymath')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  // 5. Stars count
  if (stats.totalStars >= 15 && !currentUnlocked.has('five_star_collector')) {
    currentUnlocked.add('five_star_collector');
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === 'five_star_collector')!;
    newlyUnlocked.push(ach);
    totalBonusXp += ach.xpReward;
  }

  const updatedStats: PlayerStats = {
    ...stats,
    xp: stats.xp + totalBonusXp,
    unlockedAchievements: Array.from(currentUnlocked),
  };

  return { updatedStats, newlyUnlocked };
}
