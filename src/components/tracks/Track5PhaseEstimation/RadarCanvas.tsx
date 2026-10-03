// Scientific Radar & Phase Spectrum Visualizer for Quantum Radar (Track 5)
// Renders the quantum phase continuum [0.0, 1.0), candidate signal blips,
// targeting reticles, radar sweep animation, and precision markers.

import React, { useRef, useEffect } from 'react';
import type { RadarSignal } from '../../../core/engines/phaseEstimationEngine';

interface RadarCanvasProps {
  signals: RadarSignal[];
  selectedSignalId: string | null;
  onSelectSignal: (signalId: string) => void;
  targetRange?: [number, number];
  isPracticeMode?: boolean;
}

export const RadarCanvas: React.FC<RadarCanvasProps> = ({
  signals,
  selectedSignalId,
  onSelectSignal,
  targetRange,
  isPracticeMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const sweepAngleRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Radar dimensions (Center at middle-left, spectrum arc or full circular radar)
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) * 0.44;

      // 1. Radar background: clean off-white scientific styling
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 2. Concentric range rings
      const rings = [0.25, 0.5, 0.75, 1.0];
      ctx.lineWidth = 1;
      rings.forEach(rFrac => {
        const r = maxRadius * rFrac;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = rFrac === 1.0 ? '#CBD5E1' : '#E2E8F0';
        ctx.setLineDash(rFrac === 1.0 ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 3. Coordinate axes & phase cardinal markers (0°, 90°, 180°, 270°)
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;

      // Horizontal axis (0 -> 0.5)
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius - 10, centerY);
      ctx.lineTo(centerX + maxRadius + 10, centerY);
      ctx.stroke();

      // Vertical axis (0.25 -> 0.75)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - maxRadius - 10);
      ctx.lineTo(centerX, centerY + maxRadius + 10);
      ctx.stroke();

      // Phase labels around perimeter
      ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // φ = 0.0 (Right)
      ctx.fillText('φ = 0.0 (0°)', centerX + maxRadius + 38, centerY);
      // φ = 0.25 (Top)
      ctx.fillText('φ = 0.25 (90°)', centerX, centerY - maxRadius - 14);
      // φ = 0.50 (Left)
      ctx.fillText('φ = 0.50 (180°)', centerX - maxRadius - 42, centerY);
      // φ = 0.75 (Bottom)
      ctx.fillText('φ = 0.75 (270°)', centerX, centerY + maxRadius + 14);

      // 4. Target phase sector highlight (if specified)
      if (targetRange) {
        const [minP, maxP] = targetRange;
        const startAngle = -minP * Math.PI * 2;
        const endAngle = -maxP * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)'; // Subtle amber sector
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 5. Radar sweep beam
      sweepAngleRef.current = (sweepAngleRef.current + 0.015) % (Math.PI * 2);
      const sweep = sweepAngleRef.current;

      const sweepGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius
      );
      sweepGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      sweepGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, -sweep, -sweep - 0.35, true);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sharp sweep leading line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(-sweep) * maxRadius,
        centerY + Math.sin(-sweep) * maxRadius
      );
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 6. Draw Signal Blips
      signals.forEach((sig, idx) => {
        // Map phase to angle on circle: angle = -2π * phase (counter-clockwise)
        const angle = -sig.truePhase * Math.PI * 2;
        // Distribute radii slightly to avoid overlapping radii
        const rFrac = 0.55 + (idx % 3) * 0.15;
        const r = maxRadius * rFrac;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        const isSelected = sig.id === selectedSignalId;

        // Outer pulsing ring when selected
        if (isSelected) {
          const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
          ctx.beginPath();
          ctx.arc(x, y, 16 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Reticle crosshair
          ctx.beginPath();
          ctx.moveTo(x - 22, y);
          ctx.lineTo(x + 22, y);
          ctx.moveTo(x, y - 22);
          ctx.lineTo(x, y + 22);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Signal blip node
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#F59E0B' : '#0284C7'; // Amber when selected, crisp scientific blue otherwise
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Signal Label tag (Collision-resistant offset)
        const labelOffset = y < centerY ? -16 : 18;
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = isSelected ? '#B45309' : '#0F172A';
        ctx.textAlign = 'center';
        ctx.fillText(`${sig.id}: ${sig.name}`, x, y + labelOffset);

        // Region / Frequency badge below label
        ctx.font = '9px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = '#64748B';
        const regionText = isPracticeMode
          ? `φ=${sig.truePhase.toFixed(3)}`
          : `Region: ${sig.knownRegion}`;
        ctx.fillText(regionText, x, y + labelOffset + (y < centerY ? -12 : 12));
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [signals, selectedSignalId, targetRange, isPracticeMode]);

  // Click handler to select signals on the radar
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.44;

    // Find closest signal within 28px hit radius
    let closestId: string | null = null;
    let minDist = 32;

    signals.forEach((sig, idx) => {
      const angle = -sig.truePhase * Math.PI * 2;
      const rFrac = 0.55 + (idx % 3) * 0.15;
      const r = maxRadius * rFrac;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      const dist = Math.hypot(clickX - x, clickY - y);
      if (dist < minDist) {
        minDist = dist;
        closestId = sig.id;
      }
    });

    if (closestId) {
      onSelectSignal(closestId);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '280px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'pointer',
        }}
        title="Click any signal blip to target it with the QPE receiver"
      />

      {/* Legend Badge */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          display: 'flex',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.92)',
            border: '1px solid #E2E8F0',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#F59E0B',
              display: 'inline-block',
            }}
          />
          Quantum Phase Radar (Click contact to select)
        </span>
      </div>
    </div>
  );
};
