"""
FastAPI Backend for GovAI
Serves AI agents and connects frontend to Solana blockchain
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import sys
import os
from dotenv import load_dotenv

# Add parent directory to path for agent imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.explainer.agent import ExplainerAgent
from agents.whale_watch.agent import WhaleWatchAgent
from agents.economic.agent import EconomicAgent

load_dotenv()

app = FastAPI(title="GovAI Backend", version="1.0.0")

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:3000",
    "https://govai-plum.vercel.app",
    "https://gov-ai-eight.vercel.app",  # Add this line
    os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
explainer = ExplainerAgent()
whale_watch = WhaleWatchAgent()
economic = EconomicAgent()


class PollAnalysisRequest(BaseModel):
    poll_id: str
    agent_type: Optional[str] = "all"  # explainer, whale_watch, economic, or all


class VoteRequest(BaseModel):
    poll_id: str
    wallet_address: str
    vote_option: str
    signature: str
    wallet_age_days: Optional[int] = None
    sol_balance: Optional[float] = None


@app.get("/")
async def root():
    return {
        "message": "GovAI Backend API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/analyze")
async def analyze_poll(request: PollAnalysisRequest):
    """
    Run AI agent analysis on a poll
    """
    try:
        results = {}
        
        if request.agent_type in ["explainer", "all"]:
            results["explainer"] = explainer.explain_poll(request.poll_id)
        
        if request.agent_type in ["whale_watch", "all"]:
            results["whale_watch"] = whale_watch.analyze_poll(request.poll_id)
        
        if request.agent_type in ["economic", "all"]:
            results["economic"] = economic.analyze_poll(request.poll_id)
        
        # Calculate consensus score
        if request.agent_type == "all":
            scores = []
            if "whale_watch" in results and "risk_score" in results["whale_watch"]:
                scores.append(results["whale_watch"]["risk_score"])
            if "economic" in results and "risk_score" in results["economic"]:
                scores.append(results["economic"]["risk_score"])
            
            results["consensus"] = {
                "combined_risk_score": round(sum(scores) / len(scores), 1) if scores else 0,
                "agents_analyzed": len(scores)
            }
        
        return {
            "success": True,
            "poll_id": request.poll_id,
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vote")
async def submit_vote(vote: VoteRequest):
    """
    Submit a vote to the blockchain and trigger whale watch analysis
    Allows users to change their vote by updating existing vote
    """
    try:
        # Check for Supabase credentials
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(
                status_code=500, 
                detail="Database credentials not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables."
            )
        
        from supabase import create_client
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if user already voted on this poll
        existing_vote = supabase.table("votes")\
            .select("*")\
            .eq("poll_id", vote.poll_id)\
            .eq("wallet_address", vote.wallet_address)\
            .execute()
        
        vote_data = {
            "poll_id": vote.poll_id,
            "wallet_address": vote.wallet_address,
            "vote_option": vote.vote_option,
            "signature": vote.signature,
            "wallet_age_days": vote.wallet_age_days,
            "sol_balance": vote.sol_balance
        }
        
        if existing_vote.data and len(existing_vote.data) > 0:
            # User already voted - update their vote
            old_vote = existing_vote.data[0]['vote_option']
            print(f"Updating vote from '{old_vote}' to '{vote.vote_option}' for wallet {vote.wallet_address}")
            
            response = supabase.table("votes")\
                .update(vote_data)\
                .eq("poll_id", vote.poll_id)\
                .eq("wallet_address", vote.wallet_address)\
                .execute()
            
            print(f"Vote updated successfully: {response.data}")
            vote_action = "changed"
        else:
            # New vote - insert
            print(f"Storing new vote: {vote_data}")
            response = supabase.table("votes").insert(vote_data).execute()
            print(f"Vote stored successfully: {response.data}")
            vote_action = "recorded"
        
        # Trigger whale watch analysis after vote is recorded/updated
        whale_analysis = whale_watch.analyze_poll(vote.poll_id)
        
        return {
            "success": True,
            "vote_recorded": True,
            "vote_action": vote_action,
            "previous_vote": existing_vote.data[0]['vote_option'] if existing_vote.data else None,
            "whale_watch_analysis": whale_analysis
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting vote: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to submit vote: {str(e)}")


@app.get("/api/polls")
async def get_polls():
    """
    Get all active polls
    """
    try:
        from supabase import create_client
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY")
        )
        
        response = supabase.table("polls").select("*").execute()
        
        return {
            "success": True,
            "polls": response.data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/polls/{poll_id}")
async def get_poll(poll_id: str):
    """
    Get specific poll details with analysis
    """
    try:
        from supabase import create_client
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY")
        )
        
        # Get poll
        poll_response = supabase.table("polls").select("*").eq("poll_id", poll_id).execute()
        
        if not poll_response.data:
            raise HTTPException(status_code=404, detail="Poll not found")
        
        # Get votes
        votes_response = supabase.table("votes").select("*").eq("poll_id", poll_id).execute()
        
        # Get analyses
        analyses_response = supabase.table("agent_analyses").select("*").eq("poll_id", poll_id).execute()
        
        # Calculate vote statistics
        votes = votes_response.data
        vote_stats = {
            "total_votes": len(votes),
            "unique_voters": len(set(v['wallet_address'] for v in votes)),
            "total_voting_power": sum(v.get('sol_balance', 0) for v in votes),
            "vote_distribution": {}
        }
        
        # Count votes per option
        for vote in votes:
            option = vote['vote_option']
            vote_stats["vote_distribution"][option] = vote_stats["vote_distribution"].get(option, 0) + 1
        
        return {
            "success": True,
            "poll": poll_response.data[0],
            "votes": votes_response.data,
            "analyses": analyses_response.data,
            "vote_stats": vote_stats
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_overall_stats():
    """
    Get overall platform statistics
    """
    try:
        from supabase import create_client
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY")
        )
        
        # Get all polls
        polls_response = supabase.table("polls").select("*").execute()
        
        # Get all votes
        votes_response = supabase.table("votes").select("*").execute()
        
        votes = votes_response.data
        
        stats = {
            "total_polls": len(polls_response.data),
            "total_votes": len(votes),
            "unique_voters": len(set(v['wallet_address'] for v in votes)),
            "total_voting_power": round(sum(v.get('sol_balance', 0) for v in votes), 2),
            "average_votes_per_poll": round(len(votes) / len(polls_response.data), 1) if polls_response.data else 0
        }
        
        return {
            "success": True,
            "stats": stats
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

