'use client'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'
import { useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

// Component to handle map clicks
function ClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

export default function PropertyMapInner({
  selectedLocation,
  setSelectedLocation,
  center,
  submittedProperties,
  activeProperty,
  setActiveProperty,
  showLocationPopup,
  setShowLocationPopup,
  setShowForm,
  handleCloseLocationPopup
}) {
  const mapCenter = selectedLocation || center || { lat: 20.5937, lng: 78.9629 };
  const zoomLevel = selectedLocation ? 15 : 5;
  const markerRef = useRef(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const latLng = marker.getLatLng()
          setSelectedLocation({ lat: latLng.lat, lng: latLng.lng })
          setShowLocationPopup(true)
        }
      },
    }),
    [setSelectedLocation, setShowLocationPopup],
  )

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={zoomLevel}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      
      <ClickHandler onClick={(latLng) => {
        setSelectedLocation(latLng)
        setShowLocationPopup(true)
        setShowForm(false)
      }} />

      {selectedLocation && (
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[selectedLocation.lat, selectedLocation.lng]}
          ref={markerRef}
        >
          {showLocationPopup && (
            <Popup autoPan={false}>
              <div className='p-2 bg-white rounded-lg'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-lg font-bold text-gray-800'>Raise a Property</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowForm(true)
                    setShowLocationPopup(false)
                  }}
                  className='w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center'
                >
                  <MapPin className='mr-2' size={16} /> Raise Property Here
                </button>
              </div>
            </Popup>
          )}
        </Marker>
      )}

      {submittedProperties.map((property) => (
        <Marker
          key={property.id}
          position={[property.coordinates[1], property.coordinates[0]]}
          eventHandlers={{
            click: () => setActiveProperty(activeProperty === property.id ? null : property.id),
          }}
        >
          <Popup>
            <div className='p-2 max-w-xs font-sans'>
              <h3 className='text-lg font-bold text-blue-600 mb-1'>
                {property.title}
              </h3>
              <p className='text-gray-700 mb-2 text-sm'>
                {property.description}
              </p>
              <div className='flex justify-between'>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                  {property.category}
                </span>
                <span className='text-green-600 font-semibold'>
                  ₹{property.price}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
