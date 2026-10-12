import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isAdmin, role } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allowedRoles && !allowedRoles.includes(isAdmin ? 'admin' : role)) {
    return <Navigate to={isAdmin ? '/admin' : role === 'donor' ? '/donor-dashboard' : '/dashboard'} replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin-login" replace />;
  return children;
}
