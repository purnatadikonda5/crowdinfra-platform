'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    // pathname changed = navigation completed
    if (prevPath.current !== pathname) {
      prevPath.current = pathname
      setProgress(100)
      setTimeout(() => { setVisible(false); setProgress(0) }, 400)
      clearInterval(timerRef.current)
    }
  }, [pathname])

  // Intercept all link clicks to show bar immediately
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return
      if (href === pathname) return

      setProgress(15)
      setVisible(true)
      clearInterval(timerRef.current)
      // Simulate incremental progress
      let p = 15
      timerRef.current = setInterval(() => {
        p += Math.random() * 12
        if (p >= 90) { clearInterval(timerRef.current); p = 90 }
        setProgress(p)
      }, 300)
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      clearInterval(timerRef.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 3,
      zIndex: 99999, pointerEvents: 'none',
      background: 'rgba(0,0,0,0.1)',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #06b6d4, #22d3ee, #f59e0b)',
        transition: progress === 100 ? 'width 0.2s ease, opacity 0.3s ease' : 'width 0.3s ease',
        boxShadow: '0 0 10px #22d3ee, 0 0 20px #06b6d480',
        borderRadius: '0 2px 2px 0',
      }} />
    </div>
  )
}
