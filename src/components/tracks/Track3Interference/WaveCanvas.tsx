import React, { useRef, useEffect } from 'react';
import { WavePath, InterferenceResult } from '../../../core/engines/interferenceEngine';

interface WaveCanvasProps {
  paths: WavePath[];
  result: InterferenceResult;
  width?: number;
  height?: number;
}

export const WaveCanvas: React.FC<WaveCanvasProps> = ({
  paths,
  result,
  width = 620,
  height = 360,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      // Background grid lines (subtle scientific graph)
      ctx.strokeStyle = '#F0ECE1';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const numPaths = paths.length;
      const pathSectionHeight = (height - 90) / numPaths;

      // Draw individual coherent paths
      paths.forEach((path, idx) => {
        const centerY = 35 + idx * pathSectionHeight + pathSectionHeight / 2;

        // Path centerline
        ctx.beginPath();
        ctx.moveTo(70, centerY);
        ctx.lineTo(width - 150, centerY);
        ctx.strokeStyle = '#E2DDD5';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Path Label
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillStyle = '#1C1E21';
        ctx.textAlign = 'left';
        ctx.fillText(path.name, 12, centerY - 8);

        const phaseDeg = ((path.phase * 180) / Math.PI).toFixed(0);
        ctx.font = '500 11px JetBrains Mono, monospace';
        ctx.fillStyle = '#6E7781';
        ctx.fillText(`φ = ${phaseDeg}°`, 12, centerY + 8);

        // Sine wave for this path
        ctx.beginPath();
        const startX = 70;
        const endX = width - 150;
        const wavelength = 60;
        const amplitude = 14 * path.amplitude;

        for (let x = startX; x <= endX; x++) {
          const k = (2 * Math.PI) / wavelength;
          const y = centerY - Math.sin(k * (x - startX) - time + path.phase) * amplitude;
          if (x === startX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = path.isFixed ? '#1D5E99' : '#0D7A75';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Beam splitter recombination area (x = width - 150)
      const bsX = width - 140;
      ctx.beginPath();
      ctx.moveTo(bsX, 20);
      ctx.lineTo(bsX, height - 80);
      ctx.strokeStyle = '#D5CEBF';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = '#8C95A0';
      ctx.textAlign = 'center';
      ctx.fillText('SPLITTER', bsX, 15);

      // Recombined Output Waves to Detectors A & B
      const detAY = height * 0.3;
      const detBY = height * 0.7;

      // Wave towards Detector A
      ctx.beginPath();
      const ampA = 22 * Math.sqrt(result.probA);
      for (let x = bsX; x <= width - 40; x++) {
        const k = (2 * Math.PI) / 50;
        const y = detAY - Math.sin(k * (x - bsX) - time) * ampA;
        if (x === bsX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Wave towards Detector B
      ctx.beginPath();
      const ampB = 22 * Math.sqrt(result.probB);
      for (let x = bsX; x <= width - 40; x++) {
        const k = (2 * Math.PI) / 50;
        const y = detBY - Math.sin(k * (x - bsX) - time + Math.PI) * ampB;
        if (x === bsX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Detector Icons / Boxes
      // Detector A
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2;
      ctx.fillRect(width - 45, detAY - 18, 36, 36);
      ctx.strokeRect(width - 45, detAY - 18, 36, 36);
      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillStyle = '#15803D';
      ctx.textAlign = 'center';
      ctx.fillText('D_A', width - 27, detAY + 4);

      // Detector B
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2;
      ctx.fillRect(width - 45, detBY - 18, 36, 36);
      ctx.strokeRect(width - 45, detBY - 18, 36, 36);
      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillStyle = '#B45309';
      ctx.textAlign = 'center';
      ctx.fillText('D_B', width - 27, detBY + 4);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [paths, result, width, height]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: `${width}px`,
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
      data-ui-zone="wave-canvas"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
};
