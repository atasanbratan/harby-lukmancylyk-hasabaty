import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/AuthState';
import { AppStateProvider } from './lib/AppState';
import RequireAuth from './components/RequireAuth';
import Header from './components/Header';
import Modal from './components/Modal';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import RegistryPage from './pages/RegistryPage';
import DossierPage from './pages/DossierPage';
import FormPage from './pages/FormPage';
import DashboardPage from './pages/DashboardPage';

function AppShell() {
  return (
    <AppStateProvider>
      <div style={{ minHeight: '100vh', background: '#0A0E12', position: 'relative' }}>
        <div className="grid-bg" data-noprint />
        <Header />
        <Routes>
          <Route path="/" element={<RegistryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/soldier/new" element={<FormPage />} />
          <Route path="/soldier/:id/edit" element={<FormPage />} />
          <Route path="/soldier/:id" element={<DossierPage />} />
        </Routes>
        <Modal />
        <Toast />
      </div>
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={(
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            )}
          />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
