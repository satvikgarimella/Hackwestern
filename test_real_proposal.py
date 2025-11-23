from agents.explainer.agent import ExplainerAgent

agent = ExplainerAgent()

# Test on real Uniswap proposal
result = agent.explain_poll("real-poll-5")  # "Grow Uniswap on Plasma"

print("\n" + "="*60)
print("REAL PROPOSAL ANALYSIS")
print("="*60)
print(f"\n📋 Original Question:")
print(result['poll_question'])
print(f"\n🤖 AI Explanation:")
print(result['explanation'])
print("="*60)
