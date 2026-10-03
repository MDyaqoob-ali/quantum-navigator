// Complex Number Mathematics for Quantum Amplitudes

export interface Complex {
  re: number;
  im: number;
}

export function complex(re: number, im = 0): Complex {
  return { re, im };
}

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function scale(c: Complex, s: number): Complex {
  return { re: c.re * s, im: c.im * s };
}

export function conjugate(c: Complex): Complex {
  return { re: c.re, im: -c.im };
}

export function magnitudeSq(c: Complex): number {
  return c.re * c.re + c.im * c.im;
}

export function magnitude(c: Complex): number {
  return Math.sqrt(magnitudeSq(c));
}

export function phase(c: Complex): number {
  return Math.atan2(c.im, c.re);
}

export function expI(phi: number): Complex {
  return { re: Math.cos(phi), im: Math.sin(phi) };
}

export function isValidComplex(c: any): boolean {
  return (
    c !== null &&
    c !== undefined &&
    typeof c.re === 'number' &&
    typeof c.im === 'number' &&
    !isNaN(c.re) &&
    !isNaN(c.im) &&
    isFinite(c.re) &&
    isFinite(c.im)
  );
}

export function formatComplex(c: Complex, precision = 3): string {
  const r = c.re.toFixed(precision);
  const i = Math.abs(c.im).toFixed(precision);
  if (Math.abs(c.im) < 1e-4) return `${r}`;
  if (Math.abs(c.re) < 1e-4) return `${c.im >= 0 ? '' : '-'}${i}i`;
  return `${r} ${c.im >= 0 ? '+' : '-'} ${i}i`;
}
