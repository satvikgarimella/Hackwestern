#!/bin/bash
# Start a local Solana test validator with unlimited SOL
# This runs in the background and gives you unlimited SOL for testing

echo "Starting local Solana test validator..."
echo "This will run in the background. Press Ctrl+C to stop."
echo ""
echo "The validator will be available at: http://127.0.0.1:8899"
echo "You'll have unlimited SOL for testing!"
echo ""

# Start validator in the background
solana-test-validator \
  --reset \
  --quiet \
  > /tmp/solana-validator.log 2>&1 &

VALIDATOR_PID=$!
echo "Validator started with PID: $VALIDATOR_PID"
echo "Logs are being written to: /tmp/solana-validator.log"
echo ""
echo "To stop the validator, run: kill $VALIDATOR_PID"
echo ""
echo "Waiting for validator to initialize..."
sleep 5

# Airdrop SOL to the default wallet
echo "Airdropping SOL to your wallet..."
solana airdrop 10 --url http://127.0.0.1:8899

echo ""
echo "✅ Local validator is ready!"
echo "Your balance:"
solana balance --url http://127.0.0.1:8899
echo ""
echo "To deploy, update Anchor.toml to use 'localnet' instead of 'devnet'"
echo "Or deploy with: anchor deploy --provider.cluster localnet"

