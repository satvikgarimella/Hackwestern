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
            return {
                'error': 'Poll not found',
                'risk_score': 1,
                'explanation': 'Unable to analyze - poll data not found.',
                'summary': 'Poll not found - baseline risk'
            }
        
        poll = poll_response.data[0]
        
        # Parse the proposal to detect economic changes
        question = poll['question'].lower()
        description = poll.get('description', '').lower()
        full_text = f"{question} {description}"
        
        flags = []
        risk_factors = []
        risk_score = 1  # Start at 1, never 0 - there's always some risk
        print(f"[DEBUG] Economic Agent: Initial risk_score = {risk_score}")
        projections = {}
        impact_analysis = []
        
        # Detect staking reward changes
        if 'staking' in full_text and 'reward' in full_text:
            # Extract percentages (simplified for demo)
            if '6%' in question and '8%' in question:
                current_rate = 6.0
                proposed_rate = 8.0
                
                # Simulate treasury impact
                monthly_tokens = 100000  # example staked tokens
                current_cost = monthly_tokens * (current_rate / 100)
                proposed_cost = monthly_tokens * (proposed_rate / 100)
                additional_cost = proposed_cost - current_cost
                annual_increase = additional_cost * 12
                
                # Calculate runway
                treasury_balance = 1000000  # example balance
                current_runway_months = treasury_balance / current_cost if current_cost > 0 else 999
                proposed_runway_months = treasury_balance / proposed_cost if proposed_cost > 0 else 999
                runway_reduction = current_runway_months - proposed_runway_months
                
                projections = {
                    'current_apy': current_rate,
                    'proposed_apy': proposed_rate,
                    'apy_increase': proposed_rate - current_rate,
                    'monthly_cost_increase': round(additional_cost, 2),
                    'annual_cost_increase': round(annual_increase, 2),
                    'current_runway_months': round(current_runway_months, 1),
                    'proposed_runway_months': round(proposed_runway_months, 1),
                    'runway_reduction_months': round(runway_reduction, 1),
                    'treasury_balance': treasury_balance
                }
                
                # Risk assessment
                if proposed_runway_months < 6:
                    flags.append({
                        'type': 'CRITICAL_TREASURY_RISK',
                        'severity': 'CRITICAL',
                        'message': f'🚨 Treasury depletes in {proposed_runway_months:.1f} months - UNSUSTAINABLE'
                    })
                    risk_score += 7
                    risk_factors.append(f"Critical runway depletion: only {proposed_runway_months:.1f} months remaining (+7 points)")
                    impact_analysis.append(f"⛔ **CRITICAL**: At proposed rate, treasury will be exhausted in {proposed_runway_months:.1f} months. This is dangerously short and threatens project survival.")
                elif proposed_runway_months < 12:
                    flags.append({
                        'type': 'TREASURY_DEPLETION_RISK',
                        'severity': 'HIGH',
                        'message': f'⚠️ Treasury runway reduced to {proposed_runway_months:.1f} months (under 1 year)'
                    })
                    risk_score += 5
                    risk_factors.append(f"High treasury risk: {proposed_runway_months:.1f} months runway (+5 points)")
                    impact_analysis.append(f"⚠️ **HIGH RISK**: Treasury runway drops to {proposed_runway_months:.1f} months, falling below the 12-month safety threshold.")
                elif proposed_runway_months < 18:
                    flags.append({
                        'type': 'TREASURY_CONCERN',
                        'severity': 'MEDIUM',
                        'message': f'⚡ Treasury runway reduced to {proposed_runway_months:.1f} months'
                    })
                    risk_score += 3
                    risk_factors.append(f"Moderate treasury impact: {proposed_runway_months:.1f} months runway (+3 points)")
                    impact_analysis.append(f"⚡ **MODERATE**: Runway reduces to {proposed_runway_months:.1f} months. While above critical levels, this reduces financial flexibility.")
                elif proposed_runway_months < 24:
                    flags.append({
                        'type': 'TREASURY_IMPACT',
                        'severity': 'LOW',
                        'message': f'✓ Treasury runway: {proposed_runway_months:.1f} months (acceptable)'
                    })
                    risk_score += 1
                    risk_factors.append(f"Minor treasury impact: {proposed_runway_months:.1f} months runway (+1 point)")
                    impact_analysis.append(f"✓ **LOW IMPACT**: Runway of {proposed_runway_months:.1f} months provides adequate cushion for the increase.")
                else:
                    risk_factors.append(f"Healthy treasury position: {proposed_runway_months:.1f} months runway (+0 points)")
                    impact_analysis.append(f"✅ **HEALTHY**: Strong runway of {proposed_runway_months:.1f} months allows for this increase without sustainability concerns.")
                
                # User benefit analysis
                user_benefit = proposed_rate - current_rate
                user_benefit_annual = user_benefit  # % increase
                flags.append({
                    'type': 'USER_BENEFIT',
                    'severity': 'INFO',
                    'message': f'💰 Users gain +{user_benefit}% APY (from {current_rate}% to {proposed_rate}%)'
                })
                impact_analysis.append(f"💰 **STAKER BENEFIT**: Stakers receive a {user_benefit}% APY increase, boosting from {current_rate}% to {proposed_rate}%. This makes staking {(user_benefit/current_rate*100):.0f}% more attractive.")
                
                # Cost-benefit analysis
                if runway_reduction > 12:
                    impact_analysis.append(f"⚖️ **TRADEOFF**: The {user_benefit}% APY boost costs {runway_reduction:.1f} months of runway. This is a significant tradeoff favoring short-term rewards over long-term sustainability.")
                elif runway_reduction > 6:
                    impact_analysis.append(f"⚖️ **BALANCED**: The {user_benefit}% APY increase reduces runway by {runway_reduction:.1f} months - a moderate tradeoff between growth and sustainability.")
                else:
                    impact_analysis.append(f"⚖️ **FAVORABLE**: The {user_benefit}% APY boost only costs {runway_reduction:.1f} months of runway - an excellent value proposition for stakers.")
        
        # Detect treasury allocation proposals
        elif 'treasury' in full_text or 'allocate' in full_text:
            # Try to extract amounts
            import re
            amounts = re.findall(r'[\$\€\£]?\d+[,\d]*[kKmMbB]?', full_text)
            
            flags.append({
                'type': 'TREASURY_ALLOCATION',
                'severity': 'MEDIUM',
                'message': '💸 Proposal involves direct treasury allocation - requires careful review'
            })
            risk_score += 4
            risk_factors.append("Treasury allocation proposal (+4 points)")
            impact_analysis.append("💸 **TREASURY SPENDING**: This proposal allocates funds from the treasury. Verify the amount is justified and benefits the protocol.")
            
            if 'plasma' in full_text or 'deployment' in full_text:
                impact_analysis.append("🚀 **INFRASTRUCTURE**: Funds are earmarked for protocol infrastructure (Plasma deployment). This could enhance network capabilities.")
                risk_score -= 1  # Reduce risk if it's infrastructure
                risk_factors.append("Infrastructure investment reduces risk (-1 point)")
        
        # Detect funding or grant proposals
        elif 'funding' in full_text or 'grant' in full_text:
            flags.append({
                'type': 'FUNDING_REQUEST',
                'severity': 'MEDIUM',
                'message': '💰 Funding or grant request - evaluate ROI and accountability'
            })
            risk_score += 3
            risk_factors.append("Funding request proposal (+3 points)")
            impact_analysis.append("💰 **FUNDING REQUEST**: Proposal requests funding. Assess whether deliverables are clear and team is accountable.")
        
        # Detect token economics changes
        elif 'token' in full_text and ('supply' in full_text or 'emission' in full_text or 'mint' in full_text):
            flags.append({
                'type': 'TOKENOMICS_CHANGE',
                'severity': 'HIGH',
                'message': '⚠️ Changes to token supply or emissions - impacts all holders'
            })
            risk_score += 5
            risk_factors.append("Token supply/emission changes (+5 points)")
            impact_analysis.append("⚠️ **TOKENOMICS**: Proposal modifies token supply mechanics. This affects all token holders' dilution and value.")
        
        # General governance changes
        elif 'governance' in full_text or 'voting' in full_text:
            risk_score += 2
            risk_factors.append("Governance structure changes (+2 points)")
            impact_analysis.append("🗳️ **GOVERNANCE**: Proposal modifies governance structure. Consider long-term implications for decentralization.")
        
        # If no specific category detected
        if not flags:
            flags.append({
                'type': 'GENERAL_PROPOSAL',
                'severity': 'LOW',
                'message': '📋 General proposal - standard economic impact'
            })
            risk_factors.append("General proposal with baseline risk")
            impact_analysis.append("📋 **GENERAL PROPOSAL**: No major economic red flags detected. Standard governance proposal with minimal financial impact.")
        
        # Cap risk score at 10
        risk_score = min(risk_score, 10)
        print(f"[DEBUG] Economic Agent: Final risk_score = {risk_score}")
        
        # Generate detailed explanation
        explanation = self._generate_explanation(
            risk_score, 
            question, 
            projections, 
            impact_analysis, 
            risk_factors
        )
        
        # FINAL SAFEGUARD: Ensure risk score is never 0 (minimum is 1)
        risk_score = max(1, risk_score)
        print(f"[DEBUG] Economic Agent: FINAL SAFEGUARDED risk_score = {risk_score}")
        
        # FORCE RISK SCORE TO MINIMUM 1
        final_risk_score = 1 if risk_score < 1 else int(risk_score)
        
        analysis = {
            'poll_id': poll_id,
            'agent_type': 'economic',
            'risk_score': final_risk_score,
            'explanation': explanation.replace("Risk Score: 0/10", f"Risk Score: {final_risk_score}/10").replace("Final Score: 0/10", f"Final Score: {final_risk_score}/10"),
            'summary': self._generate_summary(final_risk_score) + " [v2.0]",  # Marker to confirm new code
            'flags': flags,
            'projections': projections,
            'impact_analysis': impact_analysis,
            'risk_factors': risk_factors,
            'recommendation': self._generate_recommendation(max(1, risk_score), projections),
            'execution_time_ms': int((datetime.now() - start).total_seconds() * 1000)
        }
        
        # Store analysis
        supabase.table('agent_analyses').insert({
            'poll_id': poll_id,
            'agent_type': 'economic',
            'analysis_data': analysis,
            'risk_score': max(1, risk_score),  # Force minimum 1
            'flags': flags
        }).execute()
        
        return analysis
    
    def _generate_summary(self, risk_score: int) -> str:
        """Generate a quick summary based on risk score (1-10 scale)"""
        if risk_score >= 9:
            return "🚨 CRITICAL ECONOMIC RISK - Threatens financial sustainability"
        elif risk_score >= 7:
            return "⚠️ HIGH ECONOMIC RISK - Significant financial concerns"
        elif risk_score >= 5:
            return "⚡ MODERATE RISK - Some economic tradeoffs present"
        elif risk_score >= 3:
            return "✓ LOW RISK - Minor economic impact"
        else:
            return "✅ MINIMAL RISK - Economically sound proposal"
    
    def _generate_explanation(self, risk_score: int, question: str, projections: dict, 
                            impact_analysis: list, risk_factors: list) -> str:
        """Generate detailed explanation of the economic analysis"""
        
        explanation = f"**Economic Risk Score: {risk_score}/10**\n\n"
        
        # Overall assessment (1-10 scale)
        if risk_score >= 9:
            explanation += "🚨 **CRITICAL ECONOMIC RISK**\n\n"
            explanation += "This proposal poses severe threats to the protocol's financial sustainability. The economic impact could jeopardize long-term viability. Strongly recommend rejection or major revision.\n\n"
        elif risk_score >= 7:
            explanation += "⚠️ **HIGH ECONOMIC RISK**\n\n"
            explanation += "Significant economic concerns identified. This proposal could strain treasury resources or create unsustainable obligations. Proceed with extreme caution.\n\n"
        elif risk_score >= 5:
            explanation += "⚡ **MODERATE ECONOMIC RISK**\n\n"
            explanation += "Notable economic tradeoffs present. The proposal is viable but requires careful monitoring of treasury impact and may need adjustments.\n\n"
        elif risk_score >= 3:
            explanation += "✓ **LOW ECONOMIC RISK**\n\n"
            explanation += "Minor economic impact detected. The proposal is financially sound with manageable tradeoffs. Minimal concerns about sustainability.\n\n"
        else:
            explanation += "✅ **MINIMAL ECONOMIC RISK**\n\n"
            explanation += "Excellent economic proposal with minimal risk. Financially sustainable and well-balanced. No significant concerns identified.\n\n"
        
        # Detailed impact analysis
        if impact_analysis:
            explanation += "**Economic Impact Analysis:**\n\n"
            for impact in impact_analysis:
                explanation += f"{impact}\n\n"
        
        # Financial projections
        if projections:
            explanation += "**Financial Projections:**\n\n"
            
            if 'current_apy' in projections:
                explanation += f"📊 **Staking Rewards:**\n"
                explanation += f"• Current APY: {projections['current_apy']}%\n"
                explanation += f"• Proposed APY: {projections['proposed_apy']}%\n"
                explanation += f"• Increase: +{projections['apy_increase']}%\n\n"
                
                explanation += f"💰 **Treasury Impact:**\n"
                explanation += f"• Monthly cost increase: {projections['monthly_cost_increase']:,} tokens\n"
                explanation += f"• Annual cost increase: {projections['annual_cost_increase']:,} tokens\n\n"
                
                explanation += f"⏱️ **Treasury Runway:**\n"
                explanation += f"• Current runway: {projections['current_runway_months']} months\n"
                explanation += f"• Proposed runway: {projections['proposed_runway_months']} months\n"
                explanation += f"• Reduction: {projections['runway_reduction_months']} months\n\n"
        
        # Risk factors breakdown
        if risk_factors:
            explanation += "**Risk Score Breakdown:**\n"
            for factor in risk_factors:
                explanation += f"• {factor}\n"
            explanation += f"\n**Final Score: {risk_score}/10**\n\n"
        
        # Recommendation
        explanation += self._generate_recommendation(risk_score, projections)
        
        return explanation
    
    def _generate_recommendation(self, risk_score, projections):
        """Generate human-readable recommendation (1-10 scale)"""
        if risk_score >= 9:
            rec = "**⛔ RECOMMENDATION: REJECT**\n\n"
            rec += "This proposal threatens the protocol's financial sustainability. The economic risks far outweigh potential benefits. "
            if projections and 'proposed_runway_months' in projections:
                if projections['proposed_runway_months'] < 6:
                    rec += f"Treasury would be exhausted in {projections['proposed_runway_months']:.1f} months. "
            rec += "Consider rejecting or fundamentally restructuring the proposal."
            return rec
        elif risk_score >= 7:
            rec = "**⚠️ RECOMMENDATION: PROCEED WITH CAUTION**\n\n"
            rec += "Significant economic concerns warrant serious consideration. "
            if projections and 'proposed_runway_months' in projections:
                rec += f"Treasury runway drops to {projections['proposed_runway_months']:.1f} months. "
            rec += "Recommend revising to reduce financial impact or implementing safeguards and monitoring mechanisms."
            return rec
        elif risk_score >= 5:
            rec = "**⚡ RECOMMENDATION: ACCEPTABLE WITH MONITORING**\n\n"
            rec += "Proposal is economically viable but presents notable tradeoffs. "
            if projections and 'runway_reduction_months' in projections:
                rec += f"Reduces runway by {projections['runway_reduction_months']:.1f} months. "
            rec += "Recommend approval with close monitoring of treasury metrics and readiness to adjust if needed."
            return rec
        elif risk_score >= 3:
            rec = "**✓ RECOMMENDATION: APPROVE**\n\n"
            rec += "Proposal is financially sound with minimal risk. Economic impact is manageable and sustainable. Recommend approval."
            return rec
        else:
            rec = "**✅ RECOMMENDATION: STRONGLY APPROVE**\n\n"
            rec += "Excellent economic proposal with minimal downside. Financially sustainable and well-structured. Strongly recommend approval."
            return rec

if __name__ == "__main__":
    agent = EconomicAgent()
    result = agent.analyze_poll("test-poll-1")
    print(json.dumps(result, indent=2))
