import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, CreditCard, Activity, Minus, Calendar, Percent, ShieldAlert, BarChart2, ListTodo, Plus, Trash2, CheckSquare, Square, Lock, Crown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { MARKET_INDICATORS, formatKz } from '../constants';
import { User, AssetType, Asset, Task, Transaction } from '../types';
import { db } from '../services/db';

const Dashboard: React.FC<{ user: User; onOpenPremium: () => void }> = ({ user, onOpenPremium }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    setAssets(db.getUserAssets(user.id));
    setTasks(db.getUserTasks(user.id));
    setTxs(db.getUserTransactions(user.id).slice(0, 5));
  }, [user.id]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, db.addTask({ userId: user.id, title: newTask, completed: false })]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    db.toggleTask(id);
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    db.deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Stats
  const totalInvested = assets.reduce((acc, a) => acc + a.investedAmount, 0);
  const totalValue = assets.reduce((acc, a) => acc + (a.quantity * a.currentPriceUnit), 0);
  const profit = totalValue - totalInvested;
  const profitPct = totalInvested > 0 ? ((profit / totalInvested) * 100).toFixed(2) : "0.00";
  
  // Charts Data
  const assetsByType = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + (a.quantity * a.currentPriceUnit);
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.entries(assetsByType).map(([name, value]) => ({ 
    name, value, 
    color: name === AssetType.OT ? '#6384ff' : name === AssetType.STOCK ? '#1e293b' : '#93c5fd' 
  }));
  if (pieData.length === 0) pieData.push({ name: 'Vazio', value: 1, color: '#e2e8f0' });

  const areaData = [
    { name: 'Jan', val: totalValue * 0.85 }, { name: 'Fev', val: totalValue * 0.88 },
    { name: 'Mar', val: totalValue * 0.92 }, { name: 'Abr', val: totalValue * 0.95 },
    { name: 'Mai', val: totalValue * 0.98 }, { name: 'Jun', val: totalValue }
  ];

  const isPremium = user.plan === 'Premium';
  const tickers = [...MARKET_INDICATORS, ...MARKET_INDICATORS];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-slate-500 text-sm mb-1">Patrimônio Total</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{formatKz(totalValue)}</h2>
        </div>
      </div>

      {/* Ticker */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 overflow-hidden relative flex">
         <div className="flex animate-[scroll_30s_linear_infinite] w-max">
           {tickers.map((t, i) => (
             <div key={i} className="flex items-center gap-3 px-6 border-r border-slate-100 min-w-[160px]">
               <span className="text-sm font-medium text-slate-500">{t.name}</span>
               <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">{t.value}</p>
                  <p className={`text-[10px] ${t.isPositive ? 'text-green-500' : 'text-red-500'}`}>{t.change}%</p>
               </div>
             </div>
           ))}
         </div>
         <style>{`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Card Visual */}
         <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden text-white flex flex-col justify-between h-[220px] shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-zblue-500/20 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start">
               <CreditCard className="text-zblue-400"/>
               <span className="text-xs bg-white/10 px-2 py-1 rounded font-mono">**** 9123</span>
            </div>
            <div>
               <p className="text-slate-400 text-sm">{user.name}</p>
               <p className="text-xl font-medium tracking-widest mt-1">BODIVA {user.plan?.toUpperCase()}</p>
            </div>
            <div className="flex gap-4 mt-2">
               <div className="bg-white/10 px-3 py-2 rounded-xl flex-1"><p className="text-[10px] text-slate-400">VAL</p><p className="font-mono">12/28</p></div>
               <div className="bg-white/10 px-3 py-2 rounded-xl flex-1"><p className="text-[10px] text-slate-400">CVC</p><p className="font-mono">•••</p></div>
            </div>
         </div>

         {/* Stats */}
         <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={24}/></div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${Number(profitPct) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{profitPct}%</span>
               </div>
               <div><p className="text-slate-500 text-sm">Lucro Acumulado</p><p className="text-2xl font-bold">{formatKz(profit)}</p></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Activity size={24}/></div>
                  <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">Mensal</span>
               </div>
               <div><p className="text-slate-500 text-sm">Rentabilidade Mês</p><p className="text-2xl font-bold">+1.8%</p></div>
            </div>
         </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-[320px]">
            <h3 className="font-bold text-slate-900 mb-4">Evolução Patrimonial</h3>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={areaData}>
                  <defs>
                     <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6384ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6384ff" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} formatter={(v:number)=>[formatKz(v), 'Valor']}/>
                  <Area type="monotone" dataKey="val" stroke="#6384ff" strokeWidth={3} fill="url(#colorVal)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center relative">
            <h3 className="font-bold text-slate-900 mb-4 w-full text-left">Alocação</h3>
            <div className="w-48 h-48 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none"/>)}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="font-bold text-2xl">{assets.length}</span><span className="text-xs text-slate-500">Ativos</span>
               </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
               {pieData.filter(d => d.name !== 'Vazio').map(d => (
                  <div key={d.name} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>{d.name}</div>
               ))}
            </div>
         </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Transactions */}
         <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Últimas Transações</h3>
            <div className="space-y-3">
               {txs.length === 0 ? <p className="text-slate-400 text-sm">Sem histórico.</p> : txs.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${t.type === 'buy' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                           {t.type === 'buy' ? <TrendingDown size={16}/> : <TrendingUp size={16}/>}
                        </div>
                        <div><p className="font-medium text-sm">{t.assetName}</p><p className="text-xs text-slate-500 capitalize">{t.type}</p></div>
                     </div>
                     <div className="text-right"><p className="font-bold text-sm">{t.type==='buy'?'-':'+'}{formatKz(t.amount)}</p><p className="text-xs text-slate-400">{t.date}</p></div>
                  </div>
               ))}
            </div>
         </div>

         {/* Tasks */}
         <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><ListTodo size={20} className="text-zblue-500"/> Notas</h3>
            <form onSubmit={addTask} className="flex gap-2 mb-4">
               <input value={newTask} onChange={e=>setNewTask(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-zblue-500" placeholder="Nova tarefa..." />
               <button disabled={!newTask} type="submit" className="bg-zblue-600 text-white p-2 rounded-xl disabled:opacity-50"><Plus size={20}/></button>
            </form>
            <div className="space-y-2 overflow-y-auto max-h-[200px] flex-1">
               {tasks.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">Tudo feito!</p> : tasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg group">
                     <button onClick={() => toggleTask(t.id)} className="flex items-center gap-3 text-sm text-left">
                        {t.completed ? <CheckSquare size={18} className="text-green-500"/> : <Square size={18} className="text-slate-400"/>}
                        <span className={t.completed ? 'line-through text-slate-400' : ''}>{t.title}</span>
                     </button>
                     <button onClick={() => deleteTask(t.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;