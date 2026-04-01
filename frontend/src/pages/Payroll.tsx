import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  User, 
  Calendar, 
  FileText, 
  Trophy, 
  Timer,
  Check,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Printer,
  Stamp,
  PenLine
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axios';

const Payroll = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data: payrollRecords, isLoading } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const res = await apiClient.get('/payroll');
      return res.data.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(`/payroll/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll updated successfully');
      setEditingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  });

  const handleEdit = (rec: any) => {
    setEditingId(rec._id);
    setEditForm({
      id: rec._id,
      header: rec.header,
      digitalSignUrl: rec.digitalSignUrl || '',
      stampUrl: rec.stampUrl || ''
    });
  };

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  const printPayroll = (rec: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payroll Report - ${rec.month}/${rec.year}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #334155; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #1e1b4b; text-transform: uppercase; letter-spacing: 2px; }
            .content { margin-bottom: 40px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5px; }
            .label { font-weight: bold; color: #64748b; }
            .footer { margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature-block { text-align: center; }
            .sign-img { max-height: 80px; display: block; margin-bottom: 10px; }
            .stamp-img { max-height: 100px; display: block; margin-bottom: 10px; }
            .total { font-size: 24px; font-weight: 900; color: #1e1b4b; background: #f8fafc; padding: 20px; border-radius: 10px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${rec.header}</h1>
            <p>Salary Report - Month: ${rec.month}, Year: ${rec.year}</p>
          </div>
          <div class="content">
            <div class="row"><span class="label">Employee Name:</span><span>${rec.user.name}</span></div>
            <div class="row"><span class="label">Employee Email:</span><span>${rec.user.email}</span></div>
            <div class="row"><span class="label">Full Days Worked:</span><span>${rec.fullDayCount}</span></div>
            <div class="row"><span class="label">Half Days Worked:</span><span>${rec.halfDayCount}</span></div>
            <div class="total">Total Payment: ₹ ${rec.totalAmount.toLocaleString()}</div>
          </div>
          <div class="footer">
            <div class="signature-block">
              ${rec.digitalSignUrl ? `<img src="${rec.digitalSignUrl}" class="sign-img" />` : '<div style="height:80px; width:150px; border-bottom:1px solid #000"></div>'}
              <p>Authorized Signature</p>
            </div>
            <div class="signature-block">
              ${rec.stampUrl ? `<img src="${rec.stampUrl}" class="stamp-img" />` : '<div style="height:100px; width:100px; border:2px solid #ccc; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#ccc">STAMP</div>'}
              <p>Official Stamp</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) return <div className="p-32 flex justify-center"><Loader2 className="animate-spin text-navy" size={48} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy font-headings uppercase tracking-tighter">Payroll Management</h1>
          <p className="text-gray-500 text-sm font-medium">Manage employee salaries, headers, and digital authentication.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {payrollRecords?.map((rec: any) => (
          <div key={rec._id} className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group p-8">
            <div className="flex flex-col lg:flex-row justify-between gap-10">
              
              {/* Info Section */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {rec.user.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy leading-none">{rec.user.name}</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Period: {rec.month}/{rec.year}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase tracking-widest">
                    <Trophy size={14} /> Full Payment
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Days</p>
                    <p className="text-2xl font-black text-navy uppercase flex items-center gap-2">
                       <Timer size={18} className="text-accent" /> {rec.fullDayCount}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Half Days</p>
                    <p className="text-2xl font-black text-navy uppercase flex items-center gap-2">
                       <Timer size={18} className="text-amber-500" /> {rec.halfDayCount}
                    </p>
                  </div>
                  <div className="p-4 bg-navy text-white rounded-3xl col-span-2 shadow-xl shadow-navy/20">
                    <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-1">Final Payment Amount</p>
                    <p className="text-3xl font-black font-headings tabular-nums tracking-tighter">₹ {rec.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Edit/Admin Section */}
              <div className="lg:w-96 p-6 bg-gray-50 rounded-4xl border border-gray-100 flex flex-col justify-between">
                {editingId === rec._id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Payroll HeaderText</label>
                      <input 
                        className="w-full px-4 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:border-accent font-bold text-navy"
                        value={editForm.header}
                        onChange={e => setEditForm({...editForm, header: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Sign URL</label>
                        <input 
                          className="w-full px-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-xs"
                          value={editForm.digitalSignUrl}
                          onChange={e => setEditForm({...editForm, digitalSignUrl: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Stamp URL</label>
                        <input 
                          className="w-full px-4 py-2 bg-white rounded-xl border border-gray-200 outline-none text-xs"
                          value={editForm.stampUrl}
                          onChange={e => setEditForm({...editForm, stampUrl: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSave} className="flex-1 py-3 bg-navy text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg">
                        <Check size={14} /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs uppercase">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration</span>
                         <button onClick={() => handleEdit(rec)} className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-accent"><Edit2 size={16}/></button>
                       </div>
                       <div className="space-y-2">
                         <p className="text-sm font-black text-navy">{rec.header}</p>
                         <div className="flex items-center gap-3">
                           {rec.digitalSignUrl ? <div className="px-3 py-1 bg-white rounded-lg border border-emerald-100 text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><PenLine size={10} /> Signed</div> : <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">No Sign</div>}
                           {rec.stampUrl ? <div className="px-3 py-1 bg-white rounded-lg border border-emerald-100 text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><Stamp size={10} /> Stamped</div> : <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">No Stamp</div>}
                         </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => printPayroll(rec)}
                      className="mt-6 w-full py-4 bg-white border-2 border-navy/5 text-navy rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-navy hover:text-white hover:shadow-xl transition-all active:scale-95 group/btn"
                    >
                      <Printer size={16} className="group-hover/btn:animate-bounce" /> Print Official Payroll
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {payrollRecords?.length === 0 && (
          <div className="p-20 text-center bg-white rounded-4xl border-2 border-dashed border-gray-200 opacity-50">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-bold text-navy uppercase tracking-widest">No payroll records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
