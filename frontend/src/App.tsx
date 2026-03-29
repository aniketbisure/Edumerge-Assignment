import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applicants from './pages/Applicants';
import NewApplicant from './pages/NewApplicant';
import ApplicantDetail from './pages/ApplicantDetail';
import MasterSetup from './pages/MasterSetup';
import { Toaster } from 'react-hot-toast';
import './index.css';

const queryClient = new QueryClient();

// Protected Route wrapper
const PrivateRoute = ({ children, roles = [] }: { children: React.ReactNode; roles?: string[] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 scale-110 grayscale animate-pulse">
        <h2 className="text-3xl font-black text-navy font-headings uppercase tracking-tighter shadow-sm p-8 bg-white rounded-4xl">Admission Portal...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role || '')) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-10 bg-white shadow-lg rounded-xl">
        <h1 className="text-4xl font-bold text-red-500 mb-4 font-headings uppercase tracking-widest">Unauthorized Access</h1>
        <p className="text-gray-600 text-lg font-semibold">You don't have permission to access this module.</p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="mt-6 px-10 py-5 bg-navy text-white rounded-3xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-navy/20 active:scale-95"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="applicants" element={<Applicants />} />
              <Route path="applicants/:id" element={<ApplicantDetail />} />
              <Route path="new-applicant" element={<NewApplicant />} />
              <Route path="master-setup" element={<PrivateRoute roles={['admin']}><MasterSetup /></PrivateRoute>} />
              <Route path="programs" element={<PrivateRoute roles={['admin']}><MasterSetup /></PrivateRoute>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


export default App;
