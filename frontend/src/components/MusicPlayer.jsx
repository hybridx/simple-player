import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import './MusicPlayer.css'

const MusicPlayer = ({ currentTrack, onNext, onPrevious }) => {
  if (!currentTrack) {
    return (
      <div className="music-player">
        <div className="no-track">
          <h3>No track selected</h3>
          <p>Select a track from the list to start playing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="music-player">
      <div className="track-info">
        <h2>{currentTrack.title}</h2>
        <p>{currentTrack.artist}</p>
        {currentTrack.size && (
          <small>Size: {(currentTrack.size / 1024 / 1024).toFixed(2)} MB</small>
        )}
      </div>

      <AudioPlayer
        src={currentTrack.url}
        onPlay={e => console.log("onPlay", e)}
        onPause={e => console.log("onPause", e)}
        onEnded={onNext}
        onClickNext={onNext}
        onClickPrevious={onPrevious}
        showSkipControls={true}
        showJumpControls={false}
        showFilledProgress={true}
        autoPlayAfterSrcChange={false}
        layout="horizontal-reverse"
        customProgressBarSection={[
          "CURRENT_TIME",
          "PROGRESS_BAR",
          "DURATION",
        ]}
        customControlsSection={[
          "MAIN_CONTROLS",
          "VOLUME_CONTROLS"
        ]}
        customAdditionalControls={[]}
      />
    </div>
  )
}

export default MusicPlayer