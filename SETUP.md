# GovAI Setup Guide

Complete guide to get your GovAI governance dashboard running locally.

## 📋 Prerequisites

Before starting, make sure you have installed:

- **Node.js 18+** and **pnpm** - [Install Node.js](https://nodejs.org/)
- **Python 3.10+** - [Install Python](https://www.python.org/downloads/)
- **Git** - For cloning the repository

Optional (for Solana development):
- **Rust** and **Cargo** - [Install Rust](https://www.rust-lang.org/tools/install)
- **Solana CLI** - [Install Solana](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor Framework** - [Install Anchor](https://www.anchor-lang.com/docs/installation)

---

## 🚀 Quick Start (Automated)

### Option 1: Run Everything at Once (Recommended)

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Start both frontend and backend
bash scripts/start-all.sh
```

This will:
- Start the Python backend on `http://localhost:8000`
- Start the Next.js frontend on `http://localhost:3000`
- Run both in a tmux session (if tmux is installed)

**Tmux Controls:**
- Detach: `Ctrl+B` then `D`
- Reattach: `tmux attach -t govai`
- Kill: `tmux kill-session -t govai`
- Switch panes: `Ctrl+B` then arrow keys

---

## 🛠️ Manual Setup (Step by Step)

### Step 1: Environment Configuration

1. **Copy the environment example file:**
```bash
cp .env.example .env
cp .env.example .env.local
```

2. **Edit `.env` with your credentials:**
```bash
# Required for backend
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key

# Optional - defaults shown
FRONTEND_URL=http://localhost:3000
```

3. **Edit `.env.local` (Next.js):**
```bash
# Required for frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Where to get credentials:**
- **Supabase**: Sign up at [supabase.com](https://supabase.com) → Create project → Copy URL and anon key from Settings
- **Gemini API**: Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

### Step 2: Backend Setup

Open **Terminal 1** and run:

```bash
# Create Python virtual environment
python3 -m venv venv

# Activate it (macOS/Linux)
source venv/bin/activate

# On Windows use:
# .\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test the backend:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

---

### Step 3: Frontend Setup

Open **Terminal 2** and run:

```bash
# Install Node.js dependencies
pnpm install

# If you don't have pnpm:
# npm install -g pnpm

# Start the Next.js dev server
pnpm dev
```

You should see:
```
✓ Ready in 2.5s
○ Local:    http://localhost:3000
```

**Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 Using the Starter Scripts

### Backend Only
```bash
bash scripts/start-backend.sh
```

### Frontend Only
```bash
bash scripts/start-frontend.sh
```

### Both with Tmux
```bash
bash scripts/start-all.sh
```

---

## 🗄️ Database Setup (Supabase)

You need to create the following tables in Supabase:

### 1. Polls Table
```sql
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT UNIQUE NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Votes Table
```sql
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  vote_option TEXT NOT NULL,
  signature TEXT NOT NULL,
  wallet_age_days INTEGER,
  sol_balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, wallet_address)
);
```

### 3. Agent Analyses Table
```sql
CREATE TABLE agent_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  risk_score INTEGER,
  flags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Run these in:** Supabase Dashboard → SQL Editor → New Query

---

## 🧪 Testing the Integration

### 1. Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# Get backend info
curl http://localhost:8000/

# Test analysis (after creating a poll)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"poll_id":"test-poll-1","agent_type":"all"}'
```

### 2. Test Frontend
1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Connect Wallet"
3. Select a wallet (Phantom recommended for testing)
4. Try voting on a poll

### 3. Run Python Tests
```bash
source venv/bin/activate
python test_connection.py
python test_real_proposal.py
```

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
# Make sure you're in the virtual environment
source venv/bin/activate
pip install -r requirements.txt
```

**Error: `SUPABASE_URL` not found**
```bash
# Check your .env file exists and has correct values
cat .env
```

### Frontend Won't Start

**Error: `Cannot find module '@solana/web3.js'`**
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

**Error: Port 3000 already in use**
```bash
# Kill the process or use a different port
pnpm dev -p 3001
```

### Wallet Connection Issues

1. Make sure you have a Solana wallet installed (Phantom recommended)
2. Switch wallet to Devnet in wallet settings
3. Get test SOL from [Solana Faucet](https://faucet.solana.com/)

### CORS Errors

Make sure both servers are running:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

---

## 📦 Production Deployment

### Backend (Python FastAPI)

**Deploy to Railway/Render:**
```bash
# Add these files for deployment
echo "web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT" > Procfile
```

**Or use Docker:**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Next.js)

**Deploy to Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or push to GitHub and connect to Vercel dashboard.

**Environment Variables for Production:**
- Add all `.env.local` variables to Vercel dashboard
- Update `NEXT_PUBLIC_BACKEND_URL` to your backend URL

---

## 🎓 Next Steps

1. **Create a test poll** using the Python scripts
2. **Vote on polls** with different wallets
3. **Watch the AI agents** analyze voting patterns
4. **Customize** the dashboard UI in `app/page.tsx`
5. **Deploy** to production when ready

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Supabase Docs](https://supabase.com/docs)

---

## 🆘 Need Help?

- Check existing issues on GitHub
- Review the logs in terminal
- Join our community discussions

Happy building! 🚀

