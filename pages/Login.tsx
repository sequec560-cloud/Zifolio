import React, { useState } from 'react';
import { ArrowRight, UserPlus, LogIn, AlertCircle, Mail, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/db';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = db.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const newUser = db.createUser({ name, email, password, phone });
      onLogin(newUser);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Check if user exists first
    const exists = db.checkEmailExists(email);
    if (!exists) {
      setError('Este email não está registado no sistema.');
      return;
    }

    // Simulate sending email
    setSuccessMsg('Link de recuperação enviado! Verifique o seu email.');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      db.resetPassword(email, newPassword);
      setSuccessMsg('Senha atualizada com sucesso!');
      setTimeout(() => {
        setAuthMode('login');
        setSuccessMsg(null);
        setPassword(''); 
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
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
          <p className="text-gray-400">
            {authMode === 'register' ? 'Crie a sua carteira de investimentos inteligente.' : 
             authMode === 'forgot' || authMode === 'reset' ? 'Recupere o acesso à sua conta.' :
             'A tua carteira de investimentos, clara como nunca.'}
          </p>
        </div>

        <div className="bg-zblack-900 border border-zblack-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-500 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-2 text-green-500 text-sm animate-in slide-in-from-top-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                  <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-zgold-500 hover:text-zgold-400">Esqueceu a senha?</button>
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
                className="w-full bg-zgold-500 hover:bg-zgold-400 text-black font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-zgold-500/20 transform active:scale-95 mt-2"
              >
                <span>Entrar na Carteira</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                  placeholder="Seu nome"
                  required
                />
              </div>

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
                <label className="block text-sm font-medium text-gray-400 mb-2">Telefone</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zblack-950 border border-zblack-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                  placeholder="+244"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
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
                className="w-full bg-zgold-500 hover:bg-zgold-400 text-black font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-zgold-500/20 transform active:scale-95 mt-2"
              >
                <span>Criar Conta Gratuita</span>
                <UserPlus size={18} />
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {!successMsg ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-sm text-gray-400 mb-4">
                    Insira o seu email registado para receber um link de redefinição de senha.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zblack-950 border border-zblack-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                        placeholder="investidor@bodiva.ao"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors mt-2"
                  >
                    Enviar Link de Recuperação
                  </button>
                </form>
              ) : (
                <div className="py-4 text-center">
                   <p className="text-sm text-gray-400 mb-6">
                     Se o email <strong>{email}</strong> existir na nossa base de dados, receberá instruções em breve.
                   </p>
                   {/* DEMO PURPOSES ONLY */}
                   <button 
                     onClick={() => switchMode('reset')}
                     className="w-full bg-zgold-500/20 text-zgold-500 border border-zgold-500/50 hover:bg-zgold-500/30 font-bold py-3 rounded-xl transition-colors text-sm"
                   >
                     (Demo) Simular Clique no Email
                   </button>
                </div>
              )}
            </div>
          )}

          {/* RESET PASSWORD FORM */}
          {authMode === 'reset' && (
             <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm text-gray-400 mb-4">
                Crie uma nova senha segura para sua conta.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nova Senha</label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zblack-950 border border-zblack-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar Senha</label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zblack-950 border border-zblack-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-zgold-500 hover:bg-zgold-400 text-black font-bold py-4 rounded-xl transition-all duration-300 shadow-lg mt-2"
              >
                Atualizar Senha
              </button>
            </form>
          )}

          {/* Social / Divider (Only on Login/Register) */}
          {(authMode === 'login' || authMode === 'register') && (
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
          )}
        </div>
        
        {/* Footer Navigation */}
        <div className="text-center mt-6">
           {authMode === 'login' && (
             <button onClick={() => switchMode('register')} className="text-gray-500 text-sm hover:text-white transition-colors">
               Não tem conta? <span className="text-zgold-500 font-medium">Registar agora</span>
             </button>
           )}
           {authMode === 'register' && (
             <button onClick={() => switchMode('login')} className="text-gray-500 text-sm hover:text-white transition-colors">
               Já tem conta? <span className="text-zgold-500 font-medium">Fazer Login</span>
             </button>
           )}
           {(authMode === 'forgot' || authMode === 'reset') && (
             <button onClick={() => switchMode('login')} className="text-gray-500 text-sm hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
               <ArrowLeft size={14} /> Voltar ao Login
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default Login;