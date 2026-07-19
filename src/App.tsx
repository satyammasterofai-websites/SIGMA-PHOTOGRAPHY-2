/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const PremiumGallery = React.lazy(() => import('./pages/PremiumGallery'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const TemplateDetails = React.lazy(() => import('./pages/TemplateDetails'));
import AuthProvider from './components/AuthProvider';
import { useAuthStore } from './store/useAuthStore';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, role, loading } = useAuthStore();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

import { usePresence } from './hooks/usePresence';

const SplashVideo = React.lazy(() => import('./components/SplashVideo'));
const WhatsAppButton = React.lazy(() => import('./components/WhatsAppButton'));
const SupportChatButton = React.lazy(() => import('./components/SupportChatButton'));
const GlobalChatListener = React.lazy(() => import('./components/GlobalChatListener'));

function AppContent() {
  usePresence();
  return (
    <Router>
      <Suspense fallback={null}>
        <SplashVideo />
        <WhatsAppButton />
        <SupportChatButton />
        <GlobalChatListener />
      </Suspense>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin"></div></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<PremiumGallery />} />
        <Route path="/template/:id" element={<TemplateDetails />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

