'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'
import { useEffect } from 'react'

export default function SearchDemandsMapInner({ filteredDemands, selectedLocation, center, selectedDemand, handleMarkerClick }) {
  const mapCenter = selectedLocation || center || { lat: 20.5937, lng: 78.9629 };
  const zoomLevel = selectedLocation ? 15 : 5;

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={zoomLevel}
      style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      
      {filteredDemands.map((demand) => (
        <Marker
          key={demand.id}
          position={[demand.location.lat, demand.location.lng]}
          eventHandlers={{
            click: () => handleMarkerClick(demand),
          }}
        >
          <Popup>
            <div className='font-sans'>
              <h3 className='font-bold'>{demand.title}</h3>
              <p className='text-sm mt-1'>{demand.category}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
