import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from './components/layout/Layout';
import RoleGuard from './components/RoleGuard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WizardPage from './pages/WizardPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminBookingDetailPage from './pages/AdminBookingDetailPage';
import AdminInventoryPage from './pages/AdminInventoryPageNew';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSuppliersPage from './pages/AdminSuppliersPageNew';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
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
          <Route
            path="/admin/inventory"
            element={
              isAuthenticated ? (
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <AdminInventoryPage />
                </RoleGuard>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated ? (
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <AdminDashboardPage />
                </RoleGuard>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              isAuthenticated ? (
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <AdminSuppliersPage />
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
