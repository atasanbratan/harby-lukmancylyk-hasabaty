import { useAppState } from '../lib/AppState';

export default function Toast() {
  const { toast, hideToast } = useAppState();
  if (!toast) return null;

  return (
    <div
      data-noprint
      style={{
        position: 'fixed', left: 20, bottom: 20, zIndex: 200,
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${toast.edge}`,
        padding: '12px 16px', minWidth: 260, maxWidth: 420,
        boxShadow: 'var(--shadow)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{toast.text}</span>
      {toast.actionLabel && (
        <button
          type="button"
          className="mono"
          style={{
            background: 'transparent', border: 'none', color: toast.edge, cursor: 'pointer',
            fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', padding: 0,
          }}
          onClick={() => { toast.onAction?.(); }}
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        aria-label="Ýap"
        onClick={hideToast}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
