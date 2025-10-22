const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const MUSIC_DIR = path.join(__dirname, 'music');

// Middleware
app.use(express.json());

// Ensure music directory exists
if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
  console.log('Created music directory:', MUSIC_DIR);
}

// Helper function to get file metadata
function getFileMetadata(filename) {
  const filePath = path.join(MUSIC_DIR, filename);
  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();

  // Extract basic info from filename (you can enhance this with actual metadata parsing)
  const nameWithoutExt = path.basename(filename, ext);
  const parts = nameWithoutExt.split(' - ');

  let title, artist;
  if (parts.length >= 2) {
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  } else {
    title = nameWithoutExt;
    artist = 'Unknown Artist';
  }

  return {
    filename,
    title,
    artist,
    duration: null, // Could be populated with a library like node-ffprobe
    size: stats.size,
    url: `/stream/${encodeURIComponent(filename)}`
  };
}

// GET /tracks - Returns JSON list of available tracks
app.get('/tracks', (req, res) => {
  try {
    const files = fs.readdirSync(MUSIC_DIR);
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext);
    });

    const tracks = audioFiles.map(getFileMetadata);

    res.json({
      success: true,
      count: tracks.length,
      tracks
    });
  } catch (error) {
    console.error('Error reading music directory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read music directory'
    });
  }
});

// GET /stream/:filename - Streams audio file
app.get('/stream/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(MUSIC_DIR, filename);

    // Security check - ensure file is within music directory
    const resolvedPath = path.resolve(filePath);
    const resolvedMusicDir = path.resolve(MUSIC_DIR);
    if (!resolvedPath.startsWith(resolvedMusicDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'audio/mpeg'; // default
    if (ext === '.wav') contentType = 'audio/wav';
    else if (ext === '.ogg') contentType = 'audio/ogg';
    else if (ext === '.m4a') contentType = 'audio/mp4';
    else if (ext === '.flac') contentType = 'audio/flac';

    if (range) {
      // Handle range requests for audio seeking
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).json({ error: 'Failed to stream file' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Music streaming server is running',
    musicDir: MUSIC_DIR,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Music streaming server running on port ${PORT}`);
  console.log(`Music directory: ${MUSIC_DIR}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Tracks API: http://localhost:${PORT}/tracks`);
});