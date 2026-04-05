'use client'

import { useState } from 'react'
import Button from './ui/Button'

export default function RegisterPlayerForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      department: formData.get('department'),
    }

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to register player')
      }

      onSuccess()
      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register player')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 bg-red-900 border border-red-200 border-red-700 text-red-600 text-red-300 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-gray-300">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-700 border-gray-600 text-white sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-gray-300">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-700 border-gray-600 text-white sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 text-gray-300">
          Department
        </label>
        <input
          type="text"
          id="department"
          name="department"
          placeholder="e.g., Engineering, Marketing"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-700 border-gray-600 text-white sm:text-sm"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Registering...' : 'Register Player'}
      </Button>
    </form>
  )
}