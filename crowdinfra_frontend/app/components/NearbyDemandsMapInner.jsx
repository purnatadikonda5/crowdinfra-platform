'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'
import Loading from './loading'

const containerStyle = {
  width: '100%',
  height: '450px',
}

const defaultCenter = { lat: 20.5937, lng: 78.9629 } // Default: India center

export default function NearbyDemandsMapInner({ onDemandSelect }) {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [demands, setDemands] = useState([])
  const [selectedDemand, setSelectedDemand] = useState(null)
  const [hoveringInfoWindow, setHoveringInfoWindow] = useState(false)
  const [hoveringUserLocation, setHoveringUserLocation] = useState(false)

  // Remove google maps useLoadScript logic

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setLocation(userLocation)
        fetchNearbyDemands(userLocation)
      },
      (err) => {
        setError(`Location access denied: ${err.message}`)
      }
    )
  }, [])

  const fetchNearbyDemands = async (userLocation) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/demands`,
        { withCredentials: true }
      )
      
      // Filter demands by distance since /nearby doesn't exist yet
      const maxDistance = 0.05 // Roughly 5km in degrees
      const nearbyDemands = response.data.filter(demand => {
        if (!demand.location) return false
        const dLat = demand.location.lat
        const dLng = demand.location.lng
        const distance = Math.sqrt(Math.pow(dLat - userLocation.lat, 2) + Math.pow(dLng - userLocation.lng, 2))
        return distance <= maxDistance
      })

      setDemands(nearbyDemands)
    } catch (error) {
      console.error('Error fetching demands:', error)
      setError('Failed to load nearby demands.')
    }
  }

  const handleDemandSelect = (demand) => {
    setSelectedDemand(demand)
    onDemandSelect && onDemandSelect(demand)
  }

  if (error) return <p className='text-red-500'>{error}</p>
  if (!location) return <Loading text='Loading map...' />

  return (
    <div className='relative' style={containerStyle}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {console.log('Leaflet Map Loaded')}
        {location && (
          <>
            {/* User Location Marker */}
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div
                  className='bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg shadow-lg'
                  onMouseEnter={() => setHoveringUserLocation(true)}
                  onMouseLeave={() => setHoveringUserLocation(false)}
                >
                  <div className='flex items-center mb-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-6 w-6 text-blue-600 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                    <h3 className='text-lg font-bold text-blue-900'>
                      Your Location
                    </h3>
                  </div>

                  <div className='bg-white/50 backdrop-blur-sm rounded-md p-2'>
                    <p className='text-sm text-blue-800 mb-1'>
                      <strong>Latitude:</strong> {location.lat.toFixed(4)}°N
                    </p>
                    <p className='text-sm text-blue-800'>
                      <strong>Longitude:</strong> {location.lng.toFixed(4)}°E
                    </p>
                  </div>

                  <p className='text-xs text-blue-700 mt-2 italic'>
                    Your current precise location
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {demands.map((demand) => (
          <Marker
            key={demand.id}
            position={[demand.location.lat, demand.location.lng]}
            eventHandlers={{
              click: () => handleDemandSelect(demand),
            }}
          >
            <Popup>
              <div className='bg-white p-2 rounded'>
                <a
                  href={`/viewrequest?id=${demand.id}`}
                  className='text-blue-600 hover:underline text-xs block'
                >
                  <h3 className='text-sm font-bold'>{demand.title}</h3>
                </a>
                <p className='text-xs text-gray-700 mt-1 line-clamp-2'>
                  {demand.description}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  <strong>Category:</strong> {demand.category}
                </p>
                <p className='text-xs text-gray-500'>
                  <strong>Upvotes:</strong> {demand.upvoteCount || 0}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
