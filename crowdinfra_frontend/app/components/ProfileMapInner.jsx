'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet-defaulticon-compatibility'

export default function ProfileMapInner({ mapCenter }) {
  if (!mapCenter) return null;
  
  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={[mapCenter.lat, mapCenter.lng]} />
    </MapContainer>
  )
}
