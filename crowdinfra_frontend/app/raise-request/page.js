'use client'

import React, { useState, useEffect } from 'react'
import RaiseRequestMap from '../components/RaiseRequestMap'
import Navbar from '../components/navbar'
import { useUserContext } from '../components/user_context'
import PlaceAutocomplete from '../components/autocomplete'
import { X, MapPin, Flame, Send, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-toastify'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'

const CATEGORIES = [
  { value: 'infrastructure', label: '🏗️ Infrastructure' },
  { value: 'education', label: '📚 Education' },
  { value: 'healthcare', label: '🏥 Healthcare' },
  { value: 'transport', label: '🚌 Transport' },
  { value: 'environment', label: '🌱 Environment' },
  { value: 'utilities', label: '⚡ Utilities' },
  { value: 'other', label: '📌 Other' },
]

const STEPS = [
  { n: '01', title: 'Pick Location', desc: 'Click anywhere on the map or use the search bar to pinpoint your location.' },
  { n: '02', title: 'Click to Raise', desc: 'An info window appears — click "Raise Request Here" to open the form.' },
  { n: '03', title: 'Fill Details', desc: 'Describe the infrastructure need: title, category, and description.' },
  { n: '04', title: 'Submit', desc: 'Your demand goes live on the map for authorities and businesses to see.' },
]

const RaiseRequestPage = () => {
  const [showSteps, setShowSteps] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showLocationPopup, setShowLocationPopup] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', category: 'infrastructure' })
  const [submittedRequests, setSubmittedRequests] = useState([])
  const [activeRequest, setActiveRequest] = useState(null)
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
      const res = await fetch(`${API}/api/demands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          location: { lat: selectedLocation.lat, lng: selectedLocation.lng, address: 'Selected Location' },
        }),
      })
      if (!res.ok) {
        if (res.status === 401) { toast.error('Please log in to raise a demand'); window.location.href = '/auth'; return }
        throw new Error('Server error')
      }
      const data = await res.json()
      const newReq = { ...formData, id: data.id, coordinates: [selectedLocation.lng, selectedLocation.lat] }
      setSubmittedRequests(prev => [...prev, newReq])
      setFormData({ title: '', description: '', category: 'infrastructure' })
      setShowForm(false)
      setShowLocationPopup(false)
      setActiveRequest(newReq.id)
      setJustSubmitted(true)
      setTimeout(() => setJustSubmitted(false), 4000)
      toast.success('Demand raised successfully! 🎉')
    } catch {
      toast.error('Failed to submit demand. Please try again.')
    } finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f0800 0%, #1a0e00 40%, #0f0500 100%)' }}>
      <style>{`
        @keyframes ember-float { 0%{transform:translateY(0) scale(1);opacity:0.8} 50%{transform:translateY(-20px) scale(1.1);opacity:1} 100%{transform:translateY(-40px) scale(0.8);opacity:0} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px #f59e0b40,0 0 40px #f59e0b20} 50%{box-shadow:0 0 40px #f59e0b80,0 0 80px #f59e0b40} }
        @keyframes step-in { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes success-pop { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .step-item { animation: step-in 0.4s ease forwards; animation-fill-mode: both; }
        .glow-btn { animation: glow-pulse 2.5s ease infinite; transition: transform 0.2s ease; }
        .glow-btn:hover { transform: scale(1.03) translateY(-2px); }
        .success-badge { animation: success-pop 0.5s ease forwards; }
        .form-input:focus { box-shadow: 0 0 0 2px #f59e0b60, 0 0 20px #f59e0b20; }
        .form-input { transition: all 0.2s ease; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #f59e0b40; }
      `}</style>

      <Navbar />

      {/* Just Submitted Banner */}
      {justSubmitted && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 success-badge flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', boxShadow: '0 10px 40px #f59e0b60' }}>
          <CheckCircle className="w-5 h-5" /> Demand raised and live on the map!
        </div>
      )}

      <div className="pt-20 px-6 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-orange-400" style={{ animation: 'ember-float 2s ease infinite' }} />
            <span className="text-xs font-bold tracking-widest uppercase text-orange-400">Community Action</span>
          </div>
          <h1 className="text-5xl font-black" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 50%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Raise a Demand
          </h1>
          <p className="text-gray-400 mt-2">Pin a location, describe the need — your community&apos;s voice on the map.</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6 max-w-md">
            <PlaceAutocomplete />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Steps Panel */}
            <div className="md:col-span-1 rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(245,158,11,0.04)', height: 'fit-content' }}>
              <button className="w-full flex items-center justify-between px-5 py-4 font-bold border-b border-white/5" style={{ color: '#fbbf24' }} onClick={() => setShowSteps(s => !s)}>
                <span className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #ef4444)' }} />
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
                  <div className="mt-4 p-3 rounded-xl text-xs text-amber-300 leading-relaxed" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    💡 You can drag the marker to fine-tune the location before submitting.
                  </div>
                </div>
              )}

              {/* Submitted count */}
              {submittedRequests.length > 0 && (
                <div className="px-5 py-4 border-t border-white/5">
                  <p className="text-xs text-gray-400 mb-2 font-semibold">SUBMITTED THIS SESSION</p>
                  <div className="space-y-2">
                    {submittedRequests.map(r => (
                      <div key={r.id} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)' }}>
                        <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{r.title}</span>
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
              <RaiseRequestMap
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                center={{ lat: 20.5937, lng: 78.9629 }}
                submittedRequests={submittedRequests}
                activeRequest={activeRequest}
                setActiveRequest={setActiveRequest}
                showLocationPopup={showLocationPopup}
                setShowLocationPopup={setShowLocationPopup}
                setShowForm={setShowForm}
                handleCloseLocationPopup={handleCloseLocationPopup}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Demand Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-lg">
            <div className="rounded-3xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(135deg, #1a0e00 0%, #0f0800 100%)', boxShadow: '0 30px 80px #f59e0b30' }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Raise Demand</p>
                    {selectedLocation && <p className="text-xs text-gray-500">{selectedLocation.lat?.toFixed(4)}, {selectedLocation.lng?.toFixed(4)}</p>}
                  </div>
                </div>
                <button onClick={() => { setShowForm(false); setShowLocationPopup(true) }} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Title *</label>
                  <input
                    type="text"
                    className="form-input w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none placeholder-gray-600"
                    placeholder="e.g. Need road repair on Main Street"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className="py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center"
                        style={{
                          background: formData.category === cat.value ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${formData.category === cat.value ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: formData.category === cat.value ? '#fbbf24' : '#9ca3af',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
                  <textarea
                    className="form-input w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none placeholder-gray-600 resize-none"
                    rows={4}
                    placeholder="Describe the infrastructure need in detail..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glow-btn w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5" />
                      Raise This Demand
                    </>
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

export default RaiseRequestPage
