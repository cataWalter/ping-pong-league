import dynamic from 'next/dynamic'

const StatsPageContent = dynamic(() => import('./StatsPageContent'), {
  ssr: false,
})

export const dynamicParams = true

export default function Page() {
  return <StatsPageContent />
}