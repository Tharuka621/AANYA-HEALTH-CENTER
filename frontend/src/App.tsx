import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import ReceptionistDashboard from './pages/dashboard/ReceptionistDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import PharmacistDashboard from './pages/dashboard/PharmacistDashboard';
import LabDashboard from './pages/dashboard/LabDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import NurseDashboard from './pages/dashboard/NurseDashboard';
import UserManagement from './pages/admin/UserManagement';
import PatientManagement from './pages/admin/PatientManagement';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import LabTestManagement from './pages/admin/LabTestManagement';
import PrescriptionManagement from './pages/admin/PrescriptionManagement';
import PharmacyManagement from './pages/admin/PharmacyManagement';
import BillingManagement from './pages/admin/BillingManagement';
import ReportsManagement from './pages/admin/ReportsManagement';
import SettingsManagement from './pages/admin/SettingsManagement';
import PatientList from './pages/doctor/PatientList';
import AppointmentList from './pages/doctor/AppointmentList';
import VitalSigns from './pages/doctor/VitalSigns';
import LabTestList from './pages/doctor/LabTestList';
import PrescriptionList from './pages/doctor/PrescriptionList';
import ReportsList from './pages/doctor/ReportsList';
import PatientAppointmentList from './pages/patient/AppointmentList';
import PatientPrescriptionList from './pages/patient/PrescriptionList';
import PatientLabReports from './pages/patient/LabReports';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public routes with MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Protected app routes with dashboard layout */}
              <Route
                path="/dashboard/patient"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <DashboardLayout>
                      <PatientDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/receptionist"
                element={
                  <ProtectedRoute allowedRoles={["receptionist"]}>
                    <DashboardLayout>
                      <ReceptionistDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DashboardLayout>
                      <DoctorDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/pharmacist"
                element={
                  <ProtectedRoute allowedRoles={["pharmacist"]}>
                    <DashboardLayout>
                      <PharmacistDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/lab"
                element={
                  <ProtectedRoute allowedRoles={["lab"]}>
                    <DashboardLayout>
                      <LabDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/dashboard/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/patients"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <PatientManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/appointments"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <AppointmentManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/lab-tests"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <LabTestManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/prescriptions"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <PrescriptionManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/pharmacy"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <PharmacyManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/billing"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <BillingManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <ReportsManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <SettingsManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Doctor routes */}
              <Route
                path="/dashboard/doctor/patients"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DashboardLayout>
                      <PatientList />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/appointments"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DashboardLayout>
                      <AppointmentList />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/vital-signs"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DashboardLayout>
                      <VitalSigns />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/lab-tests"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DashboardLayout>
                      <LabTestList />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/prescriptions"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DashboardLayout>
                      <PrescriptionList />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/reports"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DashboardLayout>
                      <ReportsList />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/nurse"
                element={
                  <ProtectedRoute allowedRoles={["nurse"]}>
                    <DashboardLayout>
                      <NurseDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/nurse/*"
                element={
                  <ProtectedRoute allowedRoles={["nurse"]}>
                    <DashboardLayout>
                      <NurseDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/receptionist/*"
                element={
                  <ProtectedRoute allowedRoles={["receptionist"]}>
                    <DashboardLayout>
                      <ReceptionistDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/pharmacist/*"
                element={
                  <ProtectedRoute allowedRoles={["pharmacist"]}>
                    <DashboardLayout>
                      <PharmacistDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/lab/*"
                element={
                  <ProtectedRoute allowedRoles={["lab"]}>
                    <DashboardLayout>
                      <LabDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Patient routes */}
              <Route
                path="/dashboard/patient/appointments"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <DashboardLayout>
                      <PatientAppointmentList />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/patient/prescriptions"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <DashboardLayout>
                      <PatientPrescriptionList />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/patient/lab-reports"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <DashboardLayout>
                      <PatientLabReports />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;