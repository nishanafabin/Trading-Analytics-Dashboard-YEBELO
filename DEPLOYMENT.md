# Free Deployment Guide

## 🚀 Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configs"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repo
   - Select `frontend` folder as root directory
   - Click "Deploy"
   - Your app will be live at: `https://your-app.vercel.app`

## 🔧 Backend Deployment (Railway)

1. **Deploy WebSocket Server**
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repo
   - Choose `backend` folder
   - Railway will auto-detect Dockerfile
   - Your backend will be live at: `https://your-backend.railway.app`

2. **Update Frontend Environment**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add: `NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app`
   - Redeploy frontend

## 📊 Rust Processor (Optional - Fly.io)

1. **Install Fly CLI**
   ```bash
   # Install flyctl
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy Rust Processor**
   ```bash
   cd rust-processor
   fly auth login
   fly launch
   fly deploy
   ```

## 🎯 Interview Demo URLs

After deployment, update README with:
- **Live Demo**: https://your-app.vercel.app
- **Backend API**: https://your-backend.railway.app
- **GitHub**: https://github.com/nishanafabin/Trading-Analytics-Dashboard-YEBELO

## 🔍 Verification Steps

1. Check frontend loads correctly
2. Verify WebSocket connection in browser console
3. Test token switching functionality
4. Confirm charts display data

## 💡 Interview Tips

- Mention the tech stack: NextJS, Rust, Redpanda, Docker
- Explain the real-time data flow
- Show the RSI calculation logic
- Demonstrate responsive design
- Highlight the microservices architecture