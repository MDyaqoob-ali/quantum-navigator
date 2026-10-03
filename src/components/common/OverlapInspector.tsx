import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { auditLiveDOM, LayoutAuditResult } from '../../core/tests/layoutValidator';

export const OverlapInspector: React.FC = () => {
  const [audit, setAudit] = useState<LayoutAuditResult | null>(null);

  const runAudit = () => {
    const res = auditLiveDOM();
    setAudit(res);
  };

  useEffect(() => {
    // Initial audit after layout paint
    const timer = setTimeout(runAudit, 500);
    window.addEventListener('resize', runAudit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', runAudit);
    };
  }, []);

  if (!audit) return null;

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {audit.passed ? (
            <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)' }} />
          ) : (
            <AlertCircle size={20} style={{ color: 'var(--vector-red)' }} />
          )}
          <span style={{ fontWeight: 700, fontSize: '14px' }}>
            Layout Collision & Non-Overlap Inspector
          </span>
        </div>
        <button className="btn btn-sm" onClick={runAudit}>
          <RefreshCw size={13} />
          <span>Scan Viewport</span>
        </button>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        Active Viewport: <strong>{audit.viewport.width} × {audit.viewport.height}px</strong> | Checked Elements: <strong>{audit.totalElementsChecked}</strong>
      </div>

      {audit.passed ? (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--accent-emerald-light)',
            color: '#0F5E2C',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          ✓ 0 Overlapping Layout Regions Detected. All controls, cards, and canvas bounds are fully separated.
        </div>
      ) : (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--vector-red-light)',
            color: 'var(--vector-red-dark)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
          }}
        >
          <strong>Warning: Overlap Detected ({audit.collisions.length} collisions)</strong>
          <ul style={{ marginLeft: '18px', marginTop: '6px' }}>
            {audit.collisions.map((c, i) => (
              <li key={i}>
                Overlap between <code>{c.elementA}</code> and <code>{c.elementB}</code> ({Math.round(c.intersectionArea)}px²)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
