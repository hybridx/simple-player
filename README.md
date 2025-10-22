# 🎵 Music Player

A modern, responsive web-based music player with a React frontend (SPA) and Express.js backend. The frontend can be deployed on GitHub Pages while the backend runs on any VPS or cloud service.

## ✨ Features

- **Modern React SPA** built with Vite
- **Professional audio player** using `react-h5-audio-player`
- **Express.js backend** for music streaming
- **Range request support** for audio seeking
- **Responsive design** that works on desktop and mobile
- **Docker support** for easy deployment
- **GitHub Pages ready** for frontend deployment

## 🏗️ Architecture

```
┌─────────────────┐    API calls     ┌─────────────────┐
│  React Frontend │ ◄──────────────► │ Express Backend │
│  (GitHub Pages) │                  │    (Your VPS)   │
└─────────────────┘                  └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   Music Files   │
                                    │ (/app/music)    │
                                    └─────────────────┘
```

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add your music files:**
   ```bash
   # Create music directory and add your .mp3, .wav, .ogg, .m4a, or .flac files
   mkdir -p music
   # Copy your music files to the music/ directory
   cp /path/to/your/music/*.mp3 music/
   ```

4. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Edit .env if you want to change default settings
   ```

5. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

   Server will run on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL to your backend URL
   echo "VITE_API_URL=http://localhost:8080" > .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## 📁 Music File Organization

The backend expects music files to be named in the format: `Artist - Title.ext`

**Examples:**
- `The Beatles - Hey Jude.mp3`
- `Queen - Bohemian Rhapsody.mp3`
- `Pink Floyd - Comfortably Numb.flac`

If files don't follow this format, they'll be displayed with "Unknown Artist".

**Supported formats:** `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`

## 🐳 Docker Deployment (Recommended)

### Using Docker Compose

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Add your music files:**
   ```bash
   mkdir -p music
   cp /path/to/your/music/*.mp3 music/
   ```

3. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Using Docker directly

```bash
# Build the image
docker build -t music-backend .

# Run the container
docker run -d \\
  -p 8080:8080 \\
  -v /path/to/your/music:/app/music \\
  --name music-player-backend \\
  music-backend
```

## 🌐 Production Deployment

> **⚠️ Important**: Direct GitHub Pages → VPS backend connections often fail due to HTTPS/HTTP mixed content restrictions. See deployment alternatives below.

### Recommended Deployment Options

#### Option 1: Same Domain Deployment (Recommended)
Deploy both frontend and backend on the same domain using a reverse proxy:

```nginx
# Nginx configuration
server {
    listen 443 ssl;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option 2: Serverless Deployment
Use Vercel, Netlify, or similar platforms that support both frontend and serverless functions.

#### Option 3: Full-Stack Platforms
Deploy on platforms like Railway, Render, or Heroku that can host both components.

### Backend (VPS/Cloud)

1. **Clone your repository on your VPS:**
   ```bash
   git clone https://github.com/yourusername/music-player.git
   cd music-player/backend
   ```

2. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   nano .env
   ```

4. **Upload your music files:**
   ```bash
   # Upload via scp, rsync, or your preferred method
   scp -r /local/music/directory/* user@yourserver:/path/to/music-player/backend/music/
   ```

5. **Start with PM2 (recommended):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "music-backend"
   pm2 startup
   pm2 save
   ```

### Frontend (GitHub Pages)

1. **Update Vite config:**
   Edit `frontend/vite.config.js` and change the `base` to match your GitHub repository name:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/', // Change this!
     // ...
   })
   ```

2. **Update API URL:**
   Edit `frontend/.env`:
   ```
   VITE_API_URL=https://your-server.com:8080
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   cd frontend
   npm run deploy
   ```

## 🔧 Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080` | Backend API URL |

## 📱 Usage

1. **Start both frontend and backend**
2. **Add music files** to the backend's `music/` directory
3. **Open the frontend** in your browser
4. **Select and play** tracks from the list
5. **Use controls** to play, pause, skip, and adjust volume

## 🛠️ Development

### Adding Features

The codebase is structured for easy expansion:

- **Frontend components** in `frontend/src/components/`
- **Backend routes** in `backend/server.js`
- **Styling** in component-specific CSS files

### API Endpoints

- `GET /health` - Health check
- `GET /tracks` - List all available tracks
- `GET /stream/:filename` - Stream audio file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🔍 Troubleshooting

### Common Issues

**Backend not starting:**
- Check if port 8080 is available
- Verify Node.js version (18+ recommended)

**No tracks showing:**
- Ensure music files are in the `backend/music/` directory
- Check file formats are supported
- Verify file naming convention

**Cross-origin request issues (GitHub Pages + VPS backend):**
- **Mixed Content Error**: GitHub Pages (HTTPS) cannot call HTTP backends
- **Solution 1**: Use HTTPS for your backend (SSL certificate + reverse proxy)
- **Solution 2**: Deploy both frontend and backend on the same domain
- **Solution 3**: Use a serverless backend (Vercel/Netlify Functions)

**GitHub Pages deployment fails:**
- Verify `base` setting in `vite.config.js`
- Check repository name matches the base path

### Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure both frontend and backend are running
4. Check network connectivity between frontend and backend

---

**Happy listening! 🎵**