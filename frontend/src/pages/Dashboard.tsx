import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Loader2,
  FileText,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

interface ProgramStat {
  name: string;
  kcet: number;
  comedk: number;
  mgmt: number;
}

interface StatusDistributionItem {
  _id: string;
  count: number;
}

interface MiniApplicant {
  _id: string;
  firstName: string;
  lastName: string;
  program: { name: string };
  feeStatus: string;
  status: string;
}

interface DashboardStats {
  totalIntake: number;
  totalAdmitted: number;
  totalFilled: number;
  seatsRemaining: number;
  feePendingCount: number;
  programStats: ProgramStat[];
  statusDistribution: StatusDistributionItem[];
  feePendingList: MiniApplicant[];
  pendingDocsList: MiniApplicant[];
}

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/stats');
      return res.data.data;
    },
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-navy" size={48} />
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Intake', 
      value: dashboardData?.totalIntake || 0, 
      icon: <Users className="text-blue-500" />, 
      change: 'Capacity', 
      color: 'bg-blue-50' 
    },
    { 
      title: 'Admitted', 
      value: dashboardData?.totalAdmitted || 0, 
      icon: <CheckCircle className="text-green-500" />, 
      change: `${Math.round(((dashboardData?.totalAdmitted || 0) / (dashboardData?.totalIntake || 1)) * 100)}%`, 
      color: 'bg-green-50' 
    },
    { 
      title: 'Remaining', 
      value: dashboardData?.seatsRemaining || 0, 
      icon: <Clock className="text-orange-500" />, 
      change: 'Available', 
      color: 'bg-orange-50' 
    },
    { 
      title: 'Fee Pending', 
      value: dashboardData?.feePendingCount || 0, 
      icon: <CreditCard className="text-red-500" />, 
      change: 'Attention', 
      color: 'bg-red-50' 
    },
  ];

  const quotaData = dashboardData?.programStats || [];

  const statusData = dashboardData?.statusDistribution?.map((d: StatusDistributionItem) => ({
    name: d._id.replace('_', ' '),
    value: d.count
  })) || [];

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Welcome Header */}
      <div className="bg-navy p-10 rounded-4xl text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-accent/30 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black font-headings mb-3 tracking-tighter">Admission Command Center</h1>
            <p className="text-gray-300 opacity-80 max-w-lg font-medium">Real-time monitoring of seat allocations, quota compliance, and student registration status across the institution.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Health</p>
                <p className="text-lg font-bold">Operational</p>
             </div>
             <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-7 rounded-4xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.color} bg-opacity-70 group-hover:scale-110 transition-all duration-500 shadow-sm`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-gray-50 text-gray-400 uppercase tracking-widest">
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1 font-body leading-none">{stat.title}</h3>
            <p className="text-4xl font-black text-navy font-headings tabular-nums tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm min-h-[450px] relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="flex items-center justify-between mb-10">
            <div>
                <h2 className="text-2xl font-black text-navy font-headings tracking-tight">Program Quota Matrix</h2>
                <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-widest">Regional vs Management Seats</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quotaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                   cursor={{fill: '#F8FAFC'}}
                   contentStyle={{backgroundColor:'#0F172A', borderRadius:'16px', border:'none', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.2)', color: '#FFF'}}
                   itemStyle={{fontWeight:'900', fontSize: '12px'}}
                />
                <Bar dataKey="kcet" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="comedk" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="mgmt" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm min-h-[450px] group overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all"></div>
          <h2 className="text-2xl font-black text-navy font-headings tracking-tight mb-10">Admission Distribution</h2>
          <div className="h-[320px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={125}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{backgroundColor:'#0F172A', borderRadius:'16px', border:'none', color: '#FFF'}}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{paddingTop: '30px', fontWeight: 800, fontSize: '10px', textTransform:'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">CAPACITY</p>
               <p className="text-5xl font-black text-navy font-headings tabular-nums tracking-tighter">{dashboardData?.totalIntake || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Lists: Attention Required */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fee Pending List */}
        <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><CreditCard size={24} /></div>
                    <div>
                        <h2 className="text-xl font-black text-navy font-headings tracking-tight">Fee Attention Required</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Pending payments for locked seats</p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {dashboardData?.feePendingList?.map((applicant) => (
                    <div key={applicant._id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-3xl hover:bg-white border-2 border-transparent hover:border-red-100 transition-all group/item shadow-sm hover:shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-navy font-black shadow-sm text-xs">{applicant.firstName[0]}{applicant.lastName[0]}</div>
                            <div>
                                <p className="font-bold text-navy text-sm leading-none">{applicant.firstName} {applicant.lastName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{applicant.program.name}</p>
                            </div>
                        </div>
                        <Link to={`/applicants/${applicant._id}`} className="p-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90">
                            <Eye size={18} />
                        </Link>
                    </div>
                ))}
                {dashboardData?.feePendingList?.length === 0 && (
                    <p className="text-center py-10 text-emerald-500 font-bold text-sm bg-emerald-50 rounded-3xl">All fees are currently up to date! ✨</p>
                )}
            </div>
        </div>

        {/* Document Pending List */}
        <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><FileText size={24} /></div>
                    <div>
                        <h2 className="text-xl font-black text-navy font-headings tracking-tight">Document Verification</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Pending uploads or verification</p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {dashboardData?.pendingDocsList?.map((applicant) => (
                    <div key={applicant._id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-3xl hover:bg-white border-2 border-transparent hover:border-amber-100 transition-all group/item shadow-sm hover:shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-navy font-black shadow-sm text-xs">{applicant.firstName[0]}{applicant.lastName[0]}</div>
                            <div>
                                <p className="font-bold text-navy text-sm leading-none">{applicant.firstName} {applicant.lastName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{applicant.program.name}</p>
                            </div>
                        </div>
                        <Link to={`/applicants/${applicant._id}`} className="p-3 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all active:scale-90">
                            <Eye size={18} />
                        </Link>
                    </div>
                ))}
                {dashboardData?.pendingDocsList?.length === 0 && (
                    <p className="text-center py-10 text-emerald-500 font-bold text-sm bg-emerald-50 rounded-3xl">All documents are verified! ✅</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
