#!/bin/bash

# Start the Next.js frontend

echo "🚀 Starting GovAI Frontend..."

# Check for .env.local file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo "Please update .env.local with your credentials."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start Next.js dev server
echo "✨ Starting Next.js on http://localhost:3000"
pnpm dev

