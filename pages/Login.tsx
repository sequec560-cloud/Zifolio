import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    onLogin();
  };

  return (
    <div className="min-h-screen bg-zblack-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-zgold-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-zblack-800/50 rounded-full blur-[80px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">
            Zi<span className="text-zgold-500">FÓLIO</span>
          </h1>
          <p className="text-gray-400">A tua carteira de investimentos, clara como nunca.</p>
        </div>

        <div className="bg-zblack-900 border border-zblack-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                placeholder="investidor@bodiva.ao"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">Senha</label>
                <a href="#" className="text-xs text-zgold-500 hover:text-zgold-400">Esqueceu a senha?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-zgold-500 hover:bg-zgold-400 text-black font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-zgold-500/20 transform active:scale-95"
            >
              <span>Entrar na Carteira</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zblack-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zblack-900 text-gray-500">Ou continuar com</span>
              </div>
            </div>

            <button disabled className="mt-6 w-full bg-white text-black font-medium py-3 rounded-xl flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              <span>Google (Em breve)</span>
            </button>
          </div>
        </div>
        
        <p className="text-center mt-6 text-gray-500 text-sm">
          Não tem conta? <a href="#" className="text-zgold-500 font-medium">Registar agora</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
