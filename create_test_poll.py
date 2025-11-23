"""
Create a test poll in Supabase for the GovAI dashboard
"""
from supabase import create_client
from dotenv import load_dotenv
import os
import json

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def create_test_poll():
    """Create a test poll with real data"""
    
    poll_data = {
        "poll_id": "test-poll-1",
        "question": "Should staking rewards be increased from 6% to 8%?",
        "description": "This proposal seeks to increase staking rewards to incentivize more network participation and security.",
        "options": json.dumps(["yes", "no", "abstain"])
    }
    
    try:
        # Check if poll already exists
        existing = supabase.table('polls').select('*').eq('poll_id', 'test-poll-1').execute()
        
        if existing.data:
            print("✅ Test poll already exists!")
            print(f"Poll ID: {existing.data[0]['poll_id']}")
            print(f"Question: {existing.data[0]['question']}")
        else:
            # Create new poll
            response = supabase.table('polls').insert(poll_data).execute()
            print("✅ Test poll created successfully!")
            print(f"Poll ID: {response.data[0]['poll_id']}")
            print(f"Question: {response.data[0]['question']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating poll: {str(e)}")
        return False


def run_initial_analysis():
    """Run AI agents on the test poll"""
    from agents.explainer.agent import ExplainerAgent
    from agents.whale_watch.agent import WhaleWatchAgent
    from agents.economic.agent import EconomicAgent
    
    print("\n🤖 Running AI agent analysis...")
    
    try:
        # Run explainer
        explainer = ExplainerAgent()
        explainer_result = explainer.explain_poll("test-poll-1")
        print("✅ Explainer agent completed")
        
        # Run whale watch (will show no votes initially)
        whale_watch = WhaleWatchAgent()
        whale_result = whale_watch.analyze_poll("test-poll-1")
        print("✅ Whale watch agent completed")
        
        # Run economic analysis
        economic = EconomicAgent()
        economic_result = economic.analyze_poll("test-poll-1")
        print("✅ Economic agent completed")
        
        print("\n🎉 All agents have analyzed the poll!")
        print("You can now see the analysis in your dashboard")
        
    except Exception as e:
        print(f"⚠️  Error running agents: {str(e)}")
        print("This is normal if there are no votes yet.")


if __name__ == "__main__":
    print("🚀 Creating test poll for GovAI Dashboard\n")
    
    if create_test_poll():
        run_initial_analysis()
        
        print("\n" + "="*60)
        print("📊 Test Data Setup Complete!")
        print("="*60)
        print("\nNext steps:")
        print("1. Make sure backend is running: cd backend && python main.py")
        print("2. Make sure frontend is running: pnpm dev")
        print("3. Open http://localhost:3000 (or 3001)")
        print("4. Connect your Solana wallet")
        print("5. Try voting on the poll!")
        print("\n💡 The AI agents will analyze votes in real-time!")

