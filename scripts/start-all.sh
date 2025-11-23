#!/bin/bash

# Start both frontend and backend

echo "🚀 Starting GovAI - Full Stack"
echo "================================"

# Check for tmux or screen
if command -v tmux &> /dev/null; then
    echo "Using tmux to run both servers..."
    
    # Create new tmux session
    tmux new-session -d -s govai
    
    # Backend in first pane
    tmux send-keys -t govai "bash scripts/start-backend.sh" C-m
    
    # Split window and run frontend
    tmux split-window -h -t govai
    tmux send-keys -t govai "bash scripts/start-frontend.sh" C-m
    
    # Attach to session
    echo ""
    echo "✨ Both servers starting in tmux session 'govai'"
    echo "📡 Backend: http://localhost:8000"
    echo "🌐 Frontend: http://localhost:3000"
    echo ""
    echo "To attach: tmux attach -t govai"
    echo "To detach: Press Ctrl+B then D"
    echo "To kill: tmux kill-session -t govai"
    
    tmux attach -t govai
else
    echo "⚠️  tmux not found. Please install tmux or run servers separately:"
    echo "  Terminal 1: bash scripts/start-backend.sh"
    echo "  Terminal 2: bash scripts/start-frontend.sh"
fi

