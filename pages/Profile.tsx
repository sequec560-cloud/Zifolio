import React, { useState } from 'react';
import { User, Shield, Bell, CreditCard, Save, CheckCircle, Crown, Lock } from 'lucide-react';
import { User as UserType } from '../types';

const Profile: React.FC<{ user: UserType; onUpdateUser: (u: UserType) => void; onOpenPremium: () => void }> = ({ user, onUpdateUser, onOpenPremium }) => {
  const [form, setForm] = useState(user);
  const [saved, setSaved] = useState(false);
  const isPremium = user.plan === 'Premium';

  const handleSave = () => {
    onUpdateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900">Meu Perfil</h2>
      
      <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center gap-6 relative overflow-hidden">
         <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-zblue-500 flex items-center justify-center text-4xl font-bold text-slate-300 overflow-hidden relative">
            {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover"/> : user.name.charAt(0)}
            {isPremium && <div className="absolute top-0 right-0 bg-zblue-500 p-1 rounded-bl-xl"><Crown size={12} className="text-white"/></div>}
         </div>
         <div>
            <h3 className="text-2xl font-bold">{user.name}</h3>
            <p className="text-slate-500">{user.email}</p>
            <div className="flex gap-2 mt-2">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPremium ? 'bg-zblue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{user.plan || 'Free'}</span>
            </div>
         </div>
         {!isPremium && <button onClick={onOpenPremium} className="absolute right-8 top-8 bg-zblue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-zblue-500/20 hover:scale-105 transition-transform">Upgrade</button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="space-y-6">
            <h3 className="font-bold text-xl">Dados Pessoais</h3>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
               <div><label className="text-xs text-slate-500 ml-1">Nome</label><input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.name} onChange={e=>setForm({...form, name: e.target.value})}/></div>
               <div><label className="text-xs text-slate-500 ml-1">Email</label><input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.email} disabled/></div>
               <div><label className="text-xs text-slate-500 ml-1">Telefone</label><input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})}/></div>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="font-bold text-xl">Preferências</h3>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3"><Bell className="text-slate-400"/><span className="font-medium">Notificações</span></div>
                  <input type="checkbox" checked={form.notificationSettings?.enabled} onChange={e=>setForm({...form, notificationSettings: {...form.notificationSettings!, enabled: e.target.checked}})} className="accent-zblue-600 w-5 h-5"/>
               </div>
               
               <div className={`p-4 border rounded-xl relative ${!isPremium ? 'border-slate-100 opacity-60' : 'border-zblue-100 bg-zblue-50/50'}`}>
                  {!isPremium && <div onClick={onOpenPremium} className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-white/50 backdrop-blur-[1px] font-bold text-zblue-600 gap-2"><Lock size={16}/> Premium</div>}
                  <div className="mb-2 flex justify-between"><span className="text-sm font-bold text-red-500">Queda ({form.notificationSettings?.dropThreshold}%)</span></div>
                  <input type="range" min="1" max="50" value={form.notificationSettings?.dropThreshold} onChange={e=>setForm({...form, notificationSettings: {...form.notificationSettings!, dropThreshold: Number(e.target.value)}})} className="w-full accent-red-500 h-1 bg-slate-200 rounded-lg appearance-none"/>
               </div>

               <button onClick={handleSave} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zblue-600 transition-colors">
                  {saved ? <CheckCircle size={20}/> : <Save size={20}/>} {saved ? 'Salvo!' : 'Salvar Alterações'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Profile;