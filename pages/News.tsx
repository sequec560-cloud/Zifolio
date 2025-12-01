import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Globe, ExternalLink, Filter, ArrowRight, Minus, Calendar, User, Search, X } from 'lucide-react';
import { MOCK_NEWS, MARKET_INDICATORS } from '../constants';
import { NewsArticle } from '../types';

interface NewsProps {
  onArticleClick: (article: NewsArticle) => void;
}

const News: React.FC<NewsProps> = ({ onArticleClick }) => {
  const [filter, setFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const categories = ['Todos', 'Mercado', 'Empresas', 'Regulação', 'Global'];

  const filteredNews = MOCK_NEWS.filter(n => {
    // Category Filter
    const matchesCategory = filter === 'Todos' || n.category === filter;
    
    // Search Filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = n.title.toLowerCase().includes(searchLower) || 
                          n.summary.toLowerCase().includes(searchLower);
    
    // Date Range Filter
    const matchesDate = (!startDate || n.publishedAt >= startDate) &&
                        (!endDate || n.publishedAt <= endDate);
                        
    return matchesCategory && matchesSearch && matchesDate;
  });

  // Triple the indicators to ensure smooth infinite scrolling on wider screens
  const tickerItems = [...MARKET_INDICATORS, ...MARKET_INDICATORS, ...MARKET_INDICATORS];

  // Featured article logic: Only show featured layout if not filtering by specific criteria
  const isFiltering = searchQuery.length > 0 || startDate !== '' || endDate !== '';
  const featuredArticle = (!isFiltering && filter === 'Todos') ? MOCK_NEWS[0] : null;
  
  // If we have a featured article, exclude it from the list. Otherwise show all matches.
  const listNews = featuredArticle ? filteredNews.filter(n => n.id !== featuredArticle.id) : filteredNews;

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

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
        /* Style date inputs for dark mode */
        input[type="date"] {
          color-scheme: dark;
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

      {/* Controls: Search, Date Filter & Category Tabs */}
      <div className="space-y-4">
        
        {/* Top Row: Search and Date Inputs */}
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full lg:w-96 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar notícias..." 
              className="w-full bg-zblack-900 border border-zblack-800 rounded-2xl py-3 pl-12 pr-10 text-white focus:outline-none focus:border-zgold-500 transition-colors placeholder-gray-600"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 rounded-full hover:bg-zblack-800 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-1 flex-col sm:flex-row gap-2 bg-zblack-900 border border-zblack-800 rounded-2xl p-2 items-center">
             <div className="flex items-center gap-2 w-full">
               <span className="text-xs text-gray-500 font-medium ml-2">De</span>
               <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-zblack-950 border border-zblack-800 text-gray-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-zgold-500 w-full"
               />
             </div>
             <div className="hidden sm:block text-gray-600">-</div>
             <div className="flex items-center gap-2 w-full">
               <span className="text-xs text-gray-500 font-medium ml-2 sm:ml-0">Até</span>
               <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-zblack-950 border border-zblack-800 text-gray-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-zgold-500 w-full"
               />
             </div>
             {(startDate || endDate) && (
               <button 
                onClick={clearDateFilter}
                className="p-2 hover:bg-zblack-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                title="Limpar datas"
               >
                 <X size={16} />
               </button>
             )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-3 pb-2 md:pb-0 scrollbar-hide w-full p-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                filter === cat 
                  ? 'bg-zblack-950 text-zgold-500 border-zgold-500 shadow-[0_0_20px_rgba(240,152,5,0.2)] transform scale-105' 
                  : 'bg-zblack-900/50 text-gray-500 border-zblack-800 hover:bg-zblack-900 hover:text-gray-300'
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
          className="relative h-[400px] w-full bg-zblack-900 rounded-3xl overflow-hidden cursor-pointer group border border-zblack-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-zgold-500/20 transition-all duration-500 ease-out"
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
              className="group bg-zblack-900 border border-zblack-800 rounded-3xl overflow-hidden hover:border-zgold-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-zgold-500/10 transition-all duration-400 ease-out flex flex-col cursor-pointer h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
          <p className="text-gray-400">Tente ajustar seus filtros de pesquisa ou datas.</p>
        </div>
      )}
    </div>
  );
};

export default News;