// Educational Curriculum, Track Introductions, Component Tooltips & Interactive Walkthrough Data

import { TrackId } from './types';

export interface TrackIntroData {
  trackId: TrackId;
  trackNumber: number;
  title: string;
  gameName: string;
  whatIsIt: string;
  howDoIPlay: string;
  whatWillILearn: string[];
  walkthroughSteps: {
    title: string;
    description: string;
    highlightZone?: string;
  }[];
}

export interface ComponentHelpData {
  id: string;
  name: string;
  shortDesc: string;
  detailedDesc: string;
  trackId?: TrackId;
}

export const TRACK_INTROS: Record<TrackId, TrackIntroData> = {
  'bloch-sphere': {
    trackId: 'bloch-sphere',
    trackNumber: 1,
    title: 'QUBITS & THE BLOCH SPHERE',
    gameName: 'Bloch Sphere Vector Navigation',
    whatIsIt: 'A Bloch sphere is a visual way to represent the state of a single qubit.',
    howDoIPlay: 'Drag the red state vector on the movable Bloch spheres and adjust the vectors until their resultant points toward the target.',
    whatWillILearn: [
      'Qubits & quantum state space',
      'State-vector direction & polar angles',
      'Bloch-sphere coordinates (θ, φ)',
      'Vector resultant orientation',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: The State Vector',
        description: 'This red arrow represents the qubit state vector on the Bloch sphere surface.',
        highlightZone: 'bloch-canvas',
      },
      {
        title: 'STEP 2: Drag the Endpoint',
        description: 'Click and drag the vector endpoint to rotate latitude (polar θ) and longitude (azimuthal φ).',
        highlightZone: 'bloch-canvas',
      },
      {
        title: 'STEP 3: Watch Resultant Change',
        description: 'Watch the composite resultant vector change in real time as you adjust the movable spheres.',
        highlightZone: 'resultant-readout',
      },
      {
        title: 'STEP 4: Match the Target',
        description: 'Align the resultant arrow with the target sphere within the tolerance threshold to complete the mission.',
        highlightZone: 'target-sphere',
      },
    ],
  },

  'quantum-gates': {
    trackId: 'quantum-gates',
    trackNumber: 2,
    title: 'QUANTUM LOGIC GATES',
    gameName: 'Quantum Circuit Builder',
    whatIsIt: 'Quantum gates change the state of qubits, similar to how logic gates transform classical information.',
    howDoIPlay: 'Place quantum gates into the circuit and run the circuit to see the resulting state.',
    whatWillILearn: [
      'Pauli-X (Bit-flip gate)',
      'Pauli-Z (Phase-flip gate)',
      'Hadamard (H) superposition',
      'CNOT (Controlled-NOT entanglement)',
      'Toffoli (CCNOT reversible logic)',
      'Quantum circuit synthesis',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Circuit Wires',
        description: 'Each horizontal wire line represents a physical qubit evolving chronologically from left to right.',
        highlightZone: 'circuit-grid',
      },
      {
        title: 'STEP 2: Placing Quantum Gates',
        description: 'Select gates ([X], [H], [CNOT], etc.) from the toolbox and place them onto empty circuit wire slots.',
        highlightZone: 'gate-toolbox',
      },
      {
        title: 'STEP 3: Multi-Qubit Entanglement',
        description: 'Use two-qubit CNOT gates to entangle qubits and create Bell states and superposition superhighways.',
        highlightZone: 'circuit-grid',
      },
      {
        title: 'STEP 4: Run & Verify State',
        description: 'Click "Run Simulation" to calculate exact complex amplitudes and verify 100% fidelity with the target.',
        highlightZone: 'run-button',
      },
    ],
  },

  'quantum-interference': {
    trackId: 'quantum-interference',
    trackNumber: 3,
    title: 'QUANTUM INTERFERENCE',
    gameName: 'Interferometer Wave Superposition',
    whatIsIt: 'Quantum interference happens when quantum probability amplitudes combine, reinforcing some outcomes and reducing others.',
    howDoIPlay: 'Adjust the phase of the available quantum paths and observe how the detector probabilities change to match the target.',
    whatWillILearn: [
      'Optical & wave phase Δφ',
      'Constructive interference peaks',
      'Destructive interference cancellation',
      'Probability amplitude redistribution',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Quantum Optical Paths',
        description: 'These coherent optical paths guide photons through the interferometer toward a recombining beam splitter.',
        highlightZone: 'wave-canvas',
      },
      {
        title: 'STEP 2: Drag the Phase Control',
        description: 'Drag the phase dial or slider to shift the relative wave phase Δφ of the movable path.',
        highlightZone: 'phase-slider',
      },
      {
        title: 'STEP 3: Watch Waves Recombine',
        description: 'Observe the wave superposition graph in real time as crests and troughs constructively reinforce or cancel.',
        highlightZone: 'superposition-graph',
      },
      {
        title: 'STEP 4: Match Detector Targets',
        description: 'Check the prominent comparison panel: adjust until Detector A and Detector B match the target percentages.',
        highlightZone: 'target-comparison',
      },
    ],
  },

  'quantum-tunneling': {
    trackId: 'quantum-tunneling',
    trackNumber: 4,
    title: 'TRACK 4: QUANTUM TUNNELING',
    gameName: 'Tunnel Run',
    whatIsIt: 'Quantum tunneling is a quantum effect where a particle has a non-zero probability of passing through a potential barrier that would block it classically when its energy is below the barrier height.',
    howDoIPlay: 'Adjust the particle energy and barrier properties, then try to bring the calculated transmission probability into the target zone.',
    whatWillILearn: [
      'Quantum tunneling',
      'Potential barriers',
      'Particle energy',
      'Barrier width',
      'Barrier height',
      'Transmission probability',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Quantum Particle',
        description: 'This is the quantum particle approaching the potential barrier.',
        highlightZone: 'particle-visual',
      },
      {
        title: 'STEP 2: Potential Barrier',
        description: 'This region is a potential barrier of height V0 and width a.',
        highlightZone: 'barrier-visual',
      },
      {
        title: 'STEP 3: Adjust Parameters',
        description: 'Adjust the particle energy or barrier parameters using the sliders.',
        highlightZone: 'tunnel-controls',
      },
      {
        title: 'STEP 4: Transmission Probability',
        description: 'Watch the transmission probability change as wave penetration responds to your adjustments.',
        highlightZone: 'target-card',
      },
      {
        title: 'STEP 5: Target Probability',
        description: 'Reach the target probability range to complete the mission.',
        highlightZone: 'result-panel',
      },
    ],
  },
  'error-correction': {
    trackId: 'quantum-tunneling' as any,
    trackNumber: 4,
    title: 'TRACK 4: QUANTUM TUNNELING',
    gameName: 'Tunnel Run',
    whatIsIt: 'Quantum tunneling is a quantum effect where a particle has a non-zero probability of passing through a potential barrier that would block it classically when its energy is below the barrier height.',
    howDoIPlay: 'Adjust the particle energy and barrier properties, then try to bring the calculated transmission probability into the target zone.',
    whatWillILearn: [
      'Quantum tunneling',
      'Potential barriers',
      'Particle energy',
      'Barrier width',
      'Barrier height',
      'Transmission probability',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Quantum Particle',
        description: 'This is the quantum particle approaching the potential barrier.',
        highlightZone: 'particle-visual',
      },
      {
        title: 'STEP 2: Potential Barrier',
        description: 'This region is a potential barrier of height V0 and width a.',
        highlightZone: 'barrier-visual',
      },
      {
        title: 'STEP 3: Adjust Parameters',
        description: 'Adjust the particle energy or barrier parameters using the sliders.',
        highlightZone: 'tunnel-controls',
      },
      {
        title: 'STEP 4: Transmission Probability',
        description: 'Watch the transmission probability change as wave penetration responds to your adjustments.',
        highlightZone: 'target-card',
      },
      {
        title: 'STEP 5: Target Probability',
        description: 'Reach the target probability range to complete the mission.',
        highlightZone: 'result-panel',
      },
    ],
  },

  'phase-estimation': {
    trackId: 'phase-estimation',
    trackNumber: 5,
    title: 'TRACK 5: QUANTUM SPIN & MEASUREMENT',
    gameName: 'Spin Splitter',
    whatIsIt: 'A spin-1/2 particle can produce two outcomes when measured along a chosen direction.',
    howDoIPlay: 'Rotate the spin analyzer and run experiments. Watch how the detector probabilities change.',
    whatWillILearn: [
      'Quantum spin',
      'Measurement direction',
      'Probability',
      'State collapse',
      'Sequential measurements',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Incoming Spin State',
        description: 'This is the incoming quantum spin state represented by a Bloch vector r.',
        highlightZone: 'source-spin-area',
      },
      {
        title: 'STEP 2: Measurement Direction',
        description: 'The analyzer measures spin along its chosen direction n.',
        highlightZone: 'analyzer-visual',
      },
      {
        title: 'STEP 3: Two Outcomes',
        description: 'The particle can produce + or - with probabilities P(+) = cos²(θ/2) and P(-) = sin²(θ/2).',
        highlightZone: 'detector-bars',
      },
      {
        title: 'STEP 4: Rotate the Analyzer',
        description: 'Rotate the analyzer orientation and watch the detector probabilities change in real time.',
        highlightZone: 'analyzer-controls',
      },
      {
        title: 'STEP 5: State Preparation',
        description: 'In sequential levels, a measurement prepares the collapsed state used by the next analyzer.',
        highlightZone: 'sequential-flow',
      },
    ],
  },
};

export const COMPONENT_HELP: Record<string, ComponentHelpData> = {
  'bloch-sphere': {
    id: 'bloch-sphere',
    name: 'Bloch Sphere',
    shortDesc: 'Geometric representation of a pure 2-level quantum state.',
    detailedDesc: 'The north pole is |0⟩, the south pole is |1⟩, and the equator represents equal superpositions like |+⟩ and |-⟩. Drag the red arrow to change state angles.',
    trackId: 'bloch-sphere',
  },
  'state-vector': {
    id: 'state-vector',
    name: 'State Vector |ψ⟩',
    shortDesc: 'A unit vector defining the exact superposition of a qubit.',
    detailedDesc: '|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩. The red arrow shows both polar angle θ (latitude) and azimuthal angle φ (longitude).',
    trackId: 'bloch-sphere',
  },
  'target-vector': {
    id: 'target-vector',
    name: 'Target State Vector',
    shortDesc: 'The required orientation your quantum system must achieve.',
    detailedDesc: 'The blue dashed arrow or dedicated target sphere indicates the objective orientation. Match the resultant vector with this target.',
    trackId: 'bloch-sphere',
  },
  'resultant-vector': {
    id: 'resultant-vector',
    name: 'Composite Resultant Vector',
    shortDesc: 'The vector sum of all active Bloch spheres in the level.',
    detailedDesc: 'As you rotate movable spheres, their contributions sum together into the resultant vector. Align this vector with the target direction.',
    trackId: 'bloch-sphere',
  },
  'gate-x': {
    id: 'gate-x',
    name: 'Pauli-X Gate',
    shortDesc: 'Quantum bit-flip operator (equivalent to classical NOT).',
    detailedDesc: 'Flips |0⟩ to |1⟩ and |1⟩ to |0⟩. On the Bloch sphere, it performs a 180° rotation around the X-axis.',
    trackId: 'quantum-gates',
  },
  'gate-z': {
    id: 'gate-z',
    name: 'Pauli-Z Gate',
    shortDesc: 'Quantum phase-flip operator.',
    detailedDesc: 'Leaves |0⟩ unchanged, but flips the phase of |1⟩ to -|1⟩. It changes |+⟩ = (|0⟩+|1⟩)/√2 into |-⟩ = (|0⟩-|1⟩)/√2.',
    trackId: 'quantum-gates',
  },
  'gate-h': {
    id: 'gate-h',
    name: 'Hadamard Gate (H)',
    shortDesc: 'Creates equal quantum superposition from computational basis states.',
    detailedDesc: 'Maps |0⟩ to |+⟩ and |1⟩ to |-⟩. Essential for initiating quantum interference and quantum parallelism.',
    trackId: 'quantum-gates',
  },
  'gate-cnot': {
    id: 'gate-cnot',
    name: 'CNOT Gate (Controlled-NOT)',
    shortDesc: 'Two-qubit entangling gate.',
    detailedDesc: 'If the control qubit is |1⟩, it flips the target qubit with an X gate; otherwise, the target is unchanged. Generates entangled Bell states.',
    trackId: 'quantum-gates',
  },
  'gate-toffoli': {
    id: 'gate-toffoli',
    name: 'Toffoli Gate (CCNOT)',
    shortDesc: 'Three-qubit reversible controlled-controlled-NOT gate.',
    detailedDesc: 'Flips the target qubit only if both control qubits are in state |1⟩. Universal for classical reversible computing.',
    trackId: 'quantum-gates',
  },
  'phase-dial': {
    id: 'phase-dial',
    name: 'Phase Dial & Slider',
    shortDesc: 'Controls the relative optical phase Δφ of a quantum path.',
    detailedDesc: 'Shifting the phase rotates the probability amplitude in the complex plane, altering how waves combine at the beam splitter.',
    trackId: 'quantum-interference',
  },
  'beam-splitter': {
    id: 'beam-splitter',
    name: '50:50 Beam Splitter',
    shortDesc: 'Recombines coherent paths to produce interference.',
    detailedDesc: 'Applies a Hadamard-like transformation on spatial modes, directing photons into Detector A or B depending on relative phase.',
    trackId: 'quantum-interference',
  },
  'detector-output': {
    id: 'detector-output',
    name: 'Detector Probabilities',
    shortDesc: 'Expected output distribution at Detectors A and B.',
    detailedDesc: 'Constructive interference maximizes probability at one detector, while destructive interference cancels output at the other.',
    trackId: 'quantum-interference',
  },
  'particle': {
    id: 'particle',
    name: 'Quantum Particle',
    shortDesc: 'The incident quantum entity with defined energy E.',
    detailedDesc: 'Represented by a localized wave packet moving toward potential barriers. In quantum mechanics, its probability distribution penetrates regions where E < V0.',
    trackId: 'quantum-tunneling',
  },
  'barrier': {
    id: 'barrier',
    name: 'Potential Barrier',
    shortDesc: 'A localized region of potential energy V0.',
    detailedDesc: 'Classically, a particle without sufficient kinetic energy (E < V0) is 100% blocked. Quantum mechanically, the wave penetrates as an evanescent decaying mode.',
    trackId: 'quantum-tunneling',
  },
  'barrier-height': {
    id: 'barrier-height',
    name: 'Barrier Height (V0)',
    shortDesc: 'This is the potential energy level of the barrier.',
    detailedDesc: 'When the particle energy is below the barrier height, tunneling can occur. Increasing V0 raises the decay parameter κ, reducing transmission.',
    trackId: 'quantum-tunneling',
  },
  'barrier-width': {
    id: 'barrier-width',
    name: 'Barrier Width (a)',
    shortDesc: 'The spatial thickness of the potential barrier.',
    detailedDesc: 'Tunneling probability decays exponentially with barrier width (T ∝ e^(-2κa)). Reducing width sharply increases transmission.',
    trackId: 'quantum-tunneling',
  },
  'particle-energy': {
    id: 'particle-energy',
    name: 'Particle Energy (E)',
    shortDesc: 'The total energy of the incoming quantum particle.',
    detailedDesc: 'Higher energy closer to the barrier height V0 reduces the energy deficit (V0 - E), weakening exponential decay and boosting tunneling transmission.',
    trackId: 'quantum-tunneling',
  },
  'transmission-probability': {
    id: 'transmission-probability',
    name: 'Transmission Probability (T)',
    shortDesc: 'Calculated probability that the particle passes through the barrier.',
    detailedDesc: 'Calculated directly from the Schrödinger equation using physical parameters: T = 1 / [1 + (V0² sinh²(κa)) / (4E(V0-E))].',
    trackId: 'quantum-tunneling',
  },
  'classical-path': {
    id: 'classical-path',
    name: 'Classical Path',
    shortDesc: 'In classical physics, a particle with E < V0 is strictly reflected.',
    detailedDesc: 'A classical particle bounces off the potential wall with zero penetration and zero transmission probability.',
    trackId: 'quantum-tunneling',
  },
  'quantum-path': {
    id: 'quantum-path',
    name: 'Quantum Path',
    shortDesc: 'The wave function has non-zero amplitude emerging on the far side.',
    detailedDesc: 'Quantum wave mechanics allows the evanescent tail inside the barrier to connect smoothly to an emerging transmitted traveling wave.',
    trackId: 'quantum-tunneling',
  },
  'target-probability': {
    id: 'target-probability',
    name: 'Target Probability Window',
    shortDesc: 'The required transmission range you must reach to succeed.',
    detailedDesc: 'Every level specifies a target probability (e.g. 70% ± 3%). Calibrate your physical parameters to land within this precision window.',
    trackId: 'quantum-tunneling',
  },
  'tunnel-probability': {
    id: 'tunnel-probability',
    name: 'Tunnel Probability',
    shortDesc: 'The probability of penetrating the classically forbidden region.',
    detailedDesc: 'Valid only when E < V0. When E ≥ V0, the process transitions to over-barrier transmission.',
    trackId: 'quantum-tunneling',
  },
  'barrier-sequence': {
    id: 'barrier-sequence',
    name: 'Barrier Sequence',
    shortDesc: 'Multiple potential barriers arranged in series.',
    detailedDesc: 'Multiple barriers form quantum wells between them, creating resonant transmission peaks via internal constructive interference.',
    trackId: 'quantum-tunneling',
  },
  'experiment-run': {
    id: 'experiment-run',
    name: 'Run Experiment Control',
    shortDesc: 'Samples probabilistic trials based on the theoretical transmission.',
    detailedDesc: 'Simulates 100 trials using a binomial distribution drawn from the exact theoretical probability, demonstrating the connection between theory and experimental measurement.',
    trackId: 'quantum-tunneling',
  },
  'source-spin': {
    id: 'source-spin',
    name: 'Source Spin',
    shortDesc: 'This arrow represents the particle’s current spin state.',
    detailedDesc: 'The incoming spin-1/2 particle has an intrinsic spin direction represented by a unit Bloch vector r. In quantum mechanics, spin state is not predetermined classical rotation, but a quantum superposition.',
    trackId: 'phase-estimation',
  },
  'spin-analyzer': {
    id: 'spin-analyzer',
    name: 'Spin Analyzer',
    shortDesc: 'The analyzer measures spin along its orientation.',
    detailedDesc: 'Oriented along a unit axis n. The probability of measuring + is P(+) = (1 + r·n)/2 = cos²(θ/2), and measuring - is P(-) = (1 - r·n)/2 = sin²(θ/2), where θ is the angle between r and n.',
    trackId: 'phase-estimation',
  },
  'detector': {
    id: 'detector',
    name: 'Spin Detector',
    shortDesc: 'This records which measurement outcome occurred.',
    detailedDesc: 'When particles exit the Stern-Gerlach analyzer, they register at either the + Detector or the - Detector. Repeated runs reveal the quantum probability distribution.',
    trackId: 'phase-estimation',
  },
  'branch': {
    id: 'branch',
    name: 'Selective Beam Branch',
    shortDesc: 'This is the beam corresponding to one measurement result.',
    detailedDesc: 'Following measurement along axis n, particles that produce outcome + or - collapse into state r\' = +n or r\' = -n. You can filter and route a single branch into subsequent analyzers.',
    trackId: 'phase-estimation',
  },
  'second-analyzer': {
    id: 'second-analyzer',
    name: 'Second Spin Analyzer',
    shortDesc: 'This measures the state produced by the first analyzer.',
    detailedDesc: 'Because quantum measurement collapses the wave function, Analyzer 2 acts on the newly prepared post-measurement state (±n₁), demonstrating quantum state projection and measurement disturbance.',
    trackId: 'phase-estimation',
  },
  'state-collapse': {
    id: 'state-collapse',
    name: 'Quantum State Collapse',
    shortDesc: 'Measurement projects the particle onto the measured spin axis.',
    detailedDesc: 'A measurement along direction n does not merely observe a prior state—it forces the quantum particle into an eigenstate of that measurement axis: r\' = ±n.',
    trackId: 'phase-estimation',
  },
  'experiment-shots': {
    id: 'experiment-shots',
    name: 'Particle Beam Experiment',
    shortDesc: 'Sends a beam of 10, 50, or 100 particles through the apparatus.',
    detailedDesc: 'Each particle is probabilistically measured. While individual runs fluctuate statistically, repeating measurements with larger particle counts converges toward the theoretical probabilities.',
    trackId: 'phase-estimation',
  },
};
