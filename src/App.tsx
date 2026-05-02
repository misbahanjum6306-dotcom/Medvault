import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './lib/ProtectedRoute';

// Pages (to be implemented)
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientTimeline from './pages/PatientTimeline';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatientView from './pages/DoctorPatientView';
import HealthuOverlay from './components/HealthuOverlay';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Landing />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } 
          />

          {/* Patient Routes */}
          <Route 
            path="/patient/dashboard" 
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/upload" 
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/timeline" 
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientTimeline />
              </ProtectedRoute>
            } 
          />

          {/* Doctor Routes */}
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/patient/:id" 
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorPatientView />
              </ProtectedRoute>
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <HealthuOverlay />
      </BrowserRouter>
    </AuthProvider>
  );
}
