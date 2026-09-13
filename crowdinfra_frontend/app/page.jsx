'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Navbar from './components/navbar'
import { useUserContext } from './components/user_context'
import Link from 'next/link'
import Footer from './components/footer'
import NearbyDemandsMap from './components/NearbyDemandsMap'
import Loading from './components/loading'
import axios from 'axios'
import { toast } from 'react-toastify'
import DecryptedText from './ui_comp/de_para'
import GradientText from './components/ui/gradientText'
import Rating from './components/ratings'
import Cursor from './components/ui/cursor'

export default function GlobePage() {
  const globeRef = useRef()
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [globeLoaded, setGlobeLoaded] = useState(false)
  const router = useRouter()
  // State to track whether to show cursor based on performance
  const [showCursor, setShowCursor] = useState(true)

  // Effect to monitor performance and disable cursor if needed
  useEffect(() => {
    let lastTime = performance.now()
    let frameCount = 0
    let lowPerformanceCount = 0

    const checkPerformance = () => {
      const now = performance.now()
      const elapsed = now - lastTime
      frameCount++

      // Check every second
      if (elapsed >= 1000) {
        const fps = frameCount / (elapsed / 1000)

        // If FPS is below threshold, increment counter
        if (fps < 30) {
          lowPerformanceCount++
          if (lowPerformanceCount >= 3 && showCursor) {
            setShowCursor(false)
          }
        } else {
          // Reset counter if performance improves
          lowPerformanceCount = 0
          if (!showCursor) {
            setShowCursor(true)
          }
        }

        frameCount = 0
        lastTime = now
      }

      requestAnimationFrame(checkPerformance)
    }

    requestAnimationFrame(checkPerformance)

    return () => cancelAnimationFrame(checkPerformance)
  }, [showCursor])

  // Variable to track if the user is authenticated
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/api/users/me`,
          {
            withCredentials: true, // Send cookies with the request
          }
        )

        console.log('Response:', response.data)

        if (response.data && response.data.id) {
          console.log('User is authenticated:', response.data)
          setIsAuthenticated(true)
        } else {
          console.log('Invalid token. Redirecting...')
          toast.error('Please login to continue')
          router.push('/landing')
        }
      } catch (error) {
        console.error('Error verifying user:', error)
        toast.error('Please login to continue')
        router.push('/landing')
      }
    }

    verifyUser()
  }, [])

  // Scroll-reveal IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    const els = document.querySelectorAll('.reveal')
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [isAuthenticated])

  // Prevent rendering until authentication check is complete
  if (isAuthenticated === null) {
    return <Loading text='Verifying user...' />
  }

  const initGlobe = () => {
    if (!globeRef.current || typeof Globe === 'undefined') return

    const world = (globeRef.current.__world = new Globe(globeRef.current, {
      animateIn: false,
    })
      .globeImageUrl(
        '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
      )
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png'))

    // Auto-rotate
    world.controls().autoRotate = true
    world.controls().autoRotateSpeed = 0.35
    world.controls().enableZoom = false

    // Add clouds using THREE from the globe's own renderer (avoids window.THREE)
    try {
      const THREE = world.renderer().constructor.__three || (world.scene().constructor.__three) || window.THREE
      const CLOUDS_IMG_URL = './clouds.png'
      const CLOUDS_ALT = 0.004
      const CLOUDS_ROTATION_SPEED = -0.006

      if (THREE?.TextureLoader) {
        new THREE.TextureLoader().load(CLOUDS_IMG_URL, (cloudsTexture) => {
          const clouds = new THREE.Mesh(
            new THREE.SphereGeometry(world.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
            new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
          )
          world.scene().add(clouds)
          ;(function rotateClouds() {
            clouds.rotation.y += (CLOUDS_ROTATION_SPEED * Math.PI) / 180
            requestAnimationFrame(rotateClouds)
          })()
        })
      }
    } catch (e) {
      // clouds are optional — globe still works without them
    }

    setGlobeLoaded(true)

    // Add double-click event listener to toggle map expansion
    globeRef.current.addEventListener('dblclick', handleMapToggle)

    // Make globe responsive
    const handleResize = () => {
      if (world) {
        world.width(window.innerWidth)
        world.height(window.innerHeight * 0.8)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial sizing

    return () => {
      window.removeEventListener('resize', handleResize)
      globeRef.current?.removeEventListener('dblclick', handleMapToggle)
    }
  }

  const handleMapToggle = () => {
    if (!showMap) return // Don't toggle if map shouldn't be shown

    setIsMapExpanded(!isMapExpanded)

    if (!isMapExpanded) {
      // Expand map
      const mapElement = document.getElementById('map')
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' })

        // Show map with transition
        mapElement.style.transition = 'opacity 1000ms'
        mapElement.style.opacity = '1'
      } else {
        // If map element doesn't exist yet, scroll to bottom
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        })
      }

      // Change navbar background
      const navC = document.getElementById('navC')
      if (navC) {
        navC.style.background = 'transparent'
      }
    } else {
      // Collapse map - scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      // Hide map
      const bottomElement = document.getElementById('map')
      if (bottomElement) {
        bottomElement.style.opacity = '0'
      }

      // Reset navbar
      const navC = document.getElementById('navC')
      if (navC) {
        navC.style.background = 'black'
      }
    }
  }

  return (
    <>
      <style>{`
        @keyframes reveal-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes reveal-left { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes reveal-right { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes counter-glow { 0%,100%{text-shadow:0 0 20px currentColor} 50%{text-shadow:0 0 40px currentColor,0 0 60px currentColor} }
        .reveal { opacity: 0; }
        .reveal.visible { animation: reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .reveal-left.visible { animation: reveal-left 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .reveal-right.visible { animation: reveal-right 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .feature-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .feature-card:hover { transform: translateY(-8px) scale(1.02); }
        .step-num { animation: counter-glow 3s ease infinite; }
        .explore-card:hover { box-shadow: 0 0 40px rgba(6,182,212,0.2); }
        .raise-card:hover { box-shadow: 0 0 40px rgba(245,158,11,0.2); }
      `}</style>
      {/* {showCursor && <Cursor/>} */}
      <div
        id='navC'
        className='bg-black pt-4 md:pt-8 pb-2 md:pb-4 sticky top-0 z-[999]'
      >
        <Navbar />
        <Script src='//unpkg.com/globe.gl' strategy='lazyOnload' onLoad={initGlobe} />
      </div>
      {/* Globe: overflow-hidden is critical — without it the WebGL canvas bleeds
          over all content below and intercepts every click */}
      <div
        className='relative overflow-hidden'
        style={{ height: 'min(80vh, 620px)', marginTop: 0, padding: 0 }}
      >
        {/* Fallback skeleton */}
        {!globeLoaded && (
          <div className='absolute inset-0 flex flex-col items-center justify-center' style={{ background: 'radial-gradient(ellipse at center, #0a1628 0%, #000 70%)' }}>
            <div className='relative w-48 h-48 md:w-64 md:h-64'>
              <div className='absolute inset-0 rounded-full animate-pulse' style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.03) 60%, transparent 80%)', border: '1px solid rgba(6,182,212,0.2)' }} />
              <div className='absolute inset-0 flex items-center justify-center'>
                <svg xmlns='http://www.w3.org/2000/svg' className='w-16 h-16 md:w-20 md:h-20 opacity-40' style={{ color: '#22d3ee' }} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={0.8} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div className='absolute inset-[-20px] rounded-full border border-cyan-500/10 animate-spin' style={{ animationDuration: '8s' }} />
            </div>
            <p className='mt-6 text-sm text-cyan-500/50 tracking-widest uppercase animate-pulse'>Loading Globe...</p>
          </div>
        )}
        {/* pointer-events: none so the canvas NEVER intercepts scroll or clicks
            on the surrounding page — onWheel still forwarded for scroll */}
        <div
          ref={globeRef}
          id='globeViz'
          className='w-full h-full'
          style={{
            opacity: globeLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease',
            pointerEvents: 'none',   // canvas must NOT capture page clicks
          }}
          onWheel={e => window.scrollBy({ top: e.deltaY, behavior: 'auto' })}
        />
      </div>

      <div
        className='bg-black py-8 md:py-16 px-4 text-white'
        style={{ marginTop: '-1px' }}
      >
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-8 md:mb-16 reveal' id='hero-text'>
            <h1 className='text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gray-200'>
              <GradientText
                colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
                animationSpeed={10}
                showBorder={false}
                className='custom-class'
              >
                CrowdInfra - India's First Crowdsourced Infrastructure Platform
              </GradientText>
            </h1>
            <p className='text-lg md:text-xl text-gray-300 max-w-3xl mx-auto'>
              Contribute to improving infrastructure around you and be a part of
              your community's development.
            </p>
          </div>

          {/* <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16'>
            <div className='bg-gray-800/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-gray-700/50 shadow-xl hover:transform hover:scale-105 transition-all duration-300'>
              <div className='bg-blue-600/20 p-4 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-4 md:mb-6'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 md:h-8 md:w-8 text-blue-400'
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
              </div>
              <h3 className='text-xl md:text-2xl font-bold mb-2 md:mb-3 text-blue-400'>
                Find Properties
              </h3>
              <p className='text-gray-300 mb-4 md:mb-6'>
                Discover available properties in your area and get detailed
                information about them.
              </p>
              <Link
                href='/property'
                className='inline-block px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base'
              >
                View Properties
              </Link>
            </div>

            <div className='bg-gray-800/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-gray-700/50 shadow-xl hover:transform hover:scale-105 transition-all duration-300'>
              <div className='bg-purple-600/20 p-4 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-4 md:mb-6'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 md:h-8 md:w-8 text-purple-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <h3 className='text-xl md:text-2xl font-bold mb-2 md:mb-3 text-purple-400'>
                View Demands
              </h3>
              <p className='text-gray-300 mb-4 md:mb-6'>
                See infrastructure demands made by the community and support
                them.
              </p>
              <Link
                href='/search-demands'
                className='inline-block px-4 py-2 md:px-6 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base'
              >
                Browse Demands
              </Link>
            </div>

            <div className='bg-gray-800/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-gray-700/50 shadow-xl hover:transform hover:scale-105 transition-all duration-300'>
              <div className='bg-green-600/20 p-4 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-4 md:mb-6'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 md:h-8 md:w-8 text-green-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
              </div>
              <h3 className='text-xl md:text-2xl font-bold mb-2 md:mb-3 text-green-400'>
                Make Requests
              </h3>
              <p className='text-gray-300 mb-4 md:mb-6'>
                Request necessary infrastructure in your area and gather
                community support.
              </p>
              <Link
                href='/raise-request'
                className='inline-block px-4 py-2 md:px-6 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base'
              >
                Raise Request
              </Link>
            </div>
          </div> */}

          {/* 2 Big Feature Boxes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 md:mb-16'>

            {/* Properties Box */}
            <div className='reveal rounded-3xl overflow-hidden border border-cyan-500/20 group' style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, rgba(6,182,212,0.07) 0%, rgba(0,0,0,0.4) 100%)' }}>
              {/* Header */}
              <div className='px-6 pt-6 pb-4 border-b border-cyan-500/10'>
                <div className='flex items-center gap-3 mb-1'>
                  <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' style={{ color: '#06b6d4' }} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-xl font-black' style={{ color: '#22d3ee' }}>Properties</h2>
                    <p className='text-xs text-gray-500'>Real estate listings near demand hotspots</p>
                  </div>
                </div>
              </div>
              {/* 2 Children */}
              <div className='p-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <Link href='/properties' className='group/card flex flex-col p-4 rounded-2xl border border-cyan-500/10 transition-all duration-300 hover:border-cyan-500/40 hover:bg-cyan-500/5' >
                  <div className='flex items-center gap-2 mb-2'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' style={{ color: '#22d3ee' }} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                    <span className='text-sm font-bold' style={{ color: '#22d3ee' }}>Browse</span>
                  </div>
                  <p className='text-xs text-gray-400 mb-3 leading-relaxed'>Discover listings near infrastructure demand areas</p>
                  <span className='text-xs font-semibold mt-auto' style={{ color: '#06b6d4' }}>View all properties →</span>
                </Link>
                <Link href='/property' className='group/card flex flex-col p-4 rounded-2xl border border-amber-500/10 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/5'>
                  <div className='flex items-center gap-2 mb-2'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' style={{ color: '#fbbf24' }} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                    <span className='text-sm font-bold' style={{ color: '#fbbf24' }}>List</span>
                  </div>
                  <p className='text-xs text-gray-400 mb-3 leading-relaxed'>Pin a location and publish your property listing</p>
                  <span className='text-xs font-semibold mt-auto' style={{ color: '#f59e0b' }}>List a property →</span>
                </Link>
              </div>
            </div>

            {/* Demands Box */}
            <div className='reveal rounded-3xl overflow-hidden border border-amber-500/20 group' style={{ animationDelay: '0.2s', background: 'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(0,0,0,0.4) 100%)' }}>
              {/* Header */}
              <div className='px-6 pt-6 pb-4 border-b border-amber-500/10'>
                <div className='flex items-center gap-3 mb-1'>
                  <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' style={{ color: '#f59e0b' }} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-xl font-black' style={{ color: '#fbbf24' }}>Demands</h2>
                    <p className='text-xs text-gray-500'>Community-raised infrastructure requests</p>
                  </div>
                </div>
              </div>
              {/* 2 Children */}
              <div className='p-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <Link href='/search-demands' className='group/card flex flex-col p-4 rounded-2xl border border-cyan-500/10 transition-all duration-300 hover:border-cyan-500/40 hover:bg-cyan-500/5'>
                  <div className='flex items-center gap-2 mb-2'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' style={{ color: '#22d3ee' }} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                    <span className='text-sm font-bold' style={{ color: '#22d3ee' }}>Explore</span>
                  </div>
                  <p className='text-xs text-gray-400 mb-3 leading-relaxed'>Browse demands on the map and cast your vote</p>
                  <span className='text-xs font-semibold mt-auto' style={{ color: '#06b6d4' }}>Browse demands →</span>
                </Link>
                <Link href='/raise-request' className='group/card flex flex-col p-4 rounded-2xl border border-amber-500/10 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/5'>
                  <div className='flex items-center gap-2 mb-2'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' style={{ color: '#fbbf24' }} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                    <span className='text-sm font-bold' style={{ color: '#fbbf24' }}>Raise</span>
                  </div>
                  <p className='text-xs text-gray-400 mb-3 leading-relaxed'>Report a missing road, school, hospital or anything else</p>
                  <span className='text-xs font-semibold mt-auto' style={{ color: '#f59e0b' }}>Raise a demand →</span>
                </Link>
              </div>
            </div>
          </div>

          <div className='reveal bg-gray-900/40 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-cyan-500/10 shadow-xl mb-8 md:mb-16 text-center' style={{ animationDelay: '0.1s' }}>
            <h2 className='text-2xl md:text-3xl font-bold mb-3 md:mb-4' style={{ color: '#22d3ee', marginBottom: '1.5rem' }}>
              Demands Near You
            </h2>
            <NearbyDemandsMap />
          </div>

          <div className='reveal bg-gray-900/40 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl mb-8 md:mb-16' style={{ animationDelay: '0.15s' }}>
            <div className='text-center'>
              <h2 className='text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white'>How It Works</h2>
              <p className='text-gray-400 mb-6 md:mb-8 max-w-3xl mx-auto'>
                CrowdInfra connects citizens, government agencies, and private developers to collaboratively improve infrastructure.
              </p>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8'>
                <div className='reveal group flex flex-col items-center p-6 transition-all duration-300 hover:bg-amber-500/5 rounded-2xl hover:scale-105 border border-transparent hover:border-amber-500/20' style={{ animationDelay: '0.05s' }}>
                  <div className='w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110' style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <span className='text-2xl font-black step-num' style={{ color: '#f59e0b' }}>1</span>
                  </div>
                  <h3 className='text-lg font-semibold mb-2 text-white group-hover:text-amber-300 transition-colors'>Identify Needs</h3>
                  <p className='text-gray-400 group-hover:text-gray-200 text-center text-sm transition-colors'>Identify infrastructure gaps in your community and pin them on the map</p>
                </div>

                <div className='reveal group flex flex-col items-center p-6 transition-all duration-300 hover:bg-cyan-500/5 rounded-2xl hover:scale-105 border border-transparent hover:border-cyan-500/20' style={{ animationDelay: '0.1s' }}>
                  <div className='w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110' style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
                    <span className='text-2xl font-black step-num' style={{ color: '#06b6d4' }}>2</span>
                  </div>
                  <h3 className='text-lg font-semibold mb-2 text-white group-hover:text-cyan-300 transition-colors'>Gather Support</h3>
                  <p className='text-gray-400 group-hover:text-gray-200 text-center text-sm transition-colors'>Community members upvote and comment on important demands</p>
                </div>

                <div className='reveal group flex flex-col items-center p-6 transition-all duration-300 hover:bg-green-500/5 rounded-2xl hover:scale-105 border border-transparent hover:border-green-500/20' style={{ animationDelay: '0.15s' }}>
                  <div className='w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110' style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <span className='text-2xl font-black step-num' style={{ color: '#22c55e' }}>3</span>
                  </div>
                  <h3 className='text-lg font-semibold mb-2 text-white group-hover:text-green-300 transition-colors'>Implementation</h3>
                  <p className='text-gray-400 group-hover:text-gray-200 text-center text-sm transition-colors'>Authorities and developers act on community-backed demands</p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-black py-5'>
            <Rating />
            <Link
              href='/rating'
              className='group flex items-center justify-center space-x-2 text-white rounded-full px-6 py-3 shadow-lg transition-all duration-300 z-50 relative overflow-hidden'
              style={{
                background: 'linear-gradient(45deg, #40ffaa, #4079ff)',
                marginTop: '3rem',
                marginBottom: '2rem',
                display: 'inline-block',
                marginLeft: '44%',
                // transform: 'translateX(-50%)',
              }}
            >
              <div className='relative overflow-hidden w-full text-center' >
                <span className='block transition-all duration-300 transform group-hover:translate-y-[-100%] group-hover:opacity-0'>
                  Give us a Thumbs Up
                </span>
                <span className='absolute left-0 right-0 top-full opacity-0 transition-all duration-300 transform group-hover:translate-y-[-100%] group-hover:opacity-100 text-white'>
                  We Appreciate You!
                </span>
              </div>

              <div className='absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </Link>
          </div>
          <Footer />
        </div>
      </div>
    </>
  )
}
