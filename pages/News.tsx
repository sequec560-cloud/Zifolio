import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Globe, ExternalLink, Filter, ArrowRight, Minus, Calendar, User, Search, X } from 'lucide-react';
import { MOCK_NEWS, MARKET_INDICATORS } from '../constants';
import { NewsArticle } from '../types';
import { useNavigate } from 'react-router-dom';

const News: React.FC = () => {
  const navigate = useNavigate();
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

  const onArticleClick = (article: NewsArticle) => {
    navigate(`/news/${article.id}`);
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
        /* Style date inputs */
        input[type="date"] {
          color-scheme: light;
        }
      `}</style>

      {/* Header & Market Ticker */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mercado & Notícias</h2>
          <span className="text-xs text-slate-500 hidden md:block">Dados em tempo real (15min delay)</span>
        </div>
        
        {/* Ticker Container */}
        <div className="relative w-full overflow-hidden bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm group">
          {/* Gradient Masks for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          
          <div className="flex animate-scroll w-max">
            {tickerItems.map((indicator, idx) => {
              const isNegative = !indicator.isPositive;
              const isNeutral = indicator.change === 0;
              const uniqueKey = `${indicator.name}-${idx}`;

              return (
                <div key={uniqueKey} className="w-[200px] px-2">
                  <div className="bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-zblue-200 rounded-xl p-3 transition-all duration-300 group/card cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 group-hover/card:text-slate-700 transition-colors">
                        {indicator.name}
                      </span>
                      {/* Visual Trend Line (Simplified) */}
                      <div className={`h-1 w-6 rounded-full ${isNeutral ? 'bg-slate-200' : isNegative ? 'bg-red-200' : 'bg-green-200'}`}>
                         <div className={`h-full rounded-full ${isNeutral ? 'bg-slate-400 w-full' : isNegative ? 'bg-red-400 w-2/3' : 'bg-green-400 w-full'}`}></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-slate-900 font-mono tracking-tight leading-none">
                        {indicator.value}
                      </span>
                      <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        isNeutral 
                          ? 'text-slate-500 bg-slate-200/50 border-slate-200' 
                          : isNegative 
                            ? 'text-red-500 bg-red-50 border-red-100' 
                            : 'text-green-600 bg-green-50 border-green-100'
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar notícias..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-10 text-slate-900 focus:outline-none focus:border-zblue-500 transition-colors placeholder-slate-400 shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-1 flex-col sm:flex-row gap-2 bg-white border border-slate-200 rounded-2xl p-2 items-center shadow-sm">
             <div className="flex items-center gap-2 w-full">
               <span className="text-xs text-slate-500 font-medium ml-2">De</span>
               <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-3 py-2 outline-none focus:border-zblue-500 w-full"
               />
             </div>
             <div className="hidden sm:block text-slate-400">-</div>
             <div className="flex items-center gap-2 w-full">
               <span className="text-xs text-slate-500 font-medium ml-2 sm:ml-0">Até</span>
               <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-3 py-2 outline-none focus:border-zblue-500 w-full"
               />
             </div>
             {(startDate || endDate) && (
               <button 
                onClick={clearDateFilter}
                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
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
                  ? 'bg-zblue-600 text-white border-zblue-600 shadow-md transform scale-105' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
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
          className="relative h-[400px] w-full bg-slate-900 rounded-3xl overflow-hidden cursor-pointer group border border-slate-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-zblue-500/10 transition-all duration-500 ease-out"
        >
          <img 
            src={featuredArticle.imageUrl} 
            alt={featuredArticle.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-white bg-zblue-600 rounded-full">
              Destaque • {featuredArticle.category}
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-zblue-200 transition-colors shadow-sm">
              {featuredArticle.title}
            </h3>
            <p className="text-slate-200 mb-4 line-clamp-2 drop-shadow-md">
              {featuredArticle.summary}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300 font-medium">
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
              className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-zblue-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-400 ease-out flex flex-col cursor-pointer h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    {news.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                 <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
                   <span className="text-zblue-600 font-bold">{news.source}</span>
                   <span>•</span>
                   <span>{news.date}</span>
                 </div>
                 
                 <h4 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-zblue-600 transition-colors">
                   {news.title}
                 </h4>
                 
                 <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-grow">
                   {news.summary}
                 </p>
                 
                 <div className="flex items-center text-sm text-zblue-600 font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                   Ler completo <ArrowRight size={16} className="ml-1" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-slate-500">Tente ajustar seus filtros de pesquisa ou datas.</p>
        </div>
      )}
    </div>
  );
};

export default News;