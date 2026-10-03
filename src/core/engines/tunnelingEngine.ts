// Physical Quantum Tunneling Math Engine for Quantum Navigator (Tunnel Run)
// Implements 1D Schrödinger barrier transmission, single-barrier analytical solutions,
// multi-barrier Transfer Matrix Method (TMM), and binomial experiment sampling.

export interface BarrierConfig {
  id: string;
  height: number;           // Potential height V0 in normalized units
  width: number;            // Barrier width 'a' in normalized units
  position?: number;         // Relative x-position offset in multi-barrier setups
  adjustableHeight?: boolean;
  adjustableWidth?: boolean;
  minHeight?: number;
  maxHeight?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface TunnelingState {
  particleEnergy: number;   // E in normalized units
  barriers: BarrierConfig[];
  selectedBarrierIndex?: number;
  isOverBarrierAllowed?: boolean;
}

export interface TunnelingTransmissionResult {
  transmission: number;       // T in [0, 1]
  reflection: number;         // R = 1 - T
  kappa: number;              // Decay constant for primary barrier (or first barrier)
  wavenumber: number;         // Free wave k = sqrt(2mE)/hbar
  regime: 'tunneling' | 'over-barrier' | 'barrier-equal';
  isResonant?: boolean;
  barrierKappas?: number[];
}

export interface TunnelingLevelConfig {
  id: string;
  trackId: 'quantum-tunneling' | 'error-correction';
  trackNumber: number;
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  educationalConcept: string;
  hints: string[];
  initialState: TunnelingState;
  targetTransmission: number;  // Desired probability T in [0, 1]
  targetTolerance: number;     // Allowable delta (e.g. 0.03 for ±3%)
  energyRange: { min: number; max: number };
  adjustableEnergy: boolean;
  allowedMoves?: number;
  timeLimit?: number;          // in seconds (for timed levels)
  isOverBarrierAllowed?: boolean;
}

export interface TunnelingEvaluation {
  status: 'unstarted' | 'incomplete' | 'invalid' | 'incorrect' | 'success';
  score: number;
  progress: number;
  feedback: string;
  details: {
    currentTransmission?: number;
    targetTransmission?: number;
    tolerance?: number;
    errorDelta?: number;
    regime?: string;
    particleEnergy?: number;
    barrierIndex?: number;
    barrierHeight?: number;
    barrierWidth?: number;
    barrierCount?: number;
    movesUsed?: number;
    timeRemaining?: number;
    experimentResult?: {
      trials: number;
      transmitted: number;
      reflected: number;
      observedRate: number;
    };
    [key: string]: unknown;
  };
}

// Normalized physical constants (m = 1, hbar = 1)
export const CONST_MASS = 1.0;
export const CONST_HBAR = 1.0;

/**
 * Calculates the decay constant kappa inside a rectangular barrier:
 * kappa = sqrt(2 * m * (V0 - E)) / hbar
 */
export function calculateKappa(energy: number, barrierHeight: number, mass = CONST_MASS, hbar = CONST_HBAR): number {
  if (energy >= barrierHeight) return 0;
  const diff = barrierHeight - energy;
  return Math.sqrt(2 * mass * diff) / hbar;
}

/**
 * Calculates the free wavenumber outside barriers:
 * k = sqrt(2 * m * E) / hbar
 */
export function calculateWavenumber(energy: number, mass = CONST_MASS, hbar = CONST_HBAR): number {
  if (energy <= 0) return 0;
  return Math.sqrt(2 * mass * energy) / hbar;
}

/**
 * Calculates analytical transmission coefficient T for a single rectangular barrier.
 * For E < V0 (Quantum Tunneling):
 *   T = 1 / [ 1 + (V0^2 * sinh^2(kappa * a)) / (4 * E * (V0 - E)) ]
 * For E > V0 (Over-barrier Transmission):
 *   k2 = sqrt(2 * m * (E - V0)) / hbar
 *   T = 1 / [ 1 + (V0^2 * sin^2(k2 * a)) / (4 * E * (E - V0)) ]
 * For E = V0:
 *   T = 1 / [ 1 + (m * V0 * a^2) / (2 * hbar^2) ]
 */
export function calculateSingleBarrierTransmission(
  energy: number,
  barrierHeight: number,
  barrierWidth: number,
  mass = CONST_MASS,
  hbar = CONST_HBAR
): TunnelingTransmissionResult {
  // Edge cases and sanity limits
  if (energy <= 0.000001) {
    return {
      transmission: 0,
      reflection: 1,
      kappa: calculateKappa(0, barrierHeight, mass, hbar),
      wavenumber: 0,
      regime: 'tunneling',
    };
  }

  const k = calculateWavenumber(energy, mass, hbar);

  // Case 1: E < V0 (Classic tunneling regime)
  if (energy < barrierHeight - 1e-9) {
    const kappa = calculateKappa(energy, barrierHeight, mass, hbar);
    const ka = kappa * barrierWidth;
    const sinhKa = Math.sinh(ka);
    const v0Sq = barrierHeight * barrierHeight;
    const denom = 4 * energy * (barrierHeight - energy);
    const term = (v0Sq * sinhKa * sinhKa) / denom;
    const T = 1 / (1 + term);
    const clampedT = Math.max(0, Math.min(1, T));

    return {
      transmission: clampedT,
      reflection: 1 - clampedT,
      kappa,
      wavenumber: k,
      regime: 'tunneling',
    };
  }

  // Case 2: E = V0 (Boundary threshold)
  if (Math.abs(energy - barrierHeight) <= 1e-9) {
    const term = (mass * barrierHeight * barrierWidth * barrierWidth) / (2 * hbar * hbar);
    const T = 1 / (1 + term);
    const clampedT = Math.max(0, Math.min(1, T));

    return {
      transmission: clampedT,
      reflection: 1 - clampedT,
      kappa: 0,
      wavenumber: k,
      regime: 'barrier-equal',
    };
  }

  // Case 3: E > V0 (Over-barrier transmission)
  const k2 = Math.sqrt(2 * mass * (energy - barrierHeight)) / hbar;
  const k2a = k2 * barrierWidth;
  const sinK2a = Math.sin(k2a);
  const v0Sq = barrierHeight * barrierHeight;
  const denom = 4 * energy * (energy - barrierHeight);
  const term = (v0Sq * sinK2a * sinK2a) / denom;
  const T = 1 / (1 + term);
  const clampedT = Math.max(0, Math.min(1, T));

  return {
    transmission: clampedT,
    reflection: 1 - clampedT,
    kappa: 0,
    wavenumber: k,
    regime: 'over-barrier',
  };
}

// 2x2 Complex Matrix Multiplication for Transfer Matrix Method (TMM)
interface Complex {
  re: number;
  im: number;
}

function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

type ComplexMatrix2x2 = [
  [Complex, Complex],
  [Complex, Complex]
];

function matMul2x2(A: ComplexMatrix2x2, B: ComplexMatrix2x2): ComplexMatrix2x2 {
  return [
    [
      cAdd(cMul(A[0][0], B[0][0]), cMul(A[0][1], B[1][0])),
      cAdd(cMul(A[0][0], B[0][1]), cMul(A[0][1], B[1][1])),
    ],
    [
      cAdd(cMul(A[1][0], B[0][0]), cMul(A[1][1], B[1][0])),
      cAdd(cMul(A[1][0], B[0][1]), cMul(A[1][1], B[1][1])),
    ],
  ];
}

/**
 * Calculates transmission across multiple rectangular barriers using Transfer Matrix Method (TMM).
 * Supports up to 4 barriers separated by free potential wells (V = 0).
 */
export function calculateMultiBarrierTransmission(
  energy: number,
  barriers: BarrierConfig[],
  wellSpacing = 0.5, // Separation distance between consecutive barriers
  mass = CONST_MASS,
  hbar = CONST_HBAR
): TunnelingTransmissionResult {
  if (barriers.length === 0) {
    return {
      transmission: 1.0,
      reflection: 0.0,
      kappa: 0,
      wavenumber: calculateWavenumber(energy, mass, hbar),
      regime: 'over-barrier',
    };
  }

  if (barriers.length === 1) {
    return calculateSingleBarrierTransmission(energy, barriers[0].height, barriers[0].width, mass, hbar);
  }

  if (energy <= 0.000001) {
    return {
      transmission: 0,
      reflection: 1,
      kappa: calculateKappa(0, barriers[0].height, mass, hbar),
      wavenumber: 0,
      regime: 'tunneling',
    };
  }

  const k = calculateWavenumber(energy, mass, hbar);
  let totalMatrix: ComplexMatrix2x2 = [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: 1, im: 0 }],
  ];

  const kappas: number[] = [];
  let allTunneling = true;

  for (let i = 0; i < barriers.length; i++) {
    const b = barriers[i];
    const V = b.height;
    const a = b.width;

    let barrierM: ComplexMatrix2x2;

    if (energy < V - 1e-9) {
      const kappa = calculateKappa(energy, V, mass, hbar);
      kappas.push(kappa);
      const ka = kappa * a;
      const coshKa = Math.cosh(ka);
      const sinhKa = Math.sinh(ka);

      // M11 = cosh(kappa*a) - i * ((k^2 - kappa^2) / (2*k*kappa)) * sinh(kappa*a)
      // M12 = -i * ((k^2 + kappa^2) / (2*k*kappa)) * sinh(kappa*a)
      // M21 = i * ((k^2 + kappa^2) / (2*k*kappa)) * sinh(kappa*a)
      // M22 = cosh(kappa*a) + i * ((k^2 - kappa^2) / (2*k*kappa)) * sinh(kappa*a)
      const factorDiff = (k * k - kappa * kappa) / (2 * k * kappa);
      const factorSum = (k * k + kappa * kappa) / (2 * k * kappa);

      barrierM = [
        [{ re: coshKa, im: -factorDiff * sinhKa }, { re: 0, im: -factorSum * sinhKa }],
        [{ re: 0, im: factorSum * sinhKa }, { re: coshKa, im: factorDiff * sinhKa }],
      ];
    } else if (Math.abs(energy - V) <= 1e-9) {
      kappas.push(0);
      allTunneling = false;
      // Limit as kappa -> 0
      barrierM = [
        [{ re: 1, im: -k * a / 2 }, { re: 0, im: -k * a / 2 }],
        [{ re: 0, im: k * a / 2 }, { re: 1, im: k * a / 2 }],
      ];
    } else {
      kappas.push(0);
      allTunneling = false;
      const k2 = Math.sqrt(2 * mass * (energy - V)) / hbar;
      const k2a = k2 * a;
      const cosK2a = Math.cos(k2a);
      const sinK2a = Math.sin(k2a);

      const factorDiff = (k * k + k2 * k2) / (2 * k * k2);
      const factorDelta = (k * k - k2 * k2) / (2 * k * k2);

      barrierM = [
        [{ re: cosK2a, im: -factorDiff * sinK2a }, { re: 0, im: factorDelta * sinK2a }],
        [{ re: 0, im: -factorDelta * sinK2a }, { re: cosK2a, im: factorDiff * sinK2a }],
      ];
    }

    totalMatrix = matMul2x2(barrierM, totalMatrix);

    // If there is another barrier after this, multiply free drift matrix P(d)
    if (i < barriers.length - 1) {
      const d = wellSpacing;
      const kd = k * d;
      const freeP: ComplexMatrix2x2 = [
        [{ re: Math.cos(kd), im: Math.sin(kd) }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: Math.cos(-kd), im: Math.sin(-kd) }],
      ];
      totalMatrix = matMul2x2(freeP, totalMatrix);
    }
  }

  // T = 1 / |M11|^2
  const m11 = totalMatrix[0][0];
  const magSq = m11.re * m11.re + m11.im * m11.im;
  const T = magSq > 0 ? Math.max(0, Math.min(1, 1 / magSq)) : 0;

  return {
    transmission: T,
    reflection: 1 - T,
    kappa: kappas[0] || 0,
    wavenumber: k,
    regime: allTunneling ? 'tunneling' : 'over-barrier',
    barrierKappas: kappas,
    isResonant: barriers.length > 1 && T > 0.6 && allTunneling,
  };
}

/**
 * Universal dispatcher: calculates transmission for either single or multi barrier state.
 */
export function calculateTunneling(state: TunnelingState): TunnelingTransmissionResult {
  if (!state.barriers || state.barriers.length === 0) {
    return {
      transmission: 1.0,
      reflection: 0.0,
      kappa: 0,
      wavenumber: calculateWavenumber(state.particleEnergy),
      regime: 'over-barrier',
    };
  }

  if (state.barriers.length === 1) {
    return calculateSingleBarrierTransmission(
      state.particleEnergy,
      state.barriers[0].height,
      state.barriers[0].width
    );
  }

  return calculateMultiBarrierTransmission(
    state.particleEnergy,
    state.barriers
  );
}

/**
 * Simulates a set of experimental trials based on the exact theoretical transmission probability.
 * Returns the counts of transmitted vs reflected particles following binomial distribution.
 */
export function sampleBinomialExperiment(
  theoreticalTransmission: number,
  trials = 100
): {
  trials: number;
  transmitted: number;
  reflected: number;
  observedRate: number;
} {
  let transmitted = 0;
  const p = Math.max(0, Math.min(1, theoreticalTransmission));

  for (let i = 0; i < trials; i++) {
    if (Math.random() < p) {
      transmitted++;
    }
  }

  const reflected = trials - transmitted;
  return {
    trials,
    transmitted,
    reflected,
    observedRate: trials > 0 ? transmitted / trials : 0,
  };
}

/**
 * Comprehensive Level Evaluator:
 * Validates player's state, checks parameter bounds, verifies physical regime,
 * calculates transmission, and computes target delta and star score.
 */
export function evaluateTunnelingLevel(
  currentState: TunnelingState,
  levelConfig: TunnelingLevelConfig,
  movesUsed = 0,
  hasInteracted = false
): TunnelingEvaluation {
  // 1. Unstarted check
  if (!hasInteracted && movesUsed === 0) {
    const initialT = calculateTunneling(currentState).transmission;
    const diff = Math.abs(initialT - levelConfig.targetTransmission);
    if (diff > levelConfig.targetTolerance) {
      return {
        status: 'unstarted',
        score: 0,
        progress: 0,
        feedback: 'Adjust the particle energy or barrier parameters to match the target transmission.',
        details: {
          currentTransmission: initialT,
          targetTransmission: levelConfig.targetTransmission,
          tolerance: levelConfig.targetTolerance,
          errorDelta: diff,
          particleEnergy: currentState.particleEnergy,
          barrierCount: currentState.barriers.length,
          movesUsed,
        },
      };
    }
  }

  // 2. Validate parameter numbers
  const E = currentState.particleEnergy;
  if (isNaN(E) || !isFinite(E) || E <= 0) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: 'Particle energy must be a positive finite value.',
      details: { particleEnergy: E },
    };
  }

  for (let i = 0; i < currentState.barriers.length; i++) {
    const b = currentState.barriers[i];
    if (isNaN(b.height) || !isFinite(b.height) || b.height <= 0) {
      return {
        status: 'invalid',
        score: 0,
        progress: 0,
        feedback: `Barrier ${i + 1} height must be a valid positive number.`,
        details: { barrierIndex: i, barrierHeight: b.height },
      };
    }
    if (isNaN(b.width) || !isFinite(b.width) || b.width <= 0) {
      return {
        status: 'invalid',
        score: 0,
        progress: 0,
        feedback: `Barrier ${i + 1} width must be a valid positive number.`,
        details: { barrierIndex: i, barrierWidth: b.width },
      };
    }
  }

  // 3. Check Tunneling regime requirement (E < V0 for standard tunneling levels)
  const isOverBarrierAllowed = levelConfig.isOverBarrierAllowed || false;
  const minBarrierHeight = Math.min(...currentState.barriers.map(b => b.height));

  if (!isOverBarrierAllowed && E >= minBarrierHeight) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: `Particle energy (${E.toFixed(2)}) must remain strictly below the barrier height (${minBarrierHeight.toFixed(2)}) for quantum tunneling.`,
      details: {
        particleEnergy: E,
        barrierHeight: minBarrierHeight,
        regime: 'over-barrier-disallowed',
      },
    };
  }

  // 4. Calculate transmission
  const result = calculateTunneling(currentState);
  const currentT = result.transmission;
  const targetT = levelConfig.targetTransmission;
  const tol = levelConfig.targetTolerance;
  const errorDelta = Math.abs(currentT - targetT);

  // 5. Check move constraint
  if (levelConfig.allowedMoves && movesUsed > levelConfig.allowedMoves) {
    return {
      status: 'incorrect',
      score: 0,
      progress: 50,
      feedback: `Exceeded the maximum allowed moves (${levelConfig.allowedMoves}). Click Reset to try again.`,
      details: {
        currentTransmission: currentT,
        targetTransmission: targetT,
        tolerance: tol,
        errorDelta,
        movesUsed,
      },
    };
  }

  // 6. Compare with target range
  if (errorDelta <= tol) {
    // SUCCESS!
    // Precision factor in [0, 1]
    const precisionFactor = Math.max(0, 1 - errorDelta / tol);
    const baseScore = 500;
    const precisionBonus = Math.round(precisionFactor * 300);
    const moveBonus = levelConfig.allowedMoves ? Math.max(0, (levelConfig.allowedMoves - movesUsed) * 40) : 100;
    const finalScore = baseScore + precisionBonus + moveBonus;

    return {
      status: 'success',
      score: finalScore,
      progress: 100,
      feedback: `Target matched! Transmission probability is ${(currentT * 100).toFixed(1)}% (Target: ${(targetT * 100).toFixed(1)}% ± ${(tol * 100).toFixed(1)}%).`,
      details: {
        currentTransmission: currentT,
        targetTransmission: targetT,
        tolerance: tol,
        errorDelta,
        regime: result.regime,
        particleEnergy: E,
        barrierCount: currentState.barriers.length,
        movesUsed,
      },
    };
  }

  // 7. Not in range (Incomplete or Incorrect)
  const isNear = errorDelta <= tol * 2.5;
  const progress = Math.max(10, Math.min(95, Math.round((1 - Math.min(1, errorDelta)) * 100)));
  const status = isNear ? 'incorrect' : 'incomplete';

  let feedback = '';
  if (currentT < targetT) {
    feedback = `Current transmission (${(currentT * 100).toFixed(1)}%) is below target (${(targetT * 100).toFixed(1)}%). Reduce barrier width, decrease height, or increase particle energy.`;
  } else {
    feedback = `Current transmission (${(currentT * 100).toFixed(1)}%) is above target (${(targetT * 100).toFixed(1)}%). Increase barrier width or barrier height.`;
  }

  return {
    status,
    score: 0,
    progress,
    feedback,
    details: {
      currentTransmission: currentT,
      targetTransmission: targetT,
      tolerance: tol,
      errorDelta,
      regime: result.regime,
      particleEnergy: E,
      barrierCount: currentState.barriers.length,
      movesUsed,
    },
  };
}
