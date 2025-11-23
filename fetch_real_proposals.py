import requests
import json
from supabase import create_client
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def fetch_snapshot_proposals():
    """Fetch real proposals from Snapshot"""
    
    url = "https://hub.snapshot.org/graphql"
    
    # Query for proposals from popular DAOs
    query = """
    {
      proposals(
        first: 10,
        where: {
          space_in: ["ens.eth", "uniswapgovernance.eth", "aave.eth"],
          state: "closed"
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        space {
          id
          name
        }
        scores
        scores_total
        created
      }
    }
    """
    
    response = requests.post(url, json={'query': query})
    data = response.json()
    
    if 'data' not in data or 'proposals' not in data['data']:
        print("❌ Failed to fetch proposals")
        return []
    
    proposals = data['data']['proposals']
    print(f"✅ Fetched {len(proposals)} real proposals from Snapshot\n")
    
    return proposals

def import_to_database(proposals):
    """Import real proposals into your database"""
    
    for i, prop in enumerate(proposals[:5]):  # Import first 5
        poll_id = f"real-poll-{i+1}"
        
        # Extract description (first 500 chars of body)
        description = prop['body'][:500] if prop['body'] else "No description available"
        
        print(f"\n📊 Importing: {prop['title'][:60]}...")
        
        # Insert into polls table
        try:
            supabase.table('polls').insert({
                'poll_id': poll_id,
                'question': prop['title'],
                'description': description,
                'options': prop['choices'],
                'creator_pubkey': prop['space']['id'],
                'status': 'closed',
                'created_at': datetime.fromtimestamp(prop['created']).isoformat()
            }).execute()
            
            print(f"   ✅ Imported as {poll_id}")
            print(f"   DAO: {prop['space']['name']}")
            print(f"   Options: {prop['choices']}")
            
        except Exception as e:
            print(f"   ⚠️  Already exists or error: {str(e)[:100]}")

if __name__ == "__main__":
    print("🔍 Fetching real DAO proposals from Snapshot...\n")
    proposals = fetch_snapshot_proposals()
    
    if proposals:
        print("\n" + "="*60)
        print("FOUND PROPOSALS:")
        print("="*60)
        for i, p in enumerate(proposals[:5]):
            print(f"\n{i+1}. {p['title']}")
            print(f"   DAO: {p['space']['name']}")
            print(f"   Choices: {p['choices']}")
        
        print("\n" + "="*60)
        import_choice = input("\nImport these proposals to your database? (y/n): ")
        
        if import_choice.lower() == 'y':
            import_to_database(proposals)
            print("\n✅ Import complete! You now have real proposals.")
            print("\nTest them with:")
            print("  python agents/explainer/agent.py  # (change poll_id to 'real-poll-1')")
    else:
        print("❌ No proposals found")
