'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components'

interface Player {
  id: string
  name: string
  rating: number
}

export default function NewMatchPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [player1Score, setPlayer1Score] = useState('')
  const [player2Score, setPlayer2Score] = useState('')
  const [bestOf, setBestOf] = useState('1')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [winProbability, setWinProbability] = useState<{ p1: number; p2: number } | null>(null)

  useEffect(() => {
    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (player1Id && player2Id) {
      const p1 = players.find((p) => p.id === player1Id)
      const p2 = players.find((p) => p.id === player2Id)
      if (p1 && p2) {
        // Calculate win probability based on ELO
        const expected1 = 1 / (1 + Math.pow(10, (p2.rating - p1.rating) / 400))
        const expected2 = 1 / (1 + Math.pow(10, (p1.rating - p2.rating) / 400))
        setWinProbability({
          p1: Math.round(expected1 * 100),
          p2: Math.round(expected2 * 100),
        })
      }
    } else {
      setWinProbability(null)
    }
  }, [player1Id, player2Id, players])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1Id || !player2Id || player1Id === player2Id) {
      alert('Please select two different players')
      return
    }
    if (!player1Score || !player2Score) {
      alert('Please enter scores for both players')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('player1', player1Id)
      formData.append('player2', player2Id)
      formData.append('player1Score', player1Score)
      formData.append('player2Score', player2Score)
      formData.append('bestOf', bestOf)
      formData.append('notes', notes)

      const response = await fetch('/api/matches', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        router.push('/matches')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to record match')
      }
    } catch (error) {
      console.error('Error recording match:', error)
      alert('An error occurred while recording the match')
    } finally {
      setIsSubmitting(false)
    }
  }

  const player1 = players.find((p) => p.id === player1Id)
  const player2 = players.find((p) => p.id === player2Id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎾 Record a Match</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the match details below. ELO ratings will be calculated automatically.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Selection */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="player1"
                className="block text-sm font-medium text-gray-700 text-gray-300 mb-1"
              >
                Player 1
              </label>
              <select
                id="player1"
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-700 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} (Rating: {Math.round(player.rating)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="player2"
                className="block text-sm font-medium text-gray-700 text-gray-300 mb-1"
              >
                Player 2
              </label>
              <select
                id="player2"
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-700 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} (Rating: {Math.round(player.rating)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Win Probability */}
          {winProbability && player1 && player2 && (
            <div className="bg-blue-50 bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 text-blue-300 mb-2">
                Win Probability
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 text-gray-300 w-20">
                  {player1.name}
                </span>
                <div className="flex-1 h-4 bg-gray-200 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${winProbability.p1}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 text-center">
                  {winProbability.p1}%
                </span>
                <span className="text-gray-400">vs</span>
                <span className="text-sm font-bold text-gray-900 w-12 text-center">
                  {winProbability.p2}%
                </span>
                <div className="flex-1 h-4 bg-gray-200 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-500 transition-all duration-500"
                    style={{ width: `${winProbability.p2}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 text-gray-300 w-20">
                  {player2.name}
                </span>
              </div>
            </div>
          )}

          {/* Scores */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="player1Score"
                className="block text-sm font-medium text-gray-700 text-gray-300 mb-1"
              >
                {player1 ? `${player1.name}'s Score` : "Player 1's Score"}
              </label>
              <input
                type="number"
                id="player1Score"
                value={player1Score}
                onChange={(e) => setPlayer1Score(e.target.value)}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-700 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-2xl font-bold text-center"
              />
            </div>

            <div>
              <label
                htmlFor="player2Score"
                className="block text-sm font-medium text-gray-700 text-gray-300 mb-1"
              >
                {player2 ? `${player2.name}'s Score` : "Player 2's Score"}
              </label>
              <input
                type="number"
                id="player2Score"
                value={player2Score}
                onChange={(e) => setPlayer2Score(e.target.value)}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-700 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-2xl font-bold text-center"
              />
            </div>
          </div>

          {/* Format */}
          <div>
            <label
              htmlFor="bestOf"
              className="block text-sm font-medium text-gray-700 text-gray-300 mb-1"
            >
              Format
            </label>
            <select
              id="bestOf"
              value={bestOf}
              onChange={(e) => setBestOf(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-700 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="1">Single Game</option>
              <option value="3">Best of 3</option>
              <option value="5">Best of 5</option>
              <option value="7">Best of 7</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 text-gray-300 mb-1"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg bg-white bg-gray-700 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any notes about the match..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Record Match
            </Button>
          </div>
        </form>
      </Card>

      {/* ELO Info */}
      <Card>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 text-blue-300">
              About ELO Ratings
            </h3>
            <p className="mt-1 text-sm text-blue-700 text-blue-400">
              Ratings are calculated using a standard ELO system with a K-factor of 32.
              Winning against a higher-rated opponent earns more points, while beating a
              lower-rated opponent earns fewer points. Margin of victory also affects the
              rating change.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}