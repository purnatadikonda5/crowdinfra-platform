'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/navbar'
import { MapPin, Home, Maximize, DollarSign, Phone, ChevronLeft, Flame, MessageSquare, CheckCircle, Building2, Tag, User } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const STATUS_COLORS = {
  AVAILABLE: { bg: '#06b6d420', border: '#06b6d440', text: '#06b6d4' },
  RENTED: { bg: '#fbbf2420', border: '#fbbf2440', text: '#fbbf24' },
  SOLD: { bg: '#ef444420', border: '#ef444440', text: '#ef4444' },
  LEASED: { bg: '#8b5cf620', border: '#8b5cf640', text: '#8b5cf6' },
}

export default function PropertyDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [inquiry, setInquiry] = useState('')
  const [sending, setSending] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)
  const [nearbyDemands, setNearbyDemands] = useState([])
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!id) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/properties/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(data => { setProperty(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!property?.location?.x || !property?.location?.y) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/properties/near-demand?lat=${property.location.y}&lng=${property.location.x}&radius=5000`)
      .then(r => r.ok ? r.json() : [])
      .then(setNearbyDemands)
      .catch(() => {})
  }, [property])

  useEffect(() => {
    if (!property?.location?.x || typeof window === 'undefined' || mapInstanceRef.current || !mapRef.current) return
    const L = require('leaflet')
    const map = L.map(mapRef.current, { center: [property.location.y, property.location.x], zoom: 14, zoomControl: false })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 16 }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#06b6d4;border:3px solid white;transform:rotate(-45deg);box-shadow:0 0 20px #06b6d480;"></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36],
    })
    L.marker([property.location.y, property.location.x], { icon })
      .addTo(map)
      .bindPopup(`<b>${property.title}</b>`)
      .openPopup()
    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [property])

  const submitInquiry = async () => {
    if (!inquiry.trim()) return
    setSending(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/properties/${id}/inquiry`,
        { message: inquiry },
        { withCredentials: true }
      )
      setInquirySent(true)
      toast.success('Inquiry sent to property owner!')
    } catch {
      toast.error('Please log in to send an inquiry')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <Navbar />
      <div className="text-center">
        <div className="inline-block w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mb-4" style={{ borderColor: '#06b6d4', borderTopColor: 'transparent' }} />
        <p className="text-gray-400">Loading property...</p>
      </div>
    </div>
  )

  if (error || !property) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <Navbar />
      <div className="text-center">
        <p className="text-red-400 text-xl mb-4">{error || 'Property not found'}</p>
        <Link href="/properties" className="px-6 py-2 rounded-xl text-sm font-medium" style={{ background: '#06b6d420', color: '#06b6d4', border: '1px solid #06b6d440' }}>
          ← Back to Properties
        </Link>
      </div>
    </div>
  )

  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80']
  const statusStyle = STATUS_COLORS[property.status] || STATUS_COLORS.AVAILABLE

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #040f14 50%, #040c12 100%)' }}>
      <style>{`
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px #06b6d440} 50%{box-shadow:0 0 40px #06b6d480} }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .detail-section { animation: fade-up 0.5s ease forwards; }
        .img-thumb:hover { border-color: #06b6d4; transform: scale(1.05); }
        .img-thumb { transition: all 0.2s ease; }
      `}</style>

      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Back */}
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> All Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            <div className="detail-section rounded-3xl overflow-hidden border border-white/5" style={{ animationDelay: '0.1s' }}>
              <div className="relative h-72 md:h-96 overflow-hidden">
                <img src={images[imgIdx]} alt={property.title} className="w-full h-full object-cover" style={{ transition: 'opacity 0.3s ease' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.text }}>
                    {property.status || 'AVAILABLE'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#ffffff15', border: '1px solid #ffffff20', color: 'white' }}>
                    {property.listingType}
                  </span>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className="img-thumb w-16 h-12 rounded-lg overflow-hidden border-2" style={{ borderColor: i === imgIdx ? '#06b6d4' : 'transparent' }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + Details */}
            <div className="detail-section p-6 rounded-3xl border border-white/5" style={{ animationDelay: '0.15s', background: 'rgba(255,255,255,0.03)' }}>
              <h1 className="text-3xl font-black mb-2">{property.title}</h1>
              {property.address && (
                <p className="flex items-center gap-2 text-gray-400 mb-4"><MapPin className="w-4 h-4" style={{ color: '#06b6d4' }} />{property.address}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Stat icon={<DollarSign className="w-4 h-4" />} label="Price" value={`₹${property.price?.toLocaleString('en-IN')}`} highlight />
                <Stat icon={<Home className="w-4 h-4" />} label="Category" value={property.category} />
                {property.areaSqft && <Stat icon={<Maximize className="w-4 h-4" />} label="Area" value={`${property.areaSqft} sqft`} />}
                <Stat icon={<Tag className="w-4 h-4" />} label="Type" value={property.listingType} />
              </div>
              {property.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>

            {/* Map */}
            {property.location?.x && (
              <div className="detail-section rounded-3xl overflow-hidden border border-white/5" style={{ animationDelay: '0.2s' }}>
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: '#06b6d4' }} />
                  <span className="font-semibold text-sm">Location</span>
                </div>
                <div ref={mapRef} style={{ height: 260 }} />
              </div>
            )}

            {/* Nearby Demands */}
            {nearbyDemands.length > 0 && (
              <div className="detail-section p-6 rounded-3xl border border-white/5" style={{ animationDelay: '0.25s', background: 'rgba(251,191,36,0.03)' }}>
                <h3 className="flex items-center gap-2 font-bold mb-4">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span>Nearby Community Demands</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2440' }}>{nearbyDemands.length} demands</span>
                </h3>
                <div className="space-y-2">
                  {nearbyDemands.slice(0, 5).map(d => (
                    <Link key={d.id} href={`/viewrequest?id=${d.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300 line-clamp-1">{d.title}</span>
                      <span className="ml-auto text-xs text-orange-400">{d.voteCount || 0} votes</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Contact + Inquiry */}
          <div className="space-y-6">

            {/* Owner Info */}
            <div className="detail-section p-6 rounded-3xl border border-white/10" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,0,0,0.3))', boxShadow: '0 0 40px #06b6d410' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#06b6d420', border: '1px solid #06b6d440' }}>
                  <User className="w-6 h-6" style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <p className="font-bold">{property.ownerName || 'Property Owner'}</p>
                  <p className="text-xs text-gray-400">Listed by owner</p>
                </div>
              </div>
              {property.contactNumber && (
                <a href={`tel:${property.contactNumber}`} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: '#06b6d420', border: '1px solid #06b6d440', color: '#06b6d4' }}>
                  <Phone className="w-4 h-4" /> {property.contactNumber}
                </a>
              )}
            </div>

            {/* Inquiry Form */}
            <div className="detail-section p-6 rounded-3xl border border-white/5" style={{ animationDelay: '0.15s', background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="flex items-center gap-2 font-bold mb-4">
                <MessageSquare className="w-5 h-5" style={{ color: '#06b6d4' }} />
                Send Inquiry
              </h3>
              {inquirySent ? (
                <div className="flex items-center gap-3 py-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto" style={{ color: '#06b6d4' }} />
                  <div>
                    <p className="font-semibold">Inquiry Sent!</p>
                    <p className="text-xs text-gray-400 mt-1">The owner will contact you soon</p>
                  </div>
                </div>
              ) : (
                <>
                  <textarea
                    className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-sm resize-none focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/20 placeholder-gray-500"
                    rows={4}
                    placeholder="Hi, I'm interested in this property. Please contact me..."
                    value={inquiry}
                    onChange={e => setInquiry(e.target.value)}
                  />
                  <button
                    onClick={submitInquiry}
                    disabled={sending || !inquiry.trim()}
                    className="w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#000' }}
                  >
                    {sending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="detail-section p-4 rounded-3xl border border-white/5" style={{ animationDelay: '0.2s', background: 'rgba(255,255,255,0.02)' }}>
              <Building2 className="w-5 h-5 mb-2" style={{ color: '#06b6d4' }} />
              <p className="text-xs text-gray-400 mb-1">Property ID</p>
              <p className="font-mono text-xs text-gray-300 break-all">{property.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, highlight }) {
  return (
    <div className="p-3 rounded-xl border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">{icon}{label}</div>
      <p className="font-bold text-sm" style={{ color: highlight ? '#06b6d4' : 'white' }}>{value}</p>
    </div>
  )
}
