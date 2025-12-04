import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, User, Share2, Bookmark, Clock, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import { MOCK_NEWS } from '../constants';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    // Find article by ID from the mock data
    const found = MOCK_NEWS.find(n => n.id === id);
    if (found) {
        setArticle(found);
    } else {
        // Handle not found
        navigate('/news'); 
    }
  }, [id, navigate]);

  if (!article) return null;

  // Get related articles (exclude current, take 2 random)
  const relatedNews = MOCK_NEWS
    .filter(n => n.id !== article.id)
    .slice(0, 2);

  return (
    <div className="min-h-full">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-enter {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: opacity, transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-enter {
            animation: none;
            opacity: 1;
          }
        }
        .delay-0 { animation-delay: 0ms; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>

      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-6 animate-enter delay-0">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <Bookmark size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-200 animate-enter delay-100 group">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
               <span className="bg-zblue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                 {article.category}
               </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          {/* Title Section */}
          <div className="animate-enter delay-200">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-b border-slate-200 pb-6 mb-6">
              <div className="flex items-center gap-2">
                <User size={16} className="text-zblue-500" />
                <span className="font-medium text-slate-700">{article.source}</span>
              </div>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{article.date}</span>
              </div>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>3 min de leitura</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none text-slate-600 animate-enter delay-300 leading-relaxed">
            {article.content ? (
              article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-slate-400 italic">Conteúdo completo indisponível.</p>
            )}
          </div>
        </div>

        {/* Sidebar / Related */}
        <div className="space-y-6 animate-enter delay-400">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl sticky top-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 text-lg border-b border-slate-100 pb-4">Relacionados</h3>
            
            <div className="space-y-6">
              {relatedNews.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  <div className="relative h-32 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                       <span className="text-[10px] text-zblue-600 font-bold uppercase tracking-wider">{item.category}</span>
                       <span className="text-[10px] text-slate-400">• {item.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-zblue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/news')}
              className="w-full mt-8 py-3.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              Ver mais notícias <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsDetail;