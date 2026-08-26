import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthState';

export default function RequireAuth({ children }) {
  const { authed } = useAuth();
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
