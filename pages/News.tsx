import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Calendar, User } from 'lucide-react';
import { MOCK_NEWS } from '../constants';

const News: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  
  const filtered = MOCK_NEWS.filter(n => 
    (filter === 'Todos' || n.category === filter) && 
    (n.title.toLowerCase().includes(query.toLowerCase()) || n.summary.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold text-slate-900">Notícias</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-400" size={20}/>
            <input className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-zblue-500" placeholder="Pesquisar..." value={query} onChange={e=>setQuery(e.target.value)} />
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['Todos', 'Mercado', 'Empresas', 'Regulação'].map(c => (
               <button key={c} onClick={()=>setFilter(c)} className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap border ${filter===c ? 'bg-zblue-600 text-white border-zblue-600' : 'bg-white text-slate-500 border-slate-200'}`}>{c}</button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.map(n => (
            <div key={n.id} onClick={()=>navigate(`/news/${n.id}`)} className="bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group h-full flex flex-col">
               <div className="h-48 overflow-hidden relative">
                  <img src={n.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full">{n.category}</span>
               </div>
               <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-2 text-xs text-slate-400 mb-2">
                     <span className="font-bold text-zblue-600">{n.source}</span>•<span>{n.date}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 leading-snug group-hover:text-zblue-600 transition-colors">{n.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{n.summary}</p>
                  <div className="flex items-center text-zblue-600 font-bold text-sm">Ler mais <ArrowRight size={16} className="ml-1"/></div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default News;