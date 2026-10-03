// Track 3 — Quantum Interference Level Definitions

import type { LevelDefinition } from '../types';
import type { InterferenceLevelDefinition } from '../engines/interferenceEngine';

export interface WaveLevelConfig extends LevelDefinition {
  interferenceLevel: InterferenceLevelDefinition;
}

export const TRACK_3_LEVELS: WaveLevelConfig[] = [
  {
    id: 't3_l1',
    trackId: 'quantum-interference',
    trackNumber: 3,
    levelNumber: 1,
    title: 'Constructive Reinforcement',
    subtitle: 'Zero Phase Difference',
    description: 'Tune the movable path so both waves arrive in phase (Δφ = 0°), producing 100% constructive interference at Detector A.',
    difficulty: 'Beginner',
    educationalConcept: 'When two identical coherent quantum waves arrive with zero relative phase (crest aligns with crest), their amplitudes sum constructively, maximizing detection probability.',
    hints: [
      'The fixed path has phase 0.0 radians (0°).',
      'Rotate Path 2’s dial so its phase matches Path 1 (0° or 360°).',
      'Watch Detector A probability rise to 100%.',
    ],
    initialState: {
      paths: [
        { id: 'p1', name: 'Path 1 (Fixed)', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Path 2 (Tuning)', amplitude: 1, phase: Math.PI, isFixed: false }, // starts out of phase!
      ],
    },
    targetState: { targetA: 1.0, targetB: 0.0 },
    tolerance: 0.04,
    interferenceLevel: {
      paths: [
        { id: 'p1', name: 'Path 1 (Fixed)', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Path 2 (Tuning)', amplitude: 1, phase: Math.PI, isFixed: false },
      ],
      targetDetectorA: 1.0,
      targetDetectorB: 0.0,
      tolerance: 0.04,
      description: '100% Detector A (Constructive)',
    },
  },
  {
    id: 't3_l2',
    trackId: 'quantum-interference',
    trackNumber: 3,
    levelNumber: 2,
    title: 'Complete Cancellation',
    subtitle: '180° Destructive Interference',
    description: 'Adjust the relative phase to exactly 180° (π radians) so the wave amplitudes completely cancel out at Detector A, routing 100% intensity to Detector B.',
    difficulty: 'Beginner',
    educationalConcept: 'Destructive interference occurs when wave crests align with wave troughs, cancelling the probability amplitude at one detector and redistributing it to another.',
    hints: [
      'Rotate Path 2 until its phase is opposite to Path 1 (180° or π rad).',
      'Detector A should hit 0% and Detector B will hit 100%.',
    ],
    initialState: {
      paths: [
        { id: 'p1', name: 'Reference Path', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Phase Shifter', amplitude: 1, phase: 0, isFixed: false }, // starts in phase!
      ],
    },
    targetState: { targetA: 0.0, targetB: 1.0 },
    tolerance: 0.04,
    interferenceLevel: {
      paths: [
        { id: 'p1', name: 'Reference Path', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Phase Shifter', amplitude: 1, phase: 0, isFixed: false },
      ],
      targetDetectorA: 0.0,
      targetDetectorB: 1.0,
      tolerance: 0.04,
      description: '0% Detector A, 100% Detector B (Destructive)',
    },
  },
  {
    id: 't3_l3',
    trackId: 'quantum-interference',
    trackNumber: 3,
    levelNumber: 3,
    title: 'Targeted Probability Split',
    subtitle: '80% / 20% Superposition Ratio',
    description: 'Tune the phase difference to achieve exactly 80% probability at Detector A and 20% at Detector B.',
    difficulty: 'Intermediate',
    educationalConcept: 'Continuous phase control allows precise engineering of quantum probability distributions: P(A) = (1 + cos(Δφ))/2.',
    hints: [
      'For P(A) = 0.80, cos(Δφ) must equal 0.60.',
      'arccos(0.60) is approximately 53.1° (0.927 radians).',
      'Turn the phase dial until the error readout falls within tolerance.',
    ],
    initialState: {
      paths: [
        { id: 'p1', name: 'Arm α', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Arm β', amplitude: 1, phase: Math.PI / 2, isFixed: false },
      ],
    },
    targetState: { targetA: 0.8, targetB: 0.2 },
    tolerance: 0.03,
    interferenceLevel: {
      paths: [
        { id: 'p1', name: 'Arm α', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Arm β', amplitude: 1, phase: Math.PI / 2, isFixed: false },
      ],
      targetDetectorA: 0.8,
      targetDetectorB: 0.2,
      tolerance: 0.03,
      description: '80% at Detector A',
    },
  },
  {
    id: 't3_l4',
    trackId: 'quantum-interference',
    trackNumber: 3,
    levelNumber: 4,
    title: 'Dual Phase Shifting',
    subtitle: 'Two Movable Path Controls',
    description: 'Both paths are movable. Achieve a balanced 50% / 50% split at the detectors.',
    difficulty: 'Intermediate',
    educationalConcept: 'Phase is relative: only the difference (φ1 - φ2) governs the physical measurement outcomes.',
    hints: [
      'A 50/50 split occurs when Δφ = 90° (π/2 rad) or 270° (3π/2 rad).',
      'You can rotate either dial to establish a 90° separation.',
    ],
    initialState: {
      paths: [
        { id: 'p1', name: 'Path Alpha', amplitude: 1, phase: 0, isFixed: false },
        { id: 'p2', name: 'Path Beta', amplitude: 1, phase: 0, isFixed: false },
      ],
    },
    targetState: { targetA: 0.5, targetB: 0.5 },
    tolerance: 0.03,
    interferenceLevel: {
      paths: [
        { id: 'p1', name: 'Path Alpha', amplitude: 1, phase: 0, isFixed: false },
        { id: 'p2', name: 'Path Beta', amplitude: 1, phase: 0, isFixed: false },
      ],
      targetDetectorA: 0.5,
      targetDetectorB: 0.5,
      tolerance: 0.03,
      description: '50% / 50% balanced beam splitting',
    },
  },
  {
    id: 't3_l5',
    trackId: 'quantum-interference',
    trackNumber: 3,
    levelNumber: 5,
    title: 'Tri-Path Superposition',
    subtitle: '3 Coherent Optical Channels',
    description: 'Recombine 3 coherent paths. Steer the interference to direct 75% of power into Detector A.',
    difficulty: 'Advanced',
    educationalConcept: 'Multi-slit and multi-path quantum interference sums complex phasors in 2D Argand plane: A_total = Σ a_k e^(i φ_k).',
    hints: [
      'Paths 1 and 2 are fixed at 0° and 120°. Path 3 is movable.',
      'Rotate Path 3 to align its phasor with the vector sum.',
    ],
    initialState: {
      paths: [
        { id: 'p1', name: 'Channel 1', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Channel 2', amplitude: 1, phase: (2 * Math.PI) / 3, isFixed: true },
        { id: 'p3', name: 'Channel 3', amplitude: 1, phase: Math.PI, isFixed: false },
      ],
    },
    targetState: { targetA: 0.75, targetB: 0.25 },
    tolerance: 0.04,
    interferenceLevel: {
      paths: [
        { id: 'p1', name: 'Channel 1', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Channel 2', amplitude: 1, phase: (2 * Math.PI) / 3, isFixed: true },
        { id: 'p3', name: 'Channel 3', amplitude: 1, phase: Math.PI, isFixed: false },
      ],
      targetDetectorA: 0.75,
      targetDetectorB: 0.25,
      tolerance: 0.04,
      description: '75% at Detector A with 3 paths',
    },
  },
  {
    id: 't3_l6',
    trackId: 'quantum-interference',
    trackNumber: 3,
    levelNumber: 6,
    title: 'Quad-Path Coherence Master',
    subtitle: '4 Paths, High Precision (±2.5%)',
    description: 'Coordinate 4 independent wave paths to concentrate maximum intensity (≥ 92%) into Detector A.',
    difficulty: 'Expert',
    educationalConcept: 'Constructive interference across multiple paths forms sharp interference peaks, forming the basis of quantum frequency combs.',
    hints: [
      'Bring all movable paths into close phase alignment with the reference.',
      'Small deviations across 4 paths compound, so align each dial carefully.',
    ],
    initialState: {
      paths: [
        { id: 'p1', name: 'Ref 1', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Dial 2', amplitude: 1, phase: Math.PI / 2, isFixed: false },
        { id: 'p3', name: 'Dial 3', amplitude: 1, phase: Math.PI, isFixed: false },
        { id: 'p4', name: 'Dial 4', amplitude: 1, phase: (3 * Math.PI) / 2, isFixed: false },
      ],
    },
    targetState: { targetA: 0.92, targetB: 0.08 },
    tolerance: 0.025,
    interferenceLevel: {
      paths: [
        { id: 'p1', name: 'Ref 1', amplitude: 1, phase: 0, isFixed: true },
        { id: 'p2', name: 'Dial 2', amplitude: 1, phase: Math.PI / 2, isFixed: false },
        { id: 'p3', name: 'Dial 3', amplitude: 1, phase: Math.PI, isFixed: false },
        { id: 'p4', name: 'Dial 4', amplitude: 1, phase: (3 * Math.PI) / 2, isFixed: false },
      ],
      targetDetectorA: 0.92,
      targetDetectorB: 0.08,
      tolerance: 0.025,
      description: '≥ 92% constructive peak at Detector A',
    },
  },
];
