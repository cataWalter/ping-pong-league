import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import ClientProviders from '@/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ping Pong League - Office Table Tennis Rankings',
  description: 'Track your matches, climb the leaderboard, and become the office champion. Features ELO ratings, achievements, and comprehensive statistics.',
  keywords: ['ping pong', 'table tennis', 'league', 'ELO', 'rankings', 'office sports'],
  authors: [{ name: 'Ping Pong League' }],
  openGraph: {
    title: 'Ping Pong League - Office Table Tennis Rankings',
    description: 'Track your matches, climb the leaderboard, and become the office champion.',
    type: 'website',
  },
}

const navigation = [
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Matches', href: '/matches' },
  { name: 'Players', href: '/players' },
  { name: 'Stats', href: '/stats' },
  { name: 'Head-to-Head', href: '/head2head' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <ClientProviders>
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Logo */}
                <div className="flex">
                  <Link
                    href="/"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl">🏓</span>
                    <span className="font-bold text-xl text-gray-900 hidden sm:block">
                      Ping Pong League
                    </span>
                  </Link>

                  {/* Desktop Navigation */}
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/matches/new"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <span className="hidden sm:inline">Record Match</span>
                    <span className="sm:hidden">+</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
            <div className="flex justify-around">
              {navigation.slice(0, 5).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center py-2 px-3 text-xs font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {item.name === 'Leaderboard' && '🏆'}
                  {item.name === 'Matches' && '🎾'}
                  {item.name === 'Players' && '👥'}
                  {item.name === 'Stats' && '📊'}
                  {item.name === 'Head-to-Head' && '⚔️'}
                  <span className="mt-1">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Ping Pong League. Built with Next.js & Turso.
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href="https://github.com"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="sr-only">GitHub</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </ClientProviders>
      </body>
    </html>
  )
}