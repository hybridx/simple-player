import { useState } from 'react'
import './BackendConfig.css'

const BackendConfig = ({ onConfigComplete }) => {
  const [url, setUrl] = useState('')
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState('http://localhost:8080')

  const validateUrl = (urlString) => {
    try {
      const url = new URL(urlString)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const testConnection = async (testUrl) => {
    try {
      setTesting(true)
      setError('')

      // Test health endpoint first
      const healthResponse = await fetch(`${testUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!healthResponse.ok) {
        throw new Error(`Server responded with ${healthResponse.status}: ${healthResponse.statusText}`)
      }

      const healthData = await healthResponse.json()

      if (!healthData.success) {
        throw new Error('Backend health check failed')
      }

      // Test tracks endpoint to ensure full API functionality
      const tracksResponse = await fetch(`${testUrl}/tracks`)

      if (!tracksResponse.ok) {
        throw new Error(`Tracks API responded with ${tracksResponse.status}`)
      }

      const tracksData = await tracksResponse.json()

      if (typeof tracksData.success === 'undefined') {
        throw new Error('Invalid API response format')
      }

      return { success: true, data: { health: healthData, tracks: tracksData } }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('Please enter a backend URL')
      return
    }

    if (!validateUrl(url.trim())) {
      setError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    const cleanUrl = url.trim().replace(/\/$/, '') // Remove trailing slash

    const result = await testConnection(cleanUrl)

    if (result.success) {
      // Store the URL in localStorage for future use
      localStorage.setItem('musicPlayerBackendUrl', cleanUrl)
      onConfigComplete(cleanUrl, result.data)
    } else {
      setError(`Connection failed: ${result.error}`)
    }
  }

  const handleSuggestionClick = () => {
    setUrl(suggestion)
    setError('')
  }

  const handleQuickTest = async () => {
    if (!suggestion) return

    const result = await testConnection(suggestion)

    if (result.success) {
      localStorage.setItem('musicPlayerBackendUrl', suggestion)
      onConfigComplete(suggestion, result.data)
    } else {
      setError(`Quick test failed: ${result.error}`)
      setUrl(suggestion) // Pre-fill the form for manual adjustment
    }
  }

  return (
    <div className="backend-config">
      <div className="config-container">
        <div className="config-header">
          <h1>🎵 Music Player Setup</h1>
          <p>Connect to your music streaming backend to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label htmlFor="backend-url">Backend Server URL</label>
            <input
              id="backend-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
              }}
              placeholder="Enter your backend URL (e.g., http://localhost:8080)"
              className={error ? 'error' : ''}
              disabled={testing}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={testing || !url.trim()}
              className="primary-button"
            >
              {testing ? 'Testing Connection...' : 'Connect to Backend'}
            </button>
          </div>
        </form>

        <div className="quick-setup">
          <div className="divider">
            <span>or</span>
          </div>

          <div className="suggestion-section">
            <p>Running locally? Try this:</p>
            <div className="suggestion-container">
              <code className="suggestion-url" onClick={handleSuggestionClick}>
                {suggestion}
              </code>
              <button
                type="button"
                onClick={handleQuickTest}
                disabled={testing}
                className="quick-test-button"
              >
                {testing ? 'Testing...' : 'Quick Test'}
              </button>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h3>Need Help?</h3>
          <ul>
            <li>Make sure your backend server is running</li>
            <li>Check that the URL is correct (include http:// or https://)</li>
            <li>Verify CORS is configured to allow your frontend domain</li>
            <li>For local development, use <code>http://localhost:8080</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BackendConfig