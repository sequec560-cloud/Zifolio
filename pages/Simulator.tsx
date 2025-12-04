import React, { useState, useEffect } from 'react';
import { formatKz } from '../constants';
import { Info, Crown, Target, TrendingUp, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';

const Simulator: React.FC<{ user: User; onOpenPremium: () => void }> = ({ user, onOpenPremium }) => {
  const [mode, setMode] = useState<'growth' | 'goal'>('growth');
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(16.5);
  const [years, setYears] = useState(3);
  const [target, setTarget] = useState(2000000);
  const [result, setResult] = useState<{data: any[], final: number, profit: number, time?: string}>({ data: [], final: 0, profit: 0 });

  const isPremium = user.plan === 'Premium';

  useEffect(() => {
    if (mode === 'growth') {
      const data = [];
      let val = amount;
      for (let m = 0; m <= years * 12; m++) {
        val = amount * Math.pow((1 + (rate / 100 / 12)), m);
        data.push({ m, val: Math.round(val) });
      }
      setResult({ data, final: val, profit: val - amount });
    } else {
      // Goal logic
      if (target <= amount) { setResult({ data: [], final: amount, profit: 0, time: '0 meses' }); return; }
      const r = rate / 100 / 12;
      const months = Math.log(target / amount) / Math.log(1 + r);
      const data = [];
      for (let m = 0; m <= months; m+=Math.max(1, Math.round(months/50))) {
        data.push({ m, val: Math.round(amount * Math.pow((1 + r), m)) });
      }
      data.push({ m: Math.ceil(months), val: target });
      setResult({ data, final: target, profit: target - amount, time: `${Math.floor(months/12)}a ${Math.round(months%12)}m` });
    }
  }, [amount, rate, years, target, mode]);

  const switchMode = (m: 'growth' | 'goal') => {
    if (m === 'goal' && !isPremium) onOpenPremium();
    else setMode(m);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div><h2 className="text-3xl font-bold text-slate-900">Simulador</h2><p className="text-slate-500">Projete seus ganhos.</p></div>
        <div className="bg-white border border-slate-200 p-1 rounded-xl flex">
           <button onClick={() => switchMode('growth')} className={`px-4 py-2 rounded-lg text-sm font-bold ${mode==='growth' ? 'bg-zblue-600 text-white' : 'text-slate-500'}`}>Rendimento</button>
           <button onClick={() => switchMode('goal')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 ${mode==='goal' ? 'bg-zblue-600 text-white' : 'text-slate-500'}`}>{!isPremium && <Lock size={12}/>} Meta</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm space-y-6">
           <div>
              <label className="flex justify-between text-sm font-bold text-slate-500 mb-2"><span>Investimento</span><span className="text-zblue-600 font-mono">{formatKz(amount)}</span></label>
              <input type="range" min="100000" max="50000000" step="100000" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="w-full accent-zblue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"/>
           </div>
           <div>
              <label className="flex justify-between text-sm font-bold text-slate-500 mb-2"><span>Taxa Anual</span><span className="text-zblue-600 font-mono">{rate}%</span></label>
              <input type="range" min="5" max="30" step="0.5" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full accent-zblue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"/>
           </div>
           {mode === 'growth' ? (
              <div>
                 <label className="text-sm font-bold text-slate-500 mb-2 block">Prazo ({years} anos)</label>
                 <div className="flex gap-2">{[1,3,5,10].map(y=><button key={y} onClick={()=>setYears(y)} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${years===y ? 'bg-zblue-600 text-white border-zblue-600':'bg-slate-50 text-slate-500 border-slate-200'}`}>{y}A</button>)}</div>
              </div>
           ) : (
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-500 mb-2"><span>Objetivo</span><span className="text-zblue-600 font-mono">{formatKz(target)}</span></label>
                <input type="range" min={amount} max={amount*10} step="100000" value={target} onChange={e=>setTarget(Number(e.target.value))} className="w-full accent-zblue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"/>
              </div>
           )}
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-[300px]">
              <h3 className="font-bold text-slate-900 mb-4">{mode === 'growth' ? 'Crescimento Projetado' : `Tempo: ${result.time}`}</h3>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={result.data}>
                    <defs><linearGradient id="simColor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6384ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#6384ff" stopOpacity={0}/></linearGradient></defs>
                    <Tooltip contentStyle={{borderRadius:'12px'}} formatter={(v:number)=>[formatKz(v), 'Valor']}/>
                    <Area type="monotone" dataKey="val" stroke="#6384ff" strokeWidth={3} fill="url(#simColor)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl"><p className="text-xs text-slate-500 uppercase font-bold flex gap-2"><TrendingUp size={14}/> Investido</p><p className="text-xl font-bold font-mono mt-1">{formatKz(amount)}</p></div>
              <div className="bg-white border border-slate-200 p-5 rounded-3xl"><p className="text-xs text-slate-500 uppercase font-bold text-green-600 flex gap-2"><Crown size={14}/> Lucro</p><p className="text-xl font-bold font-mono mt-1 text-green-600">+{formatKz(result.profit)}</p></div>
              <div className="bg-white border border-slate-200 p-5 rounded-3xl border-l-4 border-l-zblue-500"><p className="text-xs text-slate-500 uppercase font-bold flex gap-2"><Target size={14}/> Total Final</p><p className="text-xl font-bold font-mono mt-1">{formatKz(result.final)}</p></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;