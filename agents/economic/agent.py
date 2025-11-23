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

class EconomicAgent:
    def analyze_poll(self, poll_id: str):
        """Simulate economic impact of proposal"""
        start = datetime.now()
        
        # Fetch poll data
        poll_response = supabase.table('polls').select('*').eq('poll_id', poll_id).execute()
        
        if not poll_response.data:
            return {'error': 'Poll not found'}
        
        poll = poll_response.data[0]
        
        # Parse the proposal to detect economic changes
        question = poll['question'].lower()
        
        flags = []
        risk_score = 0
        projections = {}
        
        # Detect staking reward changes
        if 'staking' in question and 'reward' in question:
            # Extract percentages (simplified for demo)
            if '6%' in question and '8%' in question:
                current_rate = 6.0
                proposed_rate = 8.0
                
                # Simulate treasury impact
                monthly_tokens = 100000  # example treasury
                current_cost = monthly_tokens * (current_rate / 100)
                proposed_cost = monthly_tokens * (proposed_rate / 100)
                additional_cost = proposed_cost - current_cost
                
                # Calculate runway
                treasury_balance = 1000000  # example balance
                current_runway_months = treasury_balance / current_cost
                proposed_runway_months = treasury_balance / proposed_cost
                
                projections = {
                    'current_apy': current_rate,
                    'proposed_apy': proposed_rate,
                    'monthly_cost_increase': additional_cost,
                    'current_runway_months': round(current_runway_months, 1),
                    'proposed_runway_months': round(proposed_runway_months, 1),
                    'runway_reduction_months': round(current_runway_months - proposed_runway_months, 1)
                }
                
                # Risk assessment
                if proposed_runway_months < 12:
                    flags.append({
                        'type': 'TREASURY_DEPLETION_RISK',
                        'severity': 'HIGH',
                        'message': f'Treasury runway reduced to {proposed_runway_months:.1f} months (under 1 year)'
                    })
                    risk_score += 4
                elif proposed_runway_months < 18:
                    flags.append({
                        'type': 'TREASURY_CONCERN',
                        'severity': 'MEDIUM',
                        'message': f'Treasury runway reduced to {proposed_runway_months:.1f} months'
                    })
                    risk_score += 2
                
                # User benefit analysis
                user_benefit = proposed_rate - current_rate
                flags.append({
                    'type': 'USER_BENEFIT',
                    'severity': 'INFO',
                    'message': f'Users gain +{user_benefit}% APY (from {current_rate}% to {proposed_rate}%)'
                })
        
        # Detect treasury allocation proposals
        elif 'treasury' in question or 'allocate' in question:
            flags.append({
                'type': 'TREASURY_ALLOCATION',
                'severity': 'MEDIUM',
                'message': 'Proposal involves direct treasury allocation - review carefully'
            })
            risk_score += 3
        
        risk_score = min(risk_score, 10)
        
        analysis = {
            'poll_id': poll_id,
            'agent_type': 'economic',
            'risk_score': risk_score,
            'flags': flags,
            'projections': projections,
            'recommendation': self._generate_recommendation(risk_score, projections),
            'execution_time_ms': int((datetime.now() - start).total_seconds() * 1000)
        }
        
        # Store analysis
        supabase.table('agent_analyses').insert({
            'poll_id': poll_id,
            'agent_type': 'economic',
            'analysis_data': analysis,
            'risk_score': risk_score,
            'flags': flags
        }).execute()
        
        return analysis
    
    def _generate_recommendation(self, risk_score, projections):
        """Generate human-readable recommendation"""
        if risk_score >= 7:
            return "HIGH RISK - Proposal threatens long-term sustainability. Consider reducing scope or delaying."
        elif risk_score >= 4:
            return "MEDIUM RISK - Proposal is viable but monitor treasury closely. Consider shorter implementation period."
        else:
            return "LOW RISK - Proposal appears economically sustainable."

if __name__ == "__main__":
    agent = EconomicAgent()
    result = agent.analyze_poll("test-poll-1")
    print(json.dumps(result, indent=2))
