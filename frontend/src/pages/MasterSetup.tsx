import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Settings, 
  Building2, 
  MapPin, 
  Briefcase, 
  Database,
  Trash2,
  Loader2,
  X,
  CreditCard,
  Target,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axios';

const MasterSetup = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('institutions');

  // Switch tabs based on the URL path
  useEffect(() => {
    if (location.pathname.includes('/programs')) {
      setActiveTab('programs');
    } else {
      setActiveTab('institutions');
    }
  }, [location.pathname]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<any>({
    quotas: [
      { quotaType: 'KCET', seats: 0, filled: 0 },
      { quotaType: 'COMEDK', seats: 0, filled: 0 },
      { quotaType: 'Management', seats: 0, filled: 0 }
    ],
    academicYear: '2026-27',
    courseType: 'UG',
    entryType: 'Regular',
    admissionMode: 'Government'
  });
  
  const queryClient = useQueryClient();

  // Fetch all basic masters for dependent dropdowns
  const { data: institutions } = useQuery({ queryKey: ['masters', 'institutions'], queryFn: () => apiClient.get('/masters/institutions').then(r => r.data.data) });
  const { data: campuses } = useQuery({ queryKey: ['masters', 'campuses'], queryFn: () => apiClient.get('/masters/campuses').then(r => r.data.data) });
  const { data: departments } = useQuery({ queryKey: ['masters', 'departments'], queryFn: () => apiClient.get('/masters/departments').then(r => r.data.data) });

  const tabs = [
    { id: 'institutions', label: 'Institutions', icon: <Building2 size={18} />, fields: [{name:'name', label:'Name'}, {name:'code', label:'Code'}] },
    { id: 'campuses', label: 'Campuses', icon: <MapPin size={18} />, fields: [
        {name:'name', label:'Name'}, 
        {name:'code', label:'Code'}, 
        {name:'institution', label:'Institution', type:'select', options: institutions}
    ]},
    { id: 'departments', label: 'Departments', icon: <Briefcase size={18} />, fields: [
        {name:'name', label:'Name'}, 
        {name:'code', label:'Code'}, 
        {name:'institution', label:'Institution', type:'select', options: institutions},
        {name:'campus', label:'Campus', type:'select', options: campuses}
    ]},
    { id: 'programs', label: 'Programs', icon: <Database size={18} />, fields: [
        {name:'name', label:'Program Name'}, 
        {name:'code', label:'Branch Code'}, 
        {name:'institution', label:'Institution', type:'select', options: institutions},
        {name:'campus', label:'Campus', type:'select', options: campuses},
        {name:'department', label:'Department', type:'select', options: departments},
        {name:'academicYear', label:'Year', placeholder: '2026-27'},
        {name:'courseType', label:'Type', type:'select', options: [{_id:'UG', name:'UG'}, {_id:'PG', name:'PG'}]},
        {name:'entryType', label:'Entry', type:'select', options: [{_id:'Regular', name:'Regular'}, {_id:'Lateral', name:'Lateral'}]},
        {name:'admissionMode', label:'Mode', type:'select', options: [{_id:'Government', name:'Government'}, {_id:'Management', name:'Management'}]},
    ]},
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  const { data: listData, isLoading } = useQuery({
    queryKey: ['masters', activeTab],
    queryFn: async () => {
      const res = await apiClient.get(`/masters/${activeTab}`);
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Calculate total intake for programs from quotas
      if (activeTab === 'programs') {
        data.totalIntake = data.quotas.reduce((acc: number, q: any) => acc + Number(q.seats), 0);
      }
      return apiClient.post(`/masters/${activeTab}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masters', activeTab] });
      toast.success(`${activeTab} created successfully`);
      setShowAdd(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  });

  const resetForm = () => {
    setFormData({
        quotas: [
          { quotaType: 'KCET', seats: 0, filled: 0 },
          { quotaType: 'COMEDK', seats: 0, filled: 0 },
          { quotaType: 'Management', seats: 0, filled: 0 }
        ],
        academicYear: '2026-27',
        courseType: 'UG',
        entryType: 'Regular',
        admissionMode: 'Government',
        institution: institutions?.[0]?._id,
        campus: campuses?.[0]?._id,
        department: departments?.[0]?._id
    });
  };

  const handleQuotaChange = (index: number, value: number) => {
    const newQuotas = [...formData.quotas];
    newQuotas[index].seats = value;
    setFormData({ ...formData, quotas: newQuotas });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-navy font-headings">Master Setup</h1>
          <p className="text-gray-500 text-sm">Configure core entities for your admission portal</p>
        </div>
        <button 
          onClick={() => { setShowAdd(!showAdd); if(!showAdd) resetForm(); }}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${showAdd ? 'bg-gray-100 text-gray-500' : 'bg-accent text-white shadow-accent/20'}`}
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
          {showAdd ? 'Cancel' : `Add ${activeTab.slice(0, -1)}`}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-2 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowAdd(false); resetForm(); }}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all active:scale-95
              ${activeTab === tab.id ? 'bg-navy text-white shadow-xl rotate-1 font-black uppercase tracking-tighter' : 'text-gray-400 hover:text-navy hover:bg-gray-50'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-4xl border-2 border-accent/20 shadow-2xl animate-in zoom-in-95 duration-300">
          <h2 className="text-xl font-bold text-navy mb-10 uppercase tracking-widest flex items-center gap-2">
            <Plus size={20} className="text-accent" /> Configure {activeTab.slice(0, -1)}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentTab?.fields.map(f => (
                <div key={f.name} className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{f.label}</label>
                    {f.type === 'select' ? (
                        <select 
                            required
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-accent/10 transition-all border-2 border-transparent focus:border-accent/20 font-bold text-navy"
                            onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                            value={formData[f.name] || ''}
                        >
                            <option value="">Select {f.label}</option>
                            {f.options?.map((opt: any) => (
                                <option key={opt._id} value={opt._id}>{opt.name || opt.code}</option>
                            ))}
                        </select>
                    ) : (
                        <input 
                            type={f.type || 'text'}
                            required
                            placeholder={f.placeholder}
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-accent/10 transition-all border-2 border-transparent focus:border-accent/20 font-bold text-navy"
                            onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                            value={formData[f.name] || ''}
                        />
                    )}
                </div>
                ))}
            </div>

            {activeTab === 'programs' && (
                <div className="bg-navy/5 p-8 rounded-4xl border border-navy/10">
                    <div className="flex items-center gap-3 mb-8">
                        <CreditCard className="text-navy" />
                        <div>
                            <h3 className="text-lg font-black text-navy uppercase tracking-tighter">Seat Matrix Configuration</h3>
                            <p className="text-sm text-gray-500 font-medium">Define quota-wise seat distribution. Total intake will be calculated automatically.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {formData.quotas.map((q: any, idx: number) => (
                            <div key={q.quotaType} className="bg-white p-6 rounded-3xl border border-navy/5 shadow-sm">
                                <label className="block text-xs font-black text-navy uppercase tracking-widest mb-3 opacity-60">{q.quotaType} Seats</label>
                                <input 
                                    type="number"
                                    min="0"
                                    required
                                    className="text-3xl font-black text-navy w-full bg-transparent outline-none focus:text-accent transition-colors"
                                    value={q.seats}
                                    onChange={(e) => handleQuotaChange(idx, Number(e.target.value))}
                                />
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                    <Target size={12} /> Capacity control
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-navy/10 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Calculated Total Intake</span>
                        <span className="text-4xl font-black text-navy">{formData.quotas.reduce((acc: number, q: any) => acc + q.seats, 0)} Seats</span>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-6">
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="px-14 py-5 bg-navy text-white rounded-3xl font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-navy/30 active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {createMutation.isPending ? <Loader2 className="animate-spin" /> : <><Check className="mr-2" /> Save Configuration</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-32"><Loader2 className="animate-spin text-navy" size={48} /></div>
          ) : listData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-32 text-center opacity-40">
              <div className="p-8 bg-gray-50 rounded-full mb-4"><Settings size={48} className="text-gray-300" /></div>
              <p className="text-xl font-bold text-navy uppercase tracking-tighter">No configurations found</p>
              <p className="text-sm font-semibold text-gray-400">Start by adding your first {activeTab.slice(0, -1)} above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {listData?.data?.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-navy/10 rounded-3xl transition-all shadow-sm group">
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-navy font-black shadow-sm border border-navy/5">{item.code || 'M'}</div>
                     <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">#{idx + 1}</span>
                   </div>
                   <div className="space-y-4">
                        <div>
                            <p className="font-black text-navy text-lg leading-tight">{item.name}</p>
                            <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">
                                {activeTab === 'programs' ? `${item.academicYear} • ${item.courseType}` : (item.institution?.name || 'ROOT')}
                            </p>
                        </div>
                        
                        {activeTab === 'programs' && (
                            <div className="pt-4 border-t border-navy/5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-gray-400 tracking-widest uppercase">Capacity</p>
                                    <p className="text-xl font-black text-navy">{item.totalIntake}</p>
                                </div>
                                <div className="flex -space-x-2">
                                    {item.quotas?.map((q: any) => (
                                        <div key={q.quotaType} title={`${q.quotaType}: ${q.seats}`} className="w-8 h-8 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center text-[8px] font-black text-navy shadow-sm">
                                            {q.quotaType[0]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                   </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default MasterSetup;
