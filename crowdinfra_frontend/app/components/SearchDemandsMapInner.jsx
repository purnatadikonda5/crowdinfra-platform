'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'
import { divIcon } from 'leaflet'

const CAT_COLORS = {
  infrastructure: '#3b82f6',
  education: '#8b5cf6',
  healthcare: '#ef4444',
  transport: '#f59e0b',
  environment: '#10b981',
  other: '#6b7280',
}

export default function SearchDemandsMapInner({ filteredDemands, demands, selectedLocation, center, selectedDemand, onMarkerClick }) {
  const demandsToShow = filteredDemands || demands || []
  const mapCenter = selectedLocation || center || { lat: 20.5937, lng: 78.9629 }
  const zoomLevel = selectedLocation ? 15 : 5

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={zoomLevel}
      style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {demandsToShow.filter(d => d.location?.lat && d.location?.lng).map((demand) => {
        const color = CAT_COLORS[demand.category?.toLowerCase()] || '#06b6d4'
        const isSelected = selectedDemand?.id === demand.id
        const size = isSelected ? 20 : 14
        const icon = divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 ${isSelected ? 16 : 8}px ${color};"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
        return (
          <Marker
            key={demand.id}
            position={[demand.location.lat, demand.location.lng]}
            icon={icon}
            eventHandlers={{ click: () => onMarkerClick && onMarkerClick(demand) }}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', minWidth: 140 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{demand.title}</div>
                <div style={{ fontSize: 12, color, textTransform: 'capitalize' }}>{demand.category}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>👍 {demand.upvoteCount || 0} votes</div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
