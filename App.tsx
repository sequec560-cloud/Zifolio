import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Calculator, 
  User as UserIcon, 
  LogOut, 
  Menu,
  X,
  Newspaper,
  MessageSquarePlus,
  Send,
  Check,
  Crown,
  Zap,
  ShieldCheck,
  ArrowRight,
  Star
} from 'lucide-react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Simulator from './pages/Simulator';
import Profile from './pages/Profile';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import { db } from './services/db';

const SplashScreen = () => (
  <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[100]">
    <style>{`
      @keyframes logo-reveal {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes text-slide {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .logo-anim { animation: logo-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      .text-anim { animation: text-slide 0.8s ease-out 0.5s forwards; opacity: 0; }
      .gold-shimmer {
        background: linear-gradient(90deg, #f09805 0%, #fff 50%, #f09805 100%);
        background-size: 200% auto;
        color: transparent;
        -webkit-background-clip: text;
        background-clip: text;
        animation: shimmer 3s linear infinite;
      }
      .loader-bar {
        animation: loading 2s ease-in-out infinite;
      }
      @keyframes loading {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0); }
        100% { transform: translateX(100%); }
      }
    `}</style>
    
    <div className="relative logo-anim">
      <div className="absolute -inset-20 bg-zgold-500/10 rounded-full blur-[80px] animate-pulse"></div>
      <h1 className="relative text-6xl md:text-8xl font-bold tracking-tighter text-white select-none">
        Zi<span className="gold-shimmer">FÓLIO</span>
      </h1>
    </div>

    <div className="mt-8 text-anim flex flex-col items-center gap-4">
      <p className="text-gray-500 text-xs md:text-sm tracking-[0.4em] uppercase font-medium">
        Gestão de Carteiras
      </p>
      <div className="w-24 h-0.5 bg-zblack-800 rounded-full overflow-hidden">
        <div className="w-full h-full bg-zgold-500 loader-bar"></div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Premium Modal State
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  // Initialization Effect
  useEffect(() => {
    // 1. Attempt to restore session
    const storedSession = db.getSession();
    if (storedSession) {
      setCurrentUser(storedSession);
    }

    // 2. Splash screen timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800); // 2.8 seconds splash duration

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    db.saveSession(user); // Persist login
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    db.clearSession(); // Clear persistence
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleUpdateUser = (updatedUser: User) => {
    db.updateUser(updatedUser);
    setCurrentUser(updatedUser);
    // db.updateUser already updates the session if needed, but explicit is fine too
  };

  const handleUpgradeToPremium = () => {
    if (!currentUser) return;
    setIsProcessingUpgrade(true);

    setTimeout(() => {
      try {
        const upgradedUser = db.upgradeToPremium(currentUser.id);
        setCurrentUser(upgradedUser); // State update
        setUpgradeSuccess(true);
        setIsProcessingUpgrade(false);
        
        setTimeout(() => {
          setIsPremiumModalOpen(false);
          setUpgradeSuccess(false);
        }, 2500);
      } catch (error) {
        console.error("Upgrade failed", error);
        setIsProcessingUpgrade(false);
      }
    }, 1500);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim() || !currentUser) return;

    db.saveFeedback({
      userId: currentUser.id,
      type: feedbackType,
      message: feedbackMessage
    });

    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setIsFeedbackOpen(false);
      setFeedbackMessage('');
      setFeedbackType('suggestion');
    }, 3000);
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => {
    const isActive = location.pathname.startsWith(path);
    return (
      <button
        onClick={() => {
          navigate(path);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-zgold-500 text-black font-semibold shadow-lg shadow-zgold-500/20' 
            : 'text-gray-400 hover:bg-zblack-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  // 1. Show Splash Screen first
  if (showSplash) {
    return <SplashScreen />;
  }

  // 2. Auth Guard
  if (!currentUser) {
      return (
        <Routes>
           <Route path="/login" element={<Login onLogin={handleLogin} />} />
           <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
  }

  return (
    <div className="min-h-screen bg-zblack-950 text-gray-200 flex flex-col md:flex-row font-sans selection:bg-zgold-500 selection:text-black animate-in fade-in duration-500">
      
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-6 bg-zblack-950 sticky top-0 z-50 border-b border-zblack-800">
        <div className="text-xl font-bold tracking-tighter text-white">
          Zi<span className="text-zgold-500">FÓLIO</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zblack-900 border-r border-zblack-800 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col justify-between p-6
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          <div className="hidden md:block mb-10 mt-2">
            <h1 className="text-2xl font-bold tracking-tighter text-white">
              Zi<span className="text-zgold-500">FÓLIO</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Gestão de Carteiras BODIVA</p>
          </div>

          <div className="flex items-center space-x-3 mb-8 p-4 bg-zblack-800/50 rounded-2xl border border-zblack-800">
             <div className="w-10 h-10 rounded-full bg-zgold-500 text-black flex items-center justify-center font-bold text-lg border-2 border-zgold-400 overflow-hidden shrink-0">
               {currentUser.photoUrl ? (
                 <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" />
               ) : (
                 currentUser.name.charAt(0)
               )}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
               <div className="flex items-center gap-1">
                 <p className="text-xs text-gray-500 truncate">Investidor {currentUser.plan || 'Free'}</p>
                 {currentUser.plan === 'Premium' && <Crown size={10} className="text-zgold-500" />}
               </div>
             </div>
          </div>

          <nav className="space-y-2">
            <NavItem path="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
            <NavItem path="/assets" icon={Wallet} label="Meus Ativos" />
            <NavItem path="/simulator" icon={Calculator} label="Simulador" />
            <NavItem path="/news" icon={Newspaper} label="Notícias" />
            <NavItem path="/profile" icon={UserIcon} label="Perfil" />
          </nav>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center space-x-3 w-full p-3 rounded-xl text-gray-400 hover:bg-zblack-800 hover:text-zgold-500 transition-colors"
          >
            <MessageSquarePlus size={20} />
            <span>Feedback</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>

          <div className="pt-6 px-2 text-xs text-gray-600 text-center leading-relaxed border-t border-zblack-800/50 mt-2">
            <p>© {new Date().getFullYear()} ZiFÓLIO.</p>
            <p>Todos os direitos reservados.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 h-screen">
        <div className="max-w-5xl mx-auto pb-20 md:pb-0">
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={currentUser} onOpenPremium={() => setIsPremiumModalOpen(true)} />} />
            <Route path="/assets" element={<Assets user={currentUser} onOpenPremium={() => setIsPremiumModalOpen(true)} />} />
            <Route path="/simulator" element={<Simulator user={currentUser} onOpenPremium={() => setIsPremiumModalOpen(true)} />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/profile" element={<Profile user={currentUser} onUpdateUser={handleUpdateUser} onOpenPremium={() => setIsPremiumModalOpen(true)} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zblack-900 border border-zblack-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsFeedbackOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-zblack-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquarePlus className="text-zgold-500" /> 
                Enviar Feedback
              </h3>
              <p className="text-sm text-gray-400">
                Ajude-nos a melhorar o ZiFÓLIO. Envie sugestões ou reporte problemas.
              </p>
            </div>

            {feedbackSent ? (
               <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                 <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                   <Check size={32} />
                 </div>
                 <h4 className="text-lg font-bold text-white">Obrigado!</h4>
                 <p className="text-gray-400">Seu feedback foi recebido com sucesso!</p>
               </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Tipo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['suggestion', 'bug', 'other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFeedbackType(type as any)}
                        className={`py-2 px-1 rounded-lg text-xs font-medium capitalize transition-all ${
                          feedbackType === type 
                            ? 'bg-zgold-500 text-black font-bold shadow-lg shadow-zgold-500/20' 
                            : 'bg-zblack-950 text-gray-400 border border-zblack-800 hover:border-zgold-500/50'
                        }`}
                      >
                        {type === 'suggestion' ? 'Sugestão' : type === 'bug' ? 'Problema' : 'Outro'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Mensagem</label>
                  <textarea 
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600 min-h-[120px] resize-none"
                    placeholder="Escreva aqui o seu feedback..."
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <Send size={18} />
                  <span>Enviar</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PREMIUM UPGRADE MODAL */}
      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           {upgradeSuccess && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>}

           <div className="bg-gradient-to-br from-zblack-900 to-zblack-950 border border-zgold-500/30 w-full max-w-lg rounded-3xl p-0 shadow-2xl relative overflow-hidden flex flex-col">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zgold-500 to-transparent"></div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-zgold-500/10 rounded-full blur-3xl"></div>

              <div className="p-8 relative z-10">
                <button 
                  onClick={() => setIsPremiumModalOpen(false)} 
                  className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-zblack-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-zgold-400 to-zgold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-zgold-500/30 transform rotate-3">
                    <Crown size={32} className="text-black" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">ZiFÓLIO <span className="text-zgold-500">Premium</span></h2>
                  <p className="text-gray-400">Desbloqueie todo o potencial da sua carteira.</p>
                </div>

                {upgradeSuccess ? (
                   <div className="py-12 text-center animate-in zoom-in duration-500 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-zgold-400 to-zgold-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-zgold-500/30">
                      <Crown size={48} className="text-black" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Premium!</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">Agora você tem acesso ilimitado a todos os recursos do ZiFÓLIO.</p>
                 </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-4 bg-zblack-800/50 p-3 rounded-xl border border-zblack-800">
                        <div className="p-2 bg-zgold-500/10 text-zgold-500 rounded-lg">
                          <Zap size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">Simulador Avançado</h4>
                          <p className="text-xs text-gray-500">Meta Alvo e Projeções detalhadas.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-zblack-800/50 p-3 rounded-xl border border-zblack-800">
                         <div className="p-2 bg-zgold-500/10 text-zgold-500 rounded-lg">
                          <Star size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">Ativos Ilimitados</h4>
                          <p className="text-xs text-gray-500">Gerencie carteiras complexas sem limites.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-zblack-800/50 p-3 rounded-xl border border-zblack-800">
                         <div className="p-2 bg-zgold-500/10 text-zgold-500 rounded-lg">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">Alertas Prioritários</h4>
                          <p className="text-xs text-gray-500">Notificações instantâneas de mercado.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zblack-950 rounded-xl p-4 mb-6 border border-zblack-800 flex justify-between items-center">
                       <div>
                         <p className="text-gray-400 text-xs">Preço Anual</p>
                         <p className="text-white font-bold text-lg">50.000 Kz</p>
                       </div>
                       <span className="bg-zgold-500/20 text-zgold-500 text-xs font-bold px-2 py-1 rounded">
                         -20% OFF
                       </span>
                    </div>

                    <button 
                      onClick={handleUpgradeToPremium}
                      disabled={isProcessingUpgrade}
                      className="w-full bg-gradient-to-r from-zgold-500 to-zgold-600 hover:from-zgold-400 hover:to-zgold-500 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-zgold-500/20 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isProcessingUpgrade ? (
                        <>Processing...</>
                      ) : (
                        <>
                           Tornar-se Premium Agora <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-4">
                      Pagamento seguro (Simulado). Cancele a qualquer momento.
                    </p>
                  </>
                )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;