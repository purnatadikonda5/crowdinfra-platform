'use client'
import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [demandLocations, setDemandLocations] = useState([])
  const [overlayOn, setOverlayOn] = useState(false)
  const [imageBlob, setImageBlob] = useState(null)
  const [scaleVal, setScaleVal] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [activeDemand, setActiveDemand] = useState(null)
  const [user, setUser] = useState(null) // Track logged-in user
  const router = useRouter()

  // Verify user authentication — backend uses httpOnly cookie, so just call /api/users/me
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/users/me`,
          { withCredentials: true }
        )
        if (response.data && response.data.id) {
          setUser(response.data)
        }
      } catch {
        // not logged in — silent
      }
    }
    verifyUser()
  }, [])

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/auth/logout`,
        {},
        { withCredentials: true }
      )
    } catch { /* ignore */ }
    setUser(null)
    router.push('/auth')
  }

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        selectedPlace,
        setSelectedPlace,
        demandLocations,
        setDemandLocations,
        overlayOn,
        setOverlayOn,
        imageBlob,
        setImageBlob,
        scaleVal,
        setScaleVal,
        searchResults,
        activeDemand,
        handlePlaceSelect: (place) => {
          if (place?.geometry?.location) {
            setSelectedPlace({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              name: place.formatted_address || '',
              placeId: place.place_id,
            })
            setActiveDemand(null)
          }
        },
        handleMapClick: (event) => {
          if (event?.latLng) {
            setSelectedPlace({
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
              name: 'Pinned Location',
            })
            setActiveDemand(null)
          }
        },
        raiseDemand: (demandDetails) => {
          if (selectedPlace) {
            setDemandLocations((prev) => [
              ...prev,
              {
                id: Date.now(),
                ...demandDetails,
                location: selectedPlace,
                status: 'active',
              },
            ])
            setSelectedPlace(null)
          }
        },
        loadDemandMarkers: setDemandLocations,
        highlightDemand: (demandId) => {
          const demand = demandLocations.find((d) => d.id === demandId)
          if (demand) {
            setActiveDemand(demand)
            setSelectedPlace(null)
          }
        },
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => useContext(UserContext)
