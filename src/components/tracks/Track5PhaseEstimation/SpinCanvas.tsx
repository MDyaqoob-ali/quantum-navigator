// SpinCanvas.tsx — Interactive Stern-Gerlach Spin Analyzer Canvas
// Features:
// 1. Quantum particle source with state vector r indicator
// 2. Interactive draggable Analyzer 1 chamber with orientation needle n1
// 3. Sequential 2-analyzer beam branching (+ and - states) with interactive branch routing
// 4. Draggable Analyzer 2 chamber with orientation needle n2
// 5. Detectors with live particle landing animations and distribution accumulation
// 6. Natural mouse drag orientation with grabbing cursor and circular guide

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type {
  SpinSplitterLevelConfig,
  SpinExperimentSample,
  BranchSelection,
} from '../../../core/engines/spinSplitterEngine';
import { angleToAxis2D } from '../../../core/engines/spinSplitterEngine';

interface SpinCanvasProps {
  level: SpinSplitterLevelConfig;
  analyzer1Angle: number;
  analyzer2Angle?: number;
  selectedBranch: BranchSelection;
  onRotateAnalyzer1: (angle: number) => void;
  onRotateAnalyzer2?: (angle: number) => void;
  onSelectBranch?: (branch: BranchSelection) => void;
  isSimulating: boolean;
  experimentSample: SpinExperimentSample | null;
  theoryProbPlus: number;
  theoryProbMinus: number;
  onOpenComponentHelp?: (id: string) => void;
}

interface AnimatedParticle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  stage: 'to_a1' | 'a1_split' | 'to_a2' | 'a2_split' | 'at_detector';
  outcome1: '+' | '-';
  outcome2?: '+' | '-';
  progress: number;
  speed: number;
  color: string;
}

export const SpinCanvas: React.FC<SpinCanvasProps> = ({
  level,
  analyzer1Angle,
  analyzer2Angle = 0,
  selectedBranch,
  onRotateAnalyzer1,
  onRotateAnalyzer2,
  onSelectBranch,
  isSimulating,
  experimentSample,
  theoryProbPlus,
  theoryProbMinus,
  onOpenComponentHelp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeDrag, setActiveDrag] = useState<'a1' | 'a2' | null>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const particlesRef = useRef<AnimatedParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const isTwoAnalyzer = level.analyzerCount === 2;

  // Layout positions relative to canvas size (computed dynamically)
  const getLayout = (width: number, height: number) => {
    if (!isTwoAnalyzer) {
      // Single Analyzer Layout: Top to Bottom flow
      return {
        source: { x: width * 0.5, y: height * 0.15 },
        a1: { x: width * 0.5, y: height * 0.5, radius: Math.min(width * 0.14, 68) },
        detPlus: { x: width * 0.28, y: height * 0.85, width: 90, height: 44 },
        detMinus: { x: width * 0.72, y: height * 0.85, width: 90, height: 44 },
      };
    } else {
      // Two Analyzer Layout: Sequential flow
      return {
        source: { x: width * 0.5, y: height * 0.1 },
        a1: { x: width * 0.5, y: height * 0.3, radius: Math.min(width * 0.11, 54) },
        branchPlus: { x: width * 0.32, y: height * 0.47 },
        branchMinus: { x: width * 0.68, y: height * 0.47 },
        a2: {
          x: selectedBranch === '+' ? width * 0.32 : width * 0.68,
          y: height * 0.67,
          radius: Math.min(width * 0.11, 54),
        },
        detPlus: {
          x: selectedBranch === '+' ? width * 0.18 : width * 0.54,
          y: height * 0.9,
          width: 80,
          height: 38,
        },
        detMinus: {
          x: selectedBranch === '+' ? width * 0.46 : width * 0.82,
          y: height * 0.9,
          width: 80,
          height: 38,
        },
      };
    }
  };

  // Convert pointer event coords to canvas coordinates
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Calculate angle in degrees from center (cx, cy) to point (px, py)
  // Up = 0° (+Z), Right = 90° (+X), Down = 180° (-Z), Left = 270° (-X)
  const calculateAngleFromPoint = (cx: number, cy: number, px: number, py: number): number => {
    const dx = px - cx;
    const dy = py - cy;
    let rad = Math.atan2(dx, -dy);
    if (rad < 0) rad += 2 * Math.PI;
    return Math.round((rad * 180) / Math.PI) % 360;
  };

  // Pointer event handlers for silky smooth dragging with pointer capture
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const layout = getLayout(canvas.width, canvas.height);

    // Check Analyzer 1 click/drag
    if (level.analyzer1Adjustable) {
      const distA1 = Math.hypot(x - layout.a1.x, y - layout.a1.y);
      if (distA1 <= layout.a1.radius + 24) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveDrag('a1');
        const newAngle = calculateAngleFromPoint(layout.a1.x, layout.a1.y, x, y);
        onRotateAnalyzer1(newAngle);
        return;
      }
    }

    // Check Analyzer 2 click/drag
    if (isTwoAnalyzer && level.analyzer2Adjustable && (layout as any).a2 && onRotateAnalyzer2) {
      const a2Pos = (layout as any).a2;
      const distA2 = Math.hypot(x - a2Pos.x, y - a2Pos.y);
      if (distA2 <= a2Pos.radius + 24) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveDrag('a2');
        const newAngle = calculateAngleFromPoint(a2Pos.x, a2Pos.y, x, y);
        onRotateAnalyzer2(newAngle);
        return;
      }
    }

    // Check Branch Selection clicks for two-analyzer levels
    if (isTwoAnalyzer && onSelectBranch) {
      const bPlus = (layout as any).branchPlus;
      const bMinus = (layout as any).branchMinus;
      if (bPlus && Math.hypot(x - bPlus.x, y - bPlus.y) <= 32) {
        onSelectBranch('+');
        return;
      }
      if (bMinus && Math.hypot(x - bMinus.x, y - bMinus.y) <= 32) {
        onSelectBranch('-');
        return;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const layout = getLayout(canvas.width, canvas.height);

    // Handle Active Dragging
    if (activeDrag === 'a1' && level.analyzer1Adjustable) {
      const newAngle = calculateAngleFromPoint(layout.a1.x, layout.a1.y, x, y);
      onRotateAnalyzer1(newAngle);
      return;
    }
    if (activeDrag === 'a2' && isTwoAnalyzer && level.analyzer2Adjustable && (layout as any).a2 && onRotateAnalyzer2) {
      const a2Pos = (layout as any).a2;
      const newAngle = calculateAngleFromPoint(a2Pos.x, a2Pos.y, x, y);
      onRotateAnalyzer2(newAngle);
      return;
    }

    // Hover detection for cursor styling
    let hovered: string | null = null;
    if (level.analyzer1Adjustable && Math.hypot(x - layout.a1.x, y - layout.a1.y) <= layout.a1.radius + 24) {
      hovered = 'a1';
    } else if (
      isTwoAnalyzer &&
      level.analyzer2Adjustable &&
      (layout as any).a2 &&
      Math.hypot(x - (layout as any).a2.x, y - (layout as any).a2.y) <= (layout as any).a2.radius + 24
    ) {
      hovered = 'a2';
    } else if (isTwoAnalyzer) {
      const bPlus = (layout as any).branchPlus;
      const bMinus = (layout as any).branchMinus;
      if (bPlus && Math.hypot(x - bPlus.x, y - bPlus.y) <= 32) {
        hovered = 'branchPlus';
      } else if (bMinus && Math.hypot(x - bMinus.x, y - bMinus.y) <= 32) {
        hovered = 'branchMinus';
      }
    }
    setHoveredObject(hovered);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeDrag) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setActiveDrag(null);
    }
  };

  // Generate simulated particles when experiment runs
  useEffect(() => {
    if (!isSimulating || !experimentSample) {
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const layout = getLayout(canvas.width, canvas.height);

    const shots = experimentSample.shots;
    const particleCount = Math.min(shots, 40); // Cap animated visual dots for performance
    const newParticles: AnimatedParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const sampleOutcome = experimentSample.samples[i % experimentSample.samples.length] || '+';
      newParticles.push({
        id: i,
        x: layout.source.x + (Math.random() - 0.5) * 12,
        y: layout.source.y + (Math.random() - 0.5) * 8,
        targetX: layout.a1.x,
        targetY: layout.a1.y,
        stage: 'to_a1',
        outcome1: sampleOutcome,
        progress: - (i * 0.04), // Stagger launch
        speed: 0.02 + Math.random() * 0.008,
        color: sampleOutcome === '+' ? '#10B981' : '#F43F5E',
      });
    }
    particlesRef.current = newParticles;
  }, [isSimulating, experimentSample]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const width = canvas.width;
      const height = canvas.height;
      const layout = getLayout(width, height);

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background coordinate grid
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Beam Lines
      ctx.save();
      // Beam: Source -> Analyzer 1
      ctx.beginPath();
      ctx.moveTo(layout.source.x, layout.source.y);
      ctx.lineTo(layout.a1.x, layout.a1.y);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!isTwoAnalyzer) {
        // Beam: Analyzer 1 -> Detectors
        // Left Branch (+)
        ctx.beginPath();
        ctx.moveTo(layout.a1.x, layout.a1.y);
        ctx.quadraticCurveTo(
          layout.a1.x - 40,
          (layout.a1.y + layout.detPlus.y) * 0.5,
          layout.detPlus.x,
          layout.detPlus.y - layout.detPlus.height * 0.5
        );
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = Math.max(1.5, theoryProbPlus * 6);
        ctx.stroke();

        // Right Branch (-)
        ctx.beginPath();
        ctx.moveTo(layout.a1.x, layout.a1.y);
        ctx.quadraticCurveTo(
          layout.a1.x + 40,
          (layout.a1.y + layout.detMinus.y) * 0.5,
          layout.detMinus.x,
          layout.detMinus.y - layout.detMinus.height * 0.5
        );
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = Math.max(1.5, theoryProbMinus * 6);
        ctx.stroke();
      } else {
        // Two Analyzer Beams
        const l2 = layout as any;
        // Analyzer 1 -> Branch Plus
        ctx.beginPath();
        ctx.moveTo(layout.a1.x, layout.a1.y);
        ctx.lineTo(l2.branchPlus.x, l2.branchPlus.y);
        ctx.strokeStyle = selectedBranch === '+' ? '#10B981' : '#CBD5E1';
        ctx.lineWidth = selectedBranch === '+' ? 4 : 2;
        ctx.stroke();

        // Analyzer 1 -> Branch Minus
        ctx.beginPath();
        ctx.moveTo(layout.a1.x, layout.a1.y);
        ctx.lineTo(l2.branchMinus.x, l2.branchMinus.y);
        ctx.strokeStyle = selectedBranch === '-' ? '#F43F5E' : '#CBD5E1';
        ctx.lineWidth = selectedBranch === '-' ? 4 : 2;
        ctx.stroke();

        // Active Branch -> Analyzer 2
        const activeBranchPos = selectedBranch === '+' ? l2.branchPlus : l2.branchMinus;
        ctx.beginPath();
        ctx.moveTo(activeBranchPos.x, activeBranchPos.y);
        ctx.lineTo(l2.a2.x, l2.a2.y);
        ctx.strokeStyle = selectedBranch === '+' ? '#10B981' : '#F43F5E';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Analyzer 2 -> Detectors
        ctx.beginPath();
        ctx.moveTo(l2.a2.x, l2.a2.y);
        ctx.lineTo(layout.detPlus.x, layout.detPlus.y - layout.detPlus.height * 0.5);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = Math.max(1.5, theoryProbPlus * 6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(l2.a2.x, l2.a2.y);
        ctx.lineTo(layout.detMinus.x, layout.detMinus.y - layout.detMinus.height * 0.5);
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = Math.max(1.5, theoryProbMinus * 6);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Draw Source Node
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(layout.source.x, layout.source.y, 22, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Source Arrow inside circle (showing source state direction)
      const srcAxis = level.sourceState;
      // In 2D plane: X is horizontal, Z is vertical (up)
      const srcLen = 14;
      const srcEndX = layout.source.x + srcAxis.x * srcLen;
      const srcEndY = layout.source.y - srcAxis.z * srcLen; // inverted Y for canvas
      ctx.beginPath();
      ctx.moveTo(layout.source.x, layout.source.y);
      ctx.lineTo(srcEndX, srcEndY);
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Arrowhead
      const srcAngle = Math.atan2(srcEndY - layout.source.y, srcEndX - layout.source.x);
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.moveTo(srcEndX, srcEndY);
      ctx.lineTo(
        srcEndX - 6 * Math.cos(srcAngle - Math.PI / 6),
        srcEndY - 6 * Math.sin(srcAngle - Math.PI / 6)
      );
      ctx.lineTo(
        srcEndX - 6 * Math.cos(srcAngle + Math.PI / 6),
        srcEndY - 6 * Math.sin(srcAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Source Label
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.fillText(level.sourceName || 'Spin Source', layout.source.x, layout.source.y - 28);
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('SPIN-1/2', layout.source.x, layout.source.y + 34);
      ctx.restore();

      // Helper function to render an Analyzer Chamber
      const drawAnalyzer = (
        pos: { x: number; y: number; radius: number },
        angleDeg: number,
        title: string,
        isAdjustable: boolean,
        isA2 = false
      ) => {
        ctx.save();
        const { x, y, radius } = pos;
        const isHovered = hoveredObject === (isA2 ? 'a2' : 'a1');
        const isDragging = activeDrag === (isA2 ? 'a2' : 'a1');

        // Outer Chamber Frame
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = isDragging ? '#2563EB' : isHovered ? '#3B82F6' : '#94A3B8';
        ctx.lineWidth = isDragging ? 3 : isHovered ? 2.5 : 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.stroke();

        // Subtle orientation ring markings
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius - 8, 0, 2 * Math.PI);
        ctx.stroke();

        // 4 Cardinal Direction ticks (0° = +Z up, 90° = +X right, 180° = -Z down, 270° = -X left)
        const ticks = [
          { angle: 0, label: '+Z' },
          { angle: 90, label: '+X' },
          { angle: 180, label: '-Z' },
          { angle: 270, label: '-X' },
        ];
        ticks.forEach(t => {
          const rad = (t.angle * Math.PI) / 180;
          const tx1 = x + (radius - 12) * Math.sin(rad);
          const ty1 = y - (radius - 12) * Math.cos(rad);
          const tx2 = x + (radius - 4) * Math.sin(rad);
          const ty2 = y - (radius - 4) * Math.cos(rad);
          ctx.beginPath();
          ctx.moveTo(tx1, ty1);
          ctx.lineTo(tx2, ty2);
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        // Current Orientation Needle n
        const needleRad = (angleDeg * Math.PI) / 180;
        const needleLen = radius - 10;
        const needleX = x + needleLen * Math.sin(needleRad);
        const needleY = y - needleLen * Math.cos(needleRad);

        // Needle line
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(needleX, needleY);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Needle arrow tip / handle
        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(needleX, needleY, isAdjustable ? 6 : 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pivot Center
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Chamber Label & Angle Badge
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = '#1E293B';
        ctx.textAlign = 'center';
        ctx.fillText(title, x, y - radius - 10);

        ctx.font = '600 10px monospace';
        ctx.fillStyle = '#2563EB';
        ctx.fillText(`${angleDeg}°`, x, y + radius + 15);

        if (isAdjustable) {
          ctx.font = '9px system-ui, sans-serif';
          ctx.fillStyle = '#64748B';
          ctx.fillText('Drag to rotate', x, y + radius + 27);
        }

        ctx.restore();
      };

      // 4. Draw Analyzer 1
      drawAnalyzer(
        layout.a1,
        analyzer1Angle,
        level.analyzerCount === 1 ? 'Stern–Gerlach Analyzer' : 'Analyzer 1 (Preparation)',
        level.analyzer1Adjustable,
        false
      );

      // 5. Draw Branch Selection for Two-Analyzer Levels
      if (isTwoAnalyzer) {
        const l2 = layout as any;

        // Draw Branch Nodes
        const drawBranchNode = (pos: { x: number; y: number }, branch: BranchSelection, label: string) => {
          const isSelected = selectedBranch === branch;
          ctx.save();
          ctx.fillStyle = isSelected ? (branch === '+' ? '#10B981' : '#F43F5E') : '#FFFFFF';
          ctx.strokeStyle = branch === '+' ? '#10B981' : '#F43F5E';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 16, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.fillStyle = isSelected ? '#FFFFFF' : branch === '+' ? '#10B981' : '#F43F5E';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, pos.x, pos.y);

          // State collapse label under branch node
          ctx.font = '10px monospace';
          ctx.fillStyle = isSelected ? '#1E293B' : '#94A3B8';
          ctx.fillText(
            branch === '+' ? "r' = +n₁" : "r' = -n₁",
            pos.x,
            pos.y + 24
          );
          ctx.restore();
        };

        drawBranchNode(l2.branchPlus, '+', '+');
        drawBranchNode(l2.branchMinus, '-', '−');

        // Draw Analyzer 2
        drawAnalyzer(
          l2.a2,
          analyzer2Angle,
          'Analyzer 2 (Measurement)',
          Boolean(level.analyzer2Adjustable),
          true
        );
      }

      // 6. Draw Detectors
      const drawDetector = (
        det: { x: number; y: number; width: number; height: number },
        outcome: '+' | '-',
        label: string,
        percent: number,
        count?: number
      ) => {
        ctx.save();
        const rx = det.x - det.width * 0.5;
        const ry = det.y - det.height * 0.5;

        // Rounded box
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = outcome === '+' ? '#10B981' : '#F43F5E';
        ctx.lineWidth = 2;
        ctx.shadowColor = outcome === '+' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(rx, ry, det.width, det.height, 8);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.stroke();

        // Probability fill bar on bottom of card
        ctx.fillStyle = outcome === '+' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)';
        ctx.fillRect(rx + 2, ry + det.height - 6, (det.width - 4) * Math.max(0, Math.min(1, percent)), 4);

        // Header label
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = outcome === '+' ? '#065F46' : '#9F1239';
        ctx.textAlign = 'center';
        ctx.fillText(label, det.x, ry + 16);

        // Readout text: Theory % and observed count if available
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#1E293B';
        const txt = count !== undefined ? `${(percent * 100).toFixed(0)}% (${count})` : `${(percent * 100).toFixed(0)}%`;
        ctx.fillText(txt, det.x, ry + 28);
        ctx.restore();
      };

      const obsPlus = experimentSample?.countPlus;
      const obsMinus = experimentSample?.countMinus;

      drawDetector(layout.detPlus, '+', 'Detector +', theoryProbPlus, obsPlus);
      drawDetector(layout.detMinus, '-', 'Detector −', theoryProbMinus, obsMinus);

      // 7. Update and Render Animated Particle Beam during Simulation
      if (particlesRef.current.length > 0) {
        ctx.save();
        particlesRef.current.forEach(p => {
          p.progress += p.speed;
          if (p.progress < 0) return; // Waiting in launcher queue

          // Position calculation based on progression stage
          if (!isTwoAnalyzer) {
            // Stage 1: Source -> A1 (progress 0.0 -> 0.45)
            // Stage 2: A1 -> Detector (progress 0.45 -> 1.0)
            if (p.progress <= 0.45) {
              const t = p.progress / 0.45;
              p.x = layout.source.x + (layout.a1.x - layout.source.x) * t;
              p.y = layout.source.y + (layout.a1.y - layout.source.y) * t;
            } else {
              const t = (p.progress - 0.45) / 0.55;
              const targetDet = p.outcome1 === '+' ? layout.detPlus : layout.detMinus;
              const ctrlX = p.outcome1 === '+' ? layout.a1.x - 40 : layout.a1.x + 40;
              const ctrlY = (layout.a1.y + targetDet.y) * 0.5;

              // Quadratic bezier curve interpolation
              const invT = 1 - t;
              p.x = invT * invT * layout.a1.x + 2 * invT * t * ctrlX + t * t * targetDet.x;
              p.y = invT * invT * layout.a1.y + 2 * invT * t * ctrlY + t * t * targetDet.y;
            }
          } else {
            // Two Analyzer particle path:
            // 0.0 -> 0.25: Source -> A1
            // 0.25 -> 0.5: A1 -> Selected Branch Node
            // 0.5 -> 0.75: Branch Node -> A2
            // 0.75 -> 1.0: A2 -> Detector
            const l2 = layout as any;
            const branchPos = selectedBranch === '+' ? l2.branchPlus : l2.branchMinus;

            if (p.progress <= 0.25) {
              const t = p.progress / 0.25;
              p.x = layout.source.x + (layout.a1.x - layout.source.x) * t;
              p.y = layout.source.y + (layout.a1.y - layout.source.y) * t;
            } else if (p.progress <= 0.5) {
              const t = (p.progress - 0.25) / 0.25;
              p.x = layout.a1.x + (branchPos.x - layout.a1.x) * t;
              p.y = layout.a1.y + (branchPos.y - layout.a1.y) * t;
            } else if (p.progress <= 0.75) {
              const t = (p.progress - 0.5) / 0.25;
              p.x = branchPos.x + (l2.a2.x - branchPos.x) * t;
              p.y = branchPos.y + (l2.a2.y - branchPos.y) * t;
            } else {
              const t = (p.progress - 0.75) / 0.25;
              const targetDet = p.outcome1 === '+' ? layout.detPlus : layout.detMinus;
              p.x = l2.a2.x + (targetDet.x - l2.a2.x) * t;
              p.y = l2.a2.y + (targetDet.y - l2.a2.y) * t;
            }
          }

          // Draw Glowing Particle Dot
          if (p.progress <= 1.05) {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowColor = 'transparent';
          }
        });
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    level,
    analyzer1Angle,
    analyzer2Angle,
    selectedBranch,
    isTwoAnalyzer,
    hoveredObject,
    activeDrag,
    theoryProbPlus,
    theoryProbMinus,
    experimentSample,
  ]);

  return (
    <div className="relative w-full flex flex-col items-center bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Interactive Quantum Spin Apparatus
        </span>
        <span className="text-[11px] text-slate-400">
          Click & Drag Needle to Rotate Axis
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={isTwoAnalyzer ? 560 : 440}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-full max-w-[720px] h-auto select-none touch-none ${
          activeDrag
            ? 'cursor-grabbing'
            : hoveredObject === 'a1' || hoveredObject === 'a2'
            ? 'cursor-grab'
            : hoveredObject?.startsWith('branch')
            ? 'cursor-pointer'
            : 'cursor-default'
        }`}
      />
    </div>
  );
};
