import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f9f9fd] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-zblue-500/5 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-zblue-500/10 rounded-full blur-[80px] animate-pulse-slow delay-1000" />

      {/* Main Logo Animation */}
      <div className="relative animate-slide-up z-10 flex flex-col items-center">
        {/* Glow Effect */}
        <div className="absolute -inset-20 bg-zblue-500/20 rounded-full blur-[80px] animate-pulse"></div>
        
        {/* Typography */}
        <h1 className="relative text-6xl md:text-9xl font-bold tracking-tighter text-slate-900 select-none">
          Zi<span className="text-transparent bg-clip-text bg-gradient-to-r from-zblue-500 to-zblue-300">FÓLIO</span>
        </h1>
        
        {/* Subtitle & Loader */}
        <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in delay-500">
          <p className="text-slate-400 text-sm md:text-base tracking-[0.5em] uppercase font-medium">Gestão de Carteiras</p>
          
          {/* Infinite Loading Bar */}
          <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-zblue-500 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
      
      {/* Animation Keyframes */}
      <style>{`
        @keyframes loading { 
          0% { transform: translateX(-100%); } 
          50% { transform: translateX(0); } 
          100% { transform: translateX(100%); } 
        }
      `}</style>
    </div>
  );
};

export default App;