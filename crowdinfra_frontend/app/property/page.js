'use client'

import React, { useState, useEffect } from 'react'
import PropertyMap from '../components/PropertyMap'
import Navbar from '../components/navbar'
import { useUserContext } from '../components/user_context'
import PlaceAutocomplete from '../components/autocomplete'
import { X, MapPin, Building2, Send, CheckCircle, ChevronDown, ChevronUp, DollarSign, Phone, Layers } from 'lucide-react'
import { toast } from 'react-toastify'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'

const CATEGORIES = [
  { value: 'residential', label: '🏠 Residential' },
  { value: 'commercial', label: '🏢 Commercial' },
  { value: 'industrial', label: '🏭 Industrial' },
  { value: 'land', label: '🌾 Land / Plot' },
]

const TYPES = [
  { value: 'sell', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'lease', label: 'Lease' },
]

const STEPS = [
  { n: '01', title: 'Pick Location', desc: 'Click on the map or search for a place to pin your property.' },
  { n: '02', title: 'Open Form', desc: 'Click "List Property Here" in the popup to open the listing form.' },
  { n: '03', title: 'Fill Details', desc: 'Add title, category, price, area and contact details.' },
  { n: '04', title: 'Go Live', desc: 'Your property is listed and visible to infrastructure seekers.' },
]

export default function PropertyPage() {
  const [showSteps, setShowSteps] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showLocationPopup, setShowLocationPopup] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', category: 'residential', price: '', type: 'sell', area: '', contactNumber: '', status: 'AVAILABLE' })
  const [submittedProperties, setSubmittedProperties] = useState([])
  const [activeProperty, setActiveProperty] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const { selectedPlace } = useUserContext() || {}

  useEffect(() => {
    if (selectedPlace?.lat && selectedPlace?.lng) {
      setSelectedLocation({ lat: selectedPlace.lat, lng: selectedPlace.lng })
    }
  }, [selectedPlace])

  const handleCloseLocationPopup = () => { setShowLocationPopup(false); setSelectedLocation(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedLocation?.lat || !selectedLocation?.lng) {
      toast.error('Please select a location on the map'); return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          listingType: formData.type,
          contactNumber: formData.contactNumber,
          status: formData.status,
          price: parseFloat(formData.price) || 0,
          areaSqft: parseFloat(formData.area) || 0,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: 'Selected Location',
        }),
      })
      if (!res.ok) {
        if (res.status === 401) { toast.error('Please log in to list a property'); window.location.href = '/auth'; return }
        throw new Error('Server error')
      }
      const data = await res.json()
      const newProp = { ...formData, id: data.id, coordinates: [selectedLocation.lng, selectedLocation.lat] }
      setSubmittedProperties(prev => [...prev, newProp])
      setFormData({ title: '', description: '', category: 'residential', price: '', type: 'sell', area: '', contactNumber: '', status: 'AVAILABLE' })
      setShowForm(false)
      setShowLocationPopup(false)
      setActiveProperty(newProp.id)
      setJustSubmitted(true)
      setTimeout(() => setJustSubmitted(false), 4000)
      toast.success('Property listed successfully! 🎉')
    } catch {
      toast.error('Failed to list property. Please try again.')
    } finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0a00 0%, #1a1000 40%, #0c0800 100%)' }}>
      <style>{`
        @keyframes amber-float { 0%{transform:translateY(0) scale(1);opacity:0.8} 50%{transform:translateY(-15px) scale(1.05);opacity:1} 100%{transform:translateY(-30px) scale(0.8);opacity:0} }
        @keyframes glow-amber { 0%,100%{box-shadow:0 0 20px #f59e0b40,0 0 40px #f59e0b20} 50%{box-shadow:0 0 40px #f59e0b80,0 0 80px #f59e0b40} }
        @keyframes step-in { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes success-pop { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes grid-glow { 0%,100%{opacity:0.06} 50%{opacity:0.12} }
        .step-item { animation: step-in 0.4s ease forwards; animation-fill-mode: both; }
        .glow-btn { animation: glow-amber 2.5s ease infinite; transition: transform 0.2s ease; }
        .glow-btn:hover { transform: scale(1.03) translateY(-2px); }
        .success-badge { animation: success-pop 0.5s ease forwards; }
        .form-input:focus { box-shadow: 0 0 0 2px #f59e0b60, 0 0 20px #f59e0b20; border-color: #f59e0b; }
        .form-input { transition: all 0.2s ease; }
        .prop-item:hover { background: rgba(245,158,11,0.08); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #f59e0b40; }
      `}</style>

      {/* BG grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.06) 1px, transparent 1px)', backgroundSize: '60px 60px', animation: 'grid-glow 4s ease infinite' }} />
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, #f59e0b15 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <Navbar />

      {/* Success Banner */}
      {justSubmitted && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 success-badge flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', boxShadow: '0 10px 40px #f59e0b60' }}>
          <CheckCircle className="w-5 h-5" /> Property listed and live!
        </div>
      )}

      <div className="relative z-10 pt-20 px-6 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6" style={{ color: '#fbbf24' }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#fbbf24' }}>Real Estate</span>
          </div>
          <h1 className="text-5xl font-black" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcd34d 50%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            List a Property
          </h1>
          <p className="text-gray-400 mt-2">Pin a location and list your space — connect with infrastructure seekers.</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6 max-w-md">
            <PlaceAutocomplete />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Side Panel */}
            <div className="md:col-span-1 space-y-4">
              {/* Steps */}
              <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(245,158,11,0.04)' }}>
                <button className="w-full flex items-center justify-between px-5 py-4 font-bold border-b border-white/5" style={{ color: '#fbbf24' }} onClick={() => setShowSteps(s => !s)}>
                  <span className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
                    How It Works
                  </span>
                  {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showSteps && (
                  <div className="p-5 space-y-4">
                    {STEPS.map((s, i) => (
                      <div key={i} className="step-item flex gap-4" style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                          {s.n}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{s.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submitted this session */}
              {submittedProperties.length > 0 && (
                <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(245,158,11,0.03)' }}>
                  <div className="px-5 py-3 border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">Listed This Session</div>
                  <div className="p-4 space-y-2">
                    {submittedProperties.map(p => (
                      <div key={p.id} className="prop-item flex items-center gap-2 text-xs p-2 rounded-lg transition-colors cursor-pointer">
                        <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{p.title}</span>
                        <CheckCircle className="w-3 h-3 text-green-400 ml-auto flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="md:col-span-2 rounded-2xl overflow-hidden border border-white/5 relative" style={{ height: '65vh', minHeight: 400 }}>
              <div className="absolute top-4 left-4 z-10 text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                <MapPin className="w-3 h-3 inline mr-1" />Click anywhere to place a pin
              </div>
              <PropertyMap
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                center={{ lat: 20.5937, lng: 78.9629 }}
                submittedProperties={submittedProperties}
                activeProperty={activeProperty}
                setActiveProperty={setActiveProperty}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
                setShowForm={setShowForm}
                handleCloseLocationPopup={handleCloseLocationPopup}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="rounded-3xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(135deg, #1a1000 0%, #0f0800 100%)', boxShadow: '0 30px 80px #f59e0b30' }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">List Property</p>
                    {selectedLocation && <p className="text-xs text-gray-500">{selectedLocation.lat?.toFixed(4)}, {selectedLocation.lng?.toFixed(4)}</p>}
                  </div>
                </div>
                <button onClick={() => { setShowForm(false); setShowLocationPopup(true) }} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Title *</label>
                  <input type="text" className="form-input w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none placeholder-gray-600" placeholder="e.g. 2BHK near Metro Station" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.value} type="button" onClick={() => setFormData({ ...formData, category: cat.value })} className="py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center" style={{ background: formData.category === cat.value ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${formData.category === cat.value ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`, color: formData.category === cat.value ? '#fbbf24' : '#9ca3af' }}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Listing Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPES.map(t => (
                      <button key={t.value} type="button" onClick={() => setFormData({ ...formData, type: t.value })} className="py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center" style={{ background: formData.type === t.value ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${formData.type === t.value ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`, color: formData.type === t.value ? '#fbbf24' : '#9ca3af' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price + Area */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price (₹) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input type="number" className="form-input w-full pl-9 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none placeholder-gray-600" placeholder="e.g. 5000000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Area (sqft)</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input type="number" className="form-input w-full pl-9 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none placeholder-gray-600" placeholder="e.g. 1200" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input type="tel" className="form-input w-full pl-9 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none placeholder-gray-600" placeholder="+91 9XXXXXXXXX" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} required />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
                  <textarea className="form-input w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none placeholder-gray-600 resize-none" rows={3} placeholder="Describe the property — amenities, nearby landmarks, condition..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                </div>

                <button type="submit" disabled={isSubmitting} className="glow-btn w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                  {isSubmitting ? (
                    <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Submitting...</>
                  ) : (
                    <><Send className="w-5 h-5" />List This Property</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
