# Quantum Navigator

> **“Learn Quantum Computing by Playing.”**

Quantum Navigator is an interactive educational quantum-computing puzzle game with real mathematical simulations, data-driven level progression, and a clean scientific light theme.

Every level result is derived directly from the player's simulated quantum state—there are no fake mockups, arbitrary button successes, or auto-completed answers.

---

## 🌟 The Five Active Learning Tracks

Quantum Navigator features **exactly five active learning tracks** designed to build quantum intuition step-by-step:

### Track 1 — Qubits & The Bloch Sphere (*Game: Quantum Navigator*)
- **Core Concept**: Manipulate single-qubit quantum states on the 3D Bloch sphere surface.
- **Mechanics**: Rotate movable vectors (1 to 4 spheres with fixed anchors and movable drivers), compute the game-rule resultant vector $R = \text{normalize}(\sum w_i r_i)$, and align with the target direction within angular tolerance.
- **Controls**: Direct mouse drag on red vector endpoints, real-time coordinate $(\theta, \phi)$ and measurement probability readouts.

### Track 2 — Quantum Logic Gates (*Game: Gate Builder*)
- **Core Concept**: Synthesize unitary quantum circuits using a real statevector simulator for up to 3 qubits ($2^N$ complex amplitudes).
- **Gates**: Pauli-$X$, Pauli-$Z$, Hadamard ($H$), Controlled-NOT ($CNOT$), and Toffoli ($CCNOT$).
- **Features**: Interactive circuit timeline, gate palette, multi-qubit entanglement (Bell states, GHZ states), and quantum state fidelity evaluation ($|\langle \psi | \phi \rangle|^2$).

### Track 3 — Quantum Interference (*Game: Wave Lab*)
- **Core Concept**: Master wave superposition, complex phasors ($A_k = a_k e^{i\phi_k}$), and relative phase ($\Delta\phi$).
- **Mechanics**: Route coherent waves through splitters into 2 to 4 paths. Engineer constructive interference (100% Detector A) and destructive interference (100% Detector B) to match required target probabilities.
- **Features**: Real-time sinusoidal wave simulation canvas, phase dials (0°–360°), and an experimental 100-shot measurement sampling mode.

### Track 4 — Quantum Error Correction (*Game: Quantum Repair Shop*)
- **Core Concept**: Fault-tolerant quantum memory protection using the 3-qubit repetition code ($|0_L\rangle = |000\rangle, |1_L\rangle = |111\rangle$).
- **Mechanics**: Detect bit-flip ($X$) and phase-flip ($Z$) corruptions from parity syndrome measurements ($S_1 = q_1 \oplus q_2, S_2 = q_2 \oplus q_3$).
- **Syndrome Key**: `00` = No Error, `10` = Qubit 1, `11` = Qubit 2, `01` = Qubit 3.
- **Workflow**: Diagnose syndrome $\to$ select target qubit $\to$ select correction gate $\to$ verify codeword restoration.

### Track 5 — Quantum Phase Estimation (*Game: Quantum Signal Scanner*)
- **Core Concept**: Extract unknown eigenphases $\phi$ from unitary operations $U|\psi\rangle = e^{2\pi i \phi}|\psi\rangle$.
- **Simulation**: Real 4-qubit statevector simulation (3 estimation qubits + eigenstate target), Hadamard superposition, controlled phase evolution, and inverse Quantum Fourier Transform (IQFT).
- **Features**: IQFT measurement probability histogram, binary fraction conversion ($\phi = 0.b_1b_2b_3$), continuous phase scanner dial, and preset harmonic steps.

---

## 📐 Universal Evaluator & Anti-Cheat Rules

All tracks adhere to a shared evaluator contract:

```typescript
interface EvaluationResult {
  status: 'unstarted' | 'incomplete' | 'invalid' | 'incorrect' | 'success';
  score: number;
  progress: number;
  feedback: string;
  details: Record<string, any>;
}
```

- **No-Input Rule**: Evaluators never return `success` on initial load, empty circuits, unadjusted vectors, or blank inputs.
- **Verified Success Only**: XP, stars (1–5), level progression, and achievements are awarded only after simulation math confirms tolerance constraints are met.
- **Protection**: Automatically rejects `NaN`, `Infinity`, unnormalized states, and invalid gate wiring.

---

## 🎨 Design System

- **Theme**: Light scientific aesthetic.
  - Background: Warm off-white / ivory (`#FBF9F5`)
  - Panels: Clean white (`#FFFFFF`) with subtle warm borders (`#E6E1D8`)
  - Typography: Dark charcoal (`#1C1E21`), JetBrains Mono for quantum state notation
  - State Vectors: Scientific crimson red (`#D32F2F`)
- **Layout Integrity**: Built with CSS Grid and Flexbox with strict interaction bounds. Includes an in-app DOM Layout Collision & Overlap Inspector ensuring 0 overlapping elements across viewports (1024×768 up to 1920×1080).

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Math Engines**: Custom zero-dependency complex amplitude algebra, 3D vector geometry, and $N$-qubit statevector unitary simulation
- **Graphics**: HTML5 2D Canvas with 3D matrix projection (Bloch sphere) & wave propagation
- **Icons**: Lucide React
- **Testing**: Standalone test runners powered by TSX

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated mathematical unit tests (28 tests)
npm test

# Run master QA regression suite (102 tests across all 5 tracks)
npx tsx src/core/tests/masterRegression.test.ts

# Production build
npm run build
```

---

## 🧪 Test Coverage

- **Unit Test Suite**: 28 / 28 Tests Passed (100%)
- **Master Regression Suite**: 102 / 102 Tests Passed (100%) covering no-input, incomplete, incorrect, boundary, and valid success conditions for every level across all 5 tracks.

---

## 📄 License

MIT
