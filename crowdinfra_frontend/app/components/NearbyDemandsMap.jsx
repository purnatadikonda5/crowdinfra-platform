'use client'

import dynamic from 'next/dynamic'
import Loading from './loading'

const NearbyDemandsMapInner = dynamic(
  () => import('./NearbyDemandsMapInner'),
  {
    ssr: false,
    loading: () => <Loading text='Loading Map...' />,
  }
)

export default function NearbyDemandsMap(props) {
  return <NearbyDemandsMapInner {...props} />
}
