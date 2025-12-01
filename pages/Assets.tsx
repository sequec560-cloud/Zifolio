import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { formatKz } from '../constants';
import { Asset, AssetType, User } from '../types';
import { db } from '../services/db';

interface AssetsProps {
  user: User;
}

const Assets: React.FC<AssetsProps> = ({ user }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Load assets on mount
  useEffect(() => {
    if (user) {
      setAssets(db.getUserAssets(user.id));
    }
  }, [user]);

  // New Asset Form State
  const initialFormState = {
    name: '',
    type: AssetType.OT,
    investedAmount: 0,
    interestRate: 0,
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Asset>>(initialFormState);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este ativo?')) {
      db.deleteAsset(id);
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setFormData({
      name: asset.name,
      type: asset.type,
      investedAmount: asset.investedAmount,
      quantity: asset.quantity,
      interestRate: asset.interestRate,
      purchaseDate: asset.purchaseDate,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.investedAmount || !user) return;

    // Calculate unit price based on inputs (MVP logic)
    const currentPriceUnit = Number(formData.investedAmount) / Number(formData.quantity);

    if (editingId) {
      // Update existing asset
      const updatedAsset: Asset = {
        id: editingId,
        userId: user.id,
        name: formData.name!,
        type: formData.type as AssetType,
        investedAmount: Number(formData.investedAmount),
        quantity: Number(formData.quantity),
        interestRate: Number(formData.interestRate),
        currentPriceUnit: currentPriceUnit,
        purchaseDate: formData.purchaseDate!,
      };
      
      db.updateAsset(updatedAsset);
      
      setAssets(assets.map(asset => 
        asset.id === editingId ? updatedAsset : asset
      ));
    } else {
      // Create new asset
      const assetToAdd: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        name: formData.name!,
        type: formData.type as AssetType,
        investedAmount: Number(formData.investedAmount),
        quantity: Number(formData.quantity),
        interestRate: Number(formData.interestRate),
        currentPriceUnit: currentPriceUnit,
        purchaseDate: formData.purchaseDate!,
      };
      
      db.saveAsset(assetToAdd);
      setAssets([...assets, assetToAdd]);
    }

    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Meus Ativos</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-zgold-500 hover:bg-zgold-400 text-black px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Adicionar Ativo
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome, tipo..." 
          className="w-full bg-zblack-900 border border-zblack-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-zgold-500"
        />
      </div>

      {/* Assets Grid/List */}
      <div className="bg-zblack-900 border border-zblack-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zblack-950 border-b border-zblack-800">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-400">Título</th>
                <th className="p-4 text-sm font-medium text-gray-400">Tipo</th>
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
                      <p className="font-bold text-white">{asset.name}</p>
                      <p className={`text-xs ${profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="bg-zblack-950 border border-zblack-800 px-3 py-1 rounded-lg text-xs text-gray-300">
                        {asset.type}
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
                           onClick={() => handleDelete(asset.id)}
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
                <label className="block text-xs font-medium text-gray-400 mb-1">Nome do Título</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                  placeholder="Ex: OT-NR-2025"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Tipo</label>
                   <select 
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value as AssetType})}
                     className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                   >
                     {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Valor Total (Kz)</label>
                   <input 
                      type="number"
                      value={formData.investedAmount}
                      onChange={e => setFormData({...formData, investedAmount: Number(e.target.value)})}
                      className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors"
                      min="0"
                      required
                   />
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
    </div>
  );
};

export default Assets;