// Intelligent, State-Aware, Progressive Hint Engine for Quantum Navigator
// Generates dynamic pedagogical guidance based on live player state, error magnitude, and progression tiers.

import { TrackId } from '../types';
import { calculateBlochResultant } from './blochEngine';
import { sphericalToCartesian, angularDistanceDegrees } from '../math/vector3';
import { calculateInterference } from './interferenceEngine';
import { simulateCircuit } from './gateSimulationEngine';
import { stateFidelity } from '../math/statevector';
import { calculateTunneling, TunnelingState } from './tunnelingEngine';
import {
  calculateSequentialSpin,
  angleToAxis2D,
  SpinSplitterState,
} from './spinSplitterEngine';

export interface HintContext {
  trackId: TrackId;
  level: any;
  state: any;
  tier: number; // 1 = Conceptual, 2 = Direction, 3 = Specific, 4 = Near-direct
  hasInteracted?: boolean;
}

export interface GeneratedHint {
  tier: number;
  maxTier: number;
  title: string;
  body: string;
  actionableDirection?: string;
  isClose: boolean;
}

export function generateTrackHint(ctx: HintContext): GeneratedHint {
  const { trackId, level, state, tier } = ctx;
  const clampedTier = Math.max(1, Math.min(4, tier));

  switch (trackId) {
    case 'bloch-sphere':
      return generateBlochHint(level, state, clampedTier, ctx.hasInteracted);
    case 'quantum-gates':
      return generateGatesHint(level, state, clampedTier, ctx.hasInteracted);
    case 'quantum-interference':
      return generateInterferenceHint(level, state, clampedTier, ctx.hasInteracted);
    case 'quantum-tunneling':
    case 'error-correction':
      return generateTunnelingHint(level, state, clampedTier, ctx.hasInteracted);
    case 'phase-estimation':
      return generateSpinHint(level, state, clampedTier, ctx.hasInteracted);
    default:
      return {
        tier: clampedTier,
        maxTier: 4,
        title: 'Hint',
        body: 'Follow the level objective and align your quantum system with the target state.',
        isClose: false,
      };
  }
}

// -------------------------------------------------------------
// TRACK 1: BLOCH SPHERE HINTS
// -------------------------------------------------------------
function generateBlochHint(level: any, spheres: any[], tier: number, hasInteracted = false): GeneratedHint {
  if (!spheres || spheres.length === 0) {
    return {
      tier: 1,
      maxTier: 4,
      title: 'Bloch Sphere Basics',
      body: 'Start by dragging the red state vector on the movable Bloch sphere.',
      isClose: false,
    };
  }

  const resultant = calculateBlochResultant(spheres);
  const targetVec = sphericalToCartesian(level.targetTheta, level.targetPhi);
  const dist = angularDistanceDegrees(resultant, targetVec);
  const tol = level.toleranceDegrees || 5;
  const isClose = dist <= tol + 6;

  if (!hasInteracted) {
    return {
      tier,
      maxTier: 4,
      title: 'Initial Guidance',
      body: 'Start by dragging the red state vector on the movable sphere to change its orientation.',
      actionableDirection: 'Click and drag the vector endpoint.',
      isClose: false,
    };
  }

  if (dist <= tol) {
    return {
      tier,
      maxTier: 4,
      title: 'Target Aligned!',
      body: `Your resultant is aligned with the target within ±${tol}° (current error: ${dist.toFixed(1)}°). Click "Verify Alignment" to finish!`,
      isClose: true,
    };
  }

  if (isClose) {
    return {
      tier,
      maxTier: 4,
      title: 'Very Close Adjustment',
      body: `You are within ${dist.toFixed(1)}° of the target (tolerance is ±${tol}°). Make a fine-tuning nudge on the movable vector.`,
      actionableDirection: 'Small adjustment needed.',
      isClose: true,
    };
  }

  // Tier 1: Conceptual
  if (tier === 1) {
    const isPole = level.targetTheta < 0.25 ? '|0⟩ (+Z north pole)' : level.targetTheta > Math.PI - 0.25 ? '|1⟩ (-Z south pole)' : 'the equator (superposition)';
    return {
      tier: 1,
      maxTier: 4,
      title: 'Conceptual Target Orientation',
      body: `The target state points toward ${isPole}. Your current resultant is ${dist.toFixed(0)}° away.`,
      actionableDirection: 'Observe the target sphere orientation.',
      isClose: false,
    };
  }

  // Tier 2: Direction of correction
  if (tier === 2) {
    let dir = '';
    if (dist > 135) {
      dir = 'Your resultant is pointing away from the target. Rotate the movable vector toward the opposite hemisphere.';
    } else if (resultant.z < targetVec.z - 0.2) {
      dir = 'Rotate the movable vector upward toward the North pole (+Z).';
    } else if (resultant.z > targetVec.z + 0.2) {
      dir = 'Rotate the movable vector downward toward the South pole (-Z).';
    } else {
      dir = 'Rotate the vector around the equator (adjust longitude/phi).';
    }
    return {
      tier: 2,
      maxTier: 4,
      title: 'Correction Direction',
      body: `Your resultant is ${dist.toFixed(0)}° away. ${dir}`,
      actionableDirection: dir,
      isClose: false,
    };
  }

  // Tier 3: Specific sphere guidance
  if (tier === 3) {
    const movable = spheres.find((s: any) => !s.isFixed);
    const movableName = movable ? movable.name : 'the movable sphere';
    const targetDegTheta = ((level.targetTheta * 180) / Math.PI).toFixed(0);
    const targetDegPhi = ((level.targetPhi * 180) / Math.PI).toFixed(0);
    return {
      tier: 3,
      maxTier: 4,
      title: 'Specific Sphere Adjustment',
      body: `Adjust ${movableName}. The target coordinates are θ ≈ ${targetDegTheta}° and φ ≈ ${targetDegPhi}°.`,
      actionableDirection: `Steer ${movableName} toward latitude θ = ${targetDegTheta}°.`,
      isClose: false,
    };
  }

  // Tier 4: Direct guidance
  const targetDegTheta = ((level.targetTheta * 180) / Math.PI).toFixed(0);
  const targetDegPhi = ((level.targetPhi * 180) / Math.PI).toFixed(0);
  return {
    tier: 4,
    maxTier: 4,
    title: 'Direct Solution Guidance',
    body: `Set the movable vector directly toward latitude θ = ${targetDegTheta}° and longitude φ = ${targetDegPhi}° to match the target.`,
    actionableDirection: `θ = ${targetDegTheta}°, φ = ${targetDegPhi}°`,
    isClose: false,
  };
}

// -------------------------------------------------------------
// TRACK 2: QUANTUM GATES HINTS
// -------------------------------------------------------------
function generateGatesHint(level: any, gates: any[], tier: number, hasInteracted = false): GeneratedHint {
  if (!gates || gates.length === 0) {
    return {
      tier: 1,
      maxTier: 4,
      title: 'Starting the Circuit',
      body: 'Start by dragging a quantum gate from the toolbox onto one of the circuit wires.',
      actionableDirection: 'Add your first gate.',
      isClose: false,
    };
  }

  const numQ = level.gateLevel?.numQubits || level.gateLevel?.qubitCount || 1;
  const initBasis = level.gateLevel?.initialBasis || (numQ === 2 ? '00' : numQ === 3 ? '000' : '0');
  const simResult = simulateCircuit(gates, numQ, initBasis);
  const fidelity = level.gateLevel?.targetState
    ? stateFidelity(simResult.finalState, level.gateLevel.targetState)
    : 0.5;
  const isClose = fidelity >= 0.85;

  if (fidelity >= 0.999) {
    return {
      tier,
      maxTier: 4,
      title: 'Circuit Matched!',
      body: 'Your quantum circuit outputs the exact target state (fidelity 100%)! Click "Run Simulation" to complete.',
      isClose: true,
    };
  }

  if (tier === 1) {
    return {
      tier: 1,
      maxTier: 4,
      title: 'Gate Operation Concept',
      body: `Target state is |${level.gateLevel.targetName}⟩. ${level.educationalConcept}`,
      actionableDirection: 'Examine what transformations are needed.',
      isClose,
    };
  }

  if (tier === 2) {
    return {
      tier: 2,
      maxTier: 4,
      title: 'Circuit Progress',
      body: `Current state fidelity is ${(fidelity * 100).toFixed(0)}%. ${gates.length} gate(s) placed. Check if gates are applied in the right chronological order.`,
      actionableDirection: 'Verify gate sequence left-to-right.',
      isClose,
    };
  }

  if (tier === 3) {
    const hint = level.hints && level.hints.length >= 2 ? level.hints[1] : 'Consider which wire needs superposition or a bit flip.';
    return {
      tier: 3,
      maxTier: 4,
      title: 'Wire & Gate Guidance',
      body: hint,
      actionableDirection: 'Adjust gate placement on specific qubits.',
      isClose,
    };
  }

  const finalHint = level.hints && level.hints.length > 0 ? level.hints[level.hints.length - 1] : 'Match the target state amplitudes.';
  return {
    tier: 4,
    maxTier: 4,
    title: 'Direct Circuit Sequence',
    body: finalHint,
    actionableDirection: 'Place the specified gate combination.',
    isClose,
  };
}

// -------------------------------------------------------------
// TRACK 3: QUANTUM INTERFERENCE HINTS
// -------------------------------------------------------------
function generateInterferenceHint(level: any, paths: any[], tier: number, hasInteracted = false): GeneratedHint {
  if (!paths || paths.length === 0) {
    return {
      tier: 1,
      maxTier: 4,
      title: 'Interferometer Setup',
      body: 'Adjust the phase slider of the movable optical path.',
      isClose: false,
    };
  }

  const result = calculateInterference(paths);
  const targetA = level.interferenceLevel.targetDetectorA;
  const tol = level.interferenceLevel.tolerance;
  const error = Math.abs(result.probA - targetA);
  const isClose = error <= tol + 0.05;

  if (!hasInteracted) {
    return {
      tier,
      maxTier: 4,
      title: 'Getting Started',
      body: 'Start by adjusting the phase slider of the movable path to alter wave superposition.',
      actionableDirection: 'Drag the phase slider.',
      isClose: false,
    };
  }

  if (error <= tol) {
    return {
      tier,
      maxTier: 4,
      title: 'Target Probability Reached!',
      body: `Detector A output is ${(result.probA * 100).toFixed(1)}%, perfectly within target tolerance (target: ${(targetA * 100).toFixed(0)}% ± ${(tol * 100).toFixed(0)}%). Click "Verify Interference"!`,
      isClose: true,
    };
  }

  if (isClose) {
    return {
      tier,
      maxTier: 4,
      title: 'Extremely Close',
      body: `You are within ${(error * 100).toFixed(1)} percentage points of the target! Make a tiny phase adjustment.`,
      actionableDirection: 'Fine-tune phase slider by a few degrees.',
      isClose: true,
    };
  }

  if (tier === 1) {
    return {
      tier: 1,
      maxTier: 4,
      title: 'Interference Dynamics',
      body: `Target is Detector A = ${(targetA * 100).toFixed(0)}%, Detector B = ${((1 - targetA) * 100).toFixed(0)}%. Wave amplitudes combine coherently: relative phase shifts redistribute photon probabilities.`,
      actionableDirection: 'Observe the wave superposition graph.',
      isClose: false,
    };
  }

  if (tier === 2) {
    const needMoreA = result.probA < targetA;
    const direction = needMoreA
      ? `Detector A is at ${(result.probA * 100).toFixed(0)}% (target is ${(targetA * 100).toFixed(0)}%). You need more constructive interference into Detector A.`
      : `Detector A has too much amplitude (${(result.probA * 100).toFixed(0)}% vs target ${(targetA * 100).toFixed(0)}%). Shift phase toward destructive interference.`;
    return {
      tier: 2,
      maxTier: 4,
      title: 'Interference Direction',
      body: direction,
      actionableDirection: needMoreA ? 'Increase constructive phase alignment.' : 'Increase destructive phase cancellation.',
      isClose: false,
    };
  }

  if (tier === 3) {
    return {
      tier: 3,
      maxTier: 4,
      title: 'Phase Angle Guidance',
      body: `Current relative phase is Δφ = ${result.deltaPhaseDeg.toFixed(0)}°. For 100% Detector A, Δφ = 0°. For 50/50 split, Δφ = 90°. For 100% Detector B, Δφ = 180°.`,
      actionableDirection: 'Move movable path phase toward target range.',
      isClose: false,
    };
  }

  // Tier 4: Direct
  const targetDeg = targetA >= 0.9 ? '0° or 360°' : targetA <= 0.1 ? '180°' : Math.abs(targetA - 0.5) < 0.1 ? '90° or 270°' : targetA > 0.5 ? '45°–75°' : '105°–135°';
  return {
    tier: 4,
    maxTier: 4,
    title: 'Optimal Phase Target',
    body: `Set the movable path phase to approximately ${targetDeg} to match the required ${(targetA * 100).toFixed(0)}% / ${((1 - targetA) * 100).toFixed(0)}% output.`,
    actionableDirection: `Set phase ≈ ${targetDeg}`,
    isClose: false,
  };
}

// -------------------------------------------------------------
// TRACK 4: QUANTUM TUNNELING HINTS
// -------------------------------------------------------------
function generateTunnelingHint(level: any, liveState: any, tier: number, hasInteracted = false): GeneratedHint {
  const tunnelLevel = level.tunnelingLevel;
  if (!tunnelLevel) {
    return {
      tier: 1,
      maxTier: 4,
      title: 'Tunneling Calibration',
      body: 'Adjust parameters to hit the target transmission window.',
      isClose: false,
    };
  }

  const targetT = tunnelLevel.targetTransmission;
  const tol = tunnelLevel.targetTolerance;

  const currentState: TunnelingState = liveState && liveState.barriers
    ? liveState
    : tunnelLevel.initialState;

  const E = currentState.particleEnergy;
  const barriers = currentState.barriers || [];
  const minHeight = barriers.length > 0 ? Math.min(...barriers.map((b: any) => b.height)) : 1.0;

  const result = calculateTunneling(currentState);
  const currentT = result.transmission;
  const errorDelta = Math.abs(currentT - targetT);
  const isClose = errorDelta <= tol;

  // If already in target range
  if (isClose) {
    return {
      tier,
      maxTier: 4,
      title: 'Target In Range',
      body: `Your probability is ${(currentT * 100).toFixed(1)}%, and the target range is ${((targetT - tol) * 100).toFixed(0)}%–${((targetT + tol) * 100).toFixed(0)}%. You are already in range! Click [RUN EXPERIMENT] to verify.`,
      actionableDirection: 'Click [RUN EXPERIMENT]',
      isClose: true,
    };
  }

  // If E >= V0
  if (E >= minHeight) {
    return {
      tier,
      maxTier: 4,
      title: 'Over-Barrier Regime',
      body: `Particle energy E = ${E.toFixed(2)} meets or exceeds barrier height V0 = ${minHeight.toFixed(2)}. In quantum tunneling, keep E < V0 so the particle is in the classically forbidden zone.`,
      actionableDirection: `Reduce Particle Energy below ${minHeight.toFixed(2)}`,
      isClose: false,
    };
  }

  // Tier 1: Conceptual Explanation
  if (tier === 1) {
    if (barriers.length > 1) {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Multi-Barrier Quantum Interference',
        body: `With multiple barriers, waves bouncing within the potential well interfere. At resonant energies, constructive interference spikes the transmission probability.`,
        actionableDirection: 'Observe the wave profile in the central well.',
        isClose: false,
      };
    }
    if (tunnelLevel.adjustableEnergy && !barriers[0]?.adjustableWidth && !barriers[0]?.adjustableHeight) {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Particle Energy & Tunneling',
        body: `Particle energy E controls the decay rate inside the barrier: κ = √(2m(V0 - E))/ħ. Increasing energy reduces the barrier deficit, sharply increasing transmission.`,
        actionableDirection: 'Adjust Particle Energy toward the barrier crest.',
        isClose: false,
      };
    }
    if (barriers[0]?.adjustableWidth && !tunnelLevel.adjustableEnergy) {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Barrier Width & Exponential Decay',
        body: `Tunneling transmission decays exponentially with barrier width (T ∝ e^(-2κa)). A wide barrier heavily dampens the wave function; thinning the barrier increases transmission.`,
        actionableDirection: 'Observe how barrier thickness attenuates wave amplitude.',
        isClose: false,
      };
    }
    return {
      tier: 1,
      maxTier: 4,
      title: 'Quantum Tunneling Principles',
      body: `Target transmission is ${(targetT * 100).toFixed(0)}% ± ${(tol * 100).toFixed(0)}% (current: ${(currentT * 100).toFixed(1)}%). Wave penetration depends on the energy deficit (V0 - E) and spatial thickness a.`,
      actionableDirection: 'Adjust controls to modulate wave penetration.',
      isClose: false,
    };
  }

  // Tier 2: Parameter Identification
  if (tier === 2) {
    const isTooLow = currentT < targetT;
    let focus = 'Particle Energy';
    if (barriers.some((b: any) => b.adjustableWidth)) {
      focus = 'Barrier Width';
    } else if (barriers.some((b: any) => b.adjustableHeight)) {
      focus = 'Barrier Height';
    }

    return {
      tier: 2,
      maxTier: 4,
      title: 'Key Parameter Focus',
      body: `Your transmission probability is ${isTooLow ? 'too low' : 'too high'} (${(currentT * 100).toFixed(1)}% vs ${(targetT * 100).toFixed(0)}%). Focus on adjusting ${focus}.`,
      actionableDirection: isTooLow ? `Adjust ${focus} to increase wave transmission.` : `Adjust ${focus} to decrease wave transmission.`,
      isClose: errorDelta <= tol * 2,
    };
  }

  // Tier 3: Direction of Change
  if (tier === 3) {
    const isTooLow = currentT < targetT;
    let directionMsg = '';

    if (tunnelLevel.adjustableEnergy && isTooLow) {
      directionMsg = 'Increase Particle Energy while keeping E < V0 to reduce the exponential decay constant κ.';
    } else if (tunnelLevel.adjustableEnergy && !isTooLow) {
      directionMsg = 'Decrease Particle Energy to widen the energy barrier deficit and lower transmission.';
    } else if (barriers[0]?.adjustableWidth && isTooLow) {
      directionMsg = 'Decrease the Barrier Width. Thinning the barrier reduces spatial decay distance.';
    } else if (barriers[0]?.adjustableWidth && !isTooLow) {
      directionMsg = 'Increase the Barrier Width to absorb and reflect more of the incident wave.';
    } else if (barriers[0]?.adjustableHeight && isTooLow) {
      directionMsg = 'Lower the Barrier Height closer to the particle energy.';
    } else {
      directionMsg = 'Increase Barrier Height to steepen wave attenuation.';
    }

    return {
      tier: 3,
      maxTier: 4,
      title: 'Actionable Parameter Direction',
      body: directionMsg,
      actionableDirection: directionMsg,
      isClose: errorDelta <= tol * 2,
    };
  }

  // Tier 4: Concrete Guidance (Near-solution without auto-solving)
  const targetPercent = (targetT * 100).toFixed(0);
  const tolPercent = (tol * 100).toFixed(0);
  const hintBody = tunnelLevel.hints?.[2] || `Fine-tune your active slider so current transmission enters ${targetPercent}% ± ${tolPercent}%.`;

  return {
    tier: 4,
    maxTier: 4,
    title: 'Precision Calibration Target',
    body: hintBody,
    actionableDirection: `Calibrate to ${targetPercent}% ± ${tolPercent}%`,
    isClose: true,
  };
}

// -------------------------------------------------------------
// TRACK 5: SPIN SPLITTER (QUANTUM SPIN & MEASUREMENT) HINTS
// -------------------------------------------------------------
function generateSpinHint(level: any, state: any, tier: number, hasInteracted = false): GeneratedHint {
  const isStateObject = typeof state === 'object' && state !== null;
  const analyzer1Angle = isStateObject ? (state.analyzer1Angle ?? level.analyzer1InitialAngle ?? 0) : 0;
  const analyzer2Angle = isStateObject ? (state.analyzer2Angle ?? level.analyzer2InitialAngle) : level.analyzer2InitialAngle;
  const selectedBranch = isStateObject ? (state.selectedBranch ?? '+') : '+';
  const hasRun = isStateObject ? Boolean(state.hasRunExperiment) : hasInteracted;

  // Compute live physics
  const axis1 = angleToAxis2D(analyzer1Angle);
  const axis2 =
    level.analyzerCount === 2 && analyzer2Angle !== undefined
      ? angleToAxis2D(analyzer2Angle)
      : undefined;

  const simResult = calculateSequentialSpin(
    level.sourceState,
    axis1,
    selectedBranch,
    axis2
  );

  const activeRes =
    level.targetDetector === 'analyzer1' || level.analyzerCount === 1
      ? simResult.analyzer1
      : simResult.analyzer2 || simResult.analyzer1;

  const measuredProbPlus =
    level.targetDetector === 'analyzer1' || level.analyzerCount === 1
      ? simResult.analyzer1.probPlus
      : simResult.finalProbPlus;

  const targetProbPlus = level.targetProbPlus ?? 0.5;
  const targetTol = level.targetTolerance ?? 0.04;
  const errorDelta = Math.abs(measuredProbPlus - targetProbPlus);
  const isClose = errorDelta <= targetTol * 2.0;
  const isAligned = errorDelta <= targetTol;

  // 1. Branch mismatch check (for sequential levels)
  if (level.branchSelectionRequired && level.targetBranch && selectedBranch !== level.targetBranch) {
    if (tier === 1) {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Branch Routing',
        body: 'Your second analyzer is measuring the wrong branch. Look closely at which beam the mission requires routing.',
        actionableDirection: `Check branch requirement (${level.targetBranch}).`,
        isClose: false,
      };
    }
    return {
      tier,
      maxTier: 4,
      title: 'Select Correct Branch',
      body: `The mission requires routing the ${level.targetBranch} branch into Analyzer 2. Click "Select ${level.targetBranch} Branch".`,
      actionableDirection: `Switch to ${level.targetBranch} branch.`,
      isClose: false,
    };
  }

  // 2. Target already reached
  if (isAligned) {
    return {
      tier,
      maxTier: 4,
      title: 'Target Reached!',
      body: `Current Detector + is ${(measuredProbPlus * 100).toFixed(1)}%, within target ${(targetProbPlus * 100).toFixed(0)}% ± ${(targetTol * 100).toFixed(0)}%! Click "Run Experiment" to complete the mission.`,
      actionableDirection: 'Click "Run Experiment" now.',
      isClose: true,
    };
  }

  // 3. Very close
  if (isClose) {
    return {
      tier,
      maxTier: 4,
      title: 'Near Target',
      body: `You are within ${(errorDelta * 100).toFixed(1)} percentage points of the target! Make a subtle fine-tuning nudge on the active analyzer.`,
      actionableDirection: 'Subtle fine-tuning needed.',
      isClose: true,
    };
  }

  // 4. Tier 1: Conceptual physics
  if (tier === 1) {
    if (activeRes.angleDegrees < 25) {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Aligned Axis Dominance',
        body: 'Your analyzer axis is very close to the incoming spin direction, so the + outcome dominates (cos²(θ/2) ≈ 100%).',
        actionableDirection: 'Rotate analyzer away from source to split outcomes.',
        isClose: false,
      };
    } else if (Math.abs(activeRes.angleDegrees - 90) < 20) {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Perpendicular Measurement',
        body: 'Your analyzer is nearly perpendicular to the spin direction, producing an equal 50/50 split (cos²(45°) = 0.5).',
        actionableDirection: 'Rotate toward or away from spin to shift probability.',
        isClose: false,
      };
    } else if (activeRes.angleDegrees > 155) {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Opposite Axis Domination',
        body: 'Your analyzer points almost opposite to the spin direction, sending nearly all particles to Detector - (sin²(θ/2) ≈ 100%).',
        actionableDirection: 'Rotate back toward the spin direction.',
        isClose: false,
      };
    } else {
      return {
        tier: 1,
        maxTier: 4,
        title: 'Quantum Spin Measurement',
        body: 'Measurement probability is P(+) = cos²(θ/2), where θ is the angle between the particle spin vector and the analyzer axis.',
        actionableDirection: 'Rotate the analyzer orientation needle.',
        isClose: false,
      };
    }
  }

  // 5. Tier 2: Direction of rotation
  if (tier === 2) {
    const needMorePlus = measuredProbPlus < targetProbPlus;
    const dirText = needMorePlus
      ? 'Rotate your active analyzer closer to the particle spin direction to increase the + outcome probability.'
      : 'Rotate your active analyzer further away from the spin direction to reduce the + outcome probability.';
    return {
      tier: 2,
      maxTier: 4,
      title: 'Rotation Direction',
      body: `Detector + currently receives ${(measuredProbPlus * 100).toFixed(1)}% (Target: ${(targetProbPlus * 100).toFixed(0)}%). ${dirText}`,
      actionableDirection: needMorePlus ? 'Rotate closer to spin axis.' : 'Rotate further from spin axis.',
      isClose: false,
    };
  }

  // 6. Tier 3: Specific educational hints from level config
  if (tier === 3) {
    const levelHint = level.hints && level.hints[1] ? level.hints[1] : undefined;
    if (levelHint) {
      return {
        tier: 3,
        maxTier: 4,
        title: 'Level Guidance',
        body: levelHint,
        actionableDirection: 'Apply the level guidance.',
        isClose: false,
      };
    }
    const targetTheta = Math.round(2 * Math.acos(Math.sqrt(Math.max(0, Math.min(1, targetProbPlus)))) * (180 / Math.PI));
    return {
      tier: 3,
      maxTier: 4,
      title: 'Angle Separation Target',
      body: `To achieve ${(targetProbPlus * 100).toFixed(0)}% +, the separation angle θ between state and analyzer must be approximately ${targetTheta}°.`,
      actionableDirection: `Orient analyzer ~${targetTheta}° from state.`,
      isClose: false,
    };
  }

  // 7. Tier 4: Direct orientation / solution tip
  const finalHint = level.hints && level.hints[2] ? level.hints[2] : `Set the analyzer so Detector + reads ${(targetProbPlus * 100).toFixed(0)}% ± ${(targetTol * 100).toFixed(0)}%.`;
  return {
    tier: 4,
    maxTier: 4,
    title: 'Precision Alignment',
    body: finalHint,
    actionableDirection: `Target: ${(targetProbPlus * 100).toFixed(0)}% ± ${(targetTol * 100).toFixed(0)}%`,
    isClose: isClose,
  };
}
