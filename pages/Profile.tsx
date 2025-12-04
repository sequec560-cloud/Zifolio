import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, FileText, Bell, CreditCard, AlertTriangle, TrendingUp, Save, Check, X, Mail, Phone, AlertCircle, Key, Crown, Camera, Lock } from 'lucide-react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onOpenPremium: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onOpenPremium }) => {
  // User Profile State
  const [tempProfile, setTempProfile] = useState<User>(user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // New Confirmation Modal State
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Settings State
  const [alertsEnabled, setAlertsEnabled] = useState(user.notificationSettings?.enabled ?? true);
  const [dropThreshold, setDropThreshold] = useState(user.notificationSettings?.dropThreshold ?? 10);
  const [gainThreshold, setGainThreshold] = useState(user.notificationSettings?.gainThreshold ?? 15);
  const [isSaved, setIsSaved] = useState(false);

  const isPremium = user.plan === 'Premium';

  // Sync tempProfile and settings if user prop changes (e.g. external updates)
  useEffect(() => {
    setTempProfile(user);
    if (user.notificationSettings) {
      setAlertsEnabled(user.notificationSettings.enabled);
      setDropThreshold(user.notificationSettings.dropThreshold);
      setGainThreshold(user.notificationSettings.gainThreshold);
    }
  }, [user]);

  const handleSaveSettings = () => {
    onUpdateUser({
      ...user,
      notificationSettings: {
        enabled: alertsEnabled,
        dropThreshold,
        gainThreshold
      }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOpenEditProfile = () => {
    setTempProfile(user);
    setEditError(null); // Clear previous errors
    setIsEditModalOpen(true);
  };

  const handleOpenPasswordModal = () => {
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 500KB to avoid localStorage issues
      if (file.size > 500000) {
        setEditError('A imagem é muito grande. O limite é 500KB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    // 1. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!tempProfile.email || !emailRegex.test(tempProfile.email)) {
      setEditError('Por favor, insira um endereço de email válido.');
      return;
    }

    // 2. Phone Validation (Angolan Format)
    const phone = tempProfile.phone || '';
    if (phone) {
      // Remove spaces and dashes for validation check
      const cleanPhone = phone.replace(/[\s-]/g, '');
      
      // Check: Either starts with +244 followed by 9 digits OR starts with 9 followed by 8 digits
      const isValidAngolan = /^(\+244)?9\d{8}$/.test(cleanPhone);

      if (!isValidAngolan) {
        setEditError('Número inválido. Use o formato Angolano (ex: +244 923... ou 923...).');
        return;
      }
    }

    // Open confirmation modal instead of saving directly
    setIsConfirmSaveModalOpen(true);
  };

  const executeSaveProfile = () => {
    onUpdateUser(tempProfile);
    setIsConfirmSaveModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    // Update user with new password
    onUpdateUser({ ...user, password: passwordData.newPassword });
    setIsPasswordModalOpen(false);
    // Trigger generic save success visual
    handleSaveSettings();
  };

  const SettingItem = ({ icon: Icon, title, desc, onClick, premiumOnly }: { icon: any, title: string, desc: string, onClick?: () => void, premiumOnly?: boolean }) => (
    <div 
      onClick={premiumOnly && !isPremium ? onOpenPremium : onClick}
      className={`flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 transition-colors group relative shadow-sm ${onClick || premiumOnly ? 'cursor-pointer hover:border-zblue-300' : ''}`}
    >
      <div className={`flex items-center gap-4 ${premiumOnly && !isPremium ? 'opacity-50' : ''}`}>
        <div className={`p-3 bg-slate-50 rounded-xl text-slate-500 transition-colors ${onClick ? 'group-hover:text-zblue-600' : ''}`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-medium text-slate-900 flex items-center gap-2">
            {title}
            {premiumOnly && !isPremium && <Lock size={12} className="text-zblue-500" />}
          </h4>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      {(onClick || premiumOnly) && (
        <div className="w-2 h-2 rounded-full bg-zblue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Meu Perfil</h2>

      {/* User Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zblue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="w-32 h-32 rounded-full border-4 border-zblue-500 shadow-xl bg-slate-100 flex items-center justify-center text-5xl font-bold text-white relative overflow-hidden shrink-0">
          {user.photoUrl ? (
             <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
             <span className="text-slate-400">{user.name.charAt(0)}</span>
          )}
          {isPremium && (
             <div className="absolute -top-2 -right-2 bg-zblue-500 text-white p-2 rounded-full ring-4 ring-white">
               <Crown size={18} />
             </div>
          )}
        </div>
        <div className="text-center md:text-left z-10 w-full md:w-auto flex-1">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-slate-500 mb-1">{user.email}</p>
              <p className="text-slate-400 text-sm mb-4">{user.phone || 'Sem telefone'}</p>
              <div className="flex gap-2 justify-center md:justify-start">
                <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-md ${isPremium ? 'bg-zblue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  Plano {user.plan || 'Free'}
                </span>
                <span className="bg-slate-50 border border-slate-200 text-slate-500 px-4 py-1 rounded-full text-sm font-medium">
                  ID: #{user.id.substring(0, 6)}
                </span>
              </div>
            </div>
            
            {/* Upgrade Button in Header if Free */}
            {!isPremium && (
              <button 
                onClick={onOpenPremium}
                className="bg-zblue-600 hover:bg-zblue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-zblue-500/20 transition-transform active:scale-95 flex items-center gap-2"
              >
                <Crown size={18} />
                Tornar-se Premium
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Geral</h3>
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
              onClick={handleOpenPasswordModal}
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
              premiumOnly={true}
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
          <h3 className="text-xl font-bold text-slate-900 mb-4">Configuração de Alertas</h3>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden h-full shadow-sm">
            
            {!isPremium && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-zblue-100 p-3 rounded-full mb-3">
                     <Lock className="text-zblue-600" size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900">Alertas Personalizados</h4>
                  <p className="text-sm text-slate-500 mb-4">Usuários Free têm alertas fixos (10% Queda / 15% Ganho).</p>
                  <button onClick={onOpenPremium} className="text-zblue-600 text-sm font-bold hover:underline">
                     Desbloquear Controle Total
                  </button>
               </div>
            )}

            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Notificações Push</h4>
                <p className="text-sm text-slate-500">Receba alertas em tempo real no dispositivo.</p>
              </div>
              <button 
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`w-14 h-8 rounded-full transition-colors relative ${alertsEnabled ? 'bg-zblue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md ${alertsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className={`space-y-8 transition-opacity duration-300 ${alertsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              
              {/* Drop Threshold */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-red-500 font-medium">
                    <AlertTriangle size={18} />
                    <span>Alerta de Queda</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900 font-mono">{dropThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={dropThreshold}
                  onChange={(e) => setDropThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                  disabled={!isPremium}
                />
                <p className="text-xs text-slate-400 mt-2">Notificar quando um ativo desvalorizar mais de {dropThreshold}%.</p>
              </div>

              {/* Gain Threshold */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <TrendingUp size={18} />
                    <span>Alerta de Valorização</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900 font-mono">{gainThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={gainThreshold}
                  onChange={(e) => setGainThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                  disabled={!isPremium}
                />
                <p className="text-xs text-slate-400 mt-2">Notificar quando um ativo valorizar mais de {gainThreshold}%.</p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveSettings}
                  disabled={!alertsEnabled}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                    isSaved 
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-900 text-white hover:bg-zblue-600 hover:shadow-lg'
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
      <div className="mt-8 p-6 bg-gradient-to-r from-zblue-500/10 to-transparent border border-zblue-100 rounded-3xl flex justify-between items-center">
        <div>
          <p className="text-zblue-600 font-bold mb-1">Precisa de ajuda especializada?</p>
          <p className="text-sm text-slate-500">Nossos consultores BODIVA estão disponíveis 24/7.</p>
        </div>
        <button className="bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-xl text-sm font-semibold transition-colors border border-slate-200 shadow-md">
          Falar com Suporte
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Editar Dados Pessoais</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Alert */}
            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-medium animate-in slide-in-from-top-1">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center mb-6">
                 <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-zblue-500 flex items-center justify-center overflow-hidden mb-3 relative group">
                   {tempProfile.photoUrl ? (
                     <img src={tempProfile.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-3xl font-bold text-slate-400">{tempProfile.name.charAt(0)}</span>
                   )}
                   <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera size={24} className="text-white" />
                   </label>
                 </div>
                 <input 
                   id="photo-upload" 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={handlePhotoChange} 
                 />
                 <label htmlFor="photo-upload" className="text-sm text-zblue-600 cursor-pointer hover:underline">
                   Alterar Foto
                 </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                  <UserIcon size={12} /> Nome Completo
                </label>
                <input 
                  type="text" 
                  value={tempProfile.name}
                  onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                  <Mail size={12} /> Email
                </label>
                <input 
                  type="email" 
                  value={tempProfile.email}
                  onChange={e => setTempProfile({...tempProfile, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                  <Phone size={12} /> Telefone
                </label>
                <input 
                  type="tel" 
                  value={tempProfile.phone || ''}
                  onChange={e => setTempProfile({...tempProfile, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400"
                  placeholder="+244 9..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-zblue-600 hover:bg-zblue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-zblue-500/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Shield size={20} className="text-zblue-500" /> Alterar Senha
              </h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Alert */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-medium animate-in slide-in-from-top-1">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                  <Key size={12} /> Nova Senha
                </label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                  <Key size={12} /> Confirmar Senha
                </label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400"
                  placeholder="Repita a nova senha"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-zblue-600 hover:bg-zblue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-zblue-500/20"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Save Modal */}
      {isConfirmSaveModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-zblue-50 text-zblue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Salvar Alterações?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Tem certeza que deseja atualizar os seus dados de perfil?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsConfirmSaveModalOpen(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-colors border border-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={executeSaveProfile}
                className="flex-1 bg-zblue-600 hover:bg-zblue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-zblue-500/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;