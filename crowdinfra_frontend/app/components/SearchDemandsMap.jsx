'use client'
import dynamic from 'next/dynamic'

const SearchDemandsMapInner = dynamic(
  () => import('./SearchDemandsMapInner'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-800 animate-pulse flex items-center justify-center rounded-xl"><span className="text-gray-400">Loading Map...</span></div>
  }
)

export default function SearchDemandsMap(props) {
  return <SearchDemandsMapInner {...props} />
}
