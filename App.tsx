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
  Check
} from 'lucide-react';
import { ViewState, NewsArticle, User } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Simulator from './pages/Simulator';
import Profile from './pages/Profile';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import { db } from './services/db';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setIsMobileMenuOpen(false);
  };

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setCurrentView('news-detail');
  };

  const handleUpdateUser = (updatedUser: User) => {
    db.updateUser(updatedUser);
    setCurrentUser(updatedUser);
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
    }, 2000);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        // If clicking News nav item, reset to main news view
        if (view === 'news') {
          setSelectedArticle(null);
        }
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 ${
        (currentView === view || (view === 'news' && currentView === 'news-detail'))
          ? 'bg-zgold-500 text-black font-semibold shadow-lg shadow-zgold-500/20' 
          : 'text-gray-400 hover:bg-zblack-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  if (currentView === 'login' || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zblack-950 text-gray-200 flex flex-col md:flex-row font-sans selection:bg-zgold-500 selection:text-black">
      
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-6 bg-zblack-950 sticky top-0 z-50 border-b border-zblack-800">
        <div className="text-xl font-bold tracking-tighter text-white">
          Zi<span className="text-zgold-500">FÓLIO</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
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
             <div className="w-10 h-10 rounded-full bg-zgold-500 text-black flex items-center justify-center font-bold text-lg border-2 border-zgold-400">
               {currentUser.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
               <p className="text-xs text-gray-500 truncate">Investidor {currentUser.plan || 'Free'}</p>
             </div>
          </div>

          <nav className="space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Visão Geral" />
            <NavItem view="assets" icon={Wallet} label="Meus Ativos" />
            <NavItem view="simulator" icon={Calculator} label="Simulador" />
            <NavItem view="news" icon={Newspaper} label="Notícias" />
            <NavItem view="profile" icon={UserIcon} label="Perfil" />
          </nav>
        </div>

        <div className="space-y-2">
          {/* Feedback Button */}
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
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 h-screen">
        <div className="max-w-5xl mx-auto pb-20 md:pb-0">
          {currentView === 'dashboard' && <Dashboard user={currentUser} />}
          {currentView === 'assets' && <Assets user={currentUser} />}
          {currentView === 'simulator' && <Simulator user={currentUser} />}
          {currentView === 'news' && <News onArticleClick={handleArticleClick} />}
          {currentView === 'news-detail' && selectedArticle && (
            <NewsDetail 
              article={selectedArticle} 
              onBack={() => setCurrentView('news')}
              onArticleClick={handleArticleClick}
            />
          )}
          {currentView === 'profile' && <Profile user={currentUser} onUpdateUser={handleUpdateUser} />}
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
                 <p className="text-gray-400">Seu feedback foi recebido com sucesso.</p>
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
    </div>
  );
};

export default App;