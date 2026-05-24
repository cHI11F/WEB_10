import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MembershipForm from './pages/MembershipForm';
import AdminPage from './pages/AdminPage';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публічні маршрути */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Захищені маршрути (для всіх авторизованих користувачів) */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              } 
            />
          </Route>

          {/* Захищені маршрути тільки для адміна */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route 
              path="/memberships/new" 
              element={
                <Layout>
                  <MembershipForm />
                </Layout>
              } 
            />
            <Route 
              path="/memberships/edit/:id" 
              element={
                <Layout>
                  <MembershipForm />
                </Layout>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <Layout>
                  <AdminPage />
                </Layout>
              } 
            />
          </Route>

          {/* Перенаправлення за замовчуванням */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
