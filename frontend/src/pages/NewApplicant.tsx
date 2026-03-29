import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  BookOpen, 
  MapPin,
  ChevronRight,
  Loader2,
  Calendar,
  Contact,
  ShieldAlert,
  Clock
} from 'lucide-react';
import apiClient from '../api/axios';

const applicantSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  category: z.enum(['GM', 'SC', 'ST', 'OBC', 'EWS']),
  program: z.string().min(1, 'Please select a program'),
  quotaType: z.enum(['KCET', 'COMEDK', 'Management']),
  entryType: z.enum(['Regular', 'Lateral']),
  admissionMode: z.enum(['Government', 'Management']),
  qualifyingMarks: z.coerce.number().min(0, 'Must be 0 or more'),
});

const NewApplicant = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      gender: 'Male',
      category: 'GM',
      quotaType: 'KCET',
      entryType: 'Regular',
      admissionMode: 'Government'
    }
  });

  // Fetch programs for select
  const { data: programsData } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await apiClient.get('/masters/programs');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof applicantSchema>) => apiClient.post('/applicants', data),
    onSuccess: () => navigate('/applicants'),
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create applicant')
  });

  const onSubmit = (data: z.infer<typeof applicantSchema>) => {
    mutation.mutate(data);
  };

  const selectedProgramId = watch('program');
  const selectedProgram = programsData?.data?.find((p: any) => p._id === selectedProgramId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/applicants" className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-navy hover:text-white transition-all active:scale-95">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-navy font-headings">Register Applicant</h1>
          <p className="text-gray-500 text-sm">Fill in the student details to start the admission process</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${step === 1 ? 'bg-navy text-white shadow-lg' : 'text-navy opacity-40 hover:opacity-100'}`}>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</div>
          Personal Details
        </div>
        <ChevronRight size={16} className="text-gray-300" />
        <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${step === 2 ? 'bg-navy text-white shadow-lg' : 'text-navy opacity-40 hover:opacity-100'}`}>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</div>
          Academic Choice
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium flex items-center gap-3">
          <ShieldAlert size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-navy font-headings border-b border-gray-100 pb-4 mb-8">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('firstName')} className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white transition-all outline-none shadow-sm" placeholder="John" />
                </div>
                {errors.firstName && <p className="text-xs text-red-500 ml-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('lastName')} className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white transition-all outline-none shadow-sm" placeholder="Doe" />
                </div>
                {errors.lastName && <p className="text-xs text-red-500 ml-1">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                <input {...register('email')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white transition-all outline-none shadow-sm" placeholder="john@example.com" />
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                <input {...register('phone')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white transition-all outline-none shadow-sm" placeholder="+91 9876543210" />
                {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Gender</label>
                <select {...register('gender')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                <select {...register('category')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white outline-none">
                  <option value="GM">General Merit (GM)</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
            <div className="pt-8 flex justify-end">
              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="flex items-center gap-3 px-10 py-4 bg-navy text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-navy/20"
              >
                Next Step <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6 animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-xl font-bold text-navy font-headings border-b border-gray-100 pb-4 mb-8">Academic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Select Program</label>
                <select {...register('program')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white outline-none">
                  <option value="">Choose a Program...</option>
                  {programsData?.data?.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.code})</option>
                  ))}
                </select>
                {errors.program && <p className="text-xs text-red-500 ml-1">{errors.program.message}</p>}
                {selectedProgram && (
                   <div className="mt-2 p-3 bg-blue-50/50 rounded-xl text-xs font-semibold text-blue-600 flex items-center gap-2">
                      <Clock size={14} /> Total Intake: {selectedProgram.totalIntake} • Available Seatsby Virtual: {selectedProgram.availableSeats}
                   </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Quota Type</label>
                <select {...register('quotaType')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white outline-none">
                  <option value="KCET">KCET (Government)</option>
                  <option value="COMEDK">COMEDK</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Qualifying Exam Marks (%)</label>
                <input type="number" step="0.01" {...register('qualifyingMarks')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white outline-none shadow-sm" />
                {errors.qualifyingMarks && <p className="text-xs text-red-500 ml-1">{errors.qualifyingMarks.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Entry Type</label>
                <select {...register('entryType')} className="w-full px-4 py-4 bg-gray-50/50 border border-transparent rounded-2xl focus:border-accent focus:bg-white outline-none">
                  <option value="Regular">Regular</option>
                  <option value="Lateral">Lateral (Diploma)</option>
                </select>
              </div>
            </div>
            <div className="pt-8 flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-8 py-4 text-gray-500 font-bold hover:text-navy transition-all"
              >
                Back to Personal
              </button>
              <button 
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-3 px-12 py-4 bg-accent text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" /> : <><Check size={20} /> Register Student</>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewApplicant;
