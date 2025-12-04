import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  ArrowUpRight,
  PieChart as PieIcon,
  Activity,
  Minus,
  Calendar,
  Percent,
  ShieldAlert,
  BarChart2,
  ListTodo,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Lock,
  Crown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { MARKET_INDICATORS, formatKz } from '../constants';
import { User, AssetType, Asset, Task, Transaction } from '../types';
import { db } from '../services/db';

interface DashboardProps {
  user: User;
  onOpenPremium: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onOpenPremium }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load assets for the current user
    const userAssets = db.getUserAssets(user.id);
    setAssets(userAssets);
    
    // Load tasks for current user
    const userTasks = db.getUserTasks(user.id);
    setTasks(userTasks);

    // Load transactions
    const txs = db.getUserTransactions(user.id);
    setRecentTransactions(txs.slice(0, 5)); // Take top 5 recent

    setLoading(false);
  }, [user.id]);

  // Task Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = db.addTask({
      userId: user.id,
      title: newTaskTitle,
      completed: false
    });

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (taskId: string) => {
    db.toggleTask(taskId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    db.deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Aggregate calculations based on REAL data
  const totalInvested = assets.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const currentTotalValue = assets.reduce((acc, curr) => acc + (curr.quantity * curr.currentPriceUnit), 0);
  const totalProfit = currentTotalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : "0.00";
  const monthlyYield = 1.8; // Hardcoded for MVP visualization (mock)

  // New Performance Metrics Calculations
  
  // 1. Average Annual Return (Weighted by investment amount)
  const weightedInterestRate = totalInvested > 0 ? assets.reduce((acc, asset) => {
    return acc + (asset.investedAmount * (asset.interestRate || 0));
  }, 0) / totalInvested : 0;

  // 2. Risk Score Calculation
  const getRiskWeight = (type: AssetType) => {
    switch (type) {
      case AssetType.OT:
      case AssetType.BT:
        return 1;
      case AssetType.CORP:
        return 3;
      case AssetType.STOCK:
        return 5;
      default:
        return 2;
    }
  };

  const riskScore = totalInvested > 0 ? assets.reduce((acc, asset) => {
    return acc + (asset.investedAmount * getRiskWeight(asset.type));
  }, 0) / totalInvested : 0;

  let riskLabel = 'N/A';
  let riskColor = 'text-slate-500';

  if (totalInvested > 0) {
    if (riskScore <= 1.5) {
        riskLabel = 'Conservador';
        riskColor = 'text-green-600';
    } else if (riskScore > 1.5 && riskScore <= 3.5) {
        riskLabel = 'Moderado';
        riskColor = 'text-yellow-600';
    } else {
        riskLabel = 'Agressivo';
        riskColor = 'text-red-600';
    }
  }

  // 3. YTD Return (Simulated for this context)
  const ytdReturn = (Number(profitPercentage) * 0.85).toFixed(2);
  const ytdChartData = [
    { name: 'Jan', val: 10 }, { name: 'Fev', val: 25 }, { name: 'Mar', val: 18 },
    { name: 'Abr', val: 30 }, { name: 'Mai', val: 45 }, { name: 'Jun', val: 35 },
    { name: 'Jul', val: 55 }, { name: 'Ago', val: 50 }, { name: 'Set', val: 70 },
    { name: 'Out', val: 85 }
  ];


  // Chart Data Preparation (Static Mock for Evolution as we don't store historical data yet)
  const evolutionData = [
    { month: 'Jan', value: Number(currentTotalValue) * 0.8 },
    { month: 'Fev', value: Number(currentTotalValue) * 0.85 },
    { month: 'Mar', value: Number(currentTotalValue) * 0.88 },
    { month: 'Abr', value: Number(currentTotalValue) * 0.92 },
    { month: 'Mai', value: Number(currentTotalValue) * 0.95 },
    { month: 'Jun', value: Number(currentTotalValue) * 0.98 },
    { month: 'Jul', value: Number(currentTotalValue) },
  ];

  // Distribution Data
  // Dynamic Pie Chart Data
  const assetsByTypeRaw = assets.reduce((acc, asset) => {
    const value = asset.quantity * asset.currentPriceUnit;
    const existing = acc[asset.type] || 0;
    acc[asset.type] = Number(existing) + Number(value);
    return acc;
  }, {} as Record<string, number>);

  const distributionColors: Record<string, string> = {
     [AssetType.OT]: '#6384ff',
     [AssetType.BT]: '#93c5fd',
     [AssetType.CORP]: '#cbd5e1',
     [AssetType.STOCK]: '#1e293b'
  };

  const distributionData = Object.entries(assetsByTypeRaw).map(([type, value]) => ({
    name: type === AssetType.OT ? 'OTs' : type === AssetType.BT ? 'BTs' : type === AssetType.CORP ? 'Corp' : 'Ações',
    value: parseFloat(((value as number / currentTotalValue) * 100).toFixed(1)),
    color: distributionColors[type] || '#888'
  }));
  
  // If no assets, show empty placeholder in chart
  if (distributionData.length === 0) {
      distributionData.push({ name: 'Sem dados', value: 100, color: '#e2e8f0' });
  }

  // Bar Chart Data (Detailed Breakdown)
  const shortNameMap: Record<string, string> = {
    [AssetType.OT]: 'OTs',
    [AssetType.BT]: 'BTs',
    [AssetType.CORP]: 'Corp',
    [AssetType.STOCK]: 'Ações',
  };

  const assetTypeData = Object.entries(assetsByTypeRaw).map(([type, value]) => ({
    name: shortNameMap[type] || type,
    fullName: type,
    value: value as number
  })).sort((a, b) => b.value - a.value);


  // Ticker Data (Tripled for smooth infinite scroll)
  const tickerItems = [...MARKET_INDICATORS, ...MARKET_INDICATORS, ...MARKET_INDICATORS];

  const isPremium = user.plan === 'Premium';

  if (loading) {
      return <div className="p-10 text-center text-slate-500 animate-pulse">Carregando dados da carteira...</div>;
  }

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
          <p className="text-slate-500 text-sm mb-1">Patrimônio Total</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            {formatKz(currentTotalValue)}
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="bg-zblue-600 hover:bg-zblue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-zblue-500/20">
            <ArrowUpRight size={18} />
            Transferir
          </button>
        </div>
      </div>

      {/* Market Ticker */}
      <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-xl p-2 shadow-sm group">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100 mr-2 z-20 bg-white h-full absolute left-0 md:relative">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap hidden md:block">AO VIVO</span>
          </div>

          <div className="flex animate-scroll w-max ml-8 md:ml-0">
            {tickerItems.map((indicator, idx) => {
              const isNegative = !indicator.isPositive;
              const isNeutral = indicator.change === 0;
              const uniqueKey = `dash-ticker-${indicator.name}-${idx}`;

              return (
                <div key={uniqueKey} className="flex items-center gap-3 px-6 border-r border-slate-100 min-w-[160px]">
                  <span className="text-sm text-slate-500 font-medium">{indicator.name}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 font-mono">{indicator.value}</span>
                    <span className={`text-[10px] flex items-center ${
                      isNeutral ? 'text-slate-400' : isNegative ? 'text-red-500' : 'text-green-500'
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
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-zblue-500/20 rounded-full blur-3xl group-hover:bg-zblue-500/30 transition-all duration-500"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
            <div className="flex justify-between items-start">
              <CreditCard className="text-zblue-400" size={32} />
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-gray-300 border border-white/10">
                **** 9154
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">{user.name}</p>
              <p className="text-xl text-white font-medium mt-1 tracking-widest uppercase">BODIVA {user.plan || 'INVESTOR'}</p>
            </div>
            <div className="flex gap-4 mt-4">
               <div className="flex-1 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                 <p className="text-xs text-gray-400">Validade</p>
                 <p className="text-white font-mono">12/28</p>
               </div>
               <div className="flex-1 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                 <p className="text-xs text-gray-400">CVV</p>
                 <p className="text-white font-mono">•••</p>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rentabilidade Total */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between hover:border-zblue-200 transition-colors shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <TrendingUp size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${Number(profitPercentage) >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {Number(profitPercentage) >= 0 ? '+' : ''}{profitPercentage}%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Lucro Acumulado</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatKz(totalProfit)}</p>
            </div>
          </div>

          {/* Monthly Yield */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between hover:border-zblue-200 transition-colors shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                <Activity size={24} />
              </div>
              <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium">
                Este mês
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Rentabilidade Mensal</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">+{monthlyYield}%</p>
            </div>
          </div>

          {/* Mini Chart Card (Simplified) */}
          <div className="bg-zblue-600 p-6 rounded-3xl col-span-1 sm:col-span-2 text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-zblue-500/20">
             <div className="relative z-10 flex justify-between items-center">
               <div>
                  <p className="font-semibold opacity-90 text-blue-100">Próximo Pagamento Juros</p>
                  <h3 className="text-3xl font-bold mt-1">OT-2026</h3>
                  <p className="mt-2 font-medium text-blue-50">15 de Novembro, 2024</p>
               </div>
               <div className="bg-white/20 p-4 rounded-full group-hover:bg-white/30 transition-colors">
                 <TrendingUp size={32} />
               </div>
             </div>
             {/* Decorative circles */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* YTD Return with Mini Chart */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between hover:border-zblue-200 transition-colors relative overflow-hidden h-[130px] shadow-sm">
          <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Calendar size={18} />
               </div>
               <div>
                  <p className="text-slate-500 text-xs">Retorno YTD</p>
                  <div className={`mt-0.5 ${!isPremium ? 'blur-sm select-none' : ''}`}>
                    <p className="text-xl font-bold text-slate-900">+{ytdReturn}%</p>
                  </div>
               </div>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full z-20">Desde Jan</span>
          </div>
          
          {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center z-20" onClick={onOpenPremium}>
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-zblue-500 hover:text-white transition-colors border border-slate-200 shadow-sm">
                  <Lock size={16} className="text-slate-400 hover:text-white" />
                </div>
             </div>
          )}
          
          <div className={`absolute bottom-0 right-0 left-0 h-14 px-4 pb-2 opacity-50 ${!isPremium ? 'opacity-20 blur-sm' : ''}`}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={ytdChartData}>
                 <Bar dataKey="val" fill="#c084fc" radius={[2, 2, 0, 0]} barSize={6} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Annual Return */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between hover:border-zblue-200 transition-colors h-[130px] relative shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zblue-50 rounded-xl text-zblue-600">
              <Percent size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Média Anual</p>
              <div className={`${!isPremium ? 'blur-sm select-none' : ''}`}>
                 <p className="text-xl font-bold text-slate-900 mt-0.5">{weightedInterestRate.toFixed(2)}%</p>
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-400">Ponderada</span>

          {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center z-20 bg-transparent" onClick={onOpenPremium}>
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-zblue-500 hover:text-white transition-colors border border-slate-200 shadow-sm">
                  <Lock size={16} className="text-slate-400 hover:text-white" />
                </div>
             </div>
          )}
        </div>

        {/* Risk Score */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between hover:border-zblue-200 transition-colors h-[130px] relative shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-500">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Risco da Carteira</p>
              <div className={`${!isPremium ? 'blur-sm select-none' : ''}`}>
                 <p className={`text-xl font-bold mt-0.5 ${riskColor}`}>{riskLabel}</p>
              </div>
            </div>
          </div>
          <div className={`${!isPremium ? 'blur-sm select-none' : ''}`}>
             <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{riskScore.toFixed(1)}/5.0</span>
          </div>

          {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center z-20 bg-transparent" onClick={onOpenPremium}>
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-zblue-500 hover:text-white transition-colors border border-slate-200 shadow-sm">
                  <Lock size={16} className="text-slate-400 hover:text-white" />
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Evolução da Carteira (Simulado)</h3>
            <select className="bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-sm px-3 py-1 outline-none focus:border-zblue-500">
              <option>Últimos 6 meses</option>
              <option>1 Ano</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6384ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6384ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#6384ff' }}
                  labelStyle={{ color: '#64748b' }}
                  formatter={(value: number) => [formatKz(value), "Patrimônio"]}
                />
                <XAxis dataKey="month" stroke="#cbd5e1" />
                <YAxis hide />
                <Area type="monotone" dataKey="value" stroke="#6384ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Distribuição</h3>
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
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#6384ff' }}
                    formatter={(value: number) => [value + '%', "Valor"]}
                 />
               </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-slate-900">{distributionData.length}</span>
                <span className="text-xs text-slate-500">Tipos</span>
             </div>
           </div>
           <div className="mt-4 space-y-3">
             {distributionData.map((item) => (
               <div key={item.name} className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                   <span className="text-slate-600">{item.name}</span>
                 </div>
                 <span className="font-bold text-slate-900">{item.value}%</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Grid for Recent Transactions & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl h-full shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Movimentos Recentes</h3>
            <button className="text-zblue-600 text-sm hover:underline">Ver todos</button>
          </div>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
               <div className="text-slate-500 text-sm text-center py-4">Nenhuma transação recente.</div>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group/item">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${t.type === 'buy' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {t.type === 'buy' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 group-hover/item:text-zblue-600 transition-colors">{t.assetName}</p>
                      <p className="text-xs text-slate-500 capitalize">{t.type === 'interest' ? 'Pagamento de Juros' : t.type === 'buy' ? 'Compra' : 'Venda'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'buy' ? 'text-slate-900' : 'text-green-600'}`}>
                      {t.type === 'buy' ? '-' : '+'}{formatKz(t.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{t.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Investment Tasks Widget */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl h-full flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ListTodo size={20} className="text-zblue-500"/>
              Notas & Tarefas
            </h3>
          </div>
          
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ex: Verificar taxas LUIBOR..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-zblue-500 text-sm placeholder-slate-400"
            />
            <button 
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-zblue-600 hover:bg-zblue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
            {tasks.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8 border border-dashed border-slate-200 rounded-xl">
                Nenhuma tarefa pendente.
              </div>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed 
                    ? 'bg-slate-50 border-transparent opacity-60' 
                    : 'bg-white border-slate-200 hover:border-zblue-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <button 
                      onClick={() => handleToggleTask(task.id)}
                      className={`flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <span className={`text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {task.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart Breakdown */}
      {assets.length > 0 && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 size={20} className="text-zblue-500" />
              Composição Detalhada
            </h3>
            {!isPremium && <Crown size={18} className="text-zblue-500 animate-pulse" />}
          </div>
          
          <div className={`h-[250px] w-full transition-all duration-300 ${!isPremium ? 'blur-sm opacity-30 select-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetTypeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                  itemStyle={{ color: '#6384ff' }}
                  formatter={(value: any) => [formatKz(Number(value)), "Valor Atual"]}
                  labelStyle={{ color: '#64748b' }}
                />
                <XAxis 
                  dataKey="name" 
                  stroke="#cbd5e1" 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis hide />
                <Bar 
                  dataKey="value" 
                  fill="#6384ff" 
                  radius={[6, 6, 0, 0]} 
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className={`mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 ${!isPremium ? 'blur-sm opacity-30 select-none' : ''}`}>
            {assetTypeData.map((item, index) => (
               <div key={index} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">{item.fullName}</p>
                  <p className="font-mono font-bold text-slate-900 text-sm">{formatKz(item.value)}</p>
               </div>
            ))}
          </div>

          {!isPremium && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/60 backdrop-blur-[1px]">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-xl max-w-xs">
                   <Crown size={32} className="text-zblue-500 mx-auto mb-3" />
                   <h4 className="font-bold text-slate-900 mb-1">Visualização Premium</h4>
                   <p className="text-sm text-slate-500 mb-4">Atualize para ver a análise detalhada da sua carteira.</p>
                   <button 
                     onClick={onOpenPremium}
                     className="bg-zblue-600 text-white font-bold py-2 px-6 rounded-lg text-sm hover:bg-zblue-500 transition-colors"
                   >
                     Desbloquear Agora
                   </button>
                </div>
             </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Dashboard;