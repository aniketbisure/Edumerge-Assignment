import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError('');
    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'An error occurred during login');
    }
    setIsSubmitting(false);
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="w-full max-w-md p-10 bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-2xl shadow-xl shadow-accent/20 mb-6 group transition-all duration-300 hover:scale-105 active:scale-95">
             <LogIn size={40} className="text-white group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-4xl font-bold text-navy font-headings mb-3">Admission CRM</h1>
          <p className="text-gray-500 font-body">Sign in to manage student admissions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
            <input
              {...register('email')}
              className={`w-full px-5 py-4 border rounded-2xl outline-none transition-all duration-200 bg-white/10 ${errors.email ? 'border-red-400 bg-red-50/50' : 'border-gray-200 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:shadow-sm'}`}
              placeholder="admin@edumerge.com"
            />
            {errors.email && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-5 py-4 border rounded-2xl outline-none transition-all duration-200 bg-white/10 ${errors.password ? 'border-red-400 bg-red-50/50' : 'border-gray-200 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:shadow-sm'}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-4 bg-navy text-white rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-navy/20 disabled:opacity-75"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Login to Continue'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">
          © 2026 edumerge Admission Portal
        </div>
      </div>
    </div>
  );
};

export default Login;
