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
import { MOCK_TRANSACTIONS, MARKET_INDICATORS, formatKz } from '../constants';
import { User, AssetType, Asset, Task } from '../types';
import { db } from '../services/db';

interface DashboardProps {
  user: User;
  onOpenPremium: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onOpenPremium }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load assets for the current user
    const userAssets = db.getUserAssets(user.id);
    setAssets(userAssets);
    
    // Load tasks for current user
    const userTasks = db.getUserTasks(user.id);
    setTasks(userTasks);

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
  let riskColor = 'text-gray-500';

  if (totalInvested > 0) {
    if (riskScore <= 1.5) {
        riskLabel = 'Conservador';
        riskColor = 'text-green-500';
    } else if (riskScore > 1.5 && riskScore <= 3.5) {
        riskLabel = 'Moderado';
        riskColor = 'text-yellow-500';
    } else {
        riskLabel = 'Agressivo';
        riskColor = 'text-red-500';
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
     [AssetType.OT]: '#f09805',
     [AssetType.BT]: '#d27803',
     [AssetType.CORP]: '#e5e5e5',
     [AssetType.STOCK]: '#333333'
  };

  const distributionData = Object.entries(assetsByTypeRaw).map(([type, value]) => ({
    name: type === AssetType.OT ? 'OTs' : type === AssetType.BT ? 'BTs' : type === AssetType.CORP ? 'Corp' : 'Ações',
    value: parseFloat(((value as number / currentTotalValue) * 100).toFixed(1)),
    color: distributionColors[type] || '#888'
  }));
  
  // If no assets, show empty placeholder in chart
  if (distributionData.length === 0) {
      distributionData.push({ name: 'Sem dados', value: 100, color: '#1f1f1f' });
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
      return <div className="p-10 text-center text-gray-500 animate-pulse">Carregando dados da carteira...</div>;
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
              <p className="text-gray-400 text-sm">{user.name}</p>
              <p className="text-xl text-white font-medium mt-1 tracking-widest uppercase">BODIVA {user.plan || 'INVESTOR'}</p>
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${Number(profitPercentage) >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                {Number(profitPercentage) >= 0 ? '+' : ''}{profitPercentage}%
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

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* YTD Return with Mini Chart */}
        <div className="bg-zblack-900 border border-zblack-800 p-5 rounded-3xl flex flex-col justify-between hover:border-zgold-500/30 transition-colors relative overflow-hidden h-[130px]">
          <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-zblack-950 rounded-lg text-purple-400">
                  <Calendar size={18} />
               </div>
               <div>
                  <p className="text-gray-400 text-xs">Retorno YTD</p>
                  <div className={`mt-0.5 ${!isPremium ? 'blur-sm select-none' : ''}`}>
                    <p className="text-xl font-bold text-white">+{ytdReturn}%</p>
                  </div>
               </div>
            </div>
            <span className="text-[10px] text-gray-500 bg-zblack-950 px-2 py-1 rounded-full z-20">Desde Jan</span>
          </div>
          
          {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center z-20" onClick={onOpenPremium}>
                <div className="bg-zblack-950/80 p-2 rounded-full cursor-pointer hover:bg-zgold-500 hover:text-black transition-colors">
                  <Lock size={16} className="text-gray-400" />
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
        <div className="bg-zblack-900 border border-zblack-800 p-5 rounded-3xl flex items-center justify-between hover:border-zgold-500/30 transition-colors h-[130px] relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zblack-950 rounded-xl text-zgold-500">
              <Percent size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Média Anual</p>
              <div className={`${!isPremium ? 'blur-sm select-none' : ''}`}>
                 <p className="text-xl font-bold text-white mt-0.5">{weightedInterestRate.toFixed(2)}%</p>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500">Ponderada</span>

          {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center z-20 bg-transparent" onClick={onOpenPremium}>
                <div className="bg-zblack-950/80 p-2 rounded-full cursor-pointer hover:bg-zgold-500 hover:text-black transition-colors">
                  <Lock size={16} className="text-gray-400" />
                </div>
             </div>
          )}
        </div>

        {/* Risk Score */}
        <div className="bg-zblack-900 border border-zblack-800 p-5 rounded-3xl flex items-center justify-between hover:border-zgold-500/30 transition-colors h-[130px] relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zblack-950 rounded-xl text-red-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Risco da Carteira</p>
              <div className={`${!isPremium ? 'blur-sm select-none' : ''}`}>
                 <p className={`text-xl font-bold mt-0.5 ${riskColor}`}>{riskLabel}</p>
              </div>
            </div>
          </div>
          <div className={`${!isPremium ? 'blur-sm select-none' : ''}`}>
             <span className="text-xs font-mono bg-zblack-950 px-2 py-1 rounded text-gray-400">{riskScore.toFixed(1)}/5.0</span>
          </div>

          {!isPremium && (
             <div className="absolute inset-0 flex items-center justify-center z-20 bg-transparent" onClick={onOpenPremium}>
                <div className="bg-zblack-950/80 p-2 rounded-full cursor-pointer hover:bg-zgold-500 hover:text-black transition-colors">
                  <Lock size={16} className="text-gray-400" />
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zblack-900 border border-zblack-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Evolução da Carteira (Simulado)</h3>
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
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#f09805' }}
                  labelStyle={{ color: '#999' }}
                  formatter={(value: number) => [formatKz(value), "Patrimônio"]}
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
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#f09805' }}
                    formatter={(value: number) => [value + '%', "Valor"]}
                 />
               </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-white">{distributionData.length}</span>
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

      {/* Grid for Recent Transactions & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl h-full">
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

        {/* Investment Tasks Widget */}
        <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ListTodo size={20} className="text-zgold-500"/>
              Notas & Tarefas
            </h3>
          </div>
          
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ex: Verificar taxas LUIBOR..."
              className="flex-1 bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zgold-500 text-sm placeholder-gray-600"
            />
            <button 
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-zgold-500 hover:bg-zgold-400 disabled:opacity-50 text-black p-2.5 rounded-xl transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
            {tasks.length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-8 border border-dashed border-zblack-800 rounded-xl">
                Nenhuma tarefa pendente.
              </div>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed 
                    ? 'bg-zblack-950/50 border-transparent opacity-60' 
                    : 'bg-zblack-950 border-zblack-800 hover:border-zgold-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <button 
                      onClick={() => handleToggleTask(task.id)}
                      className={`flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
                    >
                      {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <span className={`text-sm truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {task.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors ml-2"
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
        <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 size={20} className="text-zgold-500" />
              Composição Detalhada
            </h3>
            {!isPremium && <Crown size={18} className="text-zgold-500 animate-pulse" />}
          </div>
          
          <div className={`h-[250px] w-full transition-all duration-300 ${!isPremium ? 'blur-sm opacity-30 select-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetTypeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#333', borderRadius: '12px' }}
                  itemStyle={{ color: '#f09805' }}
                  formatter={(value: any) => [formatKz(Number(value)), "Valor Atual"]}
                  labelStyle={{ color: '#999' }}
                />
                <XAxis 
                  dataKey="name" 
                  stroke="#444" 
                  tick={{fill: '#888', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis hide />
                <Bar 
                  dataKey="value" 
                  fill="#f09805" 
                  radius={[6, 6, 0, 0]} 
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className={`mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 ${!isPremium ? 'blur-sm opacity-30 select-none' : ''}`}>
            {assetTypeData.map((item, index) => (
               <div key={index} className="bg-zblack-950 rounded-lg p-3 text-center border border-zblack-800">
                  <p className="text-xs text-gray-500 mb-1">{item.fullName}</p>
                  <p className="font-mono font-bold text-white text-sm">{formatKz(item.value)}</p>
               </div>
            ))}
          </div>

          {!isPremium && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-t from-zblack-900/80 to-transparent">
                <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-2xl text-center shadow-2xl max-w-xs">
                   <Crown size={32} className="text-zgold-500 mx-auto mb-3" />
                   <h4 className="font-bold text-white mb-1">Visualização Premium</h4>
                   <p className="text-sm text-gray-400 mb-4">Atualize para ver a análise detalhada da sua carteira.</p>
                   <button 
                     onClick={onOpenPremium}
                     className="bg-zgold-500 text-black font-bold py-2 px-6 rounded-lg text-sm hover:bg-zgold-400 transition-colors"
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