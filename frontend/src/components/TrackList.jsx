import './TrackList.css'

const TrackList = ({ tracks, currentTrack, onTrackSelect }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="track-list">
        <h3>No tracks available</h3>
        <p>Add some music files to your backend's music directory</p>
      </div>
    )
  }

  return (
    <div className="track-list">
      <h3>Tracks ({tracks.length})</h3>
      <div className="tracks">
        {tracks.map((track, index) => (
          <div
            key={track.filename}
            className={`track-item ${currentTrack && currentTrack.filename === track.filename ? 'active' : ''}`}
            onClick={() => onTrackSelect(track, index)}
          >
            <div className="track-main">
              <h4>{track.title}</h4>
              <p>{track.artist}</p>
            </div>
            <div className="track-meta">
              {track.size && (
                <span className="file-size">
                  {(track.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
              <span className="track-number">#{index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackList