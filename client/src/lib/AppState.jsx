import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as api from './api';
import { AMBER, ALERT } from './constants';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const toastTimer = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listSoldiers();
      setSoldiers(list);
    } catch {
      // A 401 already redirects to /login (see api.js); nothing else to do here.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = useCallback((text, opts = {}) => {
    clearTimeout(toastTimer.current);
    const t = { text, edge: AMBER, ms: 4000, ...opts };
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), t.ms);
  }, []);

  const askDelete = useCallback((soldier) => {
    setModal({
      type: 'delete',
      id: soldier.id,
      name: soldier.fullName,
    });
  }, []);

  const doDelete = useCallback(async (id) => {
    const rec = soldiers.find((r) => r.id === id);
    setModal(null);
    try {
      await api.deleteSoldier(id);
      await refresh();
      if (window.location.hash === `#/soldier/${id}`) {
        window.location.hash = '#/';
      }
      if (rec) {
        showToast(`Ýazgy öçürildi · ${rec.fullName}`, {
          edge: ALERT,
          ms: 6000,
          actionLabel: 'Yzyna al',
          onAction: async () => {
            await api.createSoldier(rec);
            await refresh();
            setToast(null);
          },
        });
      }
    } catch (e) {
      showToast(e.message || 'Öçürip bolmady.', { edge: ALERT });
    }
  }, [soldiers, refresh, showToast]);

  const askDiscard = useCallback((onConfirm) => {
    setModal({ type: 'discard', onConfirm });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const value = {
    soldiers, loading, refresh,
    toast, showToast, hideToast: () => setToast(null),
    modal, askDelete, doDelete, askDiscard, closeModal,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
