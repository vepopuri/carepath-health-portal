import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function RequireAuth() {
  const { member, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!member) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
