import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, FileText, Bell, CreditCard, AlertTriangle, TrendingUp, Save, Check, X, Mail, Phone, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  // User Profile State
  const [tempProfile, setTempProfile] = useState<User>(user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Sync tempProfile if user prop changes (e.g. external updates)
  useEffect(() => {
    setTempProfile(user);
  }, [user]);

  // Settings State
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [dropThreshold, setDropThreshold] = useState(10);
  const [gainThreshold, setGainThreshold] = useState(15);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOpenEditProfile = () => {
    setTempProfile(user);
    setEditError(null); // Clear previous errors
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    const phone = tempProfile.phone || '';
    // Remove spaces and dashes for validation
    const cleanPhone = phone.replace(/[\s-]/g, '');

    // Validation Logic:
    // 1. Starts with +244 and has 9 digits after (Total 13: +2449xxxxxxxx)
    // 2. Starts with 9 and has 8 digits after (Total 9: 9xxxxxxxx)
    const isValidAngolan = /^(\+244)?9\d{8}$/.test(cleanPhone);

    if (phone && !isValidAngolan) {
      setEditError('Número inválido. Use o formato Angolano (ex: +244 923... ou 923...).');
      return;
    }

    onUpdateUser(tempProfile);
    setIsEditModalOpen(false);
  };

  const SettingItem = ({ icon: Icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick?: () => void }) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-zblack-950 rounded-2xl border border-zblack-800 transition-colors group ${onClick ? 'cursor-pointer hover:border-zgold-500/50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-zblack-900 rounded-xl text-gray-400 transition-colors ${onClick ? 'group-hover:text-zgold-500' : ''}`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      {onClick && (
        <div className="w-2 h-2 rounded-full bg-zgold-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-white mb-6">Meu Perfil</h2>

      {/* User Header */}
      <div className="bg-zblack-900 border border-zblack-800 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zgold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="w-32 h-32 rounded-full border-4 border-zgold-500 shadow-xl bg-zblack-800 flex items-center justify-center text-5xl font-bold text-white">
          {user.name.charAt(0)}
        </div>
        <div className="text-center md:text-left z-10">
          <h3 className="text-2xl font-bold text-white">{user.name}</h3>
          <p className="text-gray-400 mb-1">{user.email}</p>
          <p className="text-gray-500 text-sm mb-4">{user.phone || 'Sem telefone'}</p>
          <div className="flex gap-2 justify-center md:justify-start">
            <span className="bg-zgold-500 text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-zgold-500/20">
              Plano {user.plan || 'Free'}
            </span>
            <span className="bg-zblack-950 border border-zblack-800 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">
              ID: #{user.id.substring(0, 6)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Geral</h3>
          <div className="grid grid-cols-1 gap-4">
            <SettingItem 
              icon={UserIcon} 
              title="Dados Pessoais" 
              desc="Nome, Email, Telefone" 
              onClick={handleOpenEditProfile}
            />
            <SettingItem 
              icon={Shield} 
              title="Segurança" 
              desc="Alterar senha, 2FA" 
            />
            <SettingItem 
              icon={Bell} 
              title="Histórico de Alertas" 
              desc="Ver todas as notificações passadas" 
            />
            <SettingItem 
              icon={FileText} 
              title="Extratos & Relatórios" 
              desc="Baixar histórico em PDF/Excel" 
            />
            <SettingItem 
              icon={CreditCard} 
              title="Métodos de Pagamento" 
              desc="Contas bancárias associadas" 
            />
          </div>
        </div>

        {/* Alert Configuration Panel */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Configuração de Alertas</h3>
          <div className="bg-zblack-900 border border-zblack-800 rounded-3xl p-6 relative overflow-hidden h-full">
            
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-zblack-800">
              <div>
                <h4 className="text-lg font-bold text-white">Notificações Push</h4>
                <p className="text-sm text-gray-400">Receba alertas em tempo real no dispositivo.</p>
              </div>
              <button 
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`w-14 h-8 rounded-full transition-colors relative ${alertsEnabled ? 'bg-zgold-500' : 'bg-zblack-800'}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md ${alertsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className={`space-y-8 transition-opacity duration-300 ${alertsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              
              {/* Drop Threshold */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-red-400 font-medium">
                    <AlertTriangle size={18} />
                    <span>Alerta de Queda</span>
                  </div>
                  <span className="text-2xl font-bold text-white font-mono">{dropThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={dropThreshold}
                  onChange={(e) => setDropThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-zblack-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-xs text-gray-500 mt-2">Notificar quando um ativo desvalorizar mais de {dropThreshold}%.</p>
              </div>

              {/* Gain Threshold */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-green-400 font-medium">
                    <TrendingUp size={18} />
                    <span>Alerta de Valorização</span>
                  </div>
                  <span className="text-2xl font-bold text-white font-mono">{gainThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={gainThreshold}
                  onChange={(e) => setGainThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-zblack-950 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <p className="text-xs text-gray-500 mt-2">Notificar quando um ativo valorizar mais de {gainThreshold}%.</p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveSettings}
                  disabled={!alertsEnabled}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                    isSaved 
                      ? 'bg-green-500 text-white'
                      : 'bg-zblack-950 text-white hover:bg-zgold-500 hover:text-black border border-zblack-800 hover:border-zgold-500'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check size={20} />
                      <span>Preferências Salvas!</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-zgold-500/10 to-transparent border border-zgold-500/20 rounded-3xl flex justify-between items-center">
        <div>
          <p className="text-zgold-500 font-bold mb-1">Precisa de ajuda especializada?</p>
          <p className="text-sm text-gray-400">Nossos consultores BODIVA estão disponíveis 24/7.</p>
        </div>
        <button className="bg-zblack-900 hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors border border-zblack-800 shadow-lg">
          Falar com Suporte
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zblack-900 border border-zblack-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Editar Dados Pessoais</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-400 hover:text-white p-2 hover:bg-zblack-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Alert */}
            {editError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-500 text-xs font-medium animate-in slide-in-from-top-1">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <UserIcon size={12} /> Nome Completo
                </label>
                <input 
                  type="text" 
                  value={tempProfile.name}
                  onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                  className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <Mail size={12} /> Email
                </label>
                <input 
                  type="email" 
                  value={tempProfile.email}
                  onChange={e => setTempProfile({...tempProfile, email: e.target.value})}
                  className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <Phone size={12} /> Telefone
                </label>
                <input 
                  type="tel" 
                  value={tempProfile.phone || ''}
                  onChange={e => setTempProfile({...tempProfile, phone: e.target.value})}
                  className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                  placeholder="+244 9..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-zblack-950 hover:bg-zblack-800 text-gray-300 font-bold py-3 rounded-xl transition-colors border border-zblack-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-zgold-500 hover:bg-zgold-400 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-zgold-500/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;