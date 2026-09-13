'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Navbar from '../components/navbar'
import { Star, Send, CheckCircle, MessageSquare, Users, TrendingUp } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

export default function RatingPage() {
  const router = useRouter()
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [allRatings, setAllRatings] = useState([])
  const canvasRef = useRef(null)
  const particles = useRef([])
  const animRef = useRef(null)

  useEffect(() => {
    axios.get(`${API}/api/user/ratings`, { withCredentials: true })
      .then(r => setAllRatings(r.data || []))
      .catch(() => {})
  }, [])

  const burst = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = 2 + Math.random() * 4
      particles.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1, decay: 0.02 + Math.random() * 0.02,
        size: 3 + Math.random() * 4,
        color: `hsl(${40 + Math.random() * 20},100%,${60 + Math.random() * 20}%)`,
      })
    }
    if (!animRef.current) animate()
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.current = particles.current.filter(p => p.life > 0)
    particles.current.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= p.decay
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
    if (particles.current.length > 0) {
      animRef.current = requestAnimationFrame(animate)
    } else { animRef.current = null }
  }

  const handleStarClick = (n, e) => {
    setRating(n)
    burst(e)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!review.trim() || rating === 0) { setError('Please write a review and select a rating.'); return }
    setSubmitting(true); setError('')
    try {
      await axios.post(`${API}/api/user/rating`, { review, rating }, { withCredentials: true })
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || ''
      if (status === 401 || status === 403) {
        setError('Session expired. Please log in again.')
      } else if (msg) {
        setError(`Submission failed: ${msg}`)
      } else {
        setError('Failed to submit. Please try again.')
      }
    } finally { setSubmitting(false) }
  }

  const avgRating = allRatings.length ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1) : 0

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0800 0%, #130f00 50%, #0a0600 100%)' }}>
      <style>{`
        @keyframes star-pop { 0%{transform:scale(0.6) rotate(-15deg)} 70%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0deg)} }
        @keyframes float-gold { 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.4} 50%{transform:translateY(-20px) rotate(180deg);opacity:0.7} }
        @keyframes glow-gold { 0%,100%{box-shadow:0 0 20px #f59e0b40,0 0 40px #f59e0b20} 50%{box-shadow:0 0 50px #f59e0b80,0 0 100px #f59e0b40} }
        @keyframes fade-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .star-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .star-btn:hover { transform: scale(1.2) rotate(-5deg); }
        .star-active { animation: star-pop 0.3s ease forwards; }
        .submit-btn { transition: transform 0.2s ease; animation: glow-gold 2.5s ease infinite; }
        .submit-btn:hover { transform: scale(1.03); }
        .rating-card { animation: fade-in 0.4s ease forwards; animation-fill-mode: both; }
        .ambient { animation: float-gold 6s ease-in-out infinite; }
      `}</style>

      {/* Ambient floating stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="ambient absolute text-2xl" style={{ left: `${10 + i * 12}%`, top: `${5 + (i % 3) * 20}%`, animationDelay: `${i * 0.7}s`, opacity: 0.15 }}>★</div>
        ))}
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 10 }} />

      <Navbar />

      <div className="relative z-20 max-w-5xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-bold tracking-widest uppercase" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
            <Star className="w-3 h-3" /> Share Your Experience
          </div>
          <h1 className="text-5xl font-black mb-3" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rate CrowdInfra
          </h1>
          <p className="text-gray-400 text-lg">Your feedback shapes the future of community infrastructure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 50px #f59e0b60' }}>
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black mb-2">Thank You!</h2>
                <p className="text-gray-400">Your review has been submitted successfully.</p>
                <p className="text-gray-500 text-sm mt-2">Redirecting you home...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-white/5" style={{ background: 'rgba(245,158,11,0.04)' }}>

                {/* Stars */}
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-400 mb-4 font-semibold">HOW WOULD YOU RATE YOUR EXPERIENCE?</p>
                  <div className="flex justify-center gap-4 mb-2">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHovered(n)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={e => handleStarClick(n, e)}
                        className={`star-btn text-5xl ${rating >= n ? 'star-active' : ''}`}
                        style={{ filter: (hovered ? hovered : rating) >= n ? 'drop-shadow(0 0 12px #f59e0b)' : 'none', color: (hovered ? hovered : rating) >= n ? '#f59e0b' : '#374151' }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {(hovered || rating) > 0 && (
                    <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>{STAR_LABELS[hovered || rating]}</p>
                  )}
                </div>

                {/* Review text */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Review</label>
                  <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    rows={5}
                    placeholder="Tell us what you think about CrowdInfra — what works well, what could be better..."
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm resize-none focus:outline-none placeholder-gray-600 transition-all focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20"
                  />
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <span>⚠</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !review.trim() || rating === 0}
                  className="submit-btn w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0a0800' }}
                >
                  {submitting ? (
                    <><div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />Submitting...</>
                  ) : (
                    <><Send className="w-5 h-5" />Submit Review</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Avg Rating */}
            <div className="p-6 rounded-3xl border border-white/5 text-center" style={{ background: 'rgba(245,158,11,0.05)' }}>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Average Rating</p>
              <p className="text-6xl font-black" style={{ color: '#f59e0b' }}>{avgRating}</p>
              <div className="flex justify-center gap-1 mt-2">
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ color: n <= Math.round(avgRating) ? '#f59e0b' : '#374151', fontSize: 20 }}>★</span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{allRatings.length} reviews</p>
            </div>

            <div className="p-5 rounded-3xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="flex items-center gap-2 font-bold text-sm mb-4"><Users className="w-4 h-4 text-yellow-400" />Recent Reviews</h3>
              {allRatings.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {allRatings.slice(0, 4).map((r, i) => (
                    <div key={i} className="rating-card p-3 rounded-xl border border-white/5" style={{ animationDelay: `${i * 0.08}s`, background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.rating ? '#f59e0b' : '#374151', fontSize: 12 }}>★</span>)}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{r.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
