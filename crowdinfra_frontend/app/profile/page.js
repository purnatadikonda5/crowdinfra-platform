'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '../components/navbar'
import axios from 'axios'
import Link from 'next/link'
import { LogOut, Mail, MapPin, Phone, Calendar, User, Activity, Building2, Star, ChevronRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'

const ProfileMap = dynamic(() => import('../components/ProfileMap'), { ssr: false, loading: () => <div className="w-full h-full rounded-2xl bg-white/5 animate-pulse" /> })

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [demands, setDemands] = useState([])
  const [properties, setProperties] = useState([])
  const [tabLoading, setTabLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    axios.get(`${API}/api/users/me`, { withCredentials: true })
      .then(res => {
        setUser(res.data)
        const addr = res.data?.address
        if (addr) {
          axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`)
            .then(r => {
              if (r.data?.[0]) setMapCenter({ lat: parseFloat(r.data[0].lat), lng: parseFloat(r.data[0].lon) })
              else setMapCenter({ lat: 20.5937, lng: 78.9629 })
            })
            .catch(() => setMapCenter({ lat: 20.5937, lng: 78.9629 }))
        } else {
          setMapCenter(res.data?.location || { lat: 20.5937, lng: 78.9629 })
        }
      })
      .catch(err => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  // Fetch counts eagerly for stats, regardless of active tab
  useEffect(() => {
    axios.get(`${API}/api/demands/user/me`, { withCredentials: true })
      .then(r => setDemands(r.data || []))
      .catch(() => {})
    axios.get(`${API}/api/properties/user/me`, { withCredentials: true })
      .then(r => setProperties(r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'activity') {
      setTabLoading(true)
      axios.get(`${API}/api/demands/user/me`, { withCredentials: true })
        .then(r => setDemands(r.data || []))
        .catch(() => {})
        .finally(() => setTabLoading(false))
    } else if (activeTab === 'properties') {
      setTabLoading(true)
      axios.get(`${API}/api/properties/user/me`, { withCredentials: true })
        .then(r => setProperties(r.data || []))
        .catch(() => {})
        .finally(() => setTabLoading(false))
    }
  }, [activeTab])

  const handleLogout = async () => {
    try { await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }) } catch {}
    router.push('/auth')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0514' }}>
      <Navbar />
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: '#a78bfa', borderTopColor: 'transparent' }} />
        <p className="text-gray-400">Loading your profile...</p>
      </div>
    </div>
  )

  if (error && !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0514' }}>
      <Navbar />
      <div className="text-center p-8 rounded-3xl border border-white/10" style={{ background: 'rgba(167,139,250,0.05)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <span className="text-2xl">⚠</span>
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Error Loading Profile</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => router.push('/auth')} className="px-6 py-3 rounded-xl font-semibold" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white' }}>
          Go to Login
        </button>
      </div>
    </div>
  )

  if (!user) return null

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'

  const TABS = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'activity', label: 'My Demands', icon: Activity },
    { id: 'properties', label: 'Properties', icon: Building2 },
  ]

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0a0514 0%, #0f0a1e 50%, #070412 100%)' }}>
      <style>{`
        @keyframes float-orb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-ring { 0%,100%{box-shadow:0 0 30px #7c3aed40,0 0 60px #7c3aed20} 50%{box-shadow:0 0 60px #7c3aed80,0 0 120px #7c3aed40} }
        @keyframes slide-in { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .profile-section { animation: fade-up 0.5s ease forwards; }
        .demand-card { animation: slide-in 0.4s ease forwards; }
        .avatar-ring { animation: glow-ring 3s ease infinite; }
        .tab-active-bar { transition: all 0.3s ease; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #7c3aed40; }
      `}</style>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, #7c3aed15 0%, transparent 70%)', animation: 'float-orb 8s ease infinite', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, #4c1d9510 0%, transparent 70%)', animation: 'float-orb 10s ease infinite 2s', filter: 'blur(50px)' }} />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20">

        {/* Hero Card */}
        <div className="profile-section rounded-3xl overflow-hidden mb-8 border border-white/5" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(15,10,30,0.9) 100%)', boxShadow: '0 30px 80px rgba(124,58,237,0.15)' }}>
          {/* Cover */}
          <div className="relative h-40 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e0a3c 0%, #2d1060 50%, #12073a 100%)' }}>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, #7c3aed25 0%, transparent 70%)' }} />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #7c3aed10 0px, #7c3aed10 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, #7c3aed10 0px, #7c3aed10 1px, transparent 1px, transparent 60px)' }} />
            {/* Top right logout */}
            <button onClick={handleLogout} className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Avatar overlapping cover */}
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end md:gap-6" style={{ marginTop: -40 }}>
              {/* Avatar */}
              <div className="avatar-ring w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black border-4 border-purple-900 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white' }}>
                {user.profile_image ? (
                  <img src={`${API}${user.profile_image}`} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : initials}
              </div>

              {/* Name + email */}
              <div className="mt-4 md:mt-0 md:pb-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-black">{user.name}</h1>
                  {user.role && (
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}>
                      {user.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" style={{ color: '#a78bfa' }} />
                  {user.email}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Demands Raised', value: demands.length || '—', icon: <Zap className="w-4 h-4" /> },
                { label: 'Properties', value: properties.length || '—', icon: <Building2 className="w-4 h-4" /> },
                { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—', icon: <Calendar className="w-4 h-4" /> },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-2xl border border-white/5 text-center" style={{ background: 'rgba(124,58,237,0.05)' }}>
                  <div className="flex justify-center mb-1" style={{ color: '#a78bfa' }}>{s.icon}</div>
                  <p className="text-xl font-black">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
              style={{
                background: activeTab === id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTab === id ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: activeTab === id ? '#a78bfa' : '#9ca3af',
                boxShadow: activeTab === id ? '0 0 20px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="profile-section grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info Card */}
            <div className="p-6 rounded-3xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: '#a78bfa' }} /> Personal Information
              </h2>
              <div className="space-y-4">
                {[
                  { icon: <User className="w-4 h-4" />, label: 'Full Name', value: user.name },
                  { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user.email },
                  { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: user.phone || 'Not provided' },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Address', value: user.address || 'Not provided' },
                  { icon: <Calendar className="w-4 h-4" />, label: 'Joined', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                      <p className="text-sm text-white mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden border border-white/5" style={{ minHeight: 300 }}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: '#a78bfa' }} />
                <span className="text-sm font-semibold">Location</span>
              </div>
              <div style={{ height: 280 }}>
                {mapCenter && <ProfileMap center={mapCenter} />}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="profile-section">
            {tabLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 animate-pulse" style={{ height: 100, background: 'rgba(255,255,255,0.02)' }} />
                ))}
              </div>
            ) : demands.length === 0 ? (
              <div className="text-center py-20">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: '#a78bfa' }} />
                <p className="text-gray-400 text-lg">No demands raised yet</p>
                <Link href="/raise-request" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}>
                  Raise Your First Demand →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demands.map((d, i) => (
                  <Link key={d.id} href={`/viewrequest?id=${d.id}`}>
                    <div className="demand-card p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group" style={{ animationDelay: `${i * 0.06}s`, background: 'rgba(124,58,237,0.03)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>{d.category}</span>
                        <span className="text-xs text-gray-500">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN') : ''}</span>
                      </div>
                      <h3 className="font-bold text-white group-hover:text-purple-200 transition-colors">{d.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{d.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Star className="w-3 h-3" /> {d.upvoteCount || 0} votes
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#a78bfa' }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="profile-section">
            {tabLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 animate-pulse" style={{ height: 100, background: 'rgba(255,255,255,0.02)' }} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: '#a78bfa' }} />
                <p className="text-gray-400 text-lg">No properties listed yet</p>
                <Link href="/property" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}>
                  List Your First Property →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((p, i) => (
                  <Link key={p.id} href={`/properties/${p.id}`}>
                    <div className="demand-card p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group" style={{ animationDelay: `${i * 0.06}s`, background: 'rgba(124,58,237,0.03)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>{p.category}</span>
                        <span className="text-xs font-bold" style={{ color: '#00ff88' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <h3 className="font-bold text-white group-hover:text-purple-200 transition-colors">{p.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{p.address}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Building2 className="w-3 h-3" /> {p.listingType}
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#a78bfa' }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
