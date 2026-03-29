import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileCheck, 
  Lock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Trash2,
  XCircle
} from 'lucide-react';
import apiClient from '../api/axios';

interface Program {
  _id: string;
  name: string;
  academicYear: string;
}

interface DocumentStatus {
  tenthMarksheet: string;
  twelfthMarksheet: string;
  casteCertificate: string;
  domicile: string;
  photos: string;
  [key: string]: string; // Fallback for flexibility
}

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'Applied' | 'Seat_Locked' | 'Confirmed' | 'Cancelled';
  admissionNumber?: string;
  documentStatus: DocumentStatus;
  feeStatus: 'Pending' | 'Paid';
  program: Program;
  quotaType: string;
  entryType: string;
  createdAt: string;
}

const ApplicantDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [allotmentNumber, setAllotmentNumber] = React.useState('');

  const { data: applicant, isLoading } = useQuery<Applicant>({
    queryKey: ['applicant', id],
    queryFn: async () => {
      const res = await apiClient.get(`/applicants/${id}`);
      return res.data.data;
    }
  });

  const updateDocMutation = useMutation({
    mutationFn: (newDocs: DocumentStatus) => apiClient.put(`/applicants/${id}/documents`, { documentStatus: newDocs }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicant', id] })
  });

  const toggleFeeMutation = useMutation({
    mutationFn: (newStatus: 'Pending' | 'Paid') => apiClient.put(`/applicants/${id}/fee`, { feeStatus: newStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicant', id] })
  });

  const allocateSeatMutation = useMutation({
    mutationFn: () => {
      if (!applicant) throw new Error('Applicant data not loaded');
      return apiClient.post(`/applicants/${id}/allocate-seat`, { 
        programId: applicant.program._id, 
        quotaType: applicant.quotaType,
        allotmentNumber: allotmentNumber || undefined
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicant', id] })
  });

  const confirmAdmissionMutation = useMutation({
    mutationFn: () => apiClient.post(`/applicants/${id}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicant', id] })
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.delete(`/applicants/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicant', id] })
  });

  if (isLoading || !applicant) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-navy" size={48} /></div>;

  const steps = [
    { label: 'Applied', status: 'done', icon: <Clock size={16} /> },
    { label: 'Seat Locked', status: applicant.status !== 'Applied' ? 'done' : 'current', icon: <Lock size={16} /> },
    { label: 'Fees & Docs', status: applicant.status === 'Seat_Locked' ? 'current' : (applicant.status === 'Confirmed' ? 'done' : 'pending'), icon: <FileCheck size={16} /> },
    { label: 'Confirmed', status: applicant.status === 'Confirmed' ? 'done' : 'pending', icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/applicants" className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-navy hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-navy font-headings uppercase tracking-tight">
              {applicant.firstName} {applicant.lastName}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
              {applicant.email} • {applicant.phone}
            </div>
          </div>
        </div>

        {applicant.status === 'Confirmed' && (
          <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-xl shadow-emerald-200 border-2 border-emerald-400/20 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Admission Number</span>
            <span className="text-2xl font-black font-headings tracking-tighter tabular-nums">{applicant.admissionNumber}</span>
          </div>
        )}
      </div>

      {/* Admission Timeline */}
      <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-navy/5"></div>
        <div className="flex justify-between relative">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-100"></div>
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 relative z-10 bg-white px-4 group">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${step.status === 'done' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-110' : 
                  step.status === 'current' ? 'bg-navy text-white shadow-xl rotate-12' : 'bg-gray-100 text-gray-400'}
              `}>
                {step.status === 'done' ? <CheckCircle2 size={24} /> : step.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${step.status === 'pending' ? 'text-gray-300' : 'text-navy'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Details & Actions */}
        <div className="xl:col-span-2 space-y-8">
          {/* Action Center */}
          <div className="bg-white p-10 rounded-4xl border border-navy shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-navy/5 rounded-full blur-3xl group-hover:bg-navy/10 transition-all duration-700"></div>
            <h2 className="text-xl font-bold text-navy font-headings mb-8 flex items-center gap-3">
              <ShieldCheck className="text-accent" /> Action Center
            </h2>
            
            <div className="flex flex-col gap-4">
              {applicant.status === 'Applied' && (
                <div className="space-y-4 w-full">
                  {(applicant.quotaType === 'KCET' || applicant.quotaType === 'COMEDK') && (
                    <div className="space-y-2 animate-in slide-in-from-left-4 duration-300">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Government Allotment Number</label>
                      <input 
                        type="text"
                        placeholder="e.g. KCET-2026-12345"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-navy focus:bg-white transition-all outline-none font-bold text-navy shadow-inner"
                        value={allotmentNumber}
                        onChange={(e) => setAllotmentNumber(e.target.value)}
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => allocateSeatMutation.mutate()}
                    disabled={allocateSeatMutation.isPending || ((applicant.quotaType === 'KCET' || applicant.quotaType === 'COMEDK') && !allotmentNumber)}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-navy text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-navy/20 active:scale-95 disabled:opacity-50"
                  >
                    {allocateSeatMutation.isPending ? <Loader2 className="animate-spin" /> : <><Lock /> Allocate Seat</>}
                  </button>
                  {(applicant.quotaType === 'KCET' || applicant.quotaType === 'COMEDK') && !allotmentNumber && (
                    <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 ml-1"><AlertCircle size={10} /> Allotment number is required for {applicant.quotaType}</p>
                  )}
                </div>
              )}

              {applicant.status === 'Seat_Locked' && (
                <button 
                  onClick={() => confirmAdmissionMutation.mutate()}
                  disabled={confirmAdmissionMutation.isPending || applicant.feeStatus === 'Pending'}
                  className={`
                    flex-grow flex items-center justify-center gap-3 px-8 py-5 text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95
                    ${applicant.feeStatus === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-gray-300 cursor-not-allowed opacity-60'}
                  `}
                >
                  {confirmAdmissionMutation.isPending ? <Loader2 className="animate-spin" /> : 
                    applicant.feeStatus === 'Pending' ? <><XCircle /> Pay Fee to Confirm</> : <><CheckCircle2 /> Confirm Admission</>
                  }
                </button>
              )}

              {applicant.status !== 'Confirmed' && applicant.status !== 'Cancelled' && (
                <button 
                  onClick={() => { if(window.confirm('Are you sure you want to cancel this admission?')) cancelMutation.mutate() }}
                  className="px-8 py-5 border-2 border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Trash2 size={20} /> Cancel
                </button>
              )}
            </div>
            {applicant.status === 'Seat_Locked' && applicant.feeStatus === 'Pending' && (
              <p className="mt-4 text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-xl inline-flex items-center gap-2">
                <AlertCircle size={14} /> Confirmation requires fee to be marked as PAID first.
              </p>
            )}
          </div>

          {/* Document Section */}
          <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm">
             <h2 className="text-xl font-bold text-navy font-headings mb-8 flex items-center gap-3">
               <FileCheck className="text-blue-500" /> Document Verification
             </h2>
             <div className="space-y-4">
                {Object.entries(applicant.documentStatus).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <span className="font-bold text-gray-700 capitalize italic">{key.replace(/([A-Z])/g, ' $1').replace('Status', '')}</span>
                    <select 
                      value={value}
                      disabled={applicant.status === 'Confirmed'}
                      className={`
                        px-6 py-2 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-accent/20 border transition-all
                        ${value === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          value === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}
                      `}
                      onChange={(e) => {
                        const newDocs = { ...applicant.documentStatus, [key]: e.target.value };
                        updateDocMutation.mutate(newDocs);
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Verified">Verified</option>
                    </select>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Information Sidebar */}
        <div className="space-y-8">
           {/* Fee Widget */}
           <div className={`p-8 rounded-4xl border transition-all duration-300 ${applicant.feeStatus === 'Paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-black text-navy uppercase text-sm tracking-widest">Fee Management</h3>
                 <CreditCard className={applicant.feeStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'} />
              </div>
              <div className="space-y-4 text-center">
                 <p className="text-3xl font-black font-headings uppercase tabular-nums tracking-tighter text-navy">{applicant.feeStatus}</p>
                 {applicant.status !== 'Confirmed' && (
                   <button 
                     onClick={() => toggleFeeMutation.mutate(applicant.feeStatus === 'Paid' ? 'Pending' : 'Paid')}
                     className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 ${applicant.feeStatus === 'Paid' ? 'bg-red-400 hover:bg-red-500 shadow-red-100' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'}`}
                   >
                     {applicant.feeStatus === 'Paid' ? 'Mark as Unpaid' : 'Mark as Received'}
                   </button>
                 )}
              </div>
           </div>

           {/* Program Summary */}
           <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-black text-navy uppercase text-xs tracking-widest opacity-40">Program Details</h3>
              <div>
                 <p className="text-xl font-bold text-navy font-headings">{applicant.program?.name}</p>
                 <p className="text-xs font-black text-accent uppercase tracking-tighter italic">Batch {applicant.program?.academicYear}</p>
              </div>
              <div className="pt-4 space-y-2">
                 <div className="flex justify-between text-xs font-semibold"><span className="text-gray-400">Quota:</span> <span className="text-navy">{applicant.quotaType}</span></div>
                 <div className="flex justify-between text-xs font-semibold"><span className="text-gray-400">Entry:</span> <span className="text-navy">{applicant.entryType}</span></div>
                 <div className="flex justify-between text-xs font-semibold"><span className="text-gray-400">Applied At:</span> <span className="text-navy">{new Date(applicant.createdAt).toLocaleDateString()}</span></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
