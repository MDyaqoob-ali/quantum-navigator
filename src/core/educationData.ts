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

  'error-correction': {
    trackId: 'error-correction',
    trackNumber: 4,
    title: 'TRACK 4: QUANTUM ERROR CORRECTION',
    gameName: 'Quantum Shield',
    whatIsIt: 'Quantum information can be affected by noise. Error-correction techniques use structured information to detect and correct certain errors.',
    howDoIPlay: 'Protect a quantum message, send it through a noisy channel, inspect the resulting error, diagnose it using the available information, repair it, and verify the result.',
    whatWillILearn: [
      'Quantum noise',
      'Bit-flip errors',
      'Phase-flip errors',
      'Redundancy',
      'Syndrome detection',
      'Error correction',
      'Verification',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Quantum Message',
        description: 'Start with a logical quantum message.',
        highlightZone: 'quantum-message',
      },
      {
        title: 'STEP 2: Protect with Redundancy',
        description: 'Protect it using redundancy.',
        highlightZone: 'encoded-qubits',
      },
      {
        title: 'STEP 3: Noisy Channel',
        description: 'Noise may corrupt part of the protected information.',
        highlightZone: 'noise-channel',
      },
      {
        title: 'STEP 4: Diagnose & Repair',
        description: 'Use diagnostic information to identify and repair the error.',
        highlightZone: 'diagnostic-panel',
      },
    ],
  },

  'phase-estimation': {
    trackId: 'phase-estimation',
    trackNumber: 5,
    title: 'QUANTUM PHASE ESTIMATION',
    gameName: 'Phase Estimation Spectrometer',
    whatIsIt: 'Quantum phase estimation is used to estimate an unknown phase associated with a quantum operation.',
    howDoIPlay: 'Interact with the phase estimation controls and quantum circuit, then estimate the hidden phase within the required tolerance.',
    whatWillILearn: [
      'Eigenvalues & phase evolution e^(2πiθ)',
      'Controlled unitary operations',
      'Quantum Fourier Transform (QFT†)',
      'Measurement register sampling',
      'Binary fraction precision & tolerance',
    ],
    walkthroughSteps: [
      {
        title: 'STEP 1: Unknown Unitary Phase',
        description: 'A target qubit has an unknown eigenphase θ applied by controlled powers of a unitary operator.',
        highlightZone: 'unitary-circuit',
      },
      {
        title: 'STEP 2: Quantum Fourier Transform',
        description: 'An Inverse QFT transforms phase frequencies into sharp constructive interference peaks in the counting register.',
        highlightZone: 'qft-stage',
      },
      {
        title: 'STEP 3: Sample Quantum Register',
        description: 'Click "Sample Quantum Register" to measure 1,000 quantum shots and observe the readout probability histogram.',
        highlightZone: 'sample-button',
      },
      {
        title: 'STEP 4: Measure Peak & Estimate',
        description: 'Identify the highest probability peak bin k, calculate θ ≈ k / 2ⁿ, and adjust the estimate slider within tolerance.',
        highlightZone: 'phase-slider',
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
  'syndrome-bits': {
    id: 'syndrome-bits',
    name: 'Parity Syndrome Bits (S1, S2)',
    shortDesc: 'Non-destructive parity checks that diagnose error locations.',
    detailedDesc: 'S1 = q1 ⊕ q2 and S2 = q2 ⊕ q3. "00" = No error, "10" = Q1 corrupted, "11" = Q2 corrupted, "01" = Q3 corrupted.',
    trackId: 'error-correction',
  },
  'phase-flip-concept': {
    id: 'phase-flip-concept',
    name: 'Phase-Flip Error (Pauli-Z)',
    shortDesc: 'Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩. Flips relative phase without changing basis.',
    detailedDesc: 'A phase flip does not change 0 into 1. Instead, it reverses the sign of the |1⟩ component. In a phase-flip code, Hadamard transformations turn phase flips into bit flips.',
    trackId: 'error-correction',
  },
  'quantum-message': {
    id: 'quantum-message',
    name: 'Quantum Message',
    shortDesc: 'This is the logical information you are protecting.',
    detailedDesc: 'The logical state (|0_L⟩ or |1_L⟩) that must be preserved through noisy quantum channels and storage registers.',
    trackId: 'error-correction',
  },
  'encoded-qubits': {
    id: 'encoded-qubits',
    name: 'Encoded Qubits',
    shortDesc: 'Redundancy represents the logical information using multiple physical qubits.',
    detailedDesc: 'In a 3-qubit repetition code, |0_L⟩ becomes |000⟩ and |1_L⟩ becomes |111⟩ so single-qubit errors can be isolated and reversed.',
    trackId: 'error-correction',
  },
  'noise-channel': {
    id: 'noise-channel',
    name: 'Noise Channel',
    shortDesc: 'This simulates an error affecting the quantum information.',
    detailedDesc: 'Environmental decoherence, thermal excitation, and cosmic rays introduce bit flips (X) or phase flips (Z) to physical qubits.',
    trackId: 'error-correction',
  },
  'error-indicator': {
    id: 'error-indicator',
    name: 'Error Indicator',
    shortDesc: 'Visual status indicator highlighting integrity disparity.',
    detailedDesc: 'Flags when physical qubits differ from the expected parity checks, warning that corruption has penetrated the register.',
    trackId: 'error-correction',
  },
  'syndrome-checker': {
    id: 'syndrome-checker',
    name: 'Syndrome Checker',
    shortDesc: 'Diagnostic information that helps identify certain errors without directly revealing the protected logical state.',
    detailedDesc: 'Parities S1 = q1 ⊕ q2 and S2 = q2 ⊕ q3 measure relative discrepancies without measuring and collapsing the logical quantum superposition.',
    trackId: 'error-correction',
  },
  'diagnostic-panel': {
    id: 'diagnostic-panel',
    name: 'Diagnostic Panel',
    shortDesc: 'Interactive diagnostic console to evaluate parity syndrome checks.',
    detailedDesc: 'Run parity checks to systematically deduce which physical qubit has experienced an error.',
    trackId: 'error-correction',
  },
  'correction-toolbox': {
    id: 'correction-toolbox',
    name: 'Correction Toolbox',
    shortDesc: 'Choose the operation needed to reverse the diagnosed error.',
    detailedDesc: 'Select the damaged qubit and the corresponding recovery gate (Pauli-X for bit flips, Pauli-Z for phase flips), then apply.',
    trackId: 'error-correction',
  },
  'verification-panel': {
    id: 'verification-panel',
    name: 'Verification Panel',
    shortDesc: 'Checks whether the corrected state actually satisfies the target.',
    detailedDesc: 'Computes post-repair parity syndrome (must be 00) and confirms that logical information is fully restored.',
    trackId: 'error-correction',
  },
  'shield-integrity': {
    id: 'shield-integrity',
    name: 'Shield Integrity Indicator',
    shortDesc: 'Contextual gameplay representation of protection and condition.',
    detailedDesc: 'Tracks overall fault tolerance and resilience before total unrecoverable state decoherence occurs.',
    trackId: 'error-correction',
  },
  'phase-estimator': {
    id: 'phase-estimator',
    name: 'Phase Estimator Register',
    shortDesc: 'Measures quantum phase θ with exponential precision 1/2ⁿ.',
    detailedDesc: 'Successive controlled-phase gates followed by an Inverse QFT map the eigenphase θ into the binary state of counting qubits.',
    trackId: 'phase-estimation',
  },
};
