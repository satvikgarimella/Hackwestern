#!/usr/bin/env python3
"""
Simulate a MAXIMUM WHALE RISK scenario (Risk Score: 10)
This creates voting patterns that demonstrate extreme whale manipulation.
"""

import os
import sys
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def simulate_whale_attack():
    """
    Create a worst-case whale manipulation scenario:
    - 3 mega whales control 85% of voting power
    - All vote the same way
    - 10 tiny wallets (sybils) vote the same way
    - Clear coordinated attack
    """
    
    print("🐋 Simulating MAXIMUM WHALE RISK (Score: 10)")
    print("=" * 60)
    
    # Get the main proposal
    poll_id = "test-poll-1"
    
    # Clear existing votes for clean demo
    print(f"\n🧹 Clearing existing votes for {poll_id}...")
    supabase.table("votes").delete().eq("poll_id", poll_id).execute()
    
    votes = []
    
    # SCENARIO: 3 MEGA WHALES (85% voting power)
    print("\n🐋 Creating 3 MEGA WHALES...")
    mega_whales = [
        {
            "wallet_address": "WhaleKing1111111111111111111111111111111",
            "sol_balance": 50000.0,  # 50K SOL!
            "wallet_age_days": 800,
            "vote_option": "YES"  # UPPERCASE to match poll options
        },
        {
            "wallet_address": "WhaleQueen222222222222222222222222222222",
            "sol_balance": 45000.0,  # 45K SOL!
            "wallet_age_days": 750,
            "vote_option": "YES"  # UPPERCASE to match poll options
        },
        {
            "wallet_address": "WhaleEmperor33333333333333333333333333333",
            "sol_balance": 40000.0,  # 40K SOL!
            "wallet_age_days": 820,
            "vote_option": "YES"  # UPPERCASE to match poll options
        }
    ]
    
    for whale in mega_whales:
        print(f"   💰 {whale['wallet_address'][:20]}... with {whale['sol_balance']:,.0f} SOL")
        votes.append({
            "poll_id": poll_id,
            "wallet_address": whale["wallet_address"],
            "vote_option": whale["vote_option"],
            "signature": f"sig_whale_{whale['wallet_address'][:10]}",
            "sol_balance": whale["sol_balance"],
            "wallet_age_days": whale["wallet_age_days"]
        })
    
    # SCENARIO: 10 SYBIL ACCOUNTS (tiny wallets, brand new, same vote)
    print("\n🤖 Creating 10 SYBIL ACCOUNTS...")
    for i in range(10):
        sybil_wallet = f"SybilBot{i}11111111111111111111111111111111"
        print(f"   🆕 {sybil_wallet[:20]}... (2 days old, 0.1 SOL)")
        votes.append({
            "poll_id": poll_id,
            "wallet_address": sybil_wallet,
            "vote_option": "YES",  # Same as whales! UPPERCASE to match poll
            "signature": f"sig_sybil_{i}",
            "sol_balance": 0.1,  # Dust
            "wallet_age_days": 2  # Brand new
        })
    
    # SCENARIO: 5 NORMAL VOTERS (legitimate but outvoted)
    print("\n👤 Creating 5 LEGITIMATE VOTERS (outvoted)...")
    for i in range(5):
        normal_wallet = f"NormalUser{i}11111111111111111111111111111"
        votes.append({
            "poll_id": poll_id,
            "wallet_address": normal_wallet,
            "vote_option": "NO",  # Voting against the whales! UPPERCASE to match poll
            "signature": f"sig_normal_{i}",
            "sol_balance": 5.0 + (i * 2),  # 5-13 SOL
            "wallet_age_days": 120 + (i * 30)  # 120-240 days
        })
        print(f"   ✓ {normal_wallet[:20]}... ({5 + i*2} SOL, voting 'NO')")
    
    # Insert all votes
    print(f"\n📝 Inserting {len(votes)} votes into database...")
    for vote in votes:
        try:
            supabase.table("votes").insert(vote).execute()
        except Exception as e:
            print(f"   ⚠️  Error inserting vote: {e}")
    
    print("\n✅ WHALE ATTACK SIMULATION COMPLETE!")
    print("=" * 60)
    print("\n📊 SCENARIO SUMMARY:")
    print(f"   • 3 whales with 135,000 SOL total (85%+ voting power)")
    print(f"   • 10 sybil bots (brand new, dust balances)")
    print(f"   • 5 legitimate voters completely outvoted")
    print(f"   • All whales + sybils voting 'YES' (coordinated)")
    print(f"   • Legitimate voters voting 'NO' but outnumbered")
    print(f"   • Expected Whale Watch Risk Score: 9-10/10 🔴")
    print(f"   • Expected Economic Risk Score: 0-1/10 ✅")
    print("\n🎯 Perfect for demonstrating AI detection!")
    print("\n🔄 Refresh your dashboard to see the analysis!")
    
    # Calculate voting power
    total_sol = sum(v["sol_balance"] for v in votes)
    whale_sol = sum(w["sol_balance"] for w in mega_whales)
    whale_percentage = (whale_sol / total_sol) * 100
    
    print(f"\n💰 Voting Power Distribution:")
    print(f"   • Total SOL: {total_sol:,.1f}")
    print(f"   • Whale SOL: {whale_sol:,.1f} ({whale_percentage:.1f}%)")
    print(f"   • Normal SOL: {total_sol - whale_sol:,.1f} ({100-whale_percentage:.1f}%)")

if __name__ == "__main__":
    try:
        simulate_whale_attack()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("  1. Backend is running (python main.py)")
        print("  2. SUPABASE_URL and SUPABASE_KEY are set in .env")
        print("  3. Database tables are created")
        sys.exit(1)

