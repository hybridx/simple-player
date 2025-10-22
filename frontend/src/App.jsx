import { useState, useEffect } from 'react'
import MusicPlayer from './components/MusicPlayer'
import TrackList from './components/TrackList'
import BackendConfig from './components/BackendConfig'
import './App.css'

function App() {
  const [apiUrl, setApiUrl] = useState(null)
  const [backendData, setBackendData] = useState(null)
  const [tracks, setTracks] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [configComplete, setConfigComplete] = useState(false)

  // Check for stored backend URL on app start
  useEffect(() => {
    const storedUrl = localStorage.getItem('musicPlayerBackendUrl')
    const envUrl = import.meta.env.VITE_API_URL

    if (storedUrl) {
      // Auto-test stored URL
      testStoredUrl(storedUrl)
    } else if (envUrl && envUrl !== 'http://localhost:8080') {
      // Auto-test environment URL if it's not the default
      testStoredUrl(envUrl)
    }
  }, [])

  const testStoredUrl = async (url) => {
    try {
      setLoading(true)
      const response = await fetch(`${url}/health`)
      if (response.ok) {
        const healthData = await response.json()
        if (healthData.success) {
          setApiUrl(url)
          setConfigComplete(true)
          return
        }
      }
    } catch (err) {
      // Auto-test failed, show config screen
      console.log('Auto-connection failed, showing config screen')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigComplete = (url, data) => {
    setApiUrl(url)
    setBackendData(data)
    setConfigComplete(true)
  }

  const handleReconfigure = () => {
    localStorage.removeItem('musicPlayerBackendUrl')
    setApiUrl(null)
    setBackendData(null)
    setConfigComplete(false)
    setTracks([])
    setCurrentTrack(null)
    setError(null)
  }

  // Fetch tracks from backend when configuration is complete
  useEffect(() => {
    if (!configComplete || !apiUrl) return

    const fetchTracks = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${apiUrl}/tracks`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          if (data.tracks.length > 0) {
            const tracksWithFullUrls = data.tracks.map(track => ({
              ...track,
              url: `${apiUrl}${track.url}`
            }))
            setTracks(tracksWithFullUrls)
            setCurrentTrack(tracksWithFullUrls[0])
          } else {
            setTracks([])
            setCurrentTrack(null)
          }
        } else {
          throw new Error('Invalid API response')
        }
      } catch (err) {
        console.error('Error fetching tracks:', err)
        setError(`Failed to load tracks: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [configComplete, apiUrl])

  const handleTrackSelect = (track, index) => {
    setCurrentTrack(track)
    setCurrentIndex(index)
  }

  const handleNext = () => {
    if (tracks.length > 0) {
      const nextIndex = (currentIndex + 1) % tracks.length
      setCurrentIndex(nextIndex)
      setCurrentTrack(tracks[nextIndex])
    }
  }

  const handlePrevious = () => {
    if (tracks.length > 0) {
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1
      setCurrentIndex(prevIndex)
      setCurrentTrack(tracks[prevIndex])
    }
  }

  // Show configuration screen if not configured yet
  if (!configComplete) {
    return <BackendConfig onConfigComplete={handleConfigComplete} />
  }

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading tracks...</h2>
          <p>Connecting to: {apiUrl}</p>
        </div>
      </div>
    )
  }

  // Show error state with option to reconfigure
  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <p>Backend URL: {apiUrl}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
            <button onClick={handleReconfigure} className="secondary-button">
              Change Backend URL
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Music Player</h1>
        <div className="header-info">
          <p>Connected to: {apiUrl}</p>
          <button onClick={handleReconfigure} className="config-button">
            ⚙️ Change Backend
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="player-section">
          <MusicPlayer
            currentTrack={currentTrack}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>

        <div className="tracks-section">
          <TrackList
            tracks={tracks}
            currentTrack={currentTrack}
            onTrackSelect={handleTrackSelect}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>Music Player • {tracks.length} tracks available</p>
      </footer>
    </div>
  )
}

export default App
