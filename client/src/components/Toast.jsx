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
        background: '#111821', border: '1px solid #1F2C38', borderLeft: `3px solid ${toast.edge}`,
        padding: '12px 16px', minWidth: 260, maxWidth: 420,
        boxShadow: '0 8px 24px rgba(0,0,0,.4)',
      }}
    >
      <span style={{ fontSize: 13, color: '#C9D6E0', flex: 1 }}>{toast.text}</span>
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
        style={{ background: 'transparent', border: 'none', color: '#6B7C8C', cursor: 'pointer', fontSize: 13, padding: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
