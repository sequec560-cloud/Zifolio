import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { MOCK_NEWS } from '../constants';
import { NewsArticle } from '../types';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const found = MOCK_NEWS.find(n => n.id === id);
    if (found) setArticle(found);
    else navigate('/news');
  }, [id, navigate]);

  if (!article) return null;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 bg-white px-4 py-2 rounded-xl border border-slate-200 w-fit"><ArrowLeft size={20}/> Voltar</button>
       
       <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="h-[300px] md:h-[400px] w-full relative">
             <img src={article.imageUrl} alt="" className="w-full h-full object-cover"/>
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="bg-zblue-600 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">{article.category}</span>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">{article.title}</h1>
             </div>
          </div>
          
          <div className="p-8 md:p-12">
             <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-6">
                <span className="flex items-center gap-2 font-bold text-slate-700"><User size={16} className="text-zblue-500"/> {article.source}</span>
                <span className="flex items-center gap-2"><Calendar size={16}/> {article.date}</span>
                <span className="flex items-center gap-2"><Clock size={16}/> 3 min leitura</span>
             </div>
             
             <div className="prose prose-lg text-slate-600 max-w-none">
                {article.content ? article.content.split('\n\n').map((p,i)=><p key={i} className="mb-4 leading-relaxed">{p}</p>) : <p>{article.summary}</p>}
             </div>
          </div>
       </div>
    </div>
  );
};

export default NewsDetail;