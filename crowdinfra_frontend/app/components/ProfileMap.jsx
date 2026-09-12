'use client'
import dynamic from 'next/dynamic'

const ProfileMapInner = dynamic(
  () => import('./ProfileMapInner'),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full flex items-center justify-center bg-gray-800">
      <div className="animate-pulse flex flex-col items-center">
        <div className="rounded-full bg-gray-700 h-10 w-10 mb-2"></div>
        <div className="h-2 bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  }
)

export default function ProfileMap(props) {
  return <ProfileMapInner {...props} />
}
