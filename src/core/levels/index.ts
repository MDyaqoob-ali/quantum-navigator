// Master Tracks and Levels Catalog for Quantum Navigator

import type { TrackId } from '../types';
import { TRACK_1_LEVELS } from './track1Levels';
import { TRACK_2_LEVELS } from './track2Levels';
import { TRACK_3_LEVELS } from './track3Levels';
import { TRACK_4_LEVELS } from './track4Levels';
import { TRACK_5_LEVELS } from './track5Levels';

export interface TrackMetadata {
  id: TrackId;
  trackNumber: number;
  title: string;
  gameName: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  levelCount: number;
}

export const ACTIVE_TRACKS: TrackMetadata[] = [
  {
    id: 'bloch-sphere',
    trackNumber: 1,
    title: 'Qubits & The Bloch Sphere',
    gameName: 'Quantum Navigator',
    tagline: 'Navigate quantum-state directions.',
    description: 'Rotate 3D Bloch sphere state vectors, balance fixed anchors with movable drivers, and align resultant vectors with surgical precision.',
    icon: 'Compass',
    color: '#D32F2F', // Crimson red
    levelCount: TRACK_1_LEVELS.length,
  },
  {
    id: 'quantum-gates',
    trackNumber: 2,
    title: 'Quantum Logic Gates',
    gameName: 'Gate Builder',
    tagline: 'Synthesize unitary quantum circuits.',
    description: 'Construct real quantum circuits using Pauli-X, Pauli-Z, Hadamard, CNOT, and Toffoli gates. Transform statevectors and create Bell and GHZ states.',
    icon: 'Cpu',
    color: '#3B82F6', // Scientific Blue
    levelCount: TRACK_2_LEVELS.length,
  },
  {
    id: 'quantum-interference',
    trackNumber: 3,
    title: 'Quantum Interference',
    gameName: 'Wave Lab',
    tagline: 'Master wave superposition and relative phase.',
    description: 'Control coherent wave paths through splitters and phase shifters. Engineer constructive and destructive interference to target detector outputs.',
    icon: 'Activity',
    color: '#0D9488', // Teal
    levelCount: TRACK_3_LEVELS.length,
  },
  {
    id: 'error-correction',
    trackNumber: 4,
    title: 'Quantum Error Correction',
    gameName: 'Quantum Repair Shop',
    tagline: 'Diagnose syndromes and protect quantum memory.',
    description: 'Harness 3-qubit repetition codes. Extract parity syndromes to isolate bit-flip and phase-flip corruptions, then execute precise fault-tolerant repairs.',
    icon: 'ShieldCheck',
    color: '#8B5CF6', // Purple/Violet
    levelCount: TRACK_4_LEVELS.length,
  },
  {
    id: 'phase-estimation',
    trackNumber: 5,
    title: 'Quantum Phase Estimation',
    gameName: 'Quantum Signal Scanner',
    tagline: 'Extract hidden eigenphases with inverse QFT.',
    description: 'Analyze unknown unitary eigenphases. Simulate real controlled phase evolution and inverse-QFT readout to decode binary fraction frequencies.',
    icon: 'Radio',
    color: '#F59E0B', // Amber
    levelCount: TRACK_5_LEVELS.length,
  },
];

export function getTrackLevels(trackId: TrackId): any[] {
  switch (trackId) {
    case 'bloch-sphere':
      return TRACK_1_LEVELS;
    case 'quantum-gates':
      return TRACK_2_LEVELS;
    case 'quantum-interference':
      return TRACK_3_LEVELS;
    case 'error-correction':
      return TRACK_4_LEVELS;
    case 'phase-estimation':
      return TRACK_5_LEVELS;
    default:
      return [];
  }
}

export function getLevelById(trackId: TrackId, levelId: string): any | undefined {
  const levels = getTrackLevels(trackId);
  return levels.find(l => l.id === levelId);
}
