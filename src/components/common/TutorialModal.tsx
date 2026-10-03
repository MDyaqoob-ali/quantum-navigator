import React from 'react';
import { TrackId } from '../../core/types';
import { Compass, Cpu, Activity, ShieldCheck, Zap, Radio, X, Check } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: TrackId;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  trackId,
}) => {
  if (!isOpen) return null;

  const getTutorialContent = () => {
    switch (trackId) {
      case 'bloch-sphere':
        return {
          title: 'Track 1 Tutorial: Navigating the Bloch Sphere',
          icon: <Compass size={24} style={{ color: 'var(--vector-red)' }} />,
          steps: [
            {
              title: '1. Recognize State Directions',
              desc: 'The north pole (+Z) represents |0⟩, the south pole (-Z) represents |1⟩, and the equator represents equal superpositions (|+⟩, |−⟩).',
            },
            {
              title: '2. Drag the Red Vector Handle',
              desc: 'Click directly on any red vector endpoint marked with ↻ and drag your mouse. Notice how coordinates θ and φ update smoothly in real time.',
            },
            {
              title: '3. Balance Fixed Anchors',
              desc: 'Fixed spheres (🔒) cannot be dragged, but contribute to the combined resultant vector. Use movable spheres to steer the resultant into the target zone.',
            },
            {
              title: '4. Verify Alignment',
              desc: 'Click "Verify Alignment". When the angular error between resultant and target is within tolerance, the level completes successfully!',
            },
          ],
        };
      case 'quantum-gates':
        return {
          title: 'Track 2 Tutorial: Building Quantum Circuits',
          icon: <Cpu size={24} style={{ color: 'var(--accent-blue)' }} />,
          steps: [
            {
              title: '1. Select a Gate from the Palette',
              desc: 'Click [X], [Z], [H], [CNOT], or [Toffoli] from the gate palette.',
            },
            {
              title: '2. Place onto Wire Slots',
              desc: 'Click any dashed slot on the circuit wires (q0, q1, q2) to drop the selected gate into the timeline.',
            },
            {
              title: '3. Wire Controlled Gates',
              desc: 'When using CNOT or Toffoli, select your desired control wires using the control selector buttons.',
            },
            {
              title: '4. Run Simulation & Match State',
              desc: 'Click "Run Circuit" to execute the real statevector matrix multiplication and verify state fidelity with the target.',
            },
          ],
        };
      case 'quantum-interference':
        return {
          title: 'Track 3 Tutorial: Mastering Wave Interference',
          icon: <Activity size={24} style={{ color: 'var(--accent-teal)' }} />,
          steps: [
            {
              title: '1. Observe Propagating Waves',
              desc: 'Coherent waves travel down independent optical paths with individual phase angles φ.',
            },
            {
              title: '2. Adjust Phase Dials',
              desc: 'Drag the phase sliders to change the relative phase Δφ between paths in real-time.',
            },
            {
              title: '3. Constructive vs Destructive Interference',
              desc: 'At Δφ = 0°, waves reinforce constructively at Detector A (100%). At Δφ = 180°, waves cancel at Detector A, routing 100% into Detector B.',
            },
            {
              title: '4. Target Detector Percentages',
              desc: 'Tune the phase until the live output matches the required target percentage, then click "Verify Interference".',
            },
          ],
        };
      case 'quantum-tunneling':
      case 'error-correction':
        return {
          title: 'Track 4 Tutorial: Quantum Tunneling (Tunnel Run)',
          icon: <Zap size={24} style={{ color: '#8B5CF6' }} />,
          steps: [
            {
              title: '1. Incident Quantum Particle',
              desc: 'A quantum particle approaching one or more potential barriers has total energy E and an incoming wave packet.',
            },
            {
              title: '2. Evanescent Penetration',
              desc: 'When E < V0, classical mechanics forbids crossing. In quantum mechanics, an evanescent wave penetrates through the barrier, giving a non-zero transmission probability T.',
            },
            {
              title: '3. Direct Physical Control',
              desc: 'Drag sliders for Particle Energy E, Barrier Height V0, and Barrier Width a. Increasing energy or narrowing barriers boosts transmission.',
            },
            {
              title: '4. Match Target & Run Experiment',
              desc: 'Bring transmission probability into the target precision window (e.g. 70% ± 3%), then click "Run Experiment" to sample 100 quantum trials.',
            },
          ],
        };
      case 'phase-estimation':
        return {
          title: 'Track 5 Tutorial: Quantum Spin & Measurement (Spin Splitter)',
          icon: <Compass size={24} style={{ color: 'var(--accent-amber)' }} />,
          steps: [
            {
              title: '1. Incoming Spin State',
              desc: 'A spin-1/2 particle enters the Stern-Gerlach apparatus with an intrinsic spin direction represented by a Bloch vector r.',
            },
            {
              title: '2. Rotate the Analyzer Needle',
              desc: 'Click and drag the analyzer needle on the canvas to orient the measurement axis n. Probabilities change continuously: P(+) = cos²(θ/2).',
            },
            {
              title: '3. Run the Experiment',
              desc: 'Click "Run Experiment" to send a beam of particles through the analyzer and observe the probabilistic split into Detector + and Detector −.',
            },
            {
              title: '4. State Collapse in Sequential Measurements',
              desc: 'Measurement projects the particle onto the measured outcome (r\' = ±n). In later levels, select which branch routes into Analyzer 2!',
            },
          ],
        };
    }
  };

  const content = getTutorialContent();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {content.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{content.title}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Interactive Step-by-Step Field Guide</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {content.steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>
            <Check size={16} />
            <span>Ready to Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};
