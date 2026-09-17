import { useAppState } from '../lib/AppState';
import { ALERT, AMBER } from '../lib/constants';

export default function Modal() {
  const { modal, closeModal, doDelete } = useAppState();
  if (!modal) return null;

  const isDelete = modal.type === 'delete';
  const title = isDelete ? 'Ýazgyny öçürmek' : 'Saklanmadyk üýtgeşmeler';
  const body = isDelete
    ? `${modal.name} — bu ýazgy hasabatdan aýrylýar.`
    : 'Bu sahypadan çykylsa girizilen maglumatlar ýitýär.';
  const warn = isDelete ? 'Bu hereketi yzyna almak mümkin däl.' : '';
  const cancelLabel = isDelete ? 'Goý bolsun' : 'Galmak';
  const confirmLabel = isDelete ? 'Öçür' : 'Çykmak';
  const confirmColor = isDelete ? ALERT : AMBER;

  const onConfirm = () => {
    if (isDelete) doDelete(modal.id);
    else {
      closeModal();
      modal.onConfirm?.();
    }
  };

  return (
    <div
      onClick={closeModal}
      data-noprint
      style={{
        position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--overlay)', backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(420px, 90vw)', background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="condensed" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-strong)' }}>
            {title}
          </span>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 14, color: 'var(--text)' }}>{body}</span>
          {warn && <span className="mono" style={{ fontSize: 11, color: ALERT }}>{warn}</span>}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn" style={{ flex: 1 }} onClick={closeModal}>{cancelLabel}</button>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, color: 'var(--on-accent)', background: confirmColor, borderColor: confirmColor, fontWeight: 500 }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
