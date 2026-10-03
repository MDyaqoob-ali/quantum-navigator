// Scientific 2D Canvas Visualizer for Quantum Tunneling
// Renders potential landscape V(x), particle energy level E,
// incident wave packet, evanescent exponential decay, and transmitted wave amplitude.

import React, { useRef, useEffect } from 'react';
import type { BarrierConfig, TunnelingTransmissionResult } from '../../../core/engines/tunnelingEngine';

interface TunnelCanvasProps {
  particleEnergy: number;
  barriers: BarrierConfig[];
  transmissionResult: TunnelingTransmissionResult;
  viewMode: 'quantum' | 'classical';
  isResonant?: boolean;
}

export const TunnelCanvas: React.FC<TunnelCanvasProps> = ({
  particleEnergy,
  barriers,
  transmissionResult,
  viewMode,
  isResonant = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const phaseOffsetRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;
      phaseOffsetRef.current = (phaseOffsetRef.current + 0.05) % (Math.PI * 2);
      const phase = phaseOffsetRef.current;

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

      // Background subtle lab grid
      ctx.fillStyle = '#FAFAF8';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Geometry coordinates
      const baselineY = height * 0.78;
      const maxHeightPx = height * 0.55;
      const maxPotentialScale = 2.5; // Max V0 mapped to maxHeightPx

      // Layout barriers horizontally
      // Left region for incident particle wave, middle region for barriers, right region for transmitted wave
      const leftMargin = Math.max(70, width * 0.18);
      const rightMargin = Math.max(70, width * 0.18);
      const middleWidth = width - leftMargin - rightMargin;

      const totalBarrierWidthUnits = barriers.reduce((sum, b) => sum + b.width, 0);
      const wellGapCount = Math.max(0, barriers.length - 1);
      const totalUnits = totalBarrierWidthUnits + wellGapCount * 0.6;
      const pxPerUnit = Math.min(120, middleWidth / Math.max(2.0, totalUnits));

      let currentX = leftMargin + (middleWidth - totalUnits * pxPerUnit) / 2;

      // Draw Baseline (V = 0 ground level)
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, baselineY);
      ctx.lineTo(width - 20, baselineY);
      ctx.stroke();

      // V=0 Ground Label
      ctx.font = '10px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('V = 0 (Free Space)', 24, baselineY + 16);

      // Barrier geometry definitions
      const barrierGeometries: {
        xStart: number;
        xEnd: number;
        widthPx: number;
        heightPx: number;
        height: number;
        width: number;
        index: number;
      }[] = [];

      for (let i = 0; i < barriers.length; i++) {
        const b = barriers[i];
        const bWidthPx = b.width * pxPerUnit;
        const bHeightPx = (b.height / maxPotentialScale) * maxHeightPx;
        barrierGeometries.push({
          xStart: currentX,
          xEnd: currentX + bWidthPx,
          widthPx: bWidthPx,
          heightPx: bHeightPx,
          height: b.height,
          width: b.width,
          index: i,
        });
        currentX += bWidthPx + 0.6 * pxPerUnit;
      }

      // Draw Barriers
      for (const bg of barrierGeometries) {
        const barTopY = baselineY - bg.heightPx;

        // Shadow / Glow if resonant
        if (isResonant) {
          ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';
          ctx.shadowBlur = 12;
        }

        // Barrier fill gradient
        const grad = ctx.createLinearGradient(0, barTopY, 0, baselineY);
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
        grad.addColorStop(1, 'rgba(124, 58, 237, 0.08)');
        ctx.fillStyle = grad;
        ctx.fillRect(bg.xStart, barTopY, bg.widthPx, bg.heightPx);

        // Barrier border
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.strokeRect(bg.xStart, barTopY, bg.widthPx, bg.heightPx);

        ctx.shadowBlur = 0;

        // Barrier Top & Width Labels
        ctx.font = 'bold 11px "Inter", -apple-system, sans-serif';
        ctx.fillStyle = '#6D28D9';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Barrier ${barriers.length > 1 ? bg.index + 1 : ''}`,
          bg.xStart + bg.widthPx / 2,
          barTopY - 18
        );
        ctx.font = '10px "Inter", -apple-system, sans-serif';
        ctx.fillStyle = '#7C3AED';
        ctx.fillText(
          `V₀ = ${bg.height.toFixed(2)} | a = ${bg.width.toFixed(2)}`,
          bg.xStart + bg.widthPx / 2,
          barTopY - 5
        );

        // Dimension dimension arrow below barrier
        ctx.strokeStyle = '#A78BFA';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const dimY = baselineY + 22;
        ctx.moveTo(bg.xStart, dimY);
        ctx.lineTo(bg.xEnd, dimY);
        ctx.moveTo(bg.xStart, dimY - 4);
        ctx.lineTo(bg.xStart, dimY + 4);
        ctx.moveTo(bg.xEnd, dimY - 4);
        ctx.lineTo(bg.xEnd, dimY + 4);
        ctx.stroke();

        ctx.font = '9px "Inter", -apple-system, sans-serif';
        ctx.fillStyle = '#8B5CF6';
        ctx.fillText(`a = ${bg.width.toFixed(2)}`, bg.xStart + bg.widthPx / 2, dimY + 12);
      }

      // Draw Energy Level Line E
      const energyHeightPx = (particleEnergy / maxPotentialScale) * maxHeightPx;
      const energyY = baselineY - energyHeightPx;

      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#0284C7'; // Blue energy line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, energyY);
      ctx.lineTo(width - 20, energyY);
      ctx.stroke();
      ctx.restore();

      // Energy Label on Left
      ctx.textAlign = 'left';
      ctx.font = 'bold 11px "Inter", -apple-system, sans-serif';
      ctx.fillStyle = '#0284C7';
      ctx.fillText(`E = ${particleEnergy.toFixed(2)}`, 24, energyY - 6);

      // Classical vs Quantum Simulation Rendering
      const firstBarrier = barrierGeometries[0];
      const lastBarrier = barrierGeometries[barrierGeometries.length - 1];

      if (viewMode === 'classical') {
        // CLASSICAL VIEW: Particle trajectory
        const isBlocked = particleEnergy < firstBarrier.height;

        ctx.font = 'bold 12px "Inter", -apple-system, sans-serif';
        ctx.fillStyle = isBlocked ? '#DC2626' : '#16A34A';
        ctx.fillText(
          isBlocked ? 'CLASSICAL VIEW: BLOCKED (E < V₀)' : 'CLASSICAL VIEW: OVER BARRIER (E ≥ V₀)',
          24,
          30
        );

        // Moving particle dot
        const tCycle = (Date.now() % 2400) / 2400; // 0 to 1
        const incidentEndX = firstBarrier.xStart;

        if (isBlocked) {
          // Bounces off the first barrier
          let dotX: number;
          if (tCycle < 0.5) {
            // Approaching
            dotX = 30 + (incidentEndX - 30) * (tCycle * 2);
          } else {
            // Reflecting
            dotX = incidentEndX - (incidentEndX - 30) * ((tCycle - 0.5) * 2);
          }

          // Path line
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(30, energyY);
          ctx.lineTo(incidentEndX, energyY);
          ctx.stroke();

          // Particle
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(dotX, energyY, 6, 0, Math.PI * 2);
          ctx.fill();

          // Block marker ✕
          ctx.font = 'bold 18px "Inter", sans-serif';
          ctx.fillStyle = '#DC2626';
          ctx.textAlign = 'center';
          ctx.fillText('✕ BLOCKED', firstBarrier.xStart - 35, energyY - 14);
          ctx.font = '10px "Inter", sans-serif';
          ctx.fillText('Transmission: 0%', firstBarrier.xStart - 35, energyY + 18);
        } else {
          // Passes through classically
          const dotX = 30 + (width - 60) * tCycle;
          ctx.strokeStyle = '#16A34A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(30, energyY);
          ctx.lineTo(width - 30, energyY);
          ctx.stroke();

          ctx.fillStyle = '#16A34A';
          ctx.beginPath();
          ctx.arc(dotX, energyY, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // QUANTUM VIEW: Real Quantum Wave Function ψ(x) with Live Transmission Amplitude
        const T = transmissionResult.transmission;
        const R = Math.max(0, 1 - T);
        const transAmp = Math.sqrt(T);
        const reflAmp = Math.sqrt(R);

        // Top Educational Tag
        ctx.textAlign = 'left';
        ctx.font = 'bold 12px "Inter", -apple-system, sans-serif';
        ctx.fillStyle = '#0D9488';
        const regimeLabel = transmissionResult.regime === 'over-barrier'
          ? 'OVER-BARRIER TRANSMISSION (E ≥ V₀)'
          : 'QUANTUM TUNNELING REGIME (E < V₀)';
        ctx.fillText(`QUANTUM VIEW: ${regimeLabel}`, 24, 30);

        ctx.font = '10px "Inter", -apple-system, sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('Wave amplitude ψ(x) oscillates freely and decays exponentially inside barriers.', 24, 46);

        // 1. Incident Wave Packet & Standing Wave on Left (x < firstBarrier.xStart)
        const waveBaseY = energyY;
        const baseAmp = Math.min(24, Math.max(12, height * 0.08));
        const kFree = Math.max(0.04, Math.min(0.12, Math.sqrt(2 * particleEnergy) * 0.05));

        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2.2;
        ctx.beginPath();

        let started = false;
        for (let x = 20; x <= firstBarrier.xStart; x += 1.5) {
          const distToBarrier = firstBarrier.xStart - x;
          // Incident wave + reflected wave interference
          const incident = Math.sin(kFree * x - phase);
          const reflected = reflAmp * Math.sin(-kFree * distToBarrier - phase);
          const psi = (incident + reflected * 0.7) * (baseAmp / 1.7);
          const y = waveBaseY + psi;

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Incoming particle packet icon
        const dotCycle = (Date.now() % 1600) / 1600;
        const packetX = 30 + (firstBarrier.xStart - 50) * dotCycle;
        ctx.fillStyle = '#0284C7';
        ctx.beginPath();
        ctx.arc(packetX, waveBaseY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '9px "Inter", sans-serif';
        ctx.fillStyle = '#0369A1';
        ctx.fillText('● Particle Wave', 30, waveBaseY - 26);

        // 2. Wave inside barriers & inter-barrier wells
        let prevEndAmp = baseAmp * 0.8;

        for (let bIdx = 0; bIdx < barrierGeometries.length; bIdx++) {
          const bg = barrierGeometries[bIdx];
          const isTunnelingHere = particleEnergy < bg.height;

          // Wave inside current barrier
          ctx.strokeStyle = isTunnelingHere ? '#8B5CF6' : '#6366F1';
          ctx.lineWidth = 2.2;
          ctx.beginPath();

          let bStarted = false;
          for (let x = bg.xStart; x <= bg.xEnd; x += 1.5) {
            const frac = (x - bg.xStart) / Math.max(1, bg.widthPx);
            let y = waveBaseY;

            if (isTunnelingHere) {
              // Exponential decay ~ e^(-kappa * x)
              const kappa = Math.sqrt(2 * Math.max(0.01, bg.height - particleEnergy));
              const decayFactor = Math.exp(-kappa * bg.width * frac);
              const evanescent = Math.cos(phase * 0.5) * prevEndAmp * decayFactor * 0.6;
              y = waveBaseY + evanescent;
            } else {
              // Over-barrier transmission: oscillatory with different k2
              const k2 = Math.sqrt(2 * Math.max(0.01, particleEnergy - bg.height)) * 0.05;
              const osc = Math.sin(k2 * (x - bg.xStart) - phase) * prevEndAmp * 0.8;
              y = waveBaseY + osc;
            }

            if (!bStarted) {
              ctx.moveTo(x, y);
              bStarted = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();

          // Subtle quantum glow particles inside barrier
          if (isTunnelingHere && T > 0.05) {
            ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';
            const sparkCount = Math.min(6, Math.max(2, Math.floor(bg.widthPx / 15)));
            for (let s = 1; s <= sparkCount; s++) {
              const sx = bg.xStart + (bg.widthPx / (sparkCount + 1)) * s;
              const sy = waveBaseY + Math.sin(phase * 2 + s) * 6;
              ctx.beginPath();
              ctx.arc(sx, sy, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // If there is a next barrier, draw wave in the well between them
          if (bIdx < barrierGeometries.length - 1) {
            const nextBg = barrierGeometries[bIdx + 1];
            ctx.strokeStyle = '#0D9488';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            let wellStarted = false;
            for (let x = bg.xEnd; x <= nextBg.xStart; x += 1.5) {
              const wellWave = Math.sin(kFree * x - phase) * (baseAmp * 0.7);
              const y = waveBaseY + wellWave;
              if (!wellStarted) {
                ctx.moveTo(x, y);
                wellStarted = true;
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
          }
        }

        // 3. Transmitted Wave on the right (x > lastBarrier.xEnd)
        const transStartX = lastBarrier.xEnd;
        ctx.strokeStyle = '#10B981'; // Green transmitted wave
        ctx.lineWidth = 2.4;
        ctx.beginPath();

        let transStarted = false;
        for (let x = transStartX; x <= width - 20; x += 1.5) {
          const osc = Math.sin(kFree * (x - transStartX) - phase);
          const y = waveBaseY + osc * (baseAmp * transAmp);
          if (!transStarted) {
            ctx.moveTo(x, y);
            transStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Transmitted particle representation (amplitude corresponds to probability T)
        if (T > 0.01) {
          const transDotCycle = (Date.now() % 1600) / 1600;
          const transDotX = transStartX + (width - 40 - transStartX) * transDotCycle;
          ctx.fillStyle = `rgba(16, 185, 129, ${Math.max(0.25, Math.min(1.0, T + 0.15))})`;
          ctx.beginPath();
          ctx.arc(transDotX, waveBaseY, Math.max(3, 6 * transAmp), 0, Math.PI * 2);
          ctx.fill();
        }

        // Transmitted Label
        ctx.textAlign = 'right';
        ctx.font = 'bold 11px "Inter", sans-serif';
        ctx.fillStyle = '#059669';
        ctx.fillText(`Transmitted: ${(T * 100).toFixed(1)}%`, width - 24, waveBaseY - 26);
        ctx.font = '9px "Inter", sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('ψ ∝ √T', width - 24, waveBaseY - 14);
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [particleEnergy, barriers, transmissionResult, viewMode, isResonant]);

  return (
    <div className="tunnel-canvas-container" style={{ width: '100%', height: '240px', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};
