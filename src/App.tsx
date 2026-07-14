/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PremiumGallery from './pages/PremiumGallery';
import Checkout from './pages/Checkout';
import TemplateDetails from './pages/TemplateDetails';
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

import SplashVideo from './components/SplashVideo';
import WhatsAppButton from './components/WhatsAppButton';
import SupportChatButton from './components/SupportChatButton';
import GlobalChatListener from './components/GlobalChatListener';

function AppContent() {
  usePresence();
  return (
    <Router>
      <SplashVideo />
      <WhatsAppButton />
      <SupportChatButton />
      <GlobalChatListener />
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

