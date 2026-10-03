// Reusable Layout Overlap Validation Utility

export interface BoundingBox {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OverlapCollision {
  elementA: string;
  elementB: string;
  intersectionArea: number;
  overlapRect: { x: number; y: number; width: number; height: number };
}

export interface LayoutAuditResult {
  viewport: { width: number; height: number };
  passed: boolean;
  totalElementsChecked: number;
  collisions: OverlapCollision[];
  warnings: string[];
}

/**
 * Checks whether two axis-aligned bounding rectangles intersect.
 * Allows an optional negative padding (tolerance) to account for 1px borders or subtle anti-aliasing.
 */
export function checkRectOverlap(
  a: BoundingBox,
  b: BoundingBox,
  tolerance = 1.0
): OverlapCollision | null {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);

  const overlapWidth = x2 - x1;
  const overlapHeight = y2 - y1;

  if (overlapWidth > tolerance && overlapHeight > tolerance) {
    return {
      elementA: a.id || a.label,
      elementB: b.id || b.label,
      intersectionArea: overlapWidth * overlapHeight,
      overlapRect: {
        x: x1,
        y: y1,
        width: overlapWidth,
        height: overlapHeight,
      },
    };
  }

  return null;
}

/**
 * Validates that no critical UI or game elements in the list overlap with each other.
 */
export function validateLayoutBounds(
  elements: BoundingBox[],
  viewport = { width: 1440, height: 900 }
): LayoutAuditResult {
  const collisions: OverlapCollision[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const col = checkRectOverlap(elements[i], elements[j]);
      if (col) {
        collisions.push(col);
      }
    }

    // Check boundary overflow
    const el = elements[i];
    if (el.x + el.width > viewport.width) {
      warnings.push(`Element ${el.id} overflows viewport right boundary (${el.x + el.width} > ${viewport.width})`);
    }
    if (el.y + el.height > viewport.height) {
      warnings.push(`Element ${el.id} overflows viewport bottom boundary (${el.y + el.height} > ${viewport.height})`);
    }
  }

  return {
    viewport,
    passed: collisions.length === 0,
    totalElementsChecked: elements.length,
    collisions,
    warnings,
  };
}

/**
 * Scans the live document DOM for elements marked with data-ui-zone or interactive elements
 * and validates that none overlap in the active viewport.
 */
export function auditLiveDOM(): LayoutAuditResult {
  if (typeof document === 'undefined') {
    return {
      viewport: { width: 0, height: 0 },
      passed: true,
      totalElementsChecked: 0,
      collisions: [],
      warnings: ['DOM not available in server context'],
    };
  }

  const nodes = document.querySelectorAll<HTMLElement>(
    '[data-ui-zone], .game-canvas-container, .control-panel-container, .mission-card, .result-panel-container, .bloch-sphere-box'
  );

  const boxes: BoundingBox[] = [];
  nodes.forEach((node, idx) => {
    const rect = node.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      boxes.push({
        id: node.id || node.getAttribute('data-ui-zone') || `zone-${idx}`,
        label: node.className || node.tagName,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  });

  return validateLayoutBounds(boxes, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
}
