import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import apiClient from '../api/axios';

interface Program {
  name: string;
}

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  category: string;
  program: Program;
  quotaType: string;
  status: 'Applied' | 'Seat_Locked' | 'Confirmed' | 'Cancelled';
  feeStatus: string;
}

interface ApiResponse {
  data: Applicant[];
  meta: {
    total: number;
  };
}

interface StatusBadgeProps {
  status: Applicant['status'];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<Applicant['status'], string> = {
    'Applied': 'bg-blue-100 text-blue-700 border-blue-200',
    'Seat_Locked': 'bg-orange-100 text-orange-700 border-orange-200',
    'Confirmed': 'bg-green-100 text-green-700 border-green-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const Applicants = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ['applicants', page, search, statusFilter],
    queryFn: async () => {
      const res = await apiClient.get('/applicants', {
        params: { page, search, status: statusFilter, limit: 10 }
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy font-headings">Applicant Management</h1>
          <p className="text-gray-500 text-sm">Review and process student admission applications</p>
        </div>
        <Link 
          to="/new-applicant" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-accent/20 active:scale-95"
        >
          <Plus size={20} />
          New Applicant
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or admission ID..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 outline-none font-semibold text-gray-600 appearance-none min-w-[160px]"
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Seat_Locked">Seat Locked</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name & Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Program & Quota</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Docs & Fee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-16">
                      <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-50 rounded-full w-1/2"></div>
                    </td>
                  </tr>
                ))
              ) : data?.data?.map((applicant) => (
                <tr key={applicant._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-navy font-headings text-lg">{applicant.firstName} {applicant.lastName}</div>
                    <div className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                      {applicant.email} • <span className="text-navy/60">{applicant.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-semibold text-gray-700">{applicant.program?.name}</div>
                    <div className="text-accent text-[10px] font-bold tracking-widest uppercase">{applicant.quotaType}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusBadge status={applicant.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-2">
                       <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${applicant.feeStatus === 'Paid' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                         <CheckCircle2 size={10} /> FEE {applicant.feeStatus.toUpperCase()}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      to={`/applicants/${applicant._id}`} 
                      className="inline-flex items-center justify-center p-3 text-navy bg-navy/5 rounded-2xl hover:bg-navy hover:text-white transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-90"
                    >
                      <Eye size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                      <Search size={64} className="text-gray-300" />
                      <div>
                        <p className="text-xl font-bold text-gray-500">No applicants found</p>
                        <p className="text-gray-400">Try adjusting your filters or search term</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta.total > 0 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">
              Showing <span className="text-navy">{data.data.length}</span> of <span className="text-navy">{data.meta.total}</span> applicants
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-navy hover:text-white transition-all disabled:opacity-30 active:scale-95 shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={page * 10 >= (data?.meta?.total ?? 0)}
                 onClick={() => setPage(p => p + 1)}
                 className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-navy hover:text-white transition-all disabled:opacity-30 active:scale-95 shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
