# GovAI - Decentralized AI Governance Dashboard

A decentralized polling and governance system using Solana blockchain with AI-powered analysis agents. This project combines a Next.js frontend dashboard with Python-based AI agents and Solana smart contracts to create a transparent, secure, and intelligent governance platform.

## 🌟 Features

- **Decentralized Voting**: Polls stored on Solana blockchain for transparency and immutability
- **AI Agent Analysis**: Three specialized AI agents analyze proposals:
  - **Explainer Agent**: Breaks down complex proposals into understandable language
  - **Whale Watch Agent**: Detects voting manipulation, whale concentration, and suspicious patterns
  - **Economic Agent**: Analyzes financial impact and treasury sustainability
- **Modern Web Dashboard**: Beautiful, responsive Next.js interface with shadcn/ui components
- **Wallet Integration**: Phantom, Solflare, Ledger, Trezor, and Backpack wallet support
- **Real-time Updates**: Live voting results and AI analysis

## 🏗️ Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── theme-provider.tsx
├── agents/               # Python AI agents
│   ├── explainer/       # Proposal explanation agent
│   ├── whale_watch/     # Voting pattern analysis agent
│   ├── economic/        # Economic impact agent
│   └── orchestrator/    # Agent coordination
├── govai_polls/         # Solana program (Rust/Anchor)
│   ├── programs/        # Smart contract code
│   ├── tests/          # Program tests
│   └── migrations/     # Deployment scripts
└── Python scripts
    ├── fetch_real_proposals.py
    ├── simulate_votes_real_proposals.py
    └── test_connection.py

```

## 🚀 Quick Start

### One-Command Setup (Easiest)

```bash
# Run both frontend and backend together
bash scripts/start-all.sh
```

This starts:
- 🐍 Python Backend → `http://localhost:8000`
- ⚛️ Next.js Frontend → `http://localhost:3000`

### Manual Setup

**Terminal 1 - Backend:**
```bash
source venv/bin/activate
pip install -r requirements.txt
cd backend && python main.py
```

**Terminal 2 - Frontend:**
```bash
pnpm install
pnpm dev
```

### First Time Setup

1. **Copy environment files:**
```bash
cp .env.example .env
cp .env.example .env.local
```

2. **Add your credentials to `.env`:**
   - Supabase URL and Key ([get from supabase.com](https://supabase.com))
   - Gemini API Key ([get from Google AI Studio](https://makersuite.google.com/app/apikey))

3. **Set up database tables** (see [SETUP.md](./SETUP.md) for SQL)

📖 **Full setup guide:** See [SETUP.md](./SETUP.md) for detailed instructions

### Test the Integration

```bash
# Backend health check
curl http://localhost:8000/health

# Open frontend
open http://localhost:3000
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization

### Backend
- **Python** - AI agent implementation
- **Supabase** - Database and real-time features
- **OpenAI/Anthropic** - AI models for analysis

### Blockchain
- **Solana** - High-performance blockchain
- **Anchor** - Solana development framework
- **Rust** - Smart contract language

## 🔐 Security Features

- Wallet signature verification
- On-chain vote storage
- Whale detection algorithms
- Sybil attack prevention
- Real-time fraud analysis

## 📊 AI Agent Details

### Explainer Agent
- Simplifies technical proposals
- Explains voting options
- Highlights key impacts

### Whale Watch Agent
- Monitors wallet age and concentration
- Detects unusual voting patterns
- Assigns risk scores (0-10)
- Flags suspicious activity

### Economic Agent
- Analyzes treasury impact
- Calculates cost projections
- Assesses sustainability
- Provides recommendations

## 🌐 Deployment

The dashboard is deployed at: [govai-plum.vercel.app](https://govai-plum.vercel.app)

## 🤝 Contributing

This project was built during HackWestern. Contributions are welcome!

## 📝 License

MIT License

## 🔗 Links

- GitHub: [satvikgarimella/Hackwestern](https://github.com/satvikgarimella/Hackwestern)
- Live Demo: [govai-plum.vercel.app](https://govai-plum.vercel.app)


