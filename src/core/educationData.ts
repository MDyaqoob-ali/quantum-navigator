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
    title: 'TRACK 5: QUANTUM PHASE ESTIMATION',
    gameName: 'Quantum Radar',
    whatIsIt: 'Quantum Phase Estimation is a quantum algorithm used to estimate the phase associated with an eigenvalue of a unitary operation.',
    howDoIPlay: 'Scan an unknown signal, configure a quantum phase-estimation experiment, run it, study the measurement results, and use them to estimate the hidden phase.',
    whatWillILearn: [
      'Quantum phase',
      'Controlled phase evolution',
      'Measurement',
      'Binary phase readout',
      'Inverse QFT',
      'Precision and estimation',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Hidden Quantum Phase',
        description: 'Each signal has a hidden phase associated with an unknown unitary eigenvalue.',
        highlightZone: 'radar-spectrum',
      },
      {
        title: 'STEP 2: Quantum Phase Estimation',
        description: 'Quantum phase estimation extracts information about that phase using controlled evolution and inverse QFT.',
        highlightZone: 'qpe-controls',
      },
      {
        title: 'STEP 3: Inspect Measurements',
        description: 'Run the experiment and inspect the measurement distribution to locate the dominant peak.',
        highlightZone: 'measurement-distribution',
      },
      {
        title: 'STEP 4: Estimate the Phase',
        description: 'Use the measured binary readout result (integer / 2ⁿ) to estimate the hidden phase.',
        highlightZone: 'phase-estimate-card',
      },
      {
        title: 'STEP 5: Lock the Signal',
        description: 'Lock the signal within the required accuracy to complete the mission.',
        highlightZone: 'lock-button',
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
  'phase-estimator': {
    id: 'phase-estimator',
    name: 'Phase Estimator Register',
    shortDesc: 'Measures quantum phase φ with binary precision 1/2ⁿ.',
    detailedDesc: 'Successive controlled-phase gates followed by an Inverse QFT map the eigenphase φ into the binary state of counting qubits.',
    trackId: 'phase-estimation',
  },
  'signal-source': {
    id: 'signal-source',
    name: 'Quantum Signal Source',
    shortDesc: 'An unknown emitter imparting a characteristic unitary eigenphase.',
    detailedDesc: 'Each signal source represents a quantum state |ψ⟩ governed by a unitary operator U|ψ⟩ = e^(2πiφ)|ψ⟩ with a hidden phase φ.',
    trackId: 'phase-estimation',
  },
  'spectrum': {
    id: 'spectrum',
    name: 'Quantum Spectrum',
    shortDesc: 'The angular phase spectrum [0.0, 1.0) monitored by the radar.',
    detailedDesc: 'The spectrum visualizes detected signal contacts across continuous phase space. Click any blip or beacon to load it into the QPE analyzer.',
    trackId: 'phase-estimation',
  },
  'precision': {
    id: 'precision',
    name: 'Estimation Precision',
    shortDesc: 'Number of estimation qubits used in the QPE register.',
    detailedDesc: 'More estimation qubits allow the phase to be represented with finer resolution (2 bits = 4 bins, 3 bits = 8 bins, 4 bits = 16 bins).',
    trackId: 'phase-estimation',
  },
  'estimation-qubit': {
    id: 'estimation-qubit',
    name: 'Estimation Qubit',
    shortDesc: 'Register qubit that stores phase information in superposition.',
    detailedDesc: 'Estimation qubits are initialized to |0⟩, put in superposition by Hadamards, and act as controls for unitary powers U^(2^k).',
    trackId: 'phase-estimation',
  },
  'controlled-u': {
    id: 'controlled-u',
    name: 'Controlled-U Operation',
    shortDesc: 'Applies U^(2^k) conditioned on the state of the estimation qubit.',
    detailedDesc: 'When the control qubit is |1⟩, the target state acquires an eigenvalue phase factor e^(2πi · 2^k · φ).',
    trackId: 'phase-estimation',
  },
  'measurement-distribution': {
    id: 'measurement-distribution',
    name: 'Measurement Distribution',
    shortDesc: 'The quantum probability distribution over computational basis states.',
    detailedDesc: 'Constructive interference creates sharp probability peaks on bitstrings that best approximate the binary fraction expansion of φ.',
    trackId: 'phase-estimation',
  },
  'binary-readout': {
    id: 'binary-readout',
    name: 'Binary Readout',
    shortDesc: 'Computational basis state bitstring |b₁b₂...bₙ⟩.',
    detailedDesc: 'The measured bitstring represents the dyadic fraction φ ≈ integer(bitstring) / 2ⁿ. For example, |011⟩ represents 3/8 = 0.375.',
    trackId: 'phase-estimation',
  },
  'inverse-qft': {
    id: 'inverse-qft',
    name: 'Inverse QFT (QFT†)',
    shortDesc: 'Converts phase oscillations into computational basis state amplitudes.',
    detailedDesc: 'The inverse Quantum Fourier Transform implements the discrete Fourier transform on quantum amplitudes, mapping frequency into position.',
    trackId: 'phase-estimation',
  },
  'estimated-phase': {
    id: 'estimated-phase',
    name: 'Estimated Phase (φ)',
    shortDesc: 'The decimal phase value deduced from the quantum readout.',
    detailedDesc: 'The calculated or selected decimal phase φ ∈ [0, 1) you are locking onto the signal.',
    trackId: 'phase-estimation',
  },
  'confidence': {
    id: 'confidence',
    name: 'Estimation Confidence',
    shortDesc: 'Statistical reliability based on sample size and peak sharpness.',
    detailedDesc: 'A pedagogical metric indicating how well the observed measurements converge upon a singular peak. More shots yield higher confidence.',
    trackId: 'phase-estimation',
  },
  'phase-lock': {
    id: 'phase-lock',
    name: 'Phase Lock Control',
    shortDesc: 'Locks the radar receiver onto the estimated quantum phase.',
    detailedDesc: 'Submits the selected signal and phase estimate to the quantum mission evaluator for verification against mission tolerance.',
    trackId: 'phase-estimation',
  },
};
