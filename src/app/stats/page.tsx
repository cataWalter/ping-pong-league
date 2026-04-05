import { lazy } from 'react'

const StatsPageContent = lazy(() => import('./StatsPageContent'))

export const dynamic = 'force-dynamic'

export default function Page() {
  return <StatsPageContent />
}