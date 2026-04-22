import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './components/SocketProvider';
import './App.css';
import AdminDashboard from './AdminDashboard';

import Header from './components/Header';
import Footer from './components/Footer';
import Newsletter from './components/Newsletter';

import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import ProjectDetail from './pages/ProjectDetail';
import BeneficiaryDetail from './pages/BeneficiaryDetail';
import OrganizationsPage from './pages/OrganizationsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

const MainLayout = () => (
  <div className="app">
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectPage />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/beneficiary/:id" element={<BeneficiaryDetail />} />
      <Route path="/organizations" element={<OrganizationsPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
    </Routes>
    <Newsletter />
    <Footer />
  </div>
);

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
