from supabase import create_client
from dotenv import load_dotenv
import os
import random
from datetime import datetime, timedelta

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

print("Creating test poll...")

supabase.table('polls').insert({
    'poll_id': 'test-poll-1',
    'question': 'Should staking rewards be increased from 6% to 8%?',
    'description': 'Currently staking rewards are 6% APY. This proposal would increase them to 8% APY, costing an additional 50,000 tokens per month from the treasury.',
    'options': ['YES', 'NO', 'ABSTAIN'],
    'creator_pubkey': 'creator_wallet_123',
    'end_time': (datetime.now() + timedelta(days=7)).isoformat()
}).execute()

votes = []
for i in range(12):
    votes.append({
        'poll_id': 'test-poll-1',
        'voter_pubkey': f'sybil_wallet_{i}',
        'vote_option': 'YES',
        'wallet_age_days': random.randint(1, 5),
        'sol_balance': round(random.uniform(0.1, 2.0), 2)
    })

for i in range(8):
    votes.append({
        'poll_id': 'test-poll-1',
        'voter_pubkey': f'legit_wallet_{i}',
        'vote_option': random.choice(['YES', 'NO', 'ABSTAIN']),
        'wallet_age_days': random.randint(30, 365),
        'sol_balance': round(random.uniform(10, 100), 2)
    })

supabase.table('votes').insert(votes).execute()
print("✅ Test data inserted: 1 poll + 20 votes")
