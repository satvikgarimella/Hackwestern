#!/bin/bash
# Auto-deploy script - checks balance and deploys when you have enough SOL

echo "Monitoring balance and will deploy automatically when ready..."
echo "Your address: 8DGBko6xpVNNU7YqKLS7CFXw7vEvC8RAJ9Z3WtRpmALW"
echo "Need: 1.59 SOL"
echo ""

while true; do
    BALANCE=$(solana balance --url devnet 2>/dev/null | awk '{print $1}')
    echo "Current balance: $BALANCE SOL"
    
    # Simple check - if balance >= 1.59
    BALANCE_NUM=$(echo "$BALANCE" | sed 's/[^0-9.]//g')
    if (( $(echo "$BALANCE_NUM >= 1.59" | bc -l 2>/dev/null) )) || [ "$(echo "$BALANCE_NUM >= 1.59" | awk '{print ($1 >= $2)}')" = "1" ]; then
        echo ""
        echo "✅ You have enough SOL! Deploying now..."
        anchor deploy
        exit 0
    else
        echo "Still need more SOL. Waiting 10 seconds..."
        sleep 10
    fi
done

