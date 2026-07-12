import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X, Pencil, Trash2, CheckCircle2 } from 'lucide-react';

const MAINTENANCE_TYPES = [
  'Oil Change', 'Tire Replacement', 'Engine Repair',
  'General Service', 'Brake Service', 'Transmission Service'
];
const MAINTENANCE_STATUSES = ['Open', 'Active', 'Closed', 'Completed'];

export default function Maintenance() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => (await api.get('/maintenance')).data.maintenance_logs || [],
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/maintenance', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenance'] }); setForm(null); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/maintenance/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenance'] }); setForm(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/maintenance/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });
  const completeMut = useMutation({
    mutationFn: (id: number) => api.put(`/maintenance/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd.entries()) as Record<string, any>;
    d.vehicle_id = parseInt(d.vehicle_id, 10);
    d.cost = parseFloat(d.cost);
    if (editing && form?.id) updateMut.mutate({ id: form.id, data: d });
    else createMut.mutate(d);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Closed': return 'badge-success';
      case 'Open':
      case 'Active': return 'badge-warning';
      default: return 'badge-muted';
    }
  };

  const isCompleted = (status: string) => status === 'Completed' || status === 'Closed';

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse-soft">Loading maintenance records…</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance</h1>
          <p className="text-sm text-slate-500 mt-1">Manage fleet service and repairs</p>
        </div>
        <button onClick={() => { setForm({}); setEditing(false); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Log Maintenance
        </button>
      </div>

      {/* Modal */}
      {form !== null && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Record' : 'Log Maintenance'}</h2>
              <button onClick={() => setForm(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <input name="description" required defaultValue={editing ? form?.description : ''} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                  <select name="type" required defaultValue={editing ? form?.type : MAINTENANCE_TYPES[0]} className="input">
                    {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Vehicle ID</label>
                  <input name="vehicle_id" type="number" min="1" required defaultValue={editing ? form?.vehicle_id : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Scheduled Date</label>
                  <input name="scheduled_date" type="date" required defaultValue={editing ? form?.scheduled_date : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Cost (₹)</label>
                  <input name="cost" type="number" step="0.01" min="0" required defaultValue={editing ? form?.cost : ''} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                  <select name="status" required defaultValue={editing ? form?.status : 'Open'} className="input">
                    {MAINTENANCE_STATUSES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
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
              <th>ID</th>
              <th>Description</th>
              <th>Type</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Cost</th>
              <th>Status</th>
              <th className="text-right min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r: any) => (
              <tr key={r.id}>
                <td className="font-medium text-slate-400">#{r.id}</td>
                <td className="font-medium text-white">{r.description}</td>
                <td>{r.type || 'General Service'}</td>
                <td>#{r.vehicle_id}</td>
                <td>{r.scheduled_date ? new Date(r.scheduled_date).toLocaleDateString() : '—'}</td>
                <td className="text-amber-400 font-semibold">₹{r.cost?.toFixed(2)}</td>
                <td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                <td className="text-right flex items-center justify-end gap-1">
                  {!isCompleted(r.status) && (
                    <button onClick={() => { if (confirm('Mark this maintenance as completed?')) completeMut.mutate(r.id); }} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-medium mr-1 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </button>
                  )}
                  <button onClick={() => { setForm(r); setEditing(true); }} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!isCompleted(r.status) && (
                    <button onClick={() => { if (confirm('Delete this record?')) deleteMut.mutate(r.id); }} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-500">No maintenance records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
