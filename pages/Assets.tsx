import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, Wallet, AlertTriangle, Lock, BarChart2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { formatKz } from '../constants';
import { Asset, AssetType, User } from '../types';
import { db } from '../services/db';

const Assets: React.FC<{ user: User; onOpenPremium: () => void }> = ({ user, onOpenPremium }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const initialForm = { name: '', typology: '', type: AssetType.OT, investedAmount: 0, interestRate: 0, quantity: 1, currentPriceUnit: 0, purchaseDate: new Date().toISOString().split('T')[0] };
  const [form, setForm] = useState(initialForm);

  const isPremium = user.plan === 'Premium';

  useEffect(() => {
    setAssets(db.getUserAssets(user.id));
  }, [user]);

  const refresh = () => setAssets(db.getUserAssets(user.id));

  // Chart Data
  const chartData = useMemo(() => {
    const agg = assets.reduce((acc: any, a) => {
      const key = a.typology || a.type;
      acc[key] = (acc[key] || 0) + (a.quantity * a.currentPriceUnit);
      return acc;
    }, {});
    return Object.entries(agg).map(([name, value]) => ({ name, value })).sort((a: any, b: any) => b.value - a.value);
  }, [assets]);

  const handleEdit = (a: Asset) => {
    setEditingId(a.id);
    setForm({ ...a } as any);
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      db.deleteAsset(deleteId);
      refresh();
      setDeleteId(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (Number(form.currentPriceUnit) <= 0 || Number(form.quantity) <= 0) {
      setFormError('Preço e Quantidade devem ser maiores que zero.');
      return;
    }

    if (!editingId && !isPremium && assets.length >= 3) {
      onOpenPremium();
      setModalOpen(false);
      return;
    }

    const payload: any = { ...form, userId: user.id, id: editingId || Math.random().toString(36).substr(2, 9) };
    
    if (editingId) db.updateAsset(payload);
    else db.saveAsset(payload);

    refresh();
    setModalOpen(false);
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Meus Ativos</h2>
        <button 
          onClick={() => { setForm(initialForm); setEditingId(null); setModalOpen(true); }}
          className="bg-zblue-600 hover:bg-zblue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-zblue-500/20"
        >
          {(!isPremium && assets.length >= 3) ? <Lock size={18}/> : <Plus size={20}/>} Novo Ativo
        </button>
      </div>

      {assets.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-[300px]">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BarChart2 className="text-zblue-500"/> Distribuição por Tipologia</h3>
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{top:5, right:5, bottom:5, left:5}}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}}/>
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}} formatter={(v:number)=>[formatKz(v), 'Valor']}/>
                 <Bar dataKey="value" fill="#6384ff" radius={[4,4,0,0]} barSize={40} />
                 <Brush dataKey="name" height={30} stroke="#cbd5e1" fill="#f8fafc" />
              </BarChart>
           </ResponsiveContainer>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                  <tr>
                     <th className="p-4">Ativo</th>
                     <th className="p-4">Tipo</th>
                     <th className="p-4 text-right">Investido</th>
                     <th className="p-4 text-right">Atual</th>
                     <th className="p-4 text-center">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {assets.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum ativo.</td></tr>
                  ) : assets.map(a => {
                     const curr = a.quantity * a.currentPriceUnit;
                     const profit = ((curr - a.investedAmount) / a.investedAmount) * 100;
                     return (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="p-4 font-bold text-slate-900">{a.name} <span className={`text-xs ml-2 ${profit >=0 ? 'text-green-600' : 'text-red-600'}`}>{profit > 0 ? '+' : ''}{profit.toFixed(1)}%</span></td>
                           <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">{a.typology || a.type}</span></td>
                           <td className="p-4 text-right font-mono text-slate-600">{formatKz(a.investedAmount)}</td>
                           <td className="p-4 text-right font-mono font-bold text-slate-900">{formatKz(curr)}</td>
                           <td className="p-4 text-center">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => handleEdit(a)} className="p-2 text-slate-400 hover:text-zblue-600"><Edit2 size={16}/></button>
                                 <button onClick={() => setDeleteId(a.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                              </div>
                           </td>
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-fade-in">
              <div className="flex justify-between mb-4">
                 <h3 className="font-bold text-xl">{editingId ? 'Editar' : 'Novo'} Ativo</h3>
                 <button onClick={() => setModalOpen(false)}><X className="text-slate-400"/></button>
              </div>
              {formError && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm flex gap-2"><AlertTriangle size={16}/>{formError}</div>}
              <form onSubmit={handleSave} className="space-y-4">
                 <input placeholder="Código (ex: OT-2025)" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-zblue-500" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Tipologia" className="bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.typology} onChange={e=>setForm({...form, typology: e.target.value})} required />
                    <select className="bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.type} onChange={e=>setForm({...form, type: e.target.value as any})}>
                       {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 ml-1">Preço Unitário</label><input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.currentPriceUnit} onChange={e=>setForm({...form, currentPriceUnit: Number(e.target.value)})} required /></div>
                    <div><label className="text-xs text-slate-500 ml-1">Quantidade</label><input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.quantity} onChange={e=>setForm({...form, quantity: Number(e.target.value)})} required /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 ml-1">Investido Total</label><input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.investedAmount} onChange={e=>setForm({...form, investedAmount: Number(e.target.value)})} required /></div>
                    <div><label className="text-xs text-slate-500 ml-1">Taxa %</label><input type="number" step="0.1" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.interestRate} onChange={e=>setForm({...form, interestRate: Number(e.target.value)})} required /></div>
                 </div>
                 <button type="submit" className="w-full bg-zblue-600 text-white font-bold py-3 rounded-xl hover:bg-zblue-500">Salvar</button>
              </form>
           </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-3xl max-w-sm w-full text-center">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32}/></div>
               <h3 className="font-bold text-xl mb-2">Excluir Ativo?</h3>
               <p className="text-slate-500 text-sm mb-6">Essa ação não pode ser desfeita.</p>
               <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-50 font-bold py-3 rounded-xl text-slate-600">Cancelar</button>
                  <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl">Excluir</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Assets;