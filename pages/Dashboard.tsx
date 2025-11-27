import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  ArrowUpRight,
  PieChart as PieIcon,
  Activity,
  Minus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_ASSETS, MOCK_TRANSACTIONS, MARKET_INDICATORS, formatKz } from '../constants';

const Dashboard: React.FC = () => {
  // Aggregate calculations
  const totalInvested = MOCK_ASSETS.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const currentTotalValue = MOCK_ASSETS.reduce((acc, curr) => acc + (curr.quantity * curr.currentPriceUnit), 0);
  const totalProfit = currentTotalValue - totalInvested;
  const profitPercentage = ((totalProfit / totalInvested) * 100).toFixed(2);
  const monthlyYield = 1.8; // Hardcoded for MVP visualization

  // Chart Data Preparation
  const evolutionData = [
    { month: 'Jan', value: 1000000 },
    { month: 'Fev', value: 1200000 },
    { month: 'Mar', value: 1150000 },
    { month: 'Abr', value: 1800000 },
    { month: 'Mai', value: 2100000 },
    { month: 'Jun', value: 2400000 },
    { month: 'Jul', value: 2824500 },
  ];

  const distributionData = [
    { name: 'Obrigações', value: 60, color: '#f09805' },
    { name: 'Ações', value: 25, color: '#e5e5e5' },
    { name: 'Liquidez', value: 15, color: '#333333' },
  ];

  // Ticker Data (Tripled for smooth infinite scroll)
  const tickerItems = [...MARKET_INDICATORS, ...MARKET_INDICATORS, ...MARKET_INDICATORS];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Styles for Marquee */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">Patrimônio Total</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {formatKz(currentTotalValue)}
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="bg-zgold-500 hover:bg-zgold-400 text-black px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-zgold-500/20">
            <ArrowUpRight size={18} />
            Transferir
          </button>
        </div>
      </div>

      {/* Market Ticker */}
      <div className="relative w-full overflow-hidden bg-zblack-900/50 border border-zblack-800 rounded-xl p-2 backdrop-blur-sm group">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zblack-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zblack-950 to-transparent z-10 pointer-events-none" />
        
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-3 border-r border-zblack-800 mr-2 z-20 bg-zblack-900/50 backdrop-blur-md h-full absolute left-0 md:relative">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-white whitespace-nowrap hidden md:block">AO VIVO</span>
          </div>

          <div className="flex animate-scroll w-max ml-8 md:ml-0">
            {tickerItems.map((indicator, idx) => {
              const isNegative = !indicator.isPositive;
              const isNeutral = indicator.change === 0;
              const uniqueKey = `dash-ticker-${indicator.name}-${idx}`;

              return (
                <div key={uniqueKey} className="flex items-center gap-3 px-6 border-r border-zblack-800/50 min-w-[160px]">
                  <span className="text-sm text-gray-400 font-medium">{indicator.name}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-white font-mono">{indicator.value}</span>
                    <span className={`text-[10px] flex items-center ${
                      isNeutral ? 'text-gray-500' : isNegative ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {isNeutral ? <Minus size={10} className="mr-1" /> : isNegative ? <TrendingDown size={10} className="mr-1" /> : <TrendingUp size={10} className="mr-1" />}
                      {Math.abs(indicator.change).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Featured Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-zblack-800 to-zblack-900 border border-zblack-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-zgold-500/20 rounded-full blur-3xl group-hover:bg-zgold-500/30 transition-all duration-500"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
            <div className="flex justify-between items-start">
              <CreditCard className="text-zgold-500" size={32} />
              <span className="bg-zblack-950/50 px-3 py-1 rounded-full text-xs font-mono text-gray-300 border border-zblack-800">
                **** 9154
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Methew White</p>
              <p className="text-xl text-white font-medium mt-1 tracking-widest">BODIVA INVESTOR</p>
            </div>
            <div className="flex gap-4 mt-4">
               <div className="flex-1 bg-zblack-950/50 p-3 rounded-xl backdrop-blur-sm">
                 <p className="text-xs text-gray-500">Validade</p>
                 <p className="text-white font-mono">12/28</p>
               </div>
               <div className="flex-1 bg-zblack-950/50 p-3 rounded-xl backdrop-blur-sm">
                 <p className="text-xs text-gray-500">CVV</p>
                 <p className="text-white font-mono">•••</p>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rentabilidade Total */}
          <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl flex flex-col justify-between hover:border-zgold-500/30 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 bg-zblack-950 rounded-xl text-zgold-500">
                <TrendingUp size={24} />
              </div>
              <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium">
                +{profitPercentage}%
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Lucro Acumulado</p>
              <p className="text-2xl font-bold text-white mt-1">{formatKz(totalProfit)}</p>
            </div>
          </div>

          {/* Monthly Yield */}
          <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl flex flex-col justify-between hover:border-zgold-500/30 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 bg-zblack-950 rounded-xl text-blue-400">
                <Activity size={24} />
              </div>
              <span className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-medium">
                Este mês
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rentabilidade Mensal</p>
              <p className="text-2xl font-bold text-white mt-1">+{monthlyYield}%</p>
            </div>
          </div>

          {/* Mini Chart Card (Simplified) */}
          <div className="bg-zgold-500 p-6 rounded-3xl col-span-1 sm:col-span-2 text-black relative overflow-hidden group cursor-pointer shadow-lg shadow-zgold-500/20">
             <div className="relative z-10 flex justify-between items-center">
               <div>
                  <p className="font-semibold opacity-80">Próximo Pagamento Juros</p>
                  <h3 className="text-3xl font-bold mt-1">OT-2026</h3>
                  <p className="mt-2 font-medium">15 de Novembro, 2024</p>
               </div>
               <div className="bg-black/10 p-4 rounded-full group-hover:bg-black/20 transition-colors">
                 <TrendingUp size={32} />
               </div>
             </div>
             {/* Decorative circles */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zblack-900 border border-zblack-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Evolução da Carteira</h3>
            <select className="bg-zblack-950 text-gray-400 border border-zblack-800 rounded-lg text-sm px-3 py-1 outline-none focus:border-zgold-500">
              <option>Últimos 6 meses</option>
              <option>1 Ano</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f09805" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f09805" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '12px' }}
                  itemStyle={{ color: '#f09805' }}
                />
                <XAxis dataKey="month" stroke="#333" />
                <YAxis hide />
                <Area type="monotone" dataKey="value" stroke="#f09805" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl flex flex-col">
           <h3 className="text-lg font-bold text-white mb-6">Distribuição</h3>
           <div className="flex-1 min-h-[200px] relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={distributionData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {distributionData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-white">3</span>
                <span className="text-xs text-gray-500">Tipos</span>
             </div>
           </div>
           <div className="mt-4 space-y-3">
             {distributionData.map((item) => (
               <div key={item.name} className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                   <span className="text-gray-300">{item.name}</span>
                 </div>
                 <span className="font-bold text-white">{item.value}%</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Movimentos Recentes</h3>
          <button className="text-zgold-500 text-sm hover:underline">Ver todos</button>
        </div>
        <div className="space-y-4">
          {MOCK_TRANSACTIONS.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-3 hover:bg-zblack-950 rounded-xl transition-colors cursor-pointer group/item">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${t.type === 'buy' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                  {t.type === 'buy' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                </div>
                <div>
                  <p className="font-medium text-white group-hover/item:text-zgold-500 transition-colors">{t.assetName}</p>
                  <p className="text-xs text-gray-500 capitalize">{t.type === 'interest' ? 'Pagamento de Juros' : t.type === 'buy' ? 'Compra' : 'Venda'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${t.type === 'buy' ? 'text-white' : 'text-green-500'}`}>
                  {t.type === 'buy' ? '-' : '+'}{formatKz(t.amount)}
                </p>
                <p className="text-xs text-gray-500">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;