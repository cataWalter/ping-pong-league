import { clsx } from 'clsx'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showRank?: boolean
  rank?: number
}

export default function Avatar({
  name,
  src,
  size = 'md',
  className = '',
  showRank = false,
  rank,
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  }

  const rankColors = {
    1: 'bg-yellow-100 text-yellow-800 ring-yellow-400',
    2: 'bg-gray-100 text-gray-800 ring-gray-400',
    3: 'bg-orange-100 text-orange-800 ring-orange-400',
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src) {
    return (
      <div className={clsx('relative inline-block', className)}>
        <img
          src={src}
          alt={name}
          className={clsx('rounded-full object-cover', sizes[size])}
        />
        {showRank && rank && rank <= 3 && (
          <span
            className={clsx(
              'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ring-2',
              rankColors[rank as 1 | 2 | 3]
            )}
          >
            {rank}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={clsx('relative inline-block', className)}>
      <div
        className={clsx(
          'rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700',
          sizes[size]
        )}
      >
        {initials}
      </div>
      {showRank && rank && rank <= 3 && (
        <span
          className={clsx(
            'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ring-2',
            rankColors[rank as 1 | 2 | 3]
          )}
        >
          {rank}
        </span>
      )}
    </div>
  )
}