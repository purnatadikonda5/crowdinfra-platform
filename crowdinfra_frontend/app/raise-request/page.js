'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import RaiseRequestMap from '../components/RaiseRequestMap'
import Navbar from '../components/navbar'
import { useUserContext } from '../components/user_context'
import PlaceAutocomplete from '../components/autocomplete'
import { X, MapPin } from 'lucide-react'
import Footer from '../components/footer'
import Link from 'next/link'
import Loading from '../components/loading'

const containerStyle = {
  width: '100%',
  height: '70vh',
}

const center = {
  lat: 20.5937,
  lng: 78.9629,
}

const RaiseRequestPage = () => {
  const [showSteps, setShowSteps] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showLocationPopup, setShowLocationPopup] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
  })
  const [submittedRequests, setSubmittedRequests] = useState([])
  const [activeRequest, setActiveRequest] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { selectedPlace } = useUserContext() || {}

  // Removed useLoadScript

  useEffect(() => {
    if (selectedPlace && selectedPlace.lat && selectedPlace.lng) {
      setSelectedLocation({
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
      })
    }
  }, [selectedPlace])

  // Removed custom handleMapClick, now handled inside RaiseRequestMapInner

  const handleCloseLocationPopup = () => {
    setShowLocationPopup(false)
    setSelectedLocation(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
      alert('Please select a location on the map')
      return
    }

    setIsSubmitting(true)

    try {
      const demandData = {
        ...formData,
        location: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: "Unknown"
        },
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/demands`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(demandData),
        }
      )

      const data = await response.json()

      console.log('Demand submission response:', data)

      if (response.ok) {
        console.log('demand id ', data.id)
        const newRequest = {
          ...demandData,
          id: data.id, 
          coordinates: [demandData.location.lng, demandData.location.lat],
        }

        setSubmittedRequests((prev) => [...prev, newRequest])

        // Reset form and show location marker
        setFormData({
          title: '',
          description: '',
          category: 'infrastructure',
        })
        setShowForm(false)
        setShowLocationPopup(false)
        setActiveRequest(newRequest.id)
      } else {
        alert(`Error: ${data.error || 'Failed to submit demand'}`)
      }
    } catch (error) {
      console.error('Error submitting demand:', error)
      alert('Failed to submit demand. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Removed isLoaded block

  return (
    <>
      <div className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-10 text-gray-100'>
        <Navbar />

        <div className='container mx-auto px-4 py-8 mt-8'>
          <h1 className='text-4xl font-bold mb-8 text-center mt-8'>
            Raise Facility Request
          </h1>

          <div className='mb-6 flex items-center justify-center'>
            <div className='w-1/2'>
              <PlaceAutocomplete />
            </div>
          </div>

          {/* Main Content with Side-by-Side Layout */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Steps Section - Left Column */}
            <div className='md:col-span-1 bg-gray-800/50 rounded-xl p-6 border border-gray-700 h-fit'>
              <div
                className='flex items-center justify-between cursor-pointer'
                onClick={() => setShowSteps(!showSteps)}
              >
                <h2 className='text-2xl font-semibold flex items-center'>
                  How to Raise a Request
                </h2>
                <button className='text-blue-300 hover:text-blue-100'>
                  {showSteps ? 'Hide Steps' : 'Show Steps'}
                </button>
              </div>

              {showSteps && (
                <div className='mt-4 space-y-4 text-gray-300'>
                  <div className='flex items-start'>
                    <span className='mr-3 text-blue-400 font-bold text-lg'>
                      1.
                    </span>
                    <p>
                      Use the search bar or click directly on the map to select
                      the location for your facility request.
                    </p>
                  </div>

                  <div className='flex items-start'>
                    <span className='mr-3 text-blue-400 font-bold text-lg'>
                      2.
                    </span>
                    <p>
                      An info window will appear. Click "Raise Request Here" to
                      open the request details form.
                    </p>
                  </div>

                  <div className='flex items-start'>
                    <span className='mr-3 text-blue-400 font-bold text-lg'>
                      3.
                    </span>
                    <p>
                      Fill in all the required details about your request,
                      including title, description, and category.
                    </p>
                  </div>

                  <div className='flex items-start'>
                    <span className='mr-3 text-blue-400 font-bold text-lg'>
                      4.
                    </span>
                    <p>
                      Review your information and submit. Your request will be
                      displayed on the map for authorities to review.
                    </p>
                  </div>

                  <div className='mt-4 bg-blue-900/30 p-3 rounded-lg border border-blue-800/50 text-blue-200'>
                    <p>
                      💡 Pro Tip: You can drag the marker to adjust the exact
                      location of your request.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Map Section - Right Columns */}
            <div className='md:col-span-2 rounded-xl overflow-hidden shadow-2xl relative'>
              <div style={containerStyle}>
                <RaiseRequestMap
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  center={center}
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

          {/* Form Overlay */}
          {showForm && (
            <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
              <div className='relative w-full max-w-2xl'>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setShowLocationPopup(true)
                  }}
                  className='absolute -top-10 right-0 text-white hover:text-gray-300'
                >
                  <X size={30} />
                </button>
                <form
                  onSubmit={handleSubmit}
                  className='bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-lg font-medium text-gray-200 mb-2'>
                        Request Title
                      </label>
                      <input
                        type='text'
                        className='w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300'
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-lg font-medium text-gray-200 mb-2'>
                        Category
                      </label>
                      <select
                        className='w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300'
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      >
                        <option value='infrastructure'>Infrastructure</option>
                        <option value='public_service'>Public Service</option>
                        <option value='transportation'>Transportation</option>
                        <option value='utilities'>Utilities</option>
                        <option value='education'>Education</option>
                        <option value='healthcare'>Healthcare</option>
                        <option value='other'>Other</option>
                      </select>
                    </div>

                    <div className='md:col-span-2'>
                      <label className='block text-lg font-medium text-gray-200 mb-2'>
                        Description
                      </label>
                      <textarea
                        className='w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300'
                        rows='4'
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className='flex justify-center mt-8'>
                    <button
                      type='submit'
                      className='px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2'></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default RaiseRequestPage
