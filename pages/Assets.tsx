import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, MoreVertical, AlertTriangle, Lock, History, Wallet, ArrowDownRight, ArrowUpRight, Percent, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { formatKz } from '../constants';
import { Asset, AssetType, User, Transaction } from '../types';
import { db } from '../services/db';

interface AssetsProps {
  user: User;
  onOpenPremium: () => void;
}

const Assets: React.FC<AssetsProps> = ({ user, onOpenPremium }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'history'>('portfolio');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  
  // Validation State
  const [formError, setFormError] = useState<string | null>(null);

  const isPremium = user.plan === 'Premium';

  // Load assets and transactions on mount
  useEffect(() => {
    if (user) {
      setAssets(db.getUserAssets(user.id));
      setTransactions(db.getUserTransactions(user.id));
    }
  }, [user]);

  // Refresh data helper
  const refreshData = () => {
      setAssets(db.getUserAssets(user.id));
      setTransactions(db.getUserTransactions(user.id));
  };

  // Prepare Chart Data (Aggregate by Typology)
  const chartData = React.useMemo(() => {
    const agg = assets.reduce((acc: Record<string, number>, asset) => {
      const key = asset.typology || asset.type;
      const value = Number(asset.quantity) * Number(asset.currentPriceUnit);
      const current = acc[key] || 0;
      acc[key] = current + value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  // New Asset Form State
  const initialFormState = {
    name: '',
    typology: '', 
    type: AssetType.OT,
    investedAmount: 0,
    interestRate: 0,
    quantity: 1,
    currentPriceUnit: 0, 
    purchaseDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Asset>>(initialFormState);

  const initiateDelete = (id: string) => {
    setAssetToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      db.deleteAsset(assetToDelete);
      refreshData();
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setFormData({
      name: asset.name,
      typology: asset.typology || '',
      type: asset.type,
      investedAmount: asset.investedAmount,
      quantity: asset.quantity,
      interestRate: asset.interestRate,
      currentPriceUnit: asset.currentPriceUnit,
      purchaseDate: asset.purchaseDate,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setFormError(null);
  };

  const handleAddClick = () => {
    if (!isPremium && assets.length >= 3) {
      onOpenPremium();
      return;
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.name || !formData.investedAmount || !user) return;

    // Use manually entered current price, or default to 0 if not provided
    const manualCurrentPrice = Number(formData.currentPriceUnit) || 0;
    const quantity = Number(formData.quantity) || 0;
    const interestRate = Number(formData.interestRate) || 0;

    // Client-side validation
    if (manualCurrentPrice <= 0) {
      setFormError('O preço atual deve ser maior que zero.');
      return;
    }

    if (quantity <= 0) {
      setFormError('A quantidade deve ser maior que zero.');
      return;
    }

    if (interestRate < 0 || interestRate > 100) {
      setFormError('A taxa de juro deve estar entre 0% e 100%.');
      return;
    }

    if (editingId) {
      // Update existing asset
      const updatedAsset: Asset = {
        id: editingId,
        userId: user.id,
        name: formData.name!,
        typology: formData.typology || 'UP',
        type: formData.type as AssetType,
        investedAmount: Number(formData.investedAmount),
        quantity: quantity,
        interestRate: interestRate,
        currentPriceUnit: manualCurrentPrice,
        purchaseDate: formData.purchaseDate!,
      };
      
      db.updateAsset(updatedAsset);
    } else {
      // Create new asset
      if (!isPremium && assets.length >= 3) {
        onOpenPremium();
        closeModal();
        return;
      }

      const assetToAdd: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        name: formData.name!,
        typology: formData.typology || 'UP',
        type: formData.type as AssetType,
        investedAmount: Number(formData.investedAmount),
        quantity: quantity,
        interestRate: interestRate,
        currentPriceUnit: manualCurrentPrice,
        purchaseDate: formData.purchaseDate!,
      };
      
      db.saveAsset(assetToAdd);
    }

    refreshData();
    closeModal();
  };

  // Helper to get transaction style
  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'buy': return { icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-50', label: 'Compra' };
      case 'sell': return { icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-50', label: 'Venda' };
      case 'interest': return { icon: Percent, color: 'text-zblue-600', bg: 'bg-zblue-50', label: 'Juros / Cupão' };
      default: return { icon: Wallet, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Outro' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 mb-2">Meus Ativos</h2>
           <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
             <button
               onClick={() => setActiveTab('portfolio')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                 activeTab === 'portfolio' 
                 ? 'bg-slate-100 text-slate-900 shadow-sm' 
                 : 'text-slate-500 hover:text-slate-900'
               }`}
             >
               <Wallet size={16} />
               Carteira
             </button>
             <button
               onClick={() => setActiveTab('history')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                 activeTab === 'history' 
                 ? 'bg-slate-100 text-slate-900 shadow-sm' 
                 : 'text-slate-500 hover:text-slate-900'
               }`}
             >
               <History size={16} />
               Histórico
             </button>
           </div>
        </div>

        {activeTab === 'portfolio' && (
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
             {!isPremium && (
               <span className="text-xs text-slate-500 border border-slate-200 px-3 py-1 rounded-full hidden sm:block">
                 Plano Free: {assets.length}/3 ativos
               </span>
             )}
            <button 
              onClick={handleAddClick}
              className={`bg-zblue-600 hover:bg-zblue-500 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-zblue-500/20 ${(!isPremium && assets.length >= 3) ? 'opacity-90' : ''}`}
            >
              {(!isPremium && assets.length >= 3) ? <Lock size={18} /> : <Plus size={20} />}
              Adicionar Ativo
            </button>
          </div>
        )}
      </div>

      {activeTab === 'portfolio' ? (
        <>
          {/* Analysis Chart Section */}
          {assets.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-zblue-50 text-zblue-600 rounded-lg">
                   <BarChart2 size={20} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">Análise por Tipologia</h3>
               </div>
               
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        hide 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(99, 132, 255, 0.05)' }}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#6384ff', fontWeight: 600 }}
                        formatter={(value: number) => [formatKz(value), "Valor Total"]}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#6384ff" 
                        radius={[6, 6, 0, 0]} 
                        barSize={60}
                        animationDuration={1500}
                      />
                      <Brush 
                        dataKey="name" 
                        height={30} 
                        stroke="#cbd5e1" 
                        fill="#f8fafc"
                        tickFormatter={() => ''}
                      />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por código, tipologia..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-zblue-500 shadow-sm"
            />
          </div>

          {/* ASSETS: MOBILE CARD VIEW (Visible on small screens) */}
          <div className="md:hidden space-y-4">
            {assets.length === 0 ? (
               <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                 Nenhum ativo encontrado.
               </div>
            ) : (
              assets.map(asset => {
                const currentValue = asset.quantity * asset.currentPriceUnit;
                const profit = currentValue - asset.investedAmount;
                const profitPercent = asset.investedAmount > 0 ? (profit / asset.investedAmount) * 100 : 0;
                
                return (
                  <div key={asset.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-slate-900 text-lg font-mono">{asset.name}</p>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-500 mt-1 inline-block">
                             {asset.typology || asset.type}
                          </span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleEdit(asset)}
                                className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 border border-slate-100"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => initiateDelete(asset.id)}
                                className="p-2 bg-red-50 rounded-lg text-red-500 border border-red-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <p className="text-xs text-slate-500">Valor Investido</p>
                           <p className="font-mono text-slate-700">{formatKz(asset.investedAmount)}</p>
                        </div>
                        <div>
                           <p className="text-xs text-slate-500">Valor Atual</p>
                           <p className="font-mono text-slate-900 font-bold">{formatKz(currentValue)}</p>
                        </div>
                        <div>
                           <p className="text-xs text-slate-500">Rentabilidade</p>
                           <p className={`text-sm font-bold ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                           </p>
                        </div>
                        <div>
                           <p className="text-xs text-slate-500">Data Compra</p>
                           <p className="text-sm text-slate-700">{asset.purchaseDate}</p>
                        </div>
                     </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ASSETS: DESKTOP TABLE VIEW (Hidden on small screens) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-sm font-medium text-slate-500">Cód. Negociação</th>
                    <th className="p-4 text-sm font-medium text-slate-500">Tipologia</th>
                    <th className="p-4 text-sm font-medium text-slate-500">Data Compra</th>
                    <th className="p-4 text-sm font-medium text-slate-500 text-right">Investido</th>
                    <th className="p-4 text-sm font-medium text-slate-500 text-right">Valor Atual</th>
                    <th className="p-4 text-sm font-medium text-slate-500 text-center">Taxa (%)</th>
                    <th className="p-4 text-sm font-medium text-slate-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.map((asset) => {
                    const currentValue = asset.quantity * asset.currentPriceUnit;
                    const profit = currentValue - asset.investedAmount;
                    const profitPercent = asset.investedAmount > 0 ? (profit / asset.investedAmount) * 100 : 0;

                    return (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 font-mono">{asset.name}</p>
                          <p className={`text-xs ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs text-slate-600 font-medium">
                            {asset.typology || asset.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">{asset.purchaseDate}</td>
                        <td className="p-4 text-right font-mono text-slate-600">
                          {formatKz(asset.investedAmount)}
                        </td>
                        <td className="p-4 text-right font-mono text-slate-900 font-medium">
                          {formatKz(currentValue)}
                        </td>
                        <td className="p-4 text-center text-sm text-zblue-600">
                          {asset.interestRate > 0 ? `${asset.interestRate}%` : '-'}
                        </td>
                        <td className="p-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => handleEdit(asset)}
                                className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                                title="Editar"
                              >
                               <Edit2 size={16} />
                             </button>
                             <button 
                               onClick={() => initiateDelete(asset.id)}
                               className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition-colors border border-transparent hover:border-red-200"
                               title="Remover"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {assets.length === 0 && (
               <div className="p-10 text-center text-slate-500">
                 Nenhum ativo encontrado. Adicione o seu primeiro investimento BODIVA.
               </div>
            )}
          </div>
        </>
      ) : (
        /* History View (Real Transactions) */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden animate-in fade-in duration-300 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-sm font-medium text-slate-500">Data</th>
                  <th className="p-4 text-sm font-medium text-slate-500">Operação</th>
                  <th className="p-4 text-sm font-medium text-slate-500">Ativo</th>
                  <th className="p-4 text-sm font-medium text-slate-500 text-right">Valor</th>
                  <th className="p-4 text-sm font-medium text-slate-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length > 0 ? (
                  transactions.map((tx) => {
                    const style = getTransactionStyle(tx.type);
                    const Icon = style.icon;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm text-slate-600">{tx.date}</td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}>
                               <Icon size={14} />
                             </div>
                             <span className="text-sm text-slate-700 font-medium">{style.label}</span>
                           </div>
                        </td>
                        <td className="p-4 text-sm text-slate-500">{tx.assetName}</td>
                        <td className={`p-4 text-right font-mono font-bold ${style.color}`}>
                          {tx.type === 'buy' ? '-' : '+'}{formatKz(tx.amount)}
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Nenhum histórico de transações disponível.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Asset Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Editar Ativo' : 'Adicionar Novo Ativo'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1">
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Cód. Negociação (Título)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400"
                  placeholder="Ex: UP-PP 41313, BCGA..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Tipologia</label>
                   <input 
                     type="text"
                     value={formData.typology}
                     onChange={e => setFormData({...formData, typology: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400"
                     placeholder="Ex: UP, Ações, FIS"
                     required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Categoria (Interna)</label>
                   <select 
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value as AssetType})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors"
                   >
                     {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Data de Compra</label>
                   <input 
                      type="date"
                      value={formData.purchaseDate}
                      onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors"
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Valor Total Investido (Kz)</label>
                   <input 
                      type="number"
                      value={formData.investedAmount}
                      onChange={e => setFormData({...formData, investedAmount: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors"
                      min="0"
                      required
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Preço Atual (Unitário)</label>
                   <input 
                      type="number"
                      value={formData.currentPriceUnit}
                      onChange={e => setFormData({...formData, currentPriceUnit: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors"
                      min="0"
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Quantidade</label>
                   <input 
                      type="number"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors"
                      min="1"
                      required
                   />
                </div>
              </div>

              <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Taxa de Juro (%)</label>
                   <input 
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={e => setFormData({...formData, interestRate: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors"
                      min="0"
                      required
                   />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-zblue-600 hover:bg-zblue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-zblue-500/20"
                >
                  {editingId ? 'Atualizar Ativo' : 'Salvar Ativo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Ativo?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja remover este ativo da sua carteira? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-colors border border-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;