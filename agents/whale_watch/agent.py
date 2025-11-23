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
            return {
                'error': 'No votes found', 
                'poll_id': poll_id,
                'risk_score': 1,
                'explanation': 'No votes have been cast yet on this proposal. Risk assessment will be available once voting begins.',
                'summary': 'No votes yet - baseline risk'
            }
        
        flags = []
        risk_factors = []
        risk_score = 1  # Start at 1, never 0 - there's always some risk
        
        # Detection 1: New wallet spam (Sybil attack indicator)
        new_wallets = [v for v in votes if v.get('wallet_age_days', 999) < 7]
        new_pct = len(new_wallets) / len(votes) * 100
        
        if new_pct > 50:
            flags.append({
                'type': 'SYBIL_SUSPECTED',
                'severity': 'CRITICAL',
                'message': f"🚨 {len(new_wallets)} votes ({new_pct:.1f}%) from wallets <7 days old - likely coordinated attack"
            })
            risk_score += 5
            risk_factors.append(f"Extreme sybil risk: {new_pct:.1f}% new wallets (+5 points)")
        elif new_pct > 30:
            flags.append({
                'type': 'SYBIL_SUSPECTED',
                'severity': 'HIGH',
                'message': f"⚠️ {len(new_wallets)} votes ({new_pct:.1f}%) from wallets <7 days old - suspicious pattern"
            })
            risk_score += 3
            risk_factors.append(f"High new wallet concentration: {new_pct:.1f}% (+3 points)")
        elif new_pct > 15:
            flags.append({
                'type': 'NEW_WALLET_ACTIVITY',
                'severity': 'MEDIUM',
                'message': f"⚡ {len(new_wallets)} votes ({new_pct:.1f}%) from wallets <7 days old - monitor closely"
            })
            risk_score += 1
            risk_factors.append(f"Moderate new wallet activity: {new_pct:.1f}% (+1 point)")
        else:
            # Good wallet distribution - no additional risk points added
            pass
        
        # Detection 2: Whale concentration
        whale_analysis = ""
        if len(votes) >= 5:
            sorted_votes = sorted(votes, key=lambda x: x.get('sol_balance', 0), reverse=True)
            top_5_balance = sum(v.get('sol_balance', 0) for v in sorted_votes[:5])
            total_balance = sum(v.get('sol_balance', 0) for v in votes)
            whale_pct = (top_5_balance / total_balance * 100) if total_balance > 0 else 0
            
            if whale_pct > 70:
                flags.append({
                    'type': 'WHALE_DOMINATION',
                    'severity': 'CRITICAL',
                    'message': f"🐋 Top 5 wallets control {whale_pct:.1f}% of voting power - extreme centralization"
                })
                risk_score += 4
                risk_factors.append(f"Extreme whale dominance: top 5 control {whale_pct:.1f}% (+4 points)")
                whale_analysis = f"CRITICAL: Top 5 wallets hold {whale_pct:.1f}% of voting power. This creates a centralization risk where a small group can determine the outcome."
            elif whale_pct > 50:
                flags.append({
                    'type': 'WHALE_CONCENTRATION',
                    'severity': 'HIGH',
                    'message': f"🐋 Top 5 wallets control {whale_pct:.1f}% of voting power - high centralization"
                })
                risk_score += 2
                risk_factors.append(f"High whale concentration: top 5 control {whale_pct:.1f}% (+2 points)")
                whale_analysis = f"HIGH: Top 5 wallets control {whale_pct:.1f}% of voting power. While not extreme, this concentration could influence the outcome."
            elif whale_pct > 30:
                flags.append({
                    'type': 'WHALE_PRESENCE',
                    'severity': 'MEDIUM',
                    'message': f"🐳 Top 5 wallets control {whale_pct:.1f}% of voting power - moderate concentration"
                })
                risk_score += 1
                risk_factors.append(f"Moderate whale presence: top 5 control {whale_pct:.1f}% (+1 point)")
                whale_analysis = f"MODERATE: Top 5 wallets control {whale_pct:.1f}% of voting power. Distribution is somewhat centralized but not alarming."
            else:
                # Healthy distribution - no additional risk
                whale_analysis = f"HEALTHY: Top 5 wallets control only {whale_pct:.1f}% of voting power. This indicates good decentralization."
        else:
            whale_analysis = f"Too few votes ({len(votes)}) to assess whale concentration. Need at least 5 votes."
        
        # Add baseline explanation if no major risks found
        if not risk_factors:
            risk_factors.append(f"Baseline risk assessment - healthy voting pattern detected")
        
        # Detection 3: Option-specific sybil
        vote_breakdown = {}
        for v in votes:
            option = v['vote_option']
            vote_breakdown.setdefault(option, []).append(v)
        
        option_analysis = []
        for option, option_votes in vote_breakdown.items():
            option_new = [v for v in option_votes if v.get('wallet_age_days', 999) < 7]
            option_new_pct = len(option_new) / len(option_votes) * 100 if option_votes else 0
            option_avg_balance = sum(v.get('sol_balance', 0) for v in option_votes) / len(option_votes) if option_votes else 0
            
            option_analysis.append({
                'option': option,
                'total_votes': len(option_votes),
                'new_wallet_pct': round(option_new_pct, 1),
                'avg_balance': round(option_avg_balance, 2)
            })
            
            if option_new_pct > 70:
                flags.append({
                    'type': 'OPTION_SYBIL',
                    'severity': 'CRITICAL',
                    'message': f"🎯 '{option}' votes: {option_new_pct:.1f}% from new wallets - targeted attack suspected",
                    'affected_option': option
                })
                risk_score += 4
                risk_factors.append(f"Targeted sybil on '{option}': {option_new_pct:.1f}% new wallets (+4 points)")
            elif option_new_pct > 50:
                flags.append({
                    'type': 'OPTION_SYBIL',
                    'severity': 'HIGH',
                    'message': f"🎯 '{option}' votes: {option_new_pct:.1f}% from new wallets - suspicious concentration",
                    'affected_option': option
                })
                risk_score += 2
                risk_factors.append(f"High new wallet concentration on '{option}': {option_new_pct:.1f}% (+2 points)")
        
        # Cap risk score at 10
        risk_score = min(risk_score, 10)
        
        # Generate detailed explanation
        explanation = self._generate_explanation(risk_score, len(votes), new_pct, whale_analysis, option_analysis, risk_factors)
        
        analysis = {
            'poll_id': poll_id,
            'agent_type': 'whale_watch',
            'risk_score': risk_score,
            'explanation': explanation,
            'summary': self._generate_summary(risk_score),
            'flags': flags,
            'total_votes': len(votes),
            'vote_breakdown': {opt: len(votes_list) for opt, votes_list in vote_breakdown.items()},
            'new_wallet_percentage': round(new_pct, 1),
            'option_analysis': option_analysis,
            'risk_factors': risk_factors,
            'whale_analysis': whale_analysis,
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
    
    def _generate_summary(self, risk_score: int) -> str:
        """Generate a quick summary based on risk score (1-10 scale)"""
        if risk_score >= 9:
            return "🚨 CRITICAL RISK - Strong evidence of manipulation or coordinated attack"
        elif risk_score >= 7:
            return "⚠️ HIGH RISK - Significant suspicious patterns detected"
        elif risk_score >= 5:
            return "⚡ MODERATE RISK - Some concerning indicators present"
        elif risk_score >= 3:
            return "✓ LOW RISK - Minor concerns but generally healthy"
        else:
            return "✅ MINIMAL RISK - Voting pattern appears legitimate and decentralized"
    
    def _generate_explanation(self, risk_score: int, total_votes: int, new_pct: float, 
                            whale_analysis: str, option_analysis: list, risk_factors: list) -> str:
        """Generate detailed explanation of the risk score"""
        
        explanation = f"**Risk Score: {risk_score}/10**\n\n"
        
        # Overall assessment
        if risk_score >= 8:
            explanation += "🚨 **CRITICAL RISK DETECTED**\n\n"
            explanation += "This voting pattern shows strong signs of manipulation. Multiple red flags indicate either a coordinated sybil attack or whale manipulation attempting to control the outcome.\n\n"
        elif risk_score >= 6:
            explanation += "⚠️ **HIGH RISK WARNING**\n\n"
            explanation += "Significant suspicious activity detected. While not definitive proof of manipulation, the patterns warrant serious concern and additional scrutiny.\n\n"
        elif risk_score >= 4:
            explanation += "⚡ **MODERATE RISK**\n\n"
            explanation += "Some concerning patterns detected that merit attention. The vote may be legitimate but shows characteristics that could indicate manipulation attempts.\n\n"
        elif risk_score >= 2:
            explanation += "✓ **LOW RISK**\n\n"
            explanation += "Generally healthy voting pattern with minor concerns. The detected issues are not severe enough to question the vote's legitimacy.\n\n"
        else:
            explanation += "✅ **MINIMAL RISK**\n\n"
            explanation += "Excellent voting pattern showing strong decentralization and legitimate participation. No significant red flags detected.\n\n"
        
        # Vote statistics
        explanation += f"**Voting Statistics:**\n"
        explanation += f"• Total votes cast: {total_votes}\n"
        explanation += f"• New wallet participation: {new_pct:.1f}%\n\n"
        
        # Whale analysis
        if whale_analysis:
            explanation += f"**Whale Concentration Analysis:**\n{whale_analysis}\n\n"
        
        # Option breakdown
        if option_analysis:
            explanation += "**Voting Option Breakdown:**\n"
            for opt in option_analysis:
                explanation += f"• **{opt['option'].upper()}**: {opt['total_votes']} votes ({opt['new_wallet_pct']:.1f}% new wallets, avg {opt['avg_balance']:.2f} SOL)\n"
            explanation += "\n"
        
        # Risk factors contributing to score
        explanation += "**Risk Score Breakdown:**\n"
        for factor in risk_factors:
            explanation += f"• {factor}\n"
        
        explanation += f"\n**Final Score: {risk_score}/10**"
        
        return explanation

if __name__ == "__main__":
    agent = WhaleWatchAgent()
    result = agent.analyze_poll("test-poll-1")
    print(json.dumps(result, indent=2))
