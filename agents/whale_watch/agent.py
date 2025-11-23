from supabase import create_client
from dotenv import load_dotenv
import os
import json
from datetime import datetime

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class WhaleWatchAgent:
    def analyze_poll(self, poll_id: str):
        """Detect sybil attacks and whale manipulation"""
        start = datetime.now()
        
        # Fetch votes
        response = supabase.table('votes').select('*').eq('poll_id', poll_id).execute()
        votes = response.data
        
        if not votes:
            return {'error': 'No votes found', 'poll_id': poll_id}
        
        flags = []
        risk_score = 0
        
        # Detection 1: New wallet spam
        new_wallets = [v for v in votes if v.get('wallet_age_days', 999) < 7]
        new_pct = len(new_wallets) / len(votes) * 100
        
        if new_pct > 30:
            flags.append({
                'type': 'SYBIL_SUSPECTED',
                'severity': 'HIGH',
                'message': f"{len(new_wallets)} votes ({new_pct:.1f}%) from wallets <7 days old"
            })
            risk_score += 4
        
        # Detection 2: Whale concentration
        if len(votes) >= 5:
            sorted_votes = sorted(votes, key=lambda x: x.get('sol_balance', 0), reverse=True)
            top_5_balance = sum(v.get('sol_balance', 0) for v in sorted_votes[:5])
            total_balance = sum(v.get('sol_balance', 0) for v in votes)
            whale_pct = (top_5_balance / total_balance * 100) if total_balance > 0 else 0
            
            if whale_pct > 50:
                flags.append({
                    'type': 'WHALE_CONCENTRATION',
                    'severity': 'MEDIUM',
                    'message': f"Top 5 wallets control {whale_pct:.1f}% of voting power"
                })
                risk_score += 3
        
        # Detection 3: Option-specific sybil
        vote_breakdown = {}
        for v in votes:
            option = v['vote_option']
            vote_breakdown.setdefault(option, []).append(v)
        
        for option, option_votes in vote_breakdown.items():
            option_new = [v for v in option_votes if v.get('wallet_age_days', 999) < 7]
            option_new_pct = len(option_new) / len(option_votes) * 100
            
            if option_new_pct > 60:
                flags.append({
                    'type': 'OPTION_SYBIL',
                    'severity': 'CRITICAL',
                    'message': f"Option '{option}': {option_new_pct:.1f}% from new wallets",
                    'affected_option': option
                })
                risk_score += 5
        
        risk_score = min(risk_score, 10)
        
        analysis = {
            'poll_id': poll_id,
            'agent_type': 'whale_watch',
            'risk_score': risk_score,
            'flags': flags,
            'total_votes': len(votes),
            'vote_breakdown': {opt: len(votes) for opt, votes in vote_breakdown.items()},
            'new_wallet_percentage': round(new_pct, 1),
            'execution_time_ms': int((datetime.now() - start).total_seconds() * 1000)
        }
        
        # Store analysis
        supabase.table('agent_analyses').insert({
            'poll_id': poll_id,
            'agent_type': 'whale_watch',
            'analysis_data': analysis,
            'risk_score': risk_score,
            'flags': flags
        }).execute()
        
        return analysis

if __name__ == "__main__":
    agent = WhaleWatchAgent()
    result = agent.analyze_poll("test-poll-1")
    print(json.dumps(result, indent=2))
