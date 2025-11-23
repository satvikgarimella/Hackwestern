from supabase import create_client
from dotenv import load_dotenv
import os
import random
from datetime import datetime

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def simulate_normal_vote(poll_id):
    """Simulate a normal, healthy vote (no attack)"""
    print(f"\n📊 Simulating NORMAL vote for {poll_id}...")
    
    votes = []
    
    # 80% legitimate voters (old wallets, diverse)
    for i in range(40):
        votes.append({
            'poll_id': poll_id,
            'voter_pubkey': f'legit_{poll_id}_{i}',
            'vote_option': random.choice(['Allocate $250k', 'Don\'t Allocate', 'Abstain']),
            'wallet_age_days': random.randint(180, 800),
            'sol_balance': round(random.uniform(50, 500), 2)
        })
    
    # 20% newer participants (still legitimate)
    for i in range(10):
        votes.append({
            'poll_id': poll_id,
            'voter_pubkey': f'newer_{poll_id}_{i}',
            'vote_option': random.choice(['Allocate $250k', 'Don\'t Allocate', 'Abstain']),
            'wallet_age_days': random.randint(30, 90),
            'sol_balance': round(random.uniform(10, 100), 2)
        })
    
    supabase.table('votes').insert(votes).execute()
    print(f"   ✅ Added 50 votes (NORMAL distribution)")

def simulate_sybil_attack(poll_id):
    """Simulate a sybil attack (malicious)"""
    print(f"\n🚨 Simulating SYBIL ATTACK for {poll_id}...")
    
    votes = []
    
    # 30 legitimate voters
    for i in range(30):
        votes.append({
            'poll_id': poll_id,
            'voter_pubkey': f'legit_{poll_id}_{i}',
            'vote_option': random.choice(['For', 'Against', 'Abstain']),
            'wallet_age_days': random.randint(180, 800),
            'sol_balance': round(random.uniform(50, 500), 2)
        })
    
    # 40 SYBIL ATTACK - new wallets all voting FOR
    for i in range(40):
        votes.append({
            'poll_id': poll_id,
            'voter_pubkey': f'SYBIL_{poll_id}_{i}',
            'vote_option': 'For',  # All vote FOR
            'wallet_age_days': random.randint(1, 6),  # Very new
            'sol_balance': round(random.uniform(0.1, 3), 2)  # Low balance
        })
    
    supabase.table('votes').insert(votes).execute()
    print(f"   ✅ Added 70 votes (40 SYBIL + 30 legit)")

# Simulate votes for real proposals
simulate_normal_vote('real-poll-5')  # Uniswap Plasma - Normal
simulate_sybil_attack('real-poll-2')  # ENS Funding - Under Attack!

print("\n" + "="*60)
print("✅ Simulation complete!")
print("\nNow test detection:")
print("  python -c \"from agents.whale_watch.agent import WhaleWatchAgent; import json; agent = WhaleWatchAgent(); result = agent.analyze_poll('real-poll-2'); print(json.dumps(result, indent=2))\"")
print("="*60)
