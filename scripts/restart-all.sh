#!/bin/bash
# Restart both backend and frontend to apply fixes

echo "🔄 Restarting GovAI servers..."
echo ""

# Kill backend (port 8000)
echo "Stopping backend..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# Kill frontend (port 3000)
echo "Stopping frontend..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

echo ""
echo "✅ Servers stopped successfully"
echo ""
echo "To restart:"
echo "  Backend:  cd backend && python main.py"
echo "  Frontend: pnpm dev"
echo ""
echo "Or use: bash scripts/start-all.sh"

