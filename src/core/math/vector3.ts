// 3D Vector Math for Bloch Sphere Geometry and Rotations

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SphericalCoord {
  theta: number; // Polar angle from +Z axis: [0, PI]
  phi: number;   // Azimuthal angle in XY plane: [0, 2*PI)
}

export function vector3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

export function isValidVector3(v: any): boolean {
  return (
    v !== null &&
    v !== undefined &&
    typeof v.x === 'number' &&
    typeof v.y === 'number' &&
    typeof v.z === 'number' &&
    !isNaN(v.x) &&
    !isNaN(v.y) &&
    !isNaN(v.z) &&
    isFinite(v.x) &&
    isFinite(v.y) &&
    isFinite(v.z)
  );
}

export function lengthSq(v: Vector3): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

export function length(v: Vector3): number {
  return Math.sqrt(lengthSq(v));
}

export function normalize(v: Vector3): Vector3 {
  const len = length(v);
  if (len < 1e-9) {
    return { x: 0, y: 0, z: 1 }; // Default to |0> on degenerate input
  }
  return {
    x: v.x / len,
    y: v.y / len,
    z: v.z / len,
  };
}

export function dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function addVectors(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function scaleVector(v: Vector3, s: number): Vector3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

/**
 * Converts spherical coordinates (theta: polar [0, PI], phi: azimuthal [0, 2PI)) to Cartesian unit vector.
 * +Z is |0>, -Z is |1>, +X is |+>, -X is |->, +Y is |+i>, -Y is |-i>.
 */
export function sphericalToCartesian(theta: number, phi: number): Vector3 {
  const sinT = Math.sin(theta);
  return {
    x: sinT * Math.cos(phi),
    y: sinT * Math.sin(phi),
    z: Math.cos(theta),
  };
}

/**
 * Converts Cartesian unit vector to spherical coordinates (theta in [0, PI], phi in [0, 2PI)).
 */
export function cartesianToSpherical(v: Vector3): SphericalCoord {
  const norm = normalize(v);
  const clampedZ = Math.max(-1, Math.min(1, norm.z));
  const theta = Math.acos(clampedZ);
  let phi = Math.atan2(norm.y, norm.x);
  if (phi < 0) {
    phi += 2 * Math.PI;
  }
  return { theta, phi };
}

/**
 * Computes angular distance between two unit vectors in degrees.
 */
export function angularDistanceDegrees(a: Vector3, b: Vector3): number {
  const na = normalize(a);
  const nb = normalize(b);
  const cosTheta = Math.max(-1, Math.min(1, dot(na, nb)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/**
 * Computes standard measurement probabilities for a qubit state on the Z axis.
 */
export function blochProbabilities(v: Vector3): { p0: number; p1: number } {
  const norm = normalize(v);
  const p0 = Math.max(0, Math.min(1, (1 + norm.z) / 2));
  const p1 = Math.max(0, Math.min(1, (1 - norm.z) / 2));
  return { p0, p1 };
}
