import React, { useState } from 'react';
import { ArrowRight, UserPlus, Mail, Key, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/db';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        const user = db.login(email, password);
        onLogin(user);
      } else if (mode === 'register') {
        const user = db.createUser({ name, email, password, phone });
        onLogin(user);
      } else {
        if (db.checkEmailExists(email)) setSuccess('Email de recuperação enviado!');
        else setError('Email não encontrado.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = () => {
    onLogin(db.loginWithGoogle('demo.google@gmail.com', 'Google User', 'https://ui-avatars.com/api/?name=Google+User&background=random'));
  };

  return (
    <div className="min-h-screen bg-[#f9f9fd] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-zblue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-zblue-500/10 rounded-full blur-[80px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tighter">Zi<span className="text-zblue-500">FÓLIO</span></h1>
          <p className="text-slate-500">Sua carteira BODIVA inteligente.</p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm"><AlertCircle size={16}/>{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl flex items-center gap-2 text-sm"><CheckCircle size={16}/>{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-500">Nome</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-zblue-500" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Telefone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-zblue-500" required />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-slate-500">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-zblue-500" required />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between mb-1">
                   <label className="text-sm font-medium text-slate-500">Senha</label>
                   {mode === 'login' && <button type="button" onClick={() => setMode('forgot')} className="text-xs text-zblue-600 font-bold hover:underline">Esqueceu?</button>}
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-zblue-500" required />
              </div>
            )}

            <button type="submit" className="w-full bg-zblue-600 hover:bg-zblue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-zblue-500/20 flex items-center justify-center gap-2 mt-2 transition-transform active:scale-95">
               {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Recuperar'} {mode !== 'forgot' && <ArrowRight size={18}/>}
            </button>
          </form>

          {mode === 'login' && (
            <button onClick={handleGoogle} className="mt-4 w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50">
               <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg> Google
            </button>
          )}
        </div>

        <div className="text-center mt-6">
           {mode === 'login' && <button onClick={() => setMode('register')} className="text-slate-500 text-sm">Não tem conta? <span className="text-zblue-600 font-bold">Criar grátis</span></button>}
           {mode === 'register' && <button onClick={() => setMode('login')} className="text-slate-500 text-sm">Já tem conta? <span className="text-zblue-600 font-bold">Login</span></button>}
           {mode === 'forgot' && <button onClick={() => setMode('login')} className="text-slate-500 text-sm flex items-center justify-center gap-1"><ArrowLeft size={14}/> Voltar</button>}
        </div>
      </div>
    </div>
  );
};

export default Login;