import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, MoreVertical, AlertTriangle, Lock, History, Wallet, ArrowDownRight, ArrowUpRight, Percent } from 'lucide-react';
import { formatKz, MOCK_TRANSACTIONS } from '../constants';
import { Asset, AssetType, User } from '../types';
import { db } from '../services/db';

interface AssetsProps {
  user: User;
  onOpenPremium: () => void;
}

const Assets: React.FC<AssetsProps> = ({ user, onOpenPremium }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'history'>('portfolio');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  
  const isPremium = user.plan === 'Premium';

  // Load assets on mount
  useEffect(() => {
    if (user) {
      setAssets(db.getUserAssets(user.id));
    }
  }, [user]);

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
      setAssets(assets.filter(a => a.id !== assetToDelete));
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleAddClick = () => {
    if (!isPremium && assets.length >= 3) {
      onOpenPremium();
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.investedAmount || !user) return;

    // Use manually entered current price, or default to 0 if not provided
    const manualCurrentPrice = Number(formData.currentPriceUnit) || 0;

    if (editingId) {
      // Update existing asset
      const updatedAsset: Asset = {
        id: editingId,
        userId: user.id,
        name: formData.name!,
        typology: formData.typology || 'UP',
        type: formData.type as AssetType,
        investedAmount: Number(formData.investedAmount),
        quantity: Number(formData.quantity),
        interestRate: Number(formData.interestRate),
        currentPriceUnit: manualCurrentPrice,
        purchaseDate: formData.purchaseDate!,
      };
      
      db.updateAsset(updatedAsset);
      
      setAssets(assets.map(asset => 
        asset.id === editingId ? updatedAsset : asset
      ));
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
        quantity: Number(formData.quantity),
        interestRate: Number(formData.interestRate),
        currentPriceUnit: manualCurrentPrice,
        purchaseDate: formData.purchaseDate!,
      };
      
      db.saveAsset(assetToAdd);
      setAssets([...assets, assetToAdd]);
    }

    closeModal();
  };

  // Helper to get transaction style
  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'buy': return { icon: ArrowDownRight, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Compra' };
      case 'sell': return { icon: ArrowUpRight, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Venda' };
      case 'interest': return { icon: Percent, color: 'text-zgold-500', bg: 'bg-zgold-500/10', label: 'Juros / Cupão' };
      default: return { icon: Wallet, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Outro' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Meus Ativos</h2>
           <div className="flex gap-2 bg-zblack-900 p-1 rounded-xl border border-zblack-800">
             <button
               onClick={() => setActiveTab('portfolio')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                 activeTab === 'portfolio' 
                 ? 'bg-zblack-800 text-white shadow-lg' 
                 : 'text-gray-400 hover:text-white'
               }`}
             >
               <Wallet size={16} />
               Carteira
             </button>
             <button
               onClick={() => setActiveTab('history')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                 activeTab === 'history' 
                 ? 'bg-zblack-800 text-white shadow-lg' 
                 : 'text-gray-400 hover:text-white'
               }`}
             >
               <History size={16} />
               Histórico
             </button>
           </div>
        </div>

        {activeTab === 'portfolio' && (
          <div className="flex items-center gap-4">
             {!isPremium && (
               <span className="text-xs text-gray-500 border border-zblack-800 px-3 py-1 rounded-full">
                 Plano Free: {assets.length}/3 ativos
               </span>
             )}
            <button 
              onClick={handleAddClick}
              className={`bg-zgold-500 hover:bg-zgold-400 text-black px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${(!isPremium && assets.length >= 3) ? 'opacity-90' : ''}`}
            >
              {(!isPremium && assets.length >= 3) ? <Lock size={18} /> : <Plus size={20} />}
              Adicionar Ativo
            </button>
          </div>
        )}
      </div>

      {activeTab === 'portfolio' ? (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por código, tipologia..." 
              className="w-full bg-zblack-900 border border-zblack-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-zgold-500"
            />
          </div>

          {/* Assets Grid/List */}
          <div className="bg-zblack-900 border border-zblack-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zblack-950 border-b border-zblack-800">
                  <tr>
                    <th className="p-4 text-sm font-medium text-gray-400">Cód. Negociação</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Tipologia</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Data Compra</th>
                    <th className="p-4 text-sm font-medium text-gray-400 text-right">Investido</th>
                    <th className="p-4 text-sm font-medium text-gray-400 text-right">Valor Atual</th>
                    <th className="p-4 text-sm font-medium text-gray-400 text-center">Taxa (%)</th>
                    <th className="p-4 text-sm font-medium text-gray-400"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zblack-800">
                  {assets.map((asset) => {
                    const currentValue = asset.quantity * asset.currentPriceUnit;
                    const profit = currentValue - asset.investedAmount;
                    const profitPercent = asset.investedAmount > 0 ? (profit / asset.investedAmount) * 100 : 0;

                    return (
                      <tr key={asset.id} className="hover:bg-zblack-800/50 transition-colors group">
                        <td className="p-4">
                          <p className="font-bold text-white font-mono">{asset.name}</p>
                          <p className={`text-xs ${profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="bg-zblack-950 border border-zblack-800 px-3 py-1 rounded-lg text-xs text-gray-300 font-medium">
                            {asset.typology || asset.type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">{asset.purchaseDate}</td>
                        <td className="p-4 text-right font-mono text-gray-300">
                          {formatKz(asset.investedAmount)}
                        </td>
                        <td className="p-4 text-right font-mono text-white font-medium">
                          {formatKz(currentValue)}
                        </td>
                        <td className="p-4 text-center text-sm text-zgold-500">
                          {asset.interestRate > 0 ? `${asset.interestRate}%` : '-'}
                        </td>
                        <td className="p-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => handleEdit(asset)}
                                className="p-2 bg-zblack-950 rounded-lg text-gray-400 hover:text-white hover:bg-zblack-800 transition-colors"
                                title="Editar"
                              >
                               <Edit2 size={16} />
                             </button>
                             <button 
                               onClick={() => initiateDelete(asset.id)}
                               className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
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
               <div className="p-10 text-center text-gray-500">
                 Nenhum ativo encontrado. Adicione o seu primeiro investimento BODIVA.
               </div>
            )}
          </div>
        </>
      ) : (
        /* History View */
        <div className="bg-zblack-900 border border-zblack-800 rounded-3xl overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zblack-950 border-b border-zblack-800">
                <tr>
                  <th className="p-4 text-sm font-medium text-gray-400">Data</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Operação</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Ativo</th>
                  <th className="p-4 text-sm font-medium text-gray-400 text-right">Valor</th>
                  <th className="p-4 text-sm font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zblack-800">
                {MOCK_TRANSACTIONS.length > 0 ? (
                  MOCK_TRANSACTIONS.map((tx) => {
                    const style = getTransactionStyle(tx.type);
                    const Icon = style.icon;

                    return (
                      <tr key={tx.id} className="hover:bg-zblack-800/50 transition-colors">
                        <td className="p-4 text-sm text-gray-300">{tx.date}</td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}>
                               <Icon size={14} />
                             </div>
                             <span className="text-sm text-white font-medium">{style.label}</span>
                           </div>
                        </td>
                        <td className="p-4 text-sm text-gray-400">{tx.assetName}</td>
                        <td className={`p-4 text-right font-mono font-bold ${style.color}`}>
                          {tx.type === 'buy' ? '-' : '+'}{formatKz(tx.amount)}
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-gray-500 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zblack-900 border border-zblack-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Editar Ativo' : 'Adicionar Novo Ativo'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Cód. Negociação (Título)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                  placeholder="Ex: UP-PP 41313, BCGA..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Tipologia</label>
                   <input 
                     type="text"
                     value={formData.typology}
                     onChange={e => setFormData({...formData, typology: e.target.value})}
                     className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                     placeholder="Ex: UP, Ações, FIS"
                     required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Categoria (Interna)</label>
                   <select 
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value as AssetType})}
                     className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                   >
                     {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Data de Compra</label>
                   <input 
                      type="date"
                      value={formData.purchaseDate}
                      onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                      className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Valor Total Investido (Kz)</label>
                   <input 
                      type="number"
                      value={formData.investedAmount}
                      onChange={e => setFormData({...formData, investedAmount: Number(e.target.value)})}
                      className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                      min="0"
                      required
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Preço Atual (Unitário)</label>
                   <input 
                      type="number"
                      value={formData.currentPriceUnit}
                      onChange={e => setFormData({...formData, currentPriceUnit: Number(e.target.value)})}
                      className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                      min="0"
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Quantidade</label>
                   <input 
                      type="number"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                      className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                      min="1"
                      required
                   />
                </div>
              </div>

              <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Taxa de Juro (%)</label>
                   <input 
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={e => setFormData({...formData, interestRate: Number(e.target.value)})}
                      className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                      min="0"
                      required
                   />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-zgold-500 hover:bg-zgold-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-zgold-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zblack-900 border border-zblack-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Excluir Ativo?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Tem certeza que deseja remover este ativo da sua carteira? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-zblack-950 hover:bg-zblack-800 text-gray-300 font-bold py-3 rounded-xl transition-colors border border-zblack-800"
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