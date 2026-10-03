// Track 1 — Qubits & The Bloch Sphere Level Definitions

import type { LevelDefinition } from '../types';
import type { BlochSphereState } from '../engines/blochEngine';

export interface BlochLevelConfig extends LevelDefinition {
  initialSpheres: BlochSphereState[];
  targetTheta: number; // [0, PI]
  targetPhi: number;   // [0, 2PI)
  toleranceDegrees: number;
}

export const TRACK_1_LEVELS: BlochLevelConfig[] = [
  {
    id: 't1_l1',
    trackId: 'bloch-sphere',
    trackNumber: 1,
    levelNumber: 1,
    title: 'Orientation Fundamentals',
    subtitle: 'Single Qubit State Vector',
    description: 'Rotate the movable red vector to point along the equator towards the |+⟩ state (θ = 90°, φ = 0°).',
    difficulty: 'Beginner',
    educationalConcept: 'A single qubit state is represented as a point on the Bloch sphere surface. |0⟩ is at the north pole, |1⟩ is at the south pole, and superpositions lie along the equator.',
    hints: [
      'The target is at the equator where theta is 90° (PI/2 radians).',
      'Drag the red endpoint from the south pole upward towards the +X axis.',
      'Check the target indicator to see your distance to alignment.',
    ],
    initialState: {
      spheres: [
        { id: 's1', name: 'Qubit 0', isFixed: false, theta: Math.PI, phi: 0, weight: 1 },
      ],
    },
    initialSpheres: [
      { id: 's1', name: 'Qubit 0', isFixed: false, theta: Math.PI, phi: 0, weight: 1 },
    ],
    targetState: { theta: Math.PI / 2, phi: 0 },
    targetTheta: Math.PI / 2,
    targetPhi: 0,
    toleranceDegrees: 8.0,
    tolerance: 8.0,
  },
  {
    id: 't1_l2',
    trackId: 'bloch-sphere',
    trackNumber: 1,
    levelNumber: 2,
    title: 'Dual Vector Summation',
    subtitle: '1 Fixed + 1 Movable Sphere',
    description: 'Sphere 1 is locked pointing towards |0⟩. Rotate Sphere 2 so their combined resultant points directly at |+⟩.',
    difficulty: 'Beginner',
    educationalConcept: 'Resultant aggregation combines individual Bloch vectors according to the game puzzle rule R = normalize(Σ w_i r_i).',
    hints: [
      'Sphere 1 is fixed along +Z (|0⟩).',
      'To tilt the resultant towards the equator, rotate Sphere 2 below the equator.',
      'Notice how the resultant vector updates immediately as you drag Sphere 2.',
    ],
    initialState: {
      spheres: [
        { id: 's1', name: 'Anchor Q0 (Fixed)', isFixed: true, theta: 0, phi: 0, weight: 1 },
        { id: 's2', name: 'Target Q1', isFixed: false, theta: Math.PI, phi: 0, weight: 1 },
      ],
    },
    initialSpheres: [
      { id: 's1', name: 'Anchor Q0 (Fixed)', isFixed: true, theta: 0, phi: 0, weight: 1 },
      { id: 's2', name: 'Target Q1', isFixed: false, theta: Math.PI, phi: 0, weight: 1 },
    ],
    targetState: { theta: Math.PI / 4, phi: 0 },
    targetTheta: Math.PI / 4,
    targetPhi: 0,
    toleranceDegrees: 7.0,
    tolerance: 7.0,
  },
  {
    id: 't1_l3',
    trackId: 'bloch-sphere',
    trackNumber: 1,
    levelNumber: 3,
    title: 'Tri-Vector Equilibrium',
    subtitle: '2 Fixed + 1 Movable Sphere',
    description: 'Two fixed spheres pull the resultant in opposite directions. Adjust the third sphere to hit the diagonal target.',
    difficulty: 'Intermediate',
    educationalConcept: 'Multiple vector forces can counterbalance each other. Careful positioning of the free vector achieves exact equilibrium.',
    hints: [
      'The fixed spheres have equal weight along +X and -Y.',
      'Rotate movable Sphere 3 to supply the missing component along +Z and +Y.',
      'Watch the angular error readout decrease as you approach.',
    ],
    initialState: {
      spheres: [
        { id: 's1', name: 'Q0 (Fixed)', isFixed: true, theta: Math.PI / 2, phi: 0, weight: 1 },
        { id: 's2', name: 'Q1 (Fixed)', isFixed: true, theta: Math.PI / 2, phi: Math.PI / 2, weight: 1 },
        { id: 's3', name: 'Q2 (Movable)', isFixed: false, theta: Math.PI, phi: 0, weight: 1 },
      ],
    },
    initialSpheres: [
      { id: 's1', name: 'Q0 (Fixed)', isFixed: true, theta: Math.PI / 2, phi: 0, weight: 1 },
      { id: 's2', name: 'Q1 (Fixed)', isFixed: true, theta: Math.PI / 2, phi: Math.PI / 2, weight: 1 },
      { id: 's3', name: 'Q2 (Movable)', isFixed: false, theta: Math.PI, phi: 0, weight: 1 },
    ],
    targetState: { theta: Math.PI / 3, phi: Math.PI / 4 },
    targetTheta: Math.PI / 3,
    targetPhi: Math.PI / 4,
    toleranceDegrees: 6.0,
    tolerance: 6.0,
  },
  {
    id: 't1_l4',
    trackId: 'bloch-sphere',
    trackNumber: 1,
    levelNumber: 4,
    title: 'Quad-Vector Coordination',
    subtitle: '2 Fixed + 2 Movable Spheres',
    description: 'Coordinate two movable vectors simultaneously to guide the resultant into the designated quantum corridor.',
    difficulty: 'Intermediate',
    educationalConcept: 'With multiple degrees of freedom, you can independently adjust the polar angle (theta) and phase angle (phi).',
    hints: [
      'Adjust Sphere 3 to handle the latitude (theta) and Sphere 4 to tune the longitude (phi).',
      'Both movable spheres contribute equally to the final direction.',
    ],
    initialState: {
      spheres: [
        { id: 's1', name: 'Anchor A', isFixed: true, theta: 0.2, phi: 0, weight: 1 },
        { id: 's2', name: 'Anchor B', isFixed: true, theta: Math.PI - 0.2, phi: Math.PI, weight: 1 },
        { id: 's3', name: 'Driver 1', isFixed: false, theta: Math.PI / 2, phi: Math.PI, weight: 1 },
        { id: 's4', name: 'Driver 2', isFixed: false, theta: Math.PI / 2, phi: Math.PI / 2, weight: 1 },
      ],
    },
    initialSpheres: [
      { id: 's1', name: 'Anchor A', isFixed: true, theta: 0.2, phi: 0, weight: 1 },
      { id: 's2', name: 'Anchor B', isFixed: true, theta: Math.PI - 0.2, phi: Math.PI, weight: 1 },
      { id: 's3', name: 'Driver 1', isFixed: false, theta: Math.PI / 2, phi: Math.PI, weight: 1 },
      { id: 's4', name: 'Driver 2', isFixed: false, theta: Math.PI / 2, phi: Math.PI / 2, weight: 1 },
    ],
    targetState: { theta: Math.PI / 2, phi: 0 },
    targetTheta: Math.PI / 2,
    targetPhi: 0,
    toleranceDegrees: 6.0,
    tolerance: 6.0,
  },
  {
    id: 't1_l5',
    trackId: 'bloch-sphere',
    trackNumber: 1,
    levelNumber: 5,
    title: 'Asymmetric Quad Steering',
    subtitle: '3 Fixed + 1 Movable Sphere',
    description: 'Three arbitrary fixed vectors exert heavy bias. Find the singular precise orientation for the sole movable vector.',
    difficulty: 'Advanced',
    educationalConcept: 'When most components are rigid, the solution space narrows down to a specific orientation.',
    hints: [
      'Inspect the fixed vectors: two point towards the northern hemisphere and one towards -X.',
      'The movable vector must steer strongly into the southern quadrant to balance the north bias.',
    ],
    initialState: {
      spheres: [
        { id: 's1', name: 'Fix 1', isFixed: true, theta: 0.4, phi: 0.5, weight: 1 },
        { id: 's2', name: 'Fix 2', isFixed: true, theta: 0.8, phi: 2.1, weight: 1 },
        { id: 's3', name: 'Fix 3', isFixed: true, theta: 1.2, phi: 4.2, weight: 1 },
        { id: 's4', name: 'Free Vector', isFixed: false, theta: 0, phi: 0, weight: 1 },
      ],
    },
    initialSpheres: [
      { id: 's1', name: 'Fix 1', isFixed: true, theta: 0.4, phi: 0.5, weight: 1 },
      { id: 's2', name: 'Fix 2', isFixed: true, theta: 0.8, phi: 2.1, weight: 1 },
      { id: 's3', name: 'Fix 3', isFixed: true, theta: 1.2, phi: 4.2, weight: 1 },
      { id: 's4', name: 'Free Vector', isFixed: false, theta: 0, phi: 0, weight: 1 },
    ],
    targetState: { theta: 2.0, phi: 1.5 },
    targetTheta: 2.0,
    targetPhi: 1.5,
    toleranceDegrees: 5.0,
    tolerance: 5.0,
  },
  {
    id: 't1_l6',
    trackId: 'bloch-sphere',
    trackNumber: 1,
    levelNumber: 6,
    title: 'High-Precision Calibration',
    subtitle: '4 Spheres, Tight Tolerance (±3.5°)',
    description: 'Calibrate the resultant within a strict ±3.5° tolerance zone. High precision is required.',
    difficulty: 'Expert',
    educationalConcept: 'Quantum state preparation in real hardware requires extremely low angular error to preserve fidelity.',
    hints: [
      'Make micro-adjustments by dragging slowly near the endpoint.',
      'Watch the live error counter to reach under 3.5°.',
    ],
    initialState: {
      spheres: [
        { id: 's1', name: 'Ref A', isFixed: true, theta: Math.PI / 4, phi: 0, weight: 1 },
        { id: 's2', name: 'Ref B', isFixed: true, theta: (3 * Math.PI) / 4, phi: Math.PI, weight: 1 },
        { id: 's3', name: 'Tuner 1', isFixed: false, theta: Math.PI / 2, phi: Math.PI / 2, weight: 1 },
        { id: 's4', name: 'Tuner 2', isFixed: false, theta: Math.PI / 2, phi: (3 * Math.PI) / 2, weight: 1 },
      ],
    },
    initialSpheres: [
      { id: 's1', name: 'Ref A', isFixed: true, theta: Math.PI / 4, phi: 0, weight: 1 },
      { id: 's2', name: 'Ref B', isFixed: true, theta: (3 * Math.PI) / 4, phi: Math.PI, weight: 1 },
      { id: 's3', name: 'Tuner 1', isFixed: false, theta: Math.PI / 2, phi: Math.PI / 2, weight: 1 },
      { id: 's4', name: 'Tuner 2', isFixed: false, theta: Math.PI / 2, phi: (3 * Math.PI) / 2, weight: 1 },
    ],
    targetState: { theta: Math.PI / 2, phi: 0.8 },
    targetTheta: Math.PI / 2,
    targetPhi: 0.8,
    toleranceDegrees: 3.5,
    tolerance: 3.5,
  },
];
