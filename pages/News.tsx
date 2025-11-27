import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Globe, ExternalLink, Filter, ArrowRight, Minus, Calendar, User, Search } from 'lucide-react';
import { MOCK_NEWS, MARKET_INDICATORS } from '../constants';
import { NewsArticle } from '../types';

interface NewsProps {
  onArticleClick: (article: NewsArticle) => void;
}

const News: React.FC<NewsProps> = ({ onArticleClick }) => {
  const [filter, setFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = ['Todos', 'Mercado', 'Empresas', 'Regulação', 'Global'];

  const filteredNews = MOCK_NEWS.filter(n => {
    const matchesCategory = filter === 'Todos' || n.category === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = n.title.toLowerCase().includes(searchLower) || 
                          n.summary.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  // Triple the indicators to ensure smooth infinite scrolling on wider screens
  const tickerItems = [...MARKET_INDICATORS, ...MARKET_INDICATORS, ...MARKET_INDICATORS];

  // Featured article logic: Only show featured layout if not searching and viewing 'Todos'
  const isSearching = searchQuery.length > 0;
  const featuredArticle = (!isSearching && filter === 'Todos') ? MOCK_NEWS[0] : null;
  
  // If we have a featured article, exclude it from the list. Otherwise show all matches.
  const listNews = featuredArticle ? filteredNews.filter(n => n.id !== featuredArticle.id) : filteredNews;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Custom Styles for Marquee Animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header & Market Ticker */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold text-white tracking-tight">Mercado & Notícias</h2>
          <span className="text-xs text-gray-500 hidden md:block">Dados em tempo real (15min delay)</span>
        </div>
        
        {/* Ticker Container */}
        <div className="relative w-full overflow-hidden bg-zblack-900/50 border border-zblack-800 rounded-2xl p-1.5 backdrop-blur-sm group">
          {/* Gradient Masks for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zblack-950 via-zblack-950/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zblack-950 via-zblack-950/80 to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-scroll w-max">
            {tickerItems.map((indicator, idx) => {
              const isNegative = !indicator.isPositive;
              const isNeutral = indicator.change === 0;
              const uniqueKey = `${indicator.name}-${idx}`;

              return (
                <div key={uniqueKey} className="w-[200px] px-2">
                  <div className="bg-zblack-950 hover:bg-zblack-800 border border-zblack-800 hover:border-zgold-500/30 rounded-xl p-3 transition-all duration-300 group/card cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-gray-400 group-hover/card:text-gray-300 transition-colors">
                        {indicator.name}
                      </span>
                      {/* Visual Trend Line (Simplified) */}
                      <div className={`h-1 w-6 rounded-full ${isNeutral ? 'bg-gray-700' : isNegative ? 'bg-red-900' : 'bg-green-900'}`}>
                         <div className={`h-full rounded-full ${isNeutral ? 'bg-gray-500 w-full' : isNegative ? 'bg-red-500 w-2/3' : 'bg-green-500 w-full'}`}></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-white font-mono tracking-tight leading-none">
                        {indicator.value}
                      </span>
                      <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        isNeutral 
                          ? 'text-gray-400 bg-gray-400/5 border-gray-400/10' 
                          : isNegative 
                            ? 'text-red-400 bg-red-400/5 border-red-400/10' 
                            : 'text-green-400 bg-green-400/5 border-green-400/10'
                      }`}>
                        {isNeutral ? <Minus size={10} className="mr-1" /> : isNegative ? <TrendingDown size={10} className="mr-1" /> : <TrendingUp size={10} className="mr-1" />}
                        {Math.abs(indicator.change).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar notícias..." 
            className="w-full bg-zblack-900 border border-zblack-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-3 pb-2 md:pb-0 scrollbar-hide w-full md:w-auto p-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                filter === cat 
                  ? 'bg-zblack-800 text-zgold-500 border-zgold-500 shadow-[0_0_15px_rgba(240,152,5,0.15)] transform scale-105' 
                  : 'bg-zblack-900 text-gray-400 border-zblack-800 hover:border-gray-600 hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <div 
          onClick={() => onArticleClick(featuredArticle)}
          className="relative h-[400px] w-full bg-zblack-900 rounded-3xl overflow-hidden cursor-pointer group border border-zblack-800"
        >
          <img 
            src={featuredArticle.imageUrl} 
            alt={featuredArticle.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zblack-950 via-zblack-950/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-black bg-zgold-500 rounded-full">
              Destaque • {featuredArticle.category}
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-zgold-100 transition-colors">
              {featuredArticle.title}
            </h3>
            <p className="text-gray-300 mb-4 line-clamp-2">
              {featuredArticle.summary}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Globe size={14} /> {featuredArticle.source}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {featuredArticle.date}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* News Grid */}
      {listNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listNews.map((news) => (
            <div 
              key={news.id}
              onClick={() => onArticleClick(news)}
              className="group bg-zblack-900 border border-zblack-800 rounded-3xl overflow-hidden hover:border-zgold-500/30 transition-all duration-300 flex flex-col cursor-pointer h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full border border-white/10">
                    {news.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                 <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                   <span className="text-zgold-500 font-semibold">{news.source}</span>
                   <span>•</span>
                   <span>{news.date}</span>
                 </div>
                 
                 <h4 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-zgold-500 transition-colors">
                   {news.title}
                 </h4>
                 
                 <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-grow">
                   {news.summary}
                 </p>
                 
                 <div className="flex items-center text-sm text-zgold-500 font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                   Ler completo <ArrowRight size={16} className="ml-1" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zblack-900 border border-zblack-800 rounded-3xl">
          <div className="bg-zblack-950 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-500" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-400">Tente pesquisar por outros termos ou categorias.</p>
        </div>
      )}
    </div>
  );
};

export default News;