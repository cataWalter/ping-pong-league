'use client'

import { useMemo } from 'react'

export interface RatingDataPoint {
  date: string
  rating: number
  matchId?: string
}

interface RatingChartProps {
  data: RatingDataPoint[]
  height?: number
  showGrid?: boolean
  showDots?: boolean
  className?: string
}

export default function RatingChart({
  data,
  height = 200,
  showGrid = true,
  showDots = true,
  className = '',
}: RatingChartProps) {
  const { path, dots, minY, maxY } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', dots: [], minY: 0, maxY: 1000 }
    }

    const ratings = data.map((d) => d.rating)
    const minRating = Math.min(...ratings)
    const maxRating = Math.max(...ratings)
    const padding = Math.max((maxRating - minRating) * 0.1, 50)
    const minYValue = Math.floor(minRating - padding)
    const maxYValue = Math.ceil(maxRating + padding)

    const width = 100
    const chartHeight = 100
    const xStep = data.length > 1 ? width / (data.length - 1) : width
    const yRange = maxYValue - minYValue

    const points = data.map((d, i) => ({
      x: i * xStep,
      y: chartHeight - ((d.rating - minYValue) / yRange) * chartHeight,
    }))

    const pathData = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ')

    const areaPath =
      pathData +
      ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`

    const dotData = points.map((p, i) => ({
      x: p.x,
      y: p.y,
      rating: data[i].rating,
      date: data[i].date,
    }))

    return { path: areaPath, dots: dotData, minY: minYValue, maxY: maxYValue }
  }, [data])

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-gray-400 text-sm ${className}`}
        style={{ height }}
      >
        No rating history available
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </>
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={path} fill="url(#ratingGradient)" />

        {/* Line */}
        <path
          d={path.replace(/ Z$/, '')}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots &&
          dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r="3"
              fill="white"
              stroke="#16a34a"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="hover:r-4 transition-all duration-200 cursor-pointer"
            >
              <title>{`${dot.date}: ${Math.round(dot.rating)}`}</title>
            </circle>
          ))}
      </svg>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-10 w-8 text-right">
        <span>{Math.round(maxY)}</span>
        <span>{Math.round((maxY + minY) / 2)}</span>
        <span>{Math.round(minY)}</span>
      </div>
    </div>
  )
}