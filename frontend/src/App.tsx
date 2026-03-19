import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from './components/layout/Layout';
import RoleGuard from './components/RoleGuard';
import HomePage from './pages/HomePage';
import WizardPage from './pages/WizardPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminBookingDetailPage from './pages/AdminBookingDetailPage';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/wizard/:hotelId"
            element={isAuthenticated ? <WizardPage /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/bookings"
            element={
              isAuthenticated ? (
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <AdminBookingsPage />
                </RoleGuard>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin/bookings/:id"
            element={
              isAuthenticated ? (
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <AdminBookingDetailPage />
                </RoleGuard>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Container>
    </Layout>
  );
}

export default App;
