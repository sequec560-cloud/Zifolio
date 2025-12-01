import React, { useState, useEffect } from 'react';
import { formatKz } from '../constants';
import { Info, Crown, Calendar, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface SimulatorProps {
  user: User;
}

const Simulator: React.FC<SimulatorProps> = ({ user }) => {
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(16.5);
  const [years, setYears] = useState(3);
  const [projection, setProjection] = useState<any[]>([]);
  const [totalReturns, setTotalReturns] = useState(0);

  useEffect(() => {
    calculateProjection();
  }, [amount, rate, years]);

  const calculateProjection = () => {
    const data = [];
    let currentAmount = amount;
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;

    for (let i = 0; i <= totalMonths; i++) {
      data.push({
        month: i,
        value: Math.round(currentAmount)
      });
      currentAmount = currentAmount * (1 + monthlyRate);
    }
    setProjection(data);
    setTotalReturns(currentAmount - amount);
  };

  const isPremium = user.plan === 'Premium';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Simulador de Investimento</h2>
        <p className="text-gray-400 mt-2">Projete os seus ganhos com base nas taxas atuais da BODIVA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl h-fit">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
             <span className="w-1 h-6 bg-zgold-500 rounded-full"></span>
             Parâmetros
          </h3>

          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                <span>Investimento Inicial</span>
                <span className="text-zgold-500 font-mono">{formatKz(amount)}</span>
              </label>
              <input 
                type="range" 
                min="100000" 
                max="50000000" 
                step="100000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-zblack-800 rounded-lg appearance-none cursor-pointer accent-zgold-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                <span>Taxa Anual (%)</span>
                <span className="text-zgold-500 font-mono">{rate}%</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="0.5"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-zblack-800 rounded-lg appearance-none cursor-pointer accent-zgold-500"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Info size={12} />
                Média atual OTs: 16% - 19%
              </p>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                <span>Prazo (Anos)</span>
                <span className="text-zgold-500 font-mono">{years} Anos</span>
              </label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 5, 10].map(y => (
                  <button
                    key={y}
                    onClick={() => setYears(y)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      years === y 
                        ? 'bg-zgold-500 text-black font-bold' 
                        : 'bg-zblack-950 text-gray-400 hover:text-white border border-zblack-800'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status + Chart + Results */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Account Status Card */}
           <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-zgold-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 z-10">
                <div className={`p-4 rounded-full ${isPremium ? 'bg-zgold-500 text-black' : 'bg-zblack-800 text-gray-400'}`}>
                  <Crown size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Estado da Conta</p>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {isPremium ? 'Membro Premium' : 'Plano Gratuito'}
                    {isPremium && <span className="text-xs bg-zgold-500 text-black px-2 py-0.5 rounded-full font-bold">PRO</span>}
                  </h3>
                  {isPremium && user.planExpiryDate && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> Expira em: {user.planExpiryDate}
                    </p>
                  )}
                  {isPremium && !user.planExpiryDate && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> Expira em: 2025-12-31 (Demo)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="z-10 w-full md:w-auto">
                {!isPremium ? (
                   <button className="w-full md:w-auto bg-zgold-500 hover:bg-zgold-400 text-black font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-zgold-500/20 flex items-center justify-center gap-2">
                     Tornar-se Premium <ArrowRight size={18} />
                   </button>
                ) : (
                  <div className="px-4 py-2 border border-zgold-500/30 bg-zgold-500/10 rounded-xl text-zgold-500 text-sm font-medium text-center">
                     Benefícios Ativos
                  </div>
                )}
              </div>
           </div>

           {/* Chart */}
           <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl">
              <h3 className="font-bold text-white mb-4">Projeção de Crescimento</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projection}>
                    <defs>
                      <linearGradient id="colorSimulator" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f09805" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f09805" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                      formatter={(value: number) => [formatKz(value), "Valor"]}
                      labelFormatter={(label) => `Mês ${label}`}
                    />
                    <XAxis dataKey="month" stroke="#333" tick={{fontSize: 12}} />
                    <YAxis hide domain={['dataMin', 'auto']} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f09805" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSimulator)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Results - Below the chart */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zblack-900 border border-zblack-800 p-5 rounded-3xl hover:border-zgold-500/30 transition-colors">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Total Investido</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{formatKz(amount)}</p>
              </div>
              
              <div className="bg-zblack-900 border border-zblack-800 p-5 rounded-3xl hover:border-zgold-500/30 transition-colors">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Estimativa de Juros</p>
                <p className="text-2xl font-bold text-green-500 mt-1 font-mono tracking-tight">+{formatKz(totalReturns)}</p>
              </div>

              <div className="bg-zblack-900 border border-zblack-800 p-5 rounded-3xl hover:border-zgold-500/30 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-zgold-500/10 rounded-full blur-xl"></div>
                <p className="text-zgold-500 text-xs uppercase tracking-wide font-bold">Valor Final Estimado</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{formatKz(amount + totalReturns)}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;