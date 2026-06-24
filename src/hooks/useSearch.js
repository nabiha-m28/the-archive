import { useState } from 'react'

export function useSearch() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async ({ description, imageBase64, mediaType, era, category, price }) => {
    setError(null)
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, imageBase64, mediaType, era, category, price })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Search failed (${response.status})`)
      }

      if (!data.results || data.results.length === 0) {
        setError('No listings found for that search. Try a different description.')
        setLoading(false)
        return
      }

      setResults(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong searching the archive. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResults(null)
    setError(null)
  }

  return { results, loading, error, search, reset }
}
