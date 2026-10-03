import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Vector3, sphericalToCartesian, cartesianToSpherical, blochProbabilities } from '../../../core/math/vector3';
import { Lock, RefreshCw } from 'lucide-react';

interface BlochCanvasProps {
  id: string;
  name: string;
  theta: number; // [0, PI]
  phi: number;   // [0, 2PI]
  isFixed?: boolean;
  isTarget?: boolean;
  weight?: number;
  size?: number; // Canvas size in pixels
  onChange?: (theta: number, phi: number) => void;
  accentColor?: string;
}

export const BlochCanvas: React.FC<BlochCanvasProps> = ({
  name,
  theta,
  phi,
  isFixed = false,
  isTarget = false,
  size = 280,
  onChange,
  accentColor = '#D32F2F', // Scientific red
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Viewing angles for 3D projection (elevation and azimuth)
  const viewRotX = 20 * (Math.PI / 180); // tilt down 20 deg
  const viewRotY = -35 * (Math.PI / 180); // rotate 35 deg

  // 3D projection function
  const project3D = useCallback((x: number, y: number, z: number, radius: number, cx: number, cy: number) => {
    // 1. Rotate around Y axis
    const cosY = Math.cos(viewRotY);
    const sinY = Math.sin(viewRotY);
    const x1 = x * cosY + z * sinY;
    const y1 = y;
    const z1 = -x * sinY + z * cosY;

    // 2. Rotate around X axis
    const cosX = Math.cos(viewRotX);
    const sinX = Math.sin(viewRotX);
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    // Projection to 2D screen coordinates (+Z in quantum is up, canvas Y is down)
    return {
      screenX: cx + x2 * radius,
      screenY: cy - y2 * radius,
      depth: z2,
    };
  }, [viewRotX, viewRotY]);

  // Inverse projection from screen coordinates (sx, sy) to unit sphere (x,y,z)
  const unprojectScreenToSphere = useCallback((sx: number, sy: number, radius: number, cx: number, cy: number) => {
    const px = (sx - cx) / radius;
    const py = -(sy - cy) / radius;

    // Clamp to sphere radius
    const distSq = px * px + py * py;
    let pz = 0;
    let clampedX = px;
    let clampedY = py;

    if (distSq > 1) {
      const dist = Math.sqrt(distSq);
      clampedX = px / dist;
      clampedY = py / dist;
      pz = 0;
    } else {
      pz = Math.sqrt(Math.max(0, 1 - distSq));
    }

    // Inverse rotation: First un-rotate around X
    const cosX = Math.cos(-viewRotX);
    const sinX = Math.sin(-viewRotX);
    const ux1 = clampedX;
    const uy1 = clampedY * cosX - pz * sinX;
    const uz1 = clampedY * sinX + pz * cosX;

    // Second un-rotate around Y
    const cosY = Math.cos(-viewRotY);
    const sinY = Math.sin(-viewRotY);
    const x = ux1 * cosY + uz1 * sinY;
    const y = uy1;
    const z = -ux1 * sinY + uz1 * cosY;

    return { x, y, z };
  }, [viewRotX, viewRotY]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPI scale
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.36;

    // 1. Transparent sphere background fill
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = isTarget ? 'rgba(235, 243, 250, 0.4)' : 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#D5CEBF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 2. Latitude & Longitude wireframes (scientific clean styling)
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(180, 175, 165, 0.55)';

    // Equator circle (z = 0)
    ctx.beginPath();
    for (let a = 0; a <= 360; a += 5) {
      const rad = (a * Math.PI) / 180;
      const pt = project3D(Math.cos(rad), Math.sin(rad), 0, radius, cx, cy);
      if (a === 0) ctx.moveTo(pt.screenX, pt.screenY);
      else ctx.lineTo(pt.screenX, pt.screenY);
    }
    ctx.stroke();

    // Upper & Lower latitude circles (+/- 45 deg)
    [-Math.PI / 4, Math.PI / 4].forEach(lat => {
      ctx.beginPath();
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      for (let a = 0; a <= 360; a += 10) {
        const rad = (a * Math.PI) / 180;
        const pt = project3D(cosLat * Math.cos(rad), cosLat * Math.sin(rad), sinLat, radius, cx, cy);
        if (a === 0) ctx.moveTo(pt.screenX, pt.screenY);
        else ctx.lineTo(pt.screenX, pt.screenY);
      }
      ctx.stroke();
    });

    // Longitude circles (meridians at phi = 0 and phi = PI/2)
    [0, Math.PI / 2].forEach(lon => {
      ctx.beginPath();
      for (let a = 0; a <= 360; a += 5) {
        const rad = (a * Math.PI) / 180;
        const pt = project3D(
          Math.sin(rad) * Math.cos(lon),
          Math.sin(rad) * Math.sin(lon),
          Math.cos(rad),
          radius,
          cx,
          cy
        );
        if (a === 0) ctx.moveTo(pt.screenX, pt.screenY);
        else ctx.lineTo(pt.screenX, pt.screenY);
      }
      ctx.stroke();
    });

    // 3. Coordinate Axes
    // Z-Axis (vertical)
    const zTop = project3D(0, 0, 1.25, radius, cx, cy);
    const zBottom = project3D(0, 0, -1.25, radius, cx, cy);
    ctx.beginPath();
    ctx.moveTo(zBottom.screenX, zBottom.screenY);
    ctx.lineTo(zTop.screenX, zTop.screenY);
    ctx.strokeStyle = '#484F58';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // X-Axis (horizontal)
    const xPos = project3D(1.2, 0, 0, radius, cx, cy);
    const xNeg = project3D(-1.2, 0, 0, radius, cx, cy);
    ctx.beginPath();
    ctx.moveTo(xNeg.screenX, xNeg.screenY);
    ctx.lineTo(xPos.screenX, xPos.screenY);
    ctx.strokeStyle = 'rgba(72, 79, 88, 0.45)';
    ctx.stroke();

    // 4. Quantum Basis Labels
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = '#1C1E21';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // |0> at +Z
    ctx.fillText('|0⟩', zTop.screenX, zTop.screenY - 10);
    // |1> at -Z
    ctx.fillText('|1⟩', zBottom.screenX, zBottom.screenY + 12);
    // |+> at +X
    ctx.fillText('|+⟩', xPos.screenX + 12, xPos.screenY);
    // |-> at -X
    ctx.fillText('|−⟩', xNeg.screenX - 12, xNeg.screenY);

    // 5. State Vector
    const cart = sphericalToCartesian(theta, phi);
    const origin = project3D(0, 0, 0, radius, cx, cy);
    const endpoint = project3D(cart.x, cart.y, cart.z, radius, cx, cy);
    const projEquator = project3D(cart.x, cart.y, 0, radius, cx, cy);

    // Subtle projection line to equator plane
    ctx.beginPath();
    ctx.setLineDash([2, 3]);
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(projEquator.screenX, projEquator.screenY);
    ctx.lineTo(endpoint.screenX, endpoint.screenY);
    ctx.strokeStyle = 'rgba(100, 110, 120, 0.4)';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // State Vector Line (Thick, prominent)
    ctx.beginPath();
    ctx.moveTo(origin.screenX, origin.screenY);
    ctx.lineTo(endpoint.screenX, endpoint.screenY);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Draggable Endpoint Handle
    ctx.beginPath();
    ctx.arc(endpoint.screenX, endpoint.screenY, isDragging ? 7 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Outer ring when dragging
    if (isDragging && !isFixed) {
      ctx.beginPath();
      ctx.arc(endpoint.screenX, endpoint.screenY, 11, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(211, 47, 47, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [theta, phi, isFixed, isTarget, size, accentColor, isDragging, project3D]);

  // Mouse & Touch interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isFixed || isTarget || !onChange) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.36;

    const sphereCoords = unprojectScreenToSphere(sx, sy, radius, cx, cy);
    const { theta: newTheta, phi: newPhi } = cartesianToSpherical(sphereCoords);
    onChange(newTheta, newPhi);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || isFixed || isTarget || !onChange) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.36;

    const sphereCoords = unprojectScreenToSphere(sx, sy, radius, cx, cy);
    const { theta: newTheta, phi: newPhi } = cartesianToSpherical(sphereCoords);
    onChange(newTheta, newPhi);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const probs = blochProbabilities(sphericalToCartesian(theta, phi));
  const thetaDeg = ((theta * 180) / Math.PI).toFixed(1);
  const phiDeg = ((phi * 180) / Math.PI).toFixed(1);

  return (
    <div
      className={`bloch-sphere-box ${isDragging ? 'active-drag' : ''}`}
      style={{ width: `${size}px` }}
      data-ui-zone={`bloch-${name}`}
    >
      {/* Header Label & Lock Badge */}
      <div className="bloch-sphere-label-row">
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
        {isTarget ? (
          <span className="badge badge-blue">🎯 TARGET</span>
        ) : isFixed ? (
          <span className="badge" style={{ color: '#6E7781' }}>
            <Lock size={11} /> LOCKED
          </span>
        ) : (
          <span className="badge badge-red">
            <RefreshCw size={11} /> DRAG TO ROTATE
          </span>
        )}
      </div>

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          cursor: isFixed || isTarget ? 'default' : isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Coordinate & Probability Readouts */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          marginTop: '4px',
          padding: '4px 6px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <span>θ: {thetaDeg}°</span>
        <span>φ: {phiDeg}°</span>
        <span>P(0): {(probs.p0 * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
