import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];
const DRIVER_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

export default function Drivers() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => (await api.get('/drivers')).data.drivers || [],
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/drivers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); setForm(null); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/drivers/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); setForm(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/drivers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd.entries()) as Record<string, any>;
    d.safety_score = parseFloat(d.safety_score);
    if (editing && form?.id) updateMut.mutate({ id: form.id, data: d });
    else createMut.mutate(d);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'On Trip': return 'badge-info';
      case 'Off Duty': return 'badge-warning';
      case 'Suspended': return 'badge-danger';
      default: return 'badge-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse-soft">Loading drivers…</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Drivers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your team</p>
        </div>
        <button onClick={() => { setForm({}); setEditing(false); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      {/* Modal */}
      {form !== null && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Driver' : 'New Driver'}</h2>
              <button onClick={() => setForm(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
                  <input name="name" required defaultValue={editing ? form?.name : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">License Number</label>
                  <input name="license_number" required defaultValue={editing ? form?.license_number : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                  <select name="license_category" required defaultValue={editing ? form?.license_category : LICENSE_CATEGORIES[0]} className="input">
                    {LICENSE_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                  <select name="status" required defaultValue={editing ? form?.status : DRIVER_STATUSES[0]} className="input">
                    {DRIVER_STATUSES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Date</label>
                  <input name="license_expiry_date" type="date" required defaultValue={editing ? form?.license_expiry_date || form?.license_expiry : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Contact Number</label>
                  <input name="contact_number" type="tel" defaultValue={editing ? form?.contact_number : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Safety Score (0-100)</label>
                  <input name="safety_score" type="number" min="0" max="100" required defaultValue={editing ? form?.safety_score : '100'} className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setForm(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn btn-primary disabled:opacity-50">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>License #</th>
              <th>Category</th>
              <th>Status</th>
              <th>Score</th>
              <th>Expiry Date</th>
              <th>Contact</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d: any) => (
              <tr key={d.id}>
                <td className="font-medium text-white">{d.name}</td>
                <td>{d.license_number}</td>
                <td>{d.license_category || '—'}</td>
                <td><span className={`badge ${getStatusBadge(d.status)}`}>{d.status}</span></td>
                <td className={`font-semibold ${getScoreColor(d.safety_score)}`}>{d.safety_score}/100</td>
                <td>{d.license_expiry_date || d.license_expiry || '—'}</td>
                <td>{d.contact_number || '—'}</td>
                <td className="text-right">
                  <button onClick={() => { setForm(d); setEditing(true); }} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('Delete this driver?')) deleteMut.mutate(d.id); }} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-500">No drivers registered yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
