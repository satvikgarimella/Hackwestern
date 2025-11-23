#!/bin/bash

# Script to create .env files for GovAI

echo "Creating .env files..."

# Create .env
cat > .env << 'ENVFILE'
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# AI Model Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ENVFILE

# Create .env.local
cat > .env.local << 'ENVLOCAL'
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
ENVLOCAL

echo ""
echo "✅ .env files created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file and add your API keys:"
echo "   - SUPABASE_URL (get from supabase.com)"
echo "   - SUPABASE_KEY (get from supabase.com)"
echo "   - GEMINI_API_KEY (get from makersuite.google.com)"
echo ""
echo "2. Open the file with:"
echo "   nano .env"
echo "   or"
echo "   code .env"
echo ""

