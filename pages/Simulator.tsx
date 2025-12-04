import React, { useState, useEffect } from 'react';
import { formatKz } from '../constants';
import { Info, Crown, Calendar, ArrowRight, Target, Clock, TrendingUp, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface SimulatorProps {
  user: User;
  onOpenPremium: () => void;
}

type CompoundingFrequency = 12 | 4 | 1; // Monthly, Quarterly, Annually
type CalculationMode = 'growth' | 'goal';

const Simulator: React.FC<SimulatorProps> = ({ user, onOpenPremium }) => {
  // Modes & Configuration
  const [mode, setMode] = useState<CalculationMode>('growth');
  const [frequency, setFrequency] = useState<CompoundingFrequency>(12); // Default Monthly

  // Inputs
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(16.5);
  const [years, setYears] = useState(3);
  const [targetAmount, setTargetAmount] = useState(2000000);

  // Results
  const [projection, setProjection] = useState<any[]>([]);
  const [totalReturns, setTotalReturns] = useState(0);
  const [finalValue, setFinalValue] = useState(0);
  const [timeResult, setTimeResult] = useState<{years: number, months: number} | null>(null);

  const isPremium = user.plan === 'Premium';

  // Constants for dropdowns
  const frequencies = [
    { label: 'Mensal', value: 12 },
    { label: 'Trimestral', value: 4, premium: true },
    { label: 'Anual', value: 1, premium: true },
  ];

  useEffect(() => {
    if (mode === 'growth') {
      calculateGrowth();
    } else {
      calculateTimeNeeded();
    }
  }, [amount, rate, years, frequency, targetAmount, mode]);

  const calculateGrowth = () => {
    const data = [];
    const monthlyRate = rate / 100 / frequency; // Rate per period
    const totalPeriods = years * frequency;
    
    let currentAmount = amount;

    // We still want to plot monthly for the chart to look smooth, 
    // but the compounding happens according to frequency
    for (let m = 0; m <= years * 12; m++) {
      // Calculate value at this month
      // Formula: A = P * (1 + r/n)^(n*t)
      const t = m / 12; // Time in years
      const val = amount * Math.pow((1 + (rate / 100 / frequency)), (frequency * t));
      
      data.push({
        month: m,
        value: Math.round(val)
      });
    }

    const final = amount * Math.pow((1 + (rate / 100 / frequency)), totalPeriods);
    
    setProjection(data);
    setFinalValue(final);
    setTotalReturns(final - amount);
    setTimeResult(null);
  };

  const calculateTimeNeeded = () => {
    if (targetAmount <= amount) {
        setProjection([]);
        setFinalValue(amount);
        setTotalReturns(0);
        setTimeResult({ years: 0, months: 0 });
        return;
    }

    // Formula: t = ln(A/P) / (n * ln(1 + r/n))
    // A = Target, P = Principal, r = annual rate decimal, n = frequency
    const r = rate / 100;
    const n = frequency;
    
    const numerator = Math.log(targetAmount / amount);
    const denominator = n * Math.log(1 + (r / n));
    
    const yearsNeeded = numerator / denominator;
    
    // Convert to Years + Months for display
    const wholeYears = Math.floor(yearsNeeded);
    const remainderMonths = Math.round((yearsNeeded - wholeYears) * 12);
    
    setTimeResult({ years: wholeYears, months: remainderMonths });
    setFinalValue(targetAmount);
    setTotalReturns(targetAmount - amount);

    // Generate Chart Data up to that time
    const data = [];
    const totalMonths = Math.ceil(yearsNeeded * 12);
    
    // Limit chart points for performance if result is crazy high (e.g. 100 years)
    const step = totalMonths > 120 ? Math.ceil(totalMonths / 60) : 1; 

    for (let m = 0; m <= totalMonths; m += step) {
        const t = m / 12;
        const val = amount * Math.pow((1 + (r / n)), (n * t));
        data.push({
            month: m,
            value: Math.round(val)
        });
    }
    // Ensure last point hits exactly
    if (data[data.length-1].month !== totalMonths) {
        data.push({ month: totalMonths, value: targetAmount });
    }

    setProjection(data);
  };

  const handleModeChange = (newMode: CalculationMode) => {
    if (newMode === 'goal' && !isPremium) {
        onOpenPremium();
        return;
    }
    setMode(newMode);
  };

  const handleFrequencyChange = (freq: number, isPremiumFreq: boolean) => {
      if (isPremiumFreq && !isPremium) {
          onOpenPremium();
          return;
      }
      setFrequency(freq as CompoundingFrequency);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Simulador de Investimento</h2>
            <p className="text-slate-500 mt-2">Planeje o seu futuro financeiro com precisão.</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
            <button
                onClick={() => handleModeChange('growth')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    mode === 'growth' 
                    ? 'bg-zblue-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                Simular Rendimento
            </button>
            <button
                onClick={() => handleModeChange('goal')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    mode === 'goal' 
                    ? 'bg-zblue-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                {!isPremium && <Lock size={12} />}
                Simular Meta
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
             <span className="w-1 h-6 bg-zblue-500 rounded-full"></span>
             Configuração
          </h3>

          <div className="space-y-8">
            {/* Amount Input */}
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                <span>Investimento Inicial</span>
                <span className="text-zblue-600 font-mono font-bold">{formatKz(amount)}</span>
              </label>
              <input 
                type="range" 
                min="100000" 
                max="50000000" 
                step="100000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-zblue-500"
              />
            </div>

            {/* Rate Input */}
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                <span>Taxa Anual (%)</span>
                <span className="text-zblue-600 font-mono font-bold">{rate}%</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="0.5"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-zblue-500"
              />
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Info size={12} />
                Média atual OTs: 16% - 19%
              </p>
            </div>

            {/* Compounding Frequency */}
            <div>
                 <label className="block text-sm font-medium text-slate-500 mb-3">Capitalização dos Juros</label>
                 <div className="grid grid-cols-3 gap-2">
                    {frequencies.map((freq) => (
                        <button
                            key={freq.value}
                            onClick={() => handleFrequencyChange(freq.value, !!freq.premium)}
                            className={`py-2 px-1 rounded-lg text-xs font-medium border transition-colors relative ${
                                frequency === freq.value
                                ? 'bg-zblue-50 text-zblue-600 border-zblue-200'
                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-1">
                                {freq.premium && !isPremium && <Lock size={10} />}
                                {freq.label}
                            </span>
                        </button>
                    ))}
                 </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                {mode === 'growth' ? (
                    /* Years Input (Growth Mode) */
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                            <span>Prazo do Investimento</span>
                            <span className="text-zblue-600 font-mono font-bold">{years} Anos</span>
                        </label>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 5, 10].map(y => (
                            <button
                                key={y}
                                onClick={() => setYears(y)}
                                className={`flex-1 py-2 rounded-lg text-sm transition-colors border ${
                                years === y 
                                    ? 'bg-zblue-600 text-white font-bold border-zblue-600' 
                                    : 'bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200'
                                }`}
                            >
                                {y}
                            </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Target Amount Input (Goal Mode) */
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                            <span className="flex items-center gap-2"><Target size={14}/> Objetivo Financeiro</span>
                            <span className="text-zblue-600 font-mono font-bold">{formatKz(targetAmount)}</span>
                        </label>
                         <input 
                            type="range" 
                            min={amount} 
                            max={amount * 10} 
                            step="100000"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-zblue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>Min: {formatKz(amount)}</span>
                            <span>Max: {formatKz(amount * 10)}</span>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Right Column: Status + Chart + Results */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Account Status Card */}
           <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-zblue-50 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 z-10">
                <div className={`p-4 rounded-full ${isPremium ? 'bg-zblue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Crown size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Estado da Conta</p>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {isPremium ? 'Membro Premium' : 'Plano Gratuito'}
                    {isPremium && <span className="text-xs bg-zblue-600 text-white px-2 py-0.5 rounded-full font-bold">PRO</span>}
                  </h3>
                  {isPremium && user.planExpiryDate && (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> Expira em: {user.planExpiryDate}
                    </p>
                  )}
                  {isPremium && !user.planExpiryDate && (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> Expira em: 2025-12-31 (Demo)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="z-10 w-full md:w-auto">
                {!isPremium ? (
                   <button 
                     onClick={onOpenPremium}
                     className="w-full md:w-auto bg-zblue-600 hover:bg-zblue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-zblue-500/20 flex items-center justify-center gap-2"
                   >
                     Tornar-se Premium <ArrowRight size={18} />
                   </button>
                ) : (
                  <div className="px-4 py-2 border border-zblue-200 bg-zblue-50 rounded-xl text-zblue-600 text-sm font-medium text-center">
                     Benefícios Ativos
                  </div>
                )}
              </div>
           </div>

           {/* Chart */}
           <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex justify-between items-center">
                  <span>
                      {mode === 'growth' ? 'Projeção de Crescimento' : 'Trajetória até o Objetivo'}
                  </span>
                  {mode === 'goal' && timeResult && (
                      <span className="text-sm font-normal text-zblue-600 bg-zblue-50 px-3 py-1 rounded-full border border-zblue-100">
                          {timeResult.years} anos e {timeResult.months} meses
                      </span>
                  )}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projection}>
                    <defs>
                      <linearGradient id="colorSimulator" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6384ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6384ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: number) => [formatKz(value), "Valor"]}
                      labelFormatter={(label) => `Mês ${label}`}
                    />
                    <XAxis dataKey="month" stroke="#cbd5e1" tick={{fontSize: 12}} minTickGap={30} />
                    <YAxis hide domain={['dataMin', 'auto']} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6384ff" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSimulator)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Results Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-zblue-200 transition-colors shadow-sm">
                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp size={14}/> Total Investido
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight">{formatKz(amount)}</p>
              </div>
              
              <div className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-zblue-200 transition-colors shadow-sm">
                <p className="text-slate-500 text-xs uppercase tracking-wide flex items-center gap-2">
                    {mode === 'growth' ? <TrendingUp size={14} className="text-green-600"/> : <Clock size={14} className="text-green-600"/>}
                    {mode === 'growth' ? 'Lucro Estimado' : 'Tempo Estimado'}
                </p>
                {mode === 'growth' ? (
                     <p className="text-2xl font-bold text-green-600 mt-1 font-mono tracking-tight">+{formatKz(totalReturns)}</p>
                ) : (
                    <div className="mt-1">
                        <p className="text-2xl font-bold text-green-600 font-mono leading-none">
                            {timeResult ? timeResult.years : 0} <span className="text-sm text-slate-500">anos</span>
                        </p>
                        <p className="text-sm text-slate-400">
                             {timeResult ? timeResult.months : 0} meses
                        </p>
                    </div>
                )}
               
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-zblue-200 transition-colors relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-20 h-20 bg-zblue-500/10 rounded-full blur-xl"></div>
                <p className="text-zblue-600 text-xs uppercase tracking-wide font-bold flex items-center gap-2">
                    <Target size={14}/> {mode === 'growth' ? 'Valor Final' : 'Meta Alvo'}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight">{formatKz(finalValue)}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;