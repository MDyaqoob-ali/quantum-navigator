// Track 5 — Quantum Spin & Measurement (Spin Splitter) Engine
// Implements Stern–Gerlach-style spin-1/2 measurement physics:
// 1. Quantum spin Bloch vector r and analyzer measurement axis n
// 2. Exact quantum measurement probabilities:
//    P(+) = (1 + r · n) / 2 = cos²(θ/2)
//    P(-) = (1 - r · n) / 2 = sin²(θ/2)
// 3. Von Neumann state projection/collapse:
//    (+) outcome -> r' = n
//    (-) outcome -> r' = -n
// 4. Sequential measurement: Analyzer 1 prepares state -> Analyzer 2 measures collapsed state
// 5. Probabilistic particle beam sampling with statistical fluctuations
// 6. Universal evaluation: unstarted, incomplete, invalid, incorrect, success

import { Vector3, vector3, dot, length, normalize } from '../math/vector3';
import { EvaluationResult, TrackId } from '../types';

export type SpinOutcome = '+' | '-';
export type BranchSelection = '+' | '-';

export interface SpinMeasurementResult {
  probPlus: number;      // P(+) = (1 + r·n)/2
  probMinus: number;     // P(-) = (1 - r·n)/2
  angleDegrees: number;  // Angle θ between r and n in degrees
  dotProduct: number;    // r · n
}

export interface SequentialMeasurementResult {
  analyzer1: SpinMeasurementResult;
  selectedBranch: BranchSelection;
  collapsedState: Vector3; // Post-measurement state r' = ±n1
  analyzer2?: SpinMeasurementResult;
  finalProbPlus: number;
  finalProbMinus: number;
}

export interface SpinExperimentSample {
  shots: number;
  countPlus: number;
  countMinus: number;
  observedFreqPlus: number;
  observedFreqMinus: number;
  samples: SpinOutcome[];
}

export interface SpinSplitterLevelConfig {
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
  sourceState: Vector3;          // Initial incoming spin-1/2 Bloch vector r
  sourceName?: string;           // e.g. '+Z (|0⟩)', '+X (|+⟩)', etc.
  analyzerCount: 1 | 2;          // 1 or 2 sequential analyzers
  analyzer1InitialAngle: number; // In degrees: 0° = +Z, 90° = +X, 180° = -Z, 270° = -X
  analyzer1Adjustable: boolean;
  analyzer2InitialAngle?: number;// For 2-analyzer levels
  analyzer2Adjustable?: boolean;
  branchSelectionRequired?: boolean;
  targetBranch?: BranchSelection;
  targetProbPlus: number;        // e.g. 0.75 (75%)
  targetTolerance: number;       // e.g. 0.03 (±3%)
  targetDetector: 'analyzer1' | 'analyzer2';
  requiredExperimentShots?: number;
  allowedExperiments?: number;   // Experiment run limit on challenge levels
  timeLimit?: number;            // Seconds limit
  xpReward: number;
  starThresholds: {
    threeStars: number;
    fourStars: number;
    fiveStars: number;
  };
}

export interface SpinSplitterState {
  analyzer1Angle: number;         // Degrees in X-Z plane [0, 360)
  analyzer2Angle?: number;        // Degrees for analyzer 2
  selectedBranch: BranchSelection;// '+' or '-'
  hasRunExperiment: boolean;
  experimentSample: SpinExperimentSample | null;
  experimentsUsed: number;
  timeRemaining?: number | null;
}

export interface SpinSplitterEvaluationResult extends EvaluationResult {
  details: {
    probPlus: number;
    probMinus: number;
    targetProbPlus: number;
    targetTolerance: number;
    errorDelta: number;
    angleDegrees: number;
    dotProduct: number;
    analyzer1Angle: number;
    analyzer2Angle?: number;
    selectedBranch: BranchSelection;
    collapsedState?: Vector3;
    experimentsUsed: number;
    hasRunExperiment: boolean;
    [key: string]: unknown;
  };
}

/**
 * Converts planar angle in degrees to 3D unit axis vector in X-Z plane:
 * 0° = +Z (0, 0, 1)
 * 90° = +X (1, 0, 0)
 * 180° = -Z (0, 0, -1)
 * 270° = -X (-1, 0, 0)
 */
export function angleToAxis2D(angleDeg: number): Vector3 {
  const rad = ((angleDeg % 360 + 360) % 360) * (Math.PI / 180);
  return {
    x: Math.sin(rad),
    y: 0,
    z: Math.cos(rad),
  };
}

/**
 * Converts 3D unit vector in X-Z plane back to planar angle in degrees [0, 360)
 */
export function axisToAngle2D(v: Vector3): number {
  const rad = Math.atan2(v.x, v.z);
  return (rad * (180 / Math.PI) + 360) % 360;
}

/**
 * Calculates spin-1/2 measurement probabilities along axis n:
 * P(+) = (1 + r · n) / 2 = cos²(θ/2)
 * P(-) = (1 - r · n) / 2 = sin²(θ/2)
 */
export function calculateSpinMeasurement(state: Vector3, axis: Vector3): SpinMeasurementResult {
  const normState = normalize(state);
  const normAxis = normalize(axis);

  const d = Math.max(-1.0, Math.min(1.0, dot(normState, normAxis)));
  const probPlus = Math.max(0.0, Math.min(1.0, (1.0 + d) / 2.0));
  const probMinus = Math.max(0.0, Math.min(1.0, (1.0 - d) / 2.0));

  // θ in degrees [0, 180°]
  const angleDegrees = (Math.acos(d) * 180) / Math.PI;

  return {
    probPlus,
    probMinus,
    angleDegrees,
    dotProduct: d,
  };
}

/**
 * Quantum State Projection / Collapse:
 * (+) outcome -> r' = n
 * (-) outcome -> r' = -n
 */
export function collapseSpinState(axis: Vector3, outcome: SpinOutcome): Vector3 {
  const normAxis = normalize(axis);
  if (outcome === '+') {
    return { ...normAxis };
  } else {
    return {
      x: -normAxis.x,
      y: -normAxis.y,
      z: -normAxis.z,
    };
  }
}

/**
 * Calculates sequential measurement across 1 or 2 analyzers:
 * If 2 analyzers, Analyzer 1 measurement projects the state, and
 * the selected branch (+ or -) enters Analyzer 2 as r_collapsed = ±n1.
 */
export function calculateSequentialSpin(
  sourceState: Vector3,
  analyzer1Axis: Vector3,
  branch: BranchSelection = '+',
  analyzer2Axis?: Vector3
): SequentialMeasurementResult {
  const res1 = calculateSpinMeasurement(sourceState, analyzer1Axis);
  const collapsed = collapseSpinState(analyzer1Axis, branch);

  if (!analyzer2Axis) {
    return {
      analyzer1: res1,
      selectedBranch: branch,
      collapsedState: collapsed,
      finalProbPlus: res1.probPlus,
      finalProbMinus: res1.probMinus,
    };
  }

  const res2 = calculateSpinMeasurement(collapsed, analyzer2Axis);
  return {
    analyzer1: res1,
    selectedBranch: branch,
    collapsedState: collapsed,
    analyzer2: res2,
    finalProbPlus: res2.probPlus,
    finalProbMinus: res2.probMinus,
  };
}

/**
 * Samples probabilistic particle measurement shots from calculated probability.
 * Supports seeded RNG for deterministic automated testing.
 */
export function sampleSpinExperiment(
  probPlus: number,
  shots = 100,
  rng: () => number = Math.random
): SpinExperimentSample {
  const samples: SpinOutcome[] = [];
  let countPlus = 0;
  let countMinus = 0;

  for (let i = 0; i < shots; i++) {
    const outcome: SpinOutcome = rng() < probPlus ? '+' : '-';
    samples.push(outcome);
    if (outcome === '+') {
      countPlus++;
    } else {
      countMinus++;
    }
  }

  return {
    shots,
    countPlus,
    countMinus,
    observedFreqPlus: shots > 0 ? countPlus / shots : 0,
    observedFreqMinus: shots > 0 ? countMinus / shots : 0,
    samples,
  };
}

/**
 * Universal Evaluator for Spin Splitter (Track 5):
 * Inspects current analyzer orientation, sequential branch selection,
 * real quantum probabilities, and mission targets.
 */
export function evaluateSpinSplitterLevel(
  state: SpinSplitterState,
  config: SpinSplitterLevelConfig
): SpinSplitterEvaluationResult {
  // 1. Calculate physical quantum simulation
  const axis1 = angleToAxis2D(state.analyzer1Angle);
  const axis2 =
    config.analyzerCount === 2 && state.analyzer2Angle !== undefined
      ? angleToAxis2D(state.analyzer2Angle)
      : undefined;

  const simResult = calculateSequentialSpin(
    config.sourceState,
    axis1,
    state.selectedBranch,
    axis2
  );

  const activeRes =
    config.targetDetector === 'analyzer1' || config.analyzerCount === 1
      ? simResult.analyzer1
      : simResult.analyzer2 || simResult.analyzer1;

  // Determine active detector probability based on level target
  const measuredProbPlus =
    config.targetDetector === 'analyzer1' || config.analyzerCount === 1
      ? simResult.analyzer1.probPlus
      : simResult.finalProbPlus;

  const measuredProbMinus = 1.0 - measuredProbPlus;
  const errorDelta = Math.abs(measuredProbPlus - config.targetProbPlus);
  const isSuccess = errorDelta <= config.targetTolerance;

  // 2. Resource check: Did player exceed experiment run limit?
  if (config.allowedExperiments && state.experimentsUsed > config.allowedExperiments) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: `Experiment budget exceeded (${state.experimentsUsed}/${config.allowedExperiments}). Reset to try again.`,
      details: {
        probPlus: measuredProbPlus,
        probMinus: measuredProbMinus,
        targetProbPlus: config.targetProbPlus,
        targetTolerance: config.targetTolerance,
        errorDelta,
        angleDegrees: activeRes.angleDegrees,
        dotProduct: activeRes.dotProduct,
        analyzer1Angle: state.analyzer1Angle,
        analyzer2Angle: state.analyzer2Angle,
        selectedBranch: state.selectedBranch,
        experimentsUsed: state.experimentsUsed,
        hasRunExperiment: state.hasRunExperiment,
      },
    };
  }

  // 3. Unstarted / Incomplete check (Experiment has not been executed yet)
  if (!state.hasRunExperiment) {
    const isUnstarted =
      state.experimentsUsed === 0 &&
      state.analyzer1Angle === config.analyzer1InitialAngle;
    const progress = Math.max(0.1, 1 - errorDelta);

    return {
      status: isUnstarted ? 'unstarted' : 'incomplete',
      score: 0,
      progress,
      feedback: isSuccess
        ? 'Target reached! Click "Run Experiment" to verify with a particle beam.'
        : 'Rotate the analyzer and click "Run Experiment" to observe particle deflection.',
      details: {
        probPlus: measuredProbPlus,
        probMinus: measuredProbMinus,
        targetProbPlus: config.targetProbPlus,
        targetTolerance: config.targetTolerance,
        errorDelta,
        angleDegrees: activeRes.angleDegrees,
        dotProduct: activeRes.dotProduct,
        analyzer1Angle: state.analyzer1Angle,
        analyzer2Angle: state.analyzer2Angle,
        selectedBranch: state.selectedBranch,
        collapsedState: simResult.collapsedState,
        experimentsUsed: state.experimentsUsed,
        hasRunExperiment: false,
      },
    };
  }

  // 4. Check branch selection requirement
  if (
    config.branchSelectionRequired &&
    config.targetBranch &&
    state.selectedBranch !== config.targetBranch
  ) {
    return {
      status: 'incorrect',
      score: 100,
      progress: 0.35,
      feedback: `❌ Wrong branch selected! The mission requires directing the ${config.targetBranch} branch into Analyzer 2. Currently sending the ${state.selectedBranch} branch.`,
      details: {
        probPlus: simResult.finalProbPlus,
        probMinus: simResult.finalProbMinus,
        targetProbPlus: config.targetProbPlus,
        targetTolerance: config.targetTolerance,
        errorDelta: Math.abs(simResult.finalProbPlus - config.targetProbPlus),
        angleDegrees: simResult.analyzer1.angleDegrees,
        dotProduct: simResult.analyzer1.dotProduct,
        analyzer1Angle: state.analyzer1Angle,
        analyzer2Angle: state.analyzer2Angle,
        selectedBranch: state.selectedBranch,
        collapsedState: simResult.collapsedState,
        experimentsUsed: state.experimentsUsed,
        hasRunExperiment: state.hasRunExperiment,
      },
    };
  }

  if (!isSuccess) {
    const isAlmost = errorDelta <= config.targetTolerance * 2.0;
    const currentPercent = (measuredProbPlus * 100).toFixed(1);
    const targetPercent = (config.targetProbPlus * 100).toFixed(0);
    const tolPercent = (config.targetTolerance * 100).toFixed(0);

    const feedback = isAlmost
      ? `Close! Current Detector + is ${currentPercent}% (Target: ${targetPercent}% ± ${tolPercent}%). Make a fine-tuning adjustment to the analyzer orientation.`
      : `Detector + received ${currentPercent}% (Target: ${targetPercent}% ± ${tolPercent}%). Rotate the analyzer to alter the measurement axis.`;

    const progress = Math.max(0.2, 1 - errorDelta);

    return {
      status: 'incorrect',
      score: Math.round(progress * 300),
      progress,
      feedback,
      details: {
        probPlus: measuredProbPlus,
        probMinus: measuredProbMinus,
        targetProbPlus: config.targetProbPlus,
        targetTolerance: config.targetTolerance,
        errorDelta,
        angleDegrees: activeRes.angleDegrees,
        dotProduct: activeRes.dotProduct,
        analyzer1Angle: state.analyzer1Angle,
        analyzer2Angle: state.analyzer2Angle,
        selectedBranch: state.selectedBranch,
        collapsedState: simResult.collapsedState,
        experimentsUsed: state.experimentsUsed,
        hasRunExperiment: state.hasRunExperiment,
      },
    };
  }

  // 4. Success!
  const accuracyBonus = Math.max(0, 1 - errorDelta / config.targetTolerance);
  const efficiencyBonus = config.allowedExperiments
    ? Math.max(0, (config.allowedExperiments - state.experimentsUsed) * 35)
    : 50;
  const finalScore = Math.round(config.xpReward + 100 * accuracyBonus + efficiencyBonus);

  const finalPercentPlus = (measuredProbPlus * 100).toFixed(1);
  const finalPercentMinus = (measuredProbMinus * 100).toFixed(1);

  return {
    status: 'success',
    score: finalScore,
    progress: 1.0,
    feedback: `✓ Target distribution achieved! Detector +: ${finalPercentPlus}%, Detector -: ${finalPercentMinus}% (Target: ${(config.targetProbPlus * 100).toFixed(0)}% ± ${(config.targetTolerance * 100).toFixed(0)}%).`,
    details: {
      probPlus: measuredProbPlus,
      probMinus: measuredProbMinus,
      targetProbPlus: config.targetProbPlus,
      targetTolerance: config.targetTolerance,
      errorDelta,
      angleDegrees: activeRes.angleDegrees,
      dotProduct: activeRes.dotProduct,
      analyzer1Angle: state.analyzer1Angle,
      analyzer2Angle: state.analyzer2Angle,
      selectedBranch: state.selectedBranch,
      collapsedState: simResult.collapsedState,
      experimentsUsed: state.experimentsUsed,
      hasRunExperiment: state.hasRunExperiment,
    },
  };
}
