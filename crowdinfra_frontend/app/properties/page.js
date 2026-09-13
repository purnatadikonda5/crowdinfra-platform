'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Navbar from '../components/navbar'
import PlaceAutocomplete from '../components/autocomplete'
import { useUserContext } from '../components/user_context'
import { Building2, Search, DollarSign, Maximize, MapPin, Home, Filter, ChevronDown, Flame, X, Navigation } from 'lucide-react'

const PropertyMap = dynamic(() => import('../components/PropertyMapInner'), { ssr: false })

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'
const CATEGORIES = ['', 'COMMERCIAL', 'RESIDENTIAL', 'LAND']
const LISTING_TYPES = ['', 'RENT', 'SELL', 'LEASE']
const CAT_LABELS = { '': 'All Categories', COMMERCIAL: 'Commercial', RESIDENTIAL: 'Residential', LAND: 'Land' }
const TYPE_LABELS = { '': 'All Types', RENT: 'For Rent', SELL: 'For Sale', LEASE: 'For Lease' }
const RADIUS_OPTIONS = [1000, 2000, 5000, 10000, 20000]
const RADIUS_LABELS = { 1000: '1 km', 2000: '2 km', 5000: '5 km', 10000: '10 km', 20000: '20 km' }

export default function PropertiesBrowse() {
  const { selectedPlace } = useUserContext() || {}
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [listingType, setListingType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedProp, setSelectedProp] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchCenter, setSearchCenter] = useState(null)
  const [radius, setRadius] = useState(5000)
  const [spatialMode, setSpatialMode] = useState(false)
  const cardRefs = useRef({})

  // When user picks a place from autocomplete, switch to spatial search
  useEffect(() => {
    if (selectedPlace?.lat && selectedPlace?.lng) {
      setSearchCenter({ lat: selectedPlace.lat, lng: selectedPlace.lng })
      setSpatialMode(true)
    }
  }, [selectedPlace])

  useEffect(() => {
    if (spatialMode && searchCenter) {
      fetchNearby()
    } else if (!spatialMode) {
      fetchProperties()
    }
  }, [category, listingType, minPrice, maxPrice, spatialMode, searchCenter, radius])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (category) q.append('category', category)
      if (listingType) q.append('listingType', listingType)
      if (minPrice) q.append('minPrice', minPrice)
      if (maxPrice) q.append('maxPrice', maxPrice)
      const res = await fetch(`${API}/api/properties/search?${q}`)
      if (res.ok) {
        const data = await res.json()
        setProperties(data.content || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchNearby = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/properties/near-demand?lat=${searchCenter.lat}&lng=${searchCenter.lng}&radius=${radius}`)
      if (res.ok) {
        const data = await res.json()
        setProperties(data || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const clearLocation = () => { setSearchCenter(null); setSpatialMode(false); fetchProperties() }
  const clearFilters = () => { setCategory(''); setListingType(''); setMinPrice(''); setMaxPrice('') }

  const markers = properties
    .filter(p => p.location?.x && p.location?.y)
    .map(p => ({ id: p.id, lat: p.location.y, lng: p.location.x, title: p.title, price: p.price }))

  return (
    <div className="properties-page min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #040f14 50%, #040c12 100%)' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px #06b6d440,0 0 40px #06b6d420} 50%{box-shadow:0 0 40px #06b6d480,0 0 80px #06b6d440} }
        @keyframes slide-in { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes card-in { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .prop-card { animation: card-in 0.5s ease forwards; animation-fill-mode: both; }
        .prop-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 60px #06b6d430, 0 0 0 1px #06b6d440; }
        .prop-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .glow-ring { animation: glow-pulse 3s ease infinite; }
        .filter-chip:hover { background: #06b6d420; border-color: #06b6d4; color: #06b6d4; }
        .filter-chip { transition: all 0.2s ease; }
        .listing-badge { font-weight: 700; font-size: 0.7rem; letter-spacing: 0.05em; }
        .shimmer-bg { background: linear-gradient(90deg,#040f1440 25%,#06b6d410 50%,#040f1440 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .selected-card { box-shadow: 0 0 0 2px #06b6d4, 0 20px 60px #06b6d440 !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0f1e; } ::-webkit-scrollbar-thumb { background: #06b6d440; border-radius: 2px; }
      `}</style>

      <Navbar />

      {/* Header */}
      <header className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #06b6d4, #00ffaa)' }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#06b6d4' }}>Real Estate</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Discover Properties
              </h1>
              <p className="mt-2 text-gray-400 text-lg">Find spaces near high-demand areas across India</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5">
              <span className="text-2xl font-black" style={{ color: '#06b6d4' }}>{properties.length}</span>
              <span className="text-gray-400 text-sm">{spatialMode ? 'nearby' : 'listings'}</span>
            </div>
          </div>

          {/* Location Search + Spatial Query */}
          <div className="mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[260px] max-w-md">
                <PlaceAutocomplete placeholder="Search by location..." />
              </div>
              {spatialMode && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#06b6d440', background: '#06b6d410', color: '#06b6d4' }}>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Spatial search active</span>
                  </div>
                  <select
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#06b6d440', background: '#0a0f1e', color: '#fff' }}
                  >
                    {RADIUS_OPTIONS.map(r => <option key={r} value={r} style={{ background: '#0a0f1e' }}>Within {RADIUS_LABELS[r]}</option>)}
                  </select>
                  <button onClick={clearLocation} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 border border-red-400/20">
                    <X className="w-3 h-3" /> Clear location
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div>
            <button
              onClick={() => setFiltersOpen(f => !f)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm mb-3"
            >
              <Filter className="w-4 h-4" style={{ color: '#06b6d4' }} />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              {(category || listingType || minPrice || maxPrice) && (
                <span className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
              )}
            </button>

            {filtersOpen && (
              <div className="w-full max-w-2xl p-4 rounded-2xl border border-white/10 backdrop-blur-xl mb-3" style={{ background: 'rgba(10,15,30,0.95)' }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <select className="p-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0a0f1e' }}>{CAT_LABELS[c]}</option>)}
                  </select>
                  <select className="p-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20" value={listingType} onChange={e => setListingType(e.target.value)}>
                    {LISTING_TYPES.map(t => <option key={t} value={t} style={{ background: '#0a0f1e' }}>{TYPE_LABELS[t]}</option>)}
                  </select>
                  <div className="relative">
                    <span className="absolute left-2 top-2.5 text-gray-400 text-xs">₹</span>
                    <input type="number" placeholder="Min Price" className="w-full pl-6 p-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-cyan-400" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-2.5 text-gray-400 text-xs">₹</span>
                    <input type="number" placeholder="Max Price" className="w-full pl-6 p-2 rounded-lg border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-cyan-400" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                  </div>
                </div>
                {(category || listingType || minPrice || maxPrice) && (
                  <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                    <X className="w-3 h-3" /> Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Active filter chips */}
            <div className="flex flex-wrap gap-2">
              {category && <span className="filter-chip px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs cursor-pointer" onClick={() => setCategory('')}>{CAT_LABELS[category]} ×</span>}
              {listingType && <span className="filter-chip px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs cursor-pointer" onClick={() => setListingType('')}>{TYPE_LABELS[listingType]} ×</span>}
              {minPrice && <span className="filter-chip px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs cursor-pointer" onClick={() => setMinPrice('')}>Min ₹{minPrice} ×</span>}
              {maxPrice && <span className="filter-chip px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs cursor-pointer" onClick={() => setMaxPrice('')}>Max ₹{maxPrice} ×</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Property Cards */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-white/5 shimmer-bg" style={{ height: 160 }} />
              ))
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ background: '#06b6d410', border: '1px solid #06b6d430' }}>
                  <Search className="w-8 h-8" style={{ color: '#06b6d4' }} />
                </div>
                <p className="text-gray-300 font-semibold">No properties found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              properties.map((prop, idx) => (
                <Link href={`/properties/${prop.id}`} key={prop.id}>
                  <div
                    ref={el => cardRefs.current[prop.id] = el}
                    className={`prop-card rounded-2xl overflow-hidden border cursor-pointer ${selectedProp?.id === prop.id ? 'selected-card' : 'border-white/5'}`}
                    style={{ animationDelay: `${idx * 0.06}s`, background: 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={() => setSelectedProp(prop)}
                    onMouseLeave={() => setSelectedProp(null)}
                  >
                    <div className="flex">
                      <div className="w-32 h-28 relative flex-shrink-0 overflow-hidden">
                        <img
                          src={prop.images?.length ? prop.images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=70'}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                          style={{ transition: 'transform 0.4s ease' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3))' }} />
                      </div>
                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{prop.title}</h3>
                          <span className="listing-badge px-2 py-0.5 rounded-md flex-shrink-0" style={{ background: prop.listingType === 'SELL' ? '#ff6b3520' : '#06b6d420', color: prop.listingType === 'SELL' ? '#ff6b35' : '#06b6d4', border: `1px solid ${prop.listingType === 'SELL' ? '#ff6b3540' : '#06b6d440'}` }}>
                            {prop.listingType}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs flex items-center gap-1 mb-2 line-clamp-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {prop.address || 'Location TBD'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-base" style={{ color: '#06b6d4' }}>₹{prop.price?.toLocaleString('en-IN')}</span>
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Home className="w-3 h-3" /><span>{prop.category}</span>
                            {prop.areaSqft && <><Maximize className="w-3 h-3" /><span>{prop.areaSqft} sqft</span></>}
                          </div>
                        </div>
                        {prop.nearbyDemandCount > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#fbbf24' }}>
                            <Flame className="w-3 h-3" /> {prop.nearbyDemandCount} demands nearby
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Right: Map */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-white/5 relative min-h-[500px]" style={{ background: '#040f14' }}>
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid #06b6d440', color: '#06b6d4' }}>
              <MapPin className="w-3 h-3 inline mr-1" />Live Map
            </div>
            <PropertyMapInnerWrapper markers={markers} selectedProp={selectedProp} center={searchCenter} radius={spatialMode ? radius : null} />
          </div>
        </div>
      </main>
    </div>
  )
}

function PropertyMapInnerWrapper({ markers, selectedProp, center, radius }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return (
    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 500 }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#06b6d4' }} />
    </div>
  )
  return (
    <LeafletPropertyMap markers={markers} selectedProp={selectedProp} center={center} radius={radius} />
  )
}

function LeafletPropertyMap({ markers, selectedProp, center, radius }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const circleRef = useRef(null)
  const centerMarkerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 18,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  // Fly to center and draw radius circle when spatial search is active
  useEffect(() => {
    const L = require('leaflet')
    const map = mapInstanceRef.current
    if (!map) return

    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null }
    if (centerMarkerRef.current) { centerMarkerRef.current.remove(); centerMarkerRef.current = null }

    if (center?.lat && center?.lng) {
      const zoomForRadius = radius <= 1000 ? 14 : radius <= 5000 ? 12 : radius <= 10000 ? 11 : 10
      map.flyTo([center.lat, center.lng], zoomForRadius, { duration: 1.2 })

      circleRef.current = L.circle([center.lat, center.lng], {
        radius,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        fillOpacity: 0.06,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map)

      const pinIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#06b6d4;border:3px solid white;box-shadow:0 0 16px #06b6d4;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      centerMarkerRef.current = L.marker([center.lat, center.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<div style="font-size:12px;color:#06b6d4;font-weight:700">Search Center</div><div style="font-size:11px;color:#666">Showing properties within ${radius >= 1000 ? (radius / 1000) + ' km' : radius + ' m'}</div>`)
    }
  }, [center, radius])

  // Update property markers
  useEffect(() => {
    const L = require('leaflet')
    const map = mapInstanceRef.current
    if (!map) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = markers.map(m => {
      const isSelected = selectedProp?.id === m.id
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${isSelected ? '#06b6d4' : '#0891b2'};border:2px solid white;transform:rotate(-45deg);box-shadow:0 0 12px ${isSelected ? '#06b6d4' : '#0891b280'};transition:all 0.2s;"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })
      return L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-size:13px;font-weight:600;color:#111">${m.title}</div><div style="color:#0891b2;font-weight:700;margin-top:2px">₹${m.price?.toLocaleString('en-IN')}</div>`)
    })

    // If we have markers but no center, fit bounds to show all pins
    if (markers.length > 0 && !center) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.2))
    }
  }, [markers, selectedProp])

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 500 }} />
}
