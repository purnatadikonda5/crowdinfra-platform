'use client'
import dynamic from 'next/dynamic'

const RaiseRequestMapInner = dynamic(
  () => import('./RaiseRequestMapInner'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center"><span className="text-gray-400">Loading Map...</span></div>
  }
)

export default function RaiseRequestMap(props) {
  return <RaiseRequestMapInner {...props} />
}
