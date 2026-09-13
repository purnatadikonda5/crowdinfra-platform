'use client'

import { Search, MapPin, Home, Building2, Star, Plus, ChevronDown, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useUserContext } from './user_context'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useUserContext()
  const [exploreOpen, setExploreOpen] = useState(false)
  const [raiseOpen, setRaiseOpen] = useState(false)
  const exploreRef = useRef(null)
  const raiseRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) setExploreOpen(false)
      if (raiseRef.current && !raiseRef.current.contains(e.target)) setRaiseOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (href) => pathname === href
  const isExploreActive = isActive('/search-demands') || isActive('/properties') || pathname?.startsWith('/properties/')
  const isRaiseActive = isActive('/raise-request') || isActive('/property')

  return (
    <nav className='fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-2.5 rounded-2xl w-[95%] max-w-5xl border border-white/10 transition-all duration-500'
      style={{ background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset' }}>

      {/* Left — Logo */}
      <Link href='/landing' className='group flex items-center gap-2.5 flex-shrink-0'>
        <div className='w-8 h-8 relative transition-transform duration-300 group-hover:scale-110'>
          <Image className='object-contain' src='/logo.png' fill sizes='32px' alt='crowdinfra' priority style={{ borderRadius: '50%' }} />
        </div>
        <span className='text-white font-bold text-base tracking-wide hidden sm:block'>CrowdInfra</span>
      </Link>

      {/* Center — Navigation */}
      <div className='flex items-center gap-1'>

        {/* Home */}
        <NavLink href='/' active={isActive('/')}>
          <Home className='w-4 h-4' />
          <span>Home</span>
        </NavLink>

        {/* Explore Dropdown */}
        <div ref={exploreRef} className='relative'>
          <button
            onClick={() => { setExploreOpen(o => !o); setRaiseOpen(false) }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isExploreActive ? 'text-cyan-400' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
            style={isExploreActive ? { background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' } : {}}
          >
            <Search className='w-4 h-4' />
            <span>Explore</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
          </button>

          {exploreOpen && (
            <div className='absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl overflow-hidden border border-white/10 py-1.5'
              style={{ background: 'rgba(8,8,20,0.97)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}>
              <DropdownItem href='/search-demands' icon={<TrendingUp className='w-4 h-4' style={{ color: '#06b6d4' }} />} label='Browse Demands' sub='Explore community requests' onClick={() => setExploreOpen(false)} />
              <DropdownItem href='/properties' icon={<Building2 className='w-4 h-4' style={{ color: '#06b6d4' }} />} label='Browse Properties' sub='Find listings near demands' onClick={() => setExploreOpen(false)} />
            </div>
          )}
        </div>

        {/* Raise Dropdown */}
        <div ref={raiseRef} className='relative'>
          <button
            onClick={() => { setRaiseOpen(o => !o); setExploreOpen(false) }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isRaiseActive ? 'text-amber-400' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
            style={isRaiseActive ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' } : {}}
          >
            <Plus className='w-4 h-4' />
            <span>Raise</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${raiseOpen ? 'rotate-180' : ''}`} />
          </button>

          {raiseOpen && (
            <div className='absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl overflow-hidden border border-white/10 py-1.5'
              style={{ background: 'rgba(8,8,20,0.97)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}>
              <DropdownItem href='/raise-request' icon={<MapPin className='w-4 h-4' style={{ color: '#f59e0b' }} />} label='Raise a Demand' sub='Report infrastructure gaps' onClick={() => setRaiseOpen(false)} />
              <DropdownItem href='/property' icon={<Building2 className='w-4 h-4' style={{ color: '#f59e0b' }} />} label='List a Property' sub='Add your listing to the map' onClick={() => setRaiseOpen(false)} />
            </div>
          )}
        </div>

        {/* Rate Us */}
        <NavLink href='/rating' active={isActive('/rating')}>
          <Star className='w-4 h-4' />
          <span>Rate Us</span>
        </NavLink>

      </div>

      {/* Right — Profile */}
      <Link href='/profile' className='group flex-shrink-0'>
        <div className='w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 transition-all duration-300 group-hover:border-cyan-500/50 group-hover:scale-110'>
          <Image src='/default-avatar.png' width={32} height={32} alt='Profile' priority className='object-cover w-full h-full' />
        </div>
      </Link>
    </nav>
  )
}

function NavLink({ href, active, children }) {
  return (
    <Link href={href}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
      style={active ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' } : {}}>
      {children}
    </Link>
  )
}

function DropdownItem({ href, icon, label, sub, onClick }) {
  return (
    <Link href={href} onClick={onClick}
      className='flex items-center gap-3 px-4 py-2.5 hover:bg-white/6 transition-colors group'>
      <div className='w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0' style={{ background: 'rgba(255,255,255,0.06)' }}>
        {icon}
      </div>
      <div>
        <div className='text-sm font-semibold text-white group-hover:text-white/90'>{label}</div>
        <div className='text-xs text-gray-500 mt-0.5'>{sub}</div>
      </div>
    </Link>
  )
}
