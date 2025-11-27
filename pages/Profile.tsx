import React from 'react';
import { User, Shield, FileText, Bell, CreditCard } from 'lucide-react';

const Profile: React.FC = () => {
  const SettingItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="flex items-center justify-between p-4 bg-zblack-950 rounded-2xl border border-zblack-800 hover:border-zgold-500/50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-zblack-900 rounded-xl text-gray-400 group-hover:text-zgold-500 transition-colors">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="w-2 h-2 rounded-full bg-zgold-500 opacity-0 group-hover:opacity-100"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Meu Perfil</h2>

      <div className="bg-zblack-900 border border-zblack-800 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
        <img src="https://picsum.photos/150/150" alt="Profile" className="w-32 h-32 rounded-full border-4 border-zgold-500" />
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold text-white">Methew White</h3>
          <p className="text-gray-400 mb-4">investidor@bodiva.ao</p>
          <span className="bg-zgold-500 text-black px-4 py-1 rounded-full text-sm font-bold">
            Plano Premium
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingItem 
          icon={User} 
          title="Dados Pessoais" 
          desc="Nome, Email, Telefone" 
        />
        <SettingItem 
          icon={Shield} 
          title="Segurança" 
          desc="Alterar senha, 2FA" 
        />
        <SettingItem 
          icon={Bell} 
          title="Notificações" 
          desc="Alertas de preços e vencimentos" 
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

      <div className="mt-8 p-6 bg-zgold-500/5 border border-zgold-500/20 rounded-3xl text-center">
        <p className="text-zgold-500 font-medium mb-2">Precisa de ajuda especializada?</p>
        <p className="text-sm text-gray-400 mb-4">Nossos consultores BODIVA estão disponíveis 24/7.</p>
        <button className="bg-zblack-900 hover:bg-black text-white px-6 py-2 rounded-xl text-sm transition-colors border border-zblack-800">
          Falar com Suporte
        </button>
      </div>
    </div>
  );
};

export default Profile;
