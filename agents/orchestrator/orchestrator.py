from supabase import create_client
from dotenv import load_dotenv
import os
import json
from datetime import datetime
import sys
import pathlib

# Add parent directory to path
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent.parent))

from agents.whale_watch.agent import WhaleWatchAgent
from agents.economic.agent import EconomicAgent

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class Orchestrator:
    def analyze_poll(self, poll_id: str):
        """Run all agents and synthesize results"""
        start = datetime.now()
        
        print(f"🤖 Analyzing poll: {poll_id}\n")
        
        # Run all agents
        print("Running Whale Watch Agent...")
        whale_watch = WhaleWatchAgent()
        whale_result = whale_watch.analyze_poll(poll_id)
        
        print("Running Economic Agent...")
        economic = EconomicAgent()
        economic_result = economic.analyze_poll(poll_id)
        
        # Calculate combined risk score (weighted average)
        combined_risk = int((whale_result['risk_score'] * 0.6) + (economic_result['risk_score'] * 0.4))
        
        # Generate agent deliberation
        deliberation = self._generate_deliberation(whale_result, economic_result)
        
        # Generate consensus recommendation
        consensus = self._generate_consensus(combined_risk, whale_result, economic_result)
        
        result = {
            'poll_id': poll_id,
            'combined_risk_score': combined_risk,
            'consensus_recommendation': consensus,
            'agent_deliberation': deliberation,
            'all_agent_results': {
                'whale_watch': whale_result,
                'economic': economic_result
            },
            'execution_time_ms': int((datetime.now() - start).total_seconds() * 1000)
        }
        
        # Store in database
        supabase.table('orchestrator_results').insert(result).execute()
        
        return result
    
    def _generate_deliberation(self, whale_result, economic_result):
        """Generate agent debate transcript"""
        debate = []
        
        debate.append("🛡️  WHALE WATCH AGENT:")
        if whale_result['risk_score'] >= 7:
            debate.append(f"   ⚠️  CRITICAL SECURITY THREAT DETECTED (Risk: {whale_result['risk_score']}/10)")
        else:
            debate.append(f"   Security Status: Risk {whale_result['risk_score']}/10")
        
        for flag in whale_result['flags']:
            debate.append(f"   • {flag['severity']}: {flag['message']}")
        
        debate.append("\n💰 ECONOMIC AGENT:")
        debate.append(f"   Financial Impact: Risk {economic_result['risk_score']}/10")
        
        if economic_result['projections']:
            proj = economic_result['projections']
            debate.append(f"   • Treasury runway: {proj.get('current_runway_months', 0):.1f} → {proj.get('proposed_runway_months', 0):.1f} months")
            debate.append(f"   • User APY gain: +{proj.get('proposed_apy', 0) - proj.get('current_apy', 0):.1f}%")
        
        for flag in economic_result['flags']:
            if flag['severity'] != 'INFO':
                debate.append(f"   • {flag['severity']}: {flag['message']}")
        
        return "\n".join(debate)
    
    def _generate_consensus(self, combined_risk, whale_result, economic_result):
        """Generate final recommendation"""
        if combined_risk >= 8:
            return "🚨 REJECT - Critical security or economic risks detected. Do not approve."
        elif combined_risk >= 6:
            return "⚠️  DELAY - Significant concerns. Address issues before approval."
        elif combined_risk >= 3:
            return "⚡ APPROVE WITH CAUTION - Moderate risks. Monitor closely after implementation."
        else:
            return "✅ APPROVE - Low risk. Proposal appears safe to implement."

if __name__ == "__main__":
    orchestrator = Orchestrator()
    result = orchestrator.analyze_poll("test-poll-1")
    
    print("\n" + "="*60)
    print("AGENT COUNCIL DELIBERATION")
    print("="*60)
    print(result['agent_deliberation'])
    print("\n" + "="*60)
    print(f"🎯 CONSENSUS RECOMMENDATION: {result['consensus_recommendation']}")
    print(f"📊 COMBINED RISK SCORE: {result['combined_risk_score']}/10")
    print("="*60)
