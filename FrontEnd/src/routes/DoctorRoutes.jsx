import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FaceAuthVerification from '../components/auth/FaceAuthVerification';
import FaceAuthGuard from '../components/auth/FaceAuthGuard';
import DoctorHome from '../pages/doctor/DoctorHome';
import DoctorSchedule from '../pages/doctor/DoctorSchedule';
import PatientList from '../pages/doctor/PatientList';
import PatientDetail from '../pages/doctor/PatientDetail';
import DoctorProfile from '../pages/doctor/DoctorProfile';
import DoctorLogin from '../pages/doctor/DoctorLogin';

/**
 * Định nghĩa các route cho phần Doctor
 * Sử dụng FaceAuthGuard để bảo vệ các route yêu cầu xác thực khuôn mặt
 */
const DoctorRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<DoctorLogin />} />
      <Route path="/face-auth" element={<FaceAuthVerification />} />
      
      {/* Protected routes - Require face authentication */}
      <Route path="/doctor-home" element={
        <FaceAuthGuard>
          <DoctorHome />
        </FaceAuthGuard>
      } />
      
      <Route path="/schedule" element={
        <FaceAuthGuard>
          <DoctorSchedule />
        </FaceAuthGuard>
      } />
      
      <Route path="/patients" element={
        <FaceAuthGuard>
          <PatientList />
        </FaceAuthGuard>
      } />
      
      <Route path="/patients/:patientId" element={
        <FaceAuthGuard>
          <PatientDetail />
        </FaceAuthGuard>
      } />
      
      <Route path="/profile" element={
        <FaceAuthGuard>
          <DoctorProfile />
        </FaceAuthGuard>
      } />
      
      {/* Redirect to doctor home by default */}
      <Route path="/" element={<Navigate to="/doctor-home" replace />} />
      
      {/* Fallback for any other doctor routes */}
      <Route path="*" element={<Navigate to="/doctor-home" replace />} />
    </Routes>
  );
};

export default DoctorRoutes; 