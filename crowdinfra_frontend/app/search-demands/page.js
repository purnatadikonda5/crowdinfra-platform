'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Navbar from '../components/navbar'
import SearchDemandsMap from '../components/SearchDemandsMap'
import { Search, Filter, ThumbsUp, MapPin, User, Clock, ChevronRight, X, Zap, TrendingUp, Grid3X3, List, MessageSquare, ArrowRight, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'

const CATEGORIES = ['all', 'infrastructure', 'education', 'healthcare', 'transport', 'environment', 'other']
const CAT_GLOW = {
  infrastructure: '#3b82f6', education: '#8b5cf6', healthcare: '#ef4444',
  transport: '#f59e0b', environment: '#10b981', other: '#6b7280', all: '#06b6d4'
}

export default function SearchDemandsPage() {
  const [demands, setDemands] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedDemand, setSelectedDemand] = useState(null)
  const [voting, setVoting] = useState(null)
  const [pinPanel, setPinPanel] = useState(null)
  const scrollRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    axios.get(`${API}/api/demands`, { withCredentials: true })
      .then(r => { setDemands(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...demands]
    if (searchTerm) result = result.filter(d => d.title?.toLowerCase().includes(searchTerm.toLowerCase()) || d.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    if (category !== 'all') result = result.filter(d => d.category?.toLowerCase() === category)
    if (sortBy === 'votes') result.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFiltered(result)
  }, [demands, searchTerm, category, sortBy])

  const handleVote = async (id, e) => {
    e.preventDefault(); e.stopPropagation()
    if (voting === id) return
    setVoting(id)
    try {
      const res = await axios.post(`${API}/api/demands/${id}/vote`, {}, { withCredentials: true })
      setDemands(prev => prev.map(d => d.id === id ? res.data : d))
    } catch { /* needs login */ }
    finally { setVoting(null) }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #020817 0%, #0a0f2e 50%, #020c17 100%)' }}>
      <style>{`
        @keyframes scan { 0%{top:-100%} 100%{top:200%} }
        @keyframes fade-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-border { 0%,100%{box-shadow:0 0 15px #06b6d420} 50%{box-shadow:0 0 30px #06b6d440,0 0 60px #06b6d415} }
        @keyframes num-pop { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes slide-right { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes panel-in { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        .pin-panel { animation: panel-in 0.3s ease forwards; }
        .demand-card { animation: fade-in 0.5s ease forwards; animation-fill-mode: both; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .demand-card:hover { transform: translateY(-4px); }
        .cat-tab.active { color: white; }
        .vote-glow:hover { box-shadow: 0 0 20px currentColor; }
        .search-glow:focus-within { box-shadow: 0 0 0 1px #06b6d4, 0 0 20px #06b6d420; }
        ::-webkit-scrollbar { height: 4px; width: 4px; } ::-webkit-scrollbar-thumb { background: #06b6d440; border-radius: 2px; }
      `}</style>

      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-8 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, #06b6d410 0%, transparent 70%)', filter: 'blur(50px)' }} />
          <div style={{ position: 'absolute', top: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, #3b82f610 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5" style={{ color: '#06b6d4' }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#06b6d4' }}>Community Demands</span>
          </div>
          <h1 className="text-5xl font-black mb-2" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #67e8f9 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Browse Demands
          </h1>
          <p className="text-gray-400">Explore infrastructure demands raised by the community</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">

        {/* Search + Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative search-glow rounded-xl border border-white/10 transition-all">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search demands by keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white/5 rounded-xl text-sm focus:outline-none placeholder-gray-500"
              style={{ background: 'transparent' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            )}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none" style={{ background: 'rgba(2,8,23,0.8)' }}>
            <option value="newest" style={{ background: '#020817' }}>Newest First</option>
            <option value="votes" style={{ background: '#020817' }}>Most Voted</option>
          </select>
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            <button onClick={() => setViewMode('grid')} className="px-4 py-3 transition-all" style={{ background: viewMode === 'grid' ? '#06b6d420' : 'rgba(255,255,255,0.03)', color: viewMode === 'grid' ? '#06b6d4' : '#9ca3af' }}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className="px-4 py-3 transition-all" style={{ background: viewMode === 'list' ? '#06b6d420' : 'rgba(255,255,255,0.03)', color: viewMode === 'list' ? '#06b6d4' : '#9ca3af' }}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="cat-tab flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: category === cat ? `${CAT_GLOW[cat]}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${category === cat ? CAT_GLOW[cat] + '60' : 'rgba(255,255,255,0.08)'}`,
                color: category === cat ? CAT_GLOW[cat] : '#9ca3af',
                boxShadow: category === cat ? `0 0 15px ${CAT_GLOW[cat]}30` : 'none',
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              {cat !== 'all' && (
                <span className="ml-2 text-xs opacity-70">{demands.filter(d => d.category?.toLowerCase() === cat).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Map + Stats/Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-white/5" style={{ height: 360 }}>
            <SearchDemandsMap
              demands={filtered}
              selectedDemand={pinPanel || selectedDemand}
              onMarkerClick={(d) => { setPinPanel(d); setSelectedDemand(d) }}
            />
          </div>
          <div className="flex flex-col gap-4">
            {pinPanel ? (
              <PinPanel demand={pinPanel} onClose={() => setPinPanel(null)} onVote={handleVote} voting={voting} catColor={CAT_GLOW} router={router} />
            ) : (
              <>
                <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Demands" value={demands.length} color="#06b6d4" />
                <StatCard icon={<ThumbsUp className="w-5 h-5" />} label="Total Votes" value={demands.reduce((s, d) => s + (d.upvoteCount || 0), 0)} color="#8b5cf6" />
                <StatCard icon={<Filter className="w-5 h-5" />} label="Showing" value={filtered.length} color="#10b981" />
                <div className="p-4 rounded-2xl border border-white/5 text-center text-xs text-gray-500" style={{ background: 'rgba(6,182,212,0.03)' }}>
                  <MapPin className="w-4 h-4 mx-auto mb-2 opacity-40" />
                  Click a pin on the map to see demand details
                </div>
              </>
            )}
          </div>
        </div>

        {/* Demand Cards */}
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-white/5 animate-pulse" style={{ height: 200, background: 'rgba(255,255,255,0.02)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-gray-400 text-lg">No demands found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map((demand, idx) => {
              const catColor = CAT_GLOW[demand.category?.toLowerCase()] || '#6b7280'
              return (
                <Link key={demand.id} href={`/viewrequest?id=${demand.id}`}>
                  <div
                    className="demand-card p-5 rounded-3xl border cursor-pointer relative overflow-hidden group"
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      background: 'rgba(255,255,255,0.02)',
                      borderColor: selectedDemand?.id === demand.id ? catColor : 'rgba(255,255,255,0.06)',
                      boxShadow: selectedDemand?.id === demand.id ? `0 0 30px ${catColor}30` : 'none',
                    }}
                    onMouseEnter={() => setSelectedDemand(demand)}
                    onMouseLeave={() => setSelectedDemand(null)}
                  >
                    {/* Scan line effect on hover */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(180deg, transparent 0%, ${catColor}08 50%, transparent 100%)` }} />

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0" style={{ background: catColor + '20', border: `1px solid ${catColor}40`, color: catColor }}>
                        {demand.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />{demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                      </span>
                    </div>

                    <h3 className="font-bold text-white mb-2 leading-tight line-clamp-2 group-hover:text-cyan-100 transition-colors">
                      {demand.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{demand.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {demand.userName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{demand.userName}</span>}
                        {demand.location?.address && <span className="flex items-center gap-1 line-clamp-1 max-w-[100px]"><MapPin className="w-3 h-3" />{demand.location.address}</span>}
                      </div>
                      <button
                        onClick={e => handleVote(demand.id, e)}
                        className="vote-glow flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{
                          background: (demand.upvoteCount || 0) > 0 ? `${catColor}20` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${(demand.upvoteCount || 0) > 0 ? catColor + '50' : 'rgba(255,255,255,0.1)'}`,
                          color: (demand.upvoteCount || 0) > 0 ? catColor : '#9ca3af',
                        }}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {demand.upvoteCount || 0}
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500 opacity-0 group-hover:opacity-100 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${catColor}, transparent)` }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function PinPanel({ demand, onClose, onVote, voting, catColor, router }) {
  const color = catColor[demand.category?.toLowerCase()] || '#06b6d4'
  return (
    <div className="pin-panel flex flex-col rounded-3xl border border-white/10 overflow-hidden" style={{ background: 'rgba(6,182,212,0.04)', height: 360 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: color + '20', border: `1px solid ${color}40`, color }}>{demand.category}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1"><X className="w-4 h-4" /></button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h3 className="font-black text-lg leading-tight text-white">{demand.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{demand.description}</p>

        <div className="space-y-2 text-xs text-gray-500">
          {demand.userName && (
            <div className="flex items-center gap-2"><User className="w-3 h-3" /><span>{demand.userName}</span></div>
          )}
          {demand.location?.address && (
            <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /><span className="line-clamp-1">{demand.location.address}</span></div>
          )}
          {demand.createdAt && (
            <div className="flex items-center gap-2"><Clock className="w-3 h-3" /><span>{new Date(demand.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={e => { e.stopPropagation(); onVote(demand.id, e) }}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: color + '20', border: `1px solid ${color}40`, color }}
          >
            {voting === demand.id ? (
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            {demand.upvoteCount || 0} Votes
          </button>
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
            <MessageSquare className="w-4 h-4" />
            {demand.commentCount || 0} Comments
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => router.push(`/viewrequest?id=${demand.id}`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all hover:scale-102"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#000' }}
        >
          View Full Details <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-xs text-gray-600 mt-2">AI analytics, comments & more</p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="p-4 rounded-2xl border border-white/5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20', color }}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="font-black text-2xl" style={{ color }}>{value}</p>
      </div>
    </div>
  )
}
