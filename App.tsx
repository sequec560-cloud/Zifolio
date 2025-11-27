import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Calculator, 
  User, 
  LogOut, 
  Menu,
  X,
  Newspaper
} from 'lucide-react';
import { ViewState, NewsArticle } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Simulator from './pages/Simulator';
import Profile from './pages/Profile';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentView('login');
    setIsMobileMenuOpen(false);
  };

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setCurrentView('news-detail');
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

  if (currentView === 'login') {
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
             <img src="https://picsum.photos/100/100" alt="User" className="w-10 h-10 rounded-full border-2 border-zgold-500" />
             <div>
               <p className="text-sm font-semibold text-white">Methew White</p>
               <p className="text-xs text-gray-500">Investidor Premium</p>
             </div>
          </div>

          <nav className="space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Visão Geral" />
            <NavItem view="assets" icon={Wallet} label="Meus Ativos" />
            <NavItem view="simulator" icon={Calculator} label="Simulador" />
            <NavItem view="news" icon={Newspaper} label="Notícias" />
            <NavItem view="profile" icon={User} label="Perfil" />
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 h-screen">
        <div className="max-w-5xl mx-auto pb-20 md:pb-0">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'assets' && <Assets />}
          {currentView === 'simulator' && <Simulator />}
          {currentView === 'news' && <News onArticleClick={handleArticleClick} />}
          {currentView === 'news-detail' && selectedArticle && (
            <NewsDetail 
              article={selectedArticle} 
              onBack={() => setCurrentView('news')}
              onArticleClick={handleArticleClick}
            />
          )}
          {currentView === 'profile' && <Profile />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;