import dynamic from 'next/dynamic'

const PlayerPageContent = dynamic(() => import('./PlayerPageContent'), {
  ssr: false,
})

export const dynamicParams = true

export default function Page({ params }: { params: { id: string } }) {
  return <PlayerPageContent params={params} />
}