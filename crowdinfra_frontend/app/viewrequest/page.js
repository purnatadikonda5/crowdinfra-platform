'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Navbar from '../components/navbar'
import { MapPin, ThumbsUp, MessageSquare, Share2, ChevronLeft, Sparkles, User, Calendar, Tag, Send, Loader, RefreshCw, Copy } from 'lucide-react'
import { toast } from 'react-toastify'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'

const CAT_COLORS = {
  INFRASTRUCTURE: { bg: '#0891b220', border: '#0891b240', text: '#22d3ee' },
  EDUCATION: { bg: '#0ea5e920', border: '#0ea5e940', text: '#38bdf8' },
  HEALTHCARE: { bg: '#ef444420', border: '#ef444440', text: '#f87171' },
  TRANSPORT: { bg: '#f59e0b20', border: '#f59e0b40', text: '#fbbf24' },
  ENVIRONMENT: { bg: '#10b98120', border: '#10b98140', text: '#34d399' },
}
const getColor = cat => CAT_COLORS[cat?.toUpperCase()] || { bg: '#06b6d420', border: '#06b6d440', text: '#67e8f9' }

export default function ViewRequest() {
  const router = useRouter()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [voting, setVoting] = useState(false)
  const [businessAnalysis, setBusinessAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')

  useEffect(() => {
    if (!requestId) { setError('No request ID found'); setLoading(false); return }
    fetch(`${API}/api/demands/${requestId}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json() })
      .then(data => { setRequest(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [requestId])

  useEffect(() => {
    if (!requestId) return
    axios.get(`${API}/api/comments/${requestId}`, { withCredentials: true })
      .then(r => setComments(r.data || []))
      .catch(() => {})
  }, [requestId])

  // Init Leaflet map
  useEffect(() => {
    if (!request?.location?.lat || typeof window === 'undefined' || mapInstanceRef.current || !mapRef.current) return
    const L = require('leaflet')
    const map = L.map(mapRef.current, {
      center: [request.location.lat, request.location.lng],
      zoom: 14,
      zoomControl: false,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 16 }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#22d3ee;border:3px solid white;transform:rotate(-45deg);box-shadow:0 0 20px #22d3ee80;animation:pulse 2s infinite;"></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36],
    })
    L.marker([request.location.lat, request.location.lng], { icon }).addTo(map).bindPopup(`<b>${request.title}</b>`).openPopup()
    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [request])

  const handleVote = async () => {
    if (voting) return
    setVoting(true)
    try {
      const res = await axios.post(`${API}/api/demands/${requestId}/vote`, {}, { withCredentials: true })
      setRequest(res.data)
      toast.success('Vote recorded!')
    } catch { toast.error('Log in to vote') }
    finally { setVoting(false) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      const res = await axios.post(`${API}/api/comments/${requestId}`, { content: newComment }, { withCredentials: true })
      setComments(prev => [...prev, res.data])
      setNewComment('')
      toast.success('Comment posted!')
    } catch { toast.error('Log in to comment') }
    finally { setCommentLoading(false) }
  }

  const fetchAnalysis = async (refresh = false) => {
    setAnalysisLoading(true)
    try {
      const endpoint = refresh ? `${API}/api/demands/${requestId}/analysis/refresh` : `${API}/api/demands/${requestId}/analysis`
      const method = refresh ? 'post' : 'get'
      const res = await axios[method](endpoint, refresh ? {} : undefined, { withCredentials: true })
      const text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
      try {
        const match = text.match(/\{[\s\S]*\}/)
        setBusinessAnalysis(match ? JSON.parse(match[0]) : { summary: text })
      } catch { setBusinessAnalysis({ summary: text }) }
    } catch (e) {
      const status = e.response?.status
      if (status === 403) setBusinessAnalysis({ error: 'This feature is for Business/Admin accounts only.' })
      else setBusinessAnalysis({ error: 'Failed to load analysis. Please try again.' })
    }
    setAnalysisLoading(false)
  }

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#040c14' }}>
      <Navbar />
      <div className="text-center">
        <div className="inline-block w-14 h-14 rounded-full border-2 border-t-transparent animate-spin mb-4" style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
        <p className="text-cyan-300">Loading demand...</p>
      </div>
    </div>
  )

  if (error || !request) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#040c14' }}>
      <Navbar />
      <div className="text-center">
        <p className="text-red-400 text-xl mb-4">{error || 'Demand not found'}</p>
        <Link href="/search-demands" className="px-6 py-2 rounded-xl text-sm font-medium" style={{ background: '#22d3ee20', color: '#22d3ee', border: '1px solid #22d3ee40' }}>
          ← Back to Demands
        </Link>
      </div>
    </div>
  )

  const catColor = getColor(request.category)

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #040c14 0%, #051826 50%, #040f1e 100%)' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 20px #22d3ee60} 50%{box-shadow:0 0 40px #22d3eeaa} }
        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 30px #0891b230,0 0 60px #0891b210} 50%{box-shadow:0 0 50px #0891b260,0 0 100px #0891b220} }
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .section-card { animation: fade-up 0.6s ease forwards; animation-fill-mode: both; }
        .vote-btn:hover { transform: scale(1.05) translateY(-2px); }
        .vote-btn { transition: all 0.2s ease; }
        .comment-item { animation: fade-up 0.4s ease forwards; }
        .glow-ring { animation: glow-pulse 3s ease infinite; }
        .floating { animation: float 4s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #0891b240; }
      `}</style>

      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-24 pb-12 px-6 overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #0891b215 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #06b6d415 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="max-w-5xl mx-auto">
          <Link href="/search-demands" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All Demands
          </Link>

          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: catColor.bg, border: `1px solid ${catColor.border}`, color: catColor.text }}>
              {request.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#ffffff10', border: '1px solid #ffffff20', color: '#e2e8f0' }}>
              {request.status?.replace('_', ' ') || 'OPEN'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #67e8f9 60%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {request.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" style={{ color: '#22d3ee' }} />{request.userName || 'Community Member'}</span>
            {request.createdAt && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" style={{ color: '#22d3ee' }} />{new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            {request.location?.address && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" style={{ color: '#22d3ee' }} />{request.location.address}</span>}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleVote}
              disabled={voting}
              className="vote-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: (request.upvoteCount || 0) > 0 ? 'linear-gradient(135deg, #0891b2, #22d3ee)' : 'rgba(124,58,237,0.15)', border: '1px solid #0891b260', color: (request.upvoteCount || 0) > 0 ? 'white' : '#22d3ee' }}
            >
              {voting ? <Loader className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
              <span>{request.upvoteCount || 0} Votes</span>
            </button>

            <button className="vote-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
              onClick={() => document.getElementById('comments-section').scrollIntoView({ behavior: 'smooth' })}>
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} Comments</span>
            </button>

            <div className="relative">
              <button className="vote-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
                onClick={() => setShowShare(s => !s)}>
                <Share2 className="w-4 h-4" />Share
              </button>
              {showShare && (
                <div className="absolute top-full left-0 mt-2 w-52 p-2 rounded-xl z-50 border border-white/10" style={{ background: 'rgba(13,6,24,0.98)', backdropFilter: 'blur(20px)' }}>
                  <button onClick={copyLink} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-left">
                    <Copy className="w-4 h-4 text-cyan-400" />Copy link
                  </button>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(request.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">
                    <span className="text-blue-400 text-xs font-bold">𝕏</span>Share on X
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(request.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">
                    <span className="text-green-400">●</span>WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-8">

        {/* Description */}
        <div className="section-card p-6 rounded-3xl border border-white/5" style={{ animationDelay: '0.05s', background: 'rgba(124,58,237,0.05)' }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#67e8f9' }}>
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#0891b2,#22d3ee)' }} />
            Description
          </h2>
          <p className="text-gray-300 leading-relaxed text-base">{request.description}</p>
        </div>

        {/* Map */}
        {request.location?.lat && (
          <div className="section-card rounded-3xl overflow-hidden border border-white/5" style={{ animationDelay: '0.1s' }}>
            <div className="px-5 py-3 flex items-center gap-2 border-b border-white/5" style={{ background: 'rgba(124,58,237,0.05)' }}>
              <MapPin className="w-4 h-4" style={{ color: '#22d3ee' }} />
              <span className="font-semibold text-sm">Location</span>
              <span className="ml-auto text-xs text-gray-500">{request.location.lat?.toFixed(4)}, {request.location.lng?.toFixed(4)}</span>
            </div>
            <div ref={mapRef} style={{ height: 300 }} />
          </div>
        )}

        {/* AI Business Analysis */}
        <div className="section-card rounded-3xl border overflow-hidden" style={{ animationDelay: '0.15s', borderColor: '#0891b230', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(139,92,246,0.05))' }}>
          <div className="px-6 py-4 flex items-center justify-between border-b border-cyan-900/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center floating" style={{ background: 'linear-gradient(135deg, #0891b2, #22d3ee)' }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: '#67e8f9' }}>AI Business Analysis</h2>
                <p className="text-xs text-gray-500">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex gap-2">
              {businessAnalysis && !businessAnalysis.error && (
                <button onClick={() => fetchAnalysis(true)} disabled={analysisLoading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105" style={{ background: '#0891b220', color: '#22d3ee', border: '1px solid #0891b230' }}>
                  <RefreshCw className={`w-3 h-3 ${analysisLoading ? 'animate-spin' : ''}`} />Refresh
                </button>
              )}
              {!businessAnalysis && (
                <button onClick={() => fetchAnalysis()} disabled={analysisLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0891b2, #22d3ee)', color: 'white' }}>
                  {analysisLoading ? <Loader className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {analysisLoading ? 'Analyzing...' : 'Get Analysis'}
                </button>
              )}
            </div>
          </div>

          {businessAnalysis && (
            <div className="p-6">
              {businessAnalysis.error ? (
                <p className="text-red-400 text-sm">{businessAnalysis.error}</p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold mb-3" style={{ color: '#67e8f9' }}>{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold mb-2" style={{ color: '#22d3ee' }}>{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold mb-2" style={{ color: '#06b6d4' }}>{children}</h3>,
                    p: ({children}) => <p className="mb-3 text-gray-300 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-300">{children}</ul>,
                    strong: ({children}) => <strong style={{ color: '#22d3ee' }}>{children}</strong>,
                  }}>
                    {businessAnalysis.summary || JSON.stringify(businessAnalysis, null, 2)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          {!businessAnalysis && !analysisLoading && (
            <div className="px-6 pb-6 pt-2 text-sm text-gray-500 text-center">
              Click &ldquo;Get Analysis&rdquo; to generate AI-powered market analysis
            </div>
          )}
        </div>

        {/* Comments */}
        <div id="comments-section" className="section-card rounded-3xl border border-white/5 overflow-hidden" style={{ animationDelay: '0.2s', background: 'rgba(255,255,255,0.02)' }}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: '#22d3ee' }} />
            <h2 className="font-bold">Comments</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#0891b220', color: '#22d3ee', border: '1px solid #0891b230' }}>{comments.length}</span>
          </div>

          <div className="p-6">
            {/* Add comment */}
            <form onSubmit={handleComment} className="flex gap-3 mb-8">
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this demand..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border bg-white/5 text-sm resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder-gray-500 transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                />
              </div>
              <button type="submit" disabled={commentLoading || !newComment.trim()} className="self-end px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #0891b2, #22d3ee)', color: 'white' }}>
                {commentLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            {/* Comments list */}
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={c.id || i} className="comment-item flex gap-3 p-4 rounded-2xl border border-white/5" style={{ animationDelay: `${i * 0.05}s`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0891b2, #22d3ee)' }}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold" style={{ color: '#67e8f9' }}>{c.userId ? `User ${c.userId.slice(-4)}` : 'Community Member'}</span>
                        {c.createdAt && <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
