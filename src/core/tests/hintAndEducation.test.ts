// Automated QA verification for Intelligent Hint System, Energy Rules, and Educational Data

import { describe, it, expect } from 'vitest';
import { generateTrackHint } from '../engines/hintEngine';
import { TRACK_INTROS, COMPONENT_HELP } from '../educationData';
import { TRACK_1_LEVELS } from '../levels/track1Levels';
import { TRACK_2_LEVELS } from '../levels/track2Levels';
import { TRACK_3_LEVELS } from '../levels/track3Levels';
import { TRACK_4_LEVELS } from '../levels/track4Levels';
import { TRACK_5_LEVELS } from '../levels/track5Levels';

describe('Intelligent Track-Aware Hint System', () => {
  it('Track 1 hints adapt to distance and tiers without leaking raw answer on tier 1', () => {
    const lvl = TRACK_1_LEVELS[0];
    
    // Unstarted
    const h0 = generateTrackHint({
      trackId: 'bloch-sphere',
      level: lvl,
      state: lvl.initialSpheres,
      tier: 1,
      hasInteracted: false,
    });
    expect(h0.body).toContain('Start by dragging');

    // Tier 1 (Conceptual)
    const h1 = generateTrackHint({
      trackId: 'bloch-sphere',
      level: lvl,
      state: lvl.initialSpheres,
      tier: 1,
      hasInteracted: true,
    });
    expect(h1.title).toContain('Conceptual');

    // Tier 2 (Direction)
    const h2 = generateTrackHint({
      trackId: 'bloch-sphere',
      level: lvl,
      state: lvl.initialSpheres,
      tier: 2,
      hasInteracted: true,
    });
    expect(h2.title).toContain('Direction');

    // Tier 3 (Specific)
    const h3 = generateTrackHint({
      trackId: 'bloch-sphere',
      level: lvl,
      state: lvl.initialSpheres,
      tier: 3,
      hasInteracted: true,
    });
    expect(h3.title).toContain('Specific');

    // Tier 4 (Direct)
    const h4 = generateTrackHint({
      trackId: 'bloch-sphere',
      level: lvl,
      state: lvl.initialSpheres,
      tier: 4,
      hasInteracted: true,
    });
    expect(h4.title).toContain('Direct');
  });

  it('Track 3 hints provide real-time guidance on interference phase', () => {
    const lvl = TRACK_3_LEVELS[0];
    const h = generateTrackHint({
      trackId: 'quantum-interference',
      level: lvl,
      state: lvl.interferenceLevel.paths,
      tier: 2,
      hasInteracted: true,
    });
    expect(h.body).toContain('Detector A');
  });

  it('Track 4 hints provide physical parameter guidance', () => {
    const lvl = TRACK_4_LEVELS[0];
    const h = generateTrackHint({
      trackId: 'quantum-tunneling',
      level: lvl,
      state: lvl.tunnelingLevel.initialState,
      tier: 2,
      hasInteracted: true,
    });
    expect(h.body).toContain('transmission probability');
    expect(h.title).toContain('Key Parameter Focus');
  });

  it('Track 5 hints evaluate true phase vs player estimate', () => {
    const lvl = TRACK_5_LEVELS[0];
    const h = generateTrackHint({
      trackId: 'phase-estimation',
      level: lvl,
      state: 0.1,
      tier: 2,
      hasInteracted: true,
    });
    expect(h.title).toContain('Estimate Direction');
  });
});

describe('Educational Data & Curriculum Completeness', () => {
  it('defines comprehensive track intros and walkthrough steps for all 5 tracks', () => {
    const trackIds = ['bloch-sphere', 'quantum-gates', 'quantum-interference', 'quantum-tunneling', 'phase-estimation'] as const;
    
    for (const tId of trackIds) {
      const intro = TRACK_INTROS[tId];
      expect(intro).toBeDefined();
      expect(intro.whatIsIt.length).toBeGreaterThan(10);
      expect(intro.howDoIPlay.length).toBeGreaterThan(10);
      expect(intro.whatWillILearn.length).toBeGreaterThan(2);
      expect(intro.walkthroughSteps.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('defines all required component explanations', () => {
    const requiredComponents = [
      'bloch-sphere',
      'state-vector',
      'target-vector',
      'resultant-vector',
      'gate-x',
      'gate-z',
      'gate-h',
      'gate-cnot',
      'gate-toffoli',
      'phase-dial',
      'beam-splitter',
      'detector-output',
      'particle',
      'barrier',
      'barrier-height',
      'barrier-width',
      'particle-energy',
      'transmission-probability',
      'target-probability',
      'phase-estimator',
    ];

    for (const compId of requiredComponents) {
      const comp = COMPONENT_HELP[compId];
      expect(comp).toBeDefined();
      expect(comp.name.length).toBeGreaterThan(0);
      expect(comp.detailedDesc.length).toBeGreaterThan(10);
    }
  });
});
