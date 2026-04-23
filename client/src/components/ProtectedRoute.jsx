import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import { SkeletonDashboard } from '../ui';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  /* Show the full dashboard skeleton (not a spinner) while auth loads */
  if (loading) {
    return (
      <Layout>
        <SkeletonDashboard />
      </Layout>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return children;
}
