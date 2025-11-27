import React from 'react';
import { ArrowLeft, Calendar, User, Share2, Bookmark, Clock, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../types';
import { MOCK_NEWS } from '../constants';

interface NewsDetailProps {
  article: NewsArticle;
  onBack: () => void;
  onArticleClick: (article: NewsArticle) => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ article, onBack, onArticleClick }) => {
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
          animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
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
        .delay-100 { animation-delay: 50ms; }
        .delay-200 { animation-delay: 100ms; }
        .delay-300 { animation-delay: 150ms; }
        .delay-400 { animation-delay: 200ms; }
      `}</style>

      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-6 animate-enter delay-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-zblack-900 hover:bg-zblack-800 px-4 py-2 rounded-xl border border-zblack-800"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-zblack-800 rounded-lg transition-colors">
            <Bookmark size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-zblack-800 rounded-lg transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/50 animate-enter delay-100">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
               <span className="bg-zgold-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                 {article.category}
               </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zblack-950 via-transparent to-transparent opacity-80" />
          </div>

          {/* Title Section */}
          <div className="animate-enter delay-200">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-zblack-800 pb-6 mb-6">
              <div className="flex items-center gap-2">
                <User size={16} className="text-zgold-500" />
                <span className="font-medium text-gray-300">{article.source}</span>
              </div>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{article.date}</span>
              </div>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>3 min de leitura</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 animate-enter delay-300">
            {article.content ? (
              article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">Conteúdo completo indisponível.</p>
            )}
          </div>
        </div>

        {/* Sidebar / Related */}
        <div className="space-y-6 animate-enter delay-400">
          <div className="bg-zblack-900 border border-zblack-800 p-6 rounded-3xl sticky top-6">
            <h3 className="font-bold text-white mb-6 text-lg">Relacionados</h3>
            
            <div className="space-y-4">
              {relatedNews.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onArticleClick(item)}
                  className="group cursor-pointer"
                >
                  <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] text-zgold-500 font-bold uppercase">{item.category}</span>
                     <span className="text-[10px] text-gray-500">• {item.date}</span>
                  </div>
                  <h4 className="font-bold text-white leading-snug group-hover:text-zgold-500 transition-colors">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>

            <button 
              onClick={onBack}
              className="w-full mt-6 py-3 border border-zblack-800 rounded-xl text-gray-400 hover:text-white hover:bg-zblack-800 transition-colors flex items-center justify-center gap-2 text-sm"
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