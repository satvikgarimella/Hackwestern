from supabase import create_client
from dotenv import load_dotenv
import os
import json
from datetime import datetime
import google.generativeai as genai

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class ExplainerAgent:
    def explain_poll(self, poll_id: str):
        """Generate plain-English explanation of a poll"""
        start = datetime.now()
        
        # Fetch poll data
        poll_response = supabase.table('polls').select('*').eq('poll_id', poll_id).execute()
        
        if not poll_response.data:
            return {'error': 'Poll not found'}
        
        poll = poll_response.data[0]
        
        prompt = f"""Explain this blockchain governance vote in simple language:

Question: {poll['question']}
Description: {poll.get('description', '')}
Options: {poll['options']}

Write 3 sections:
1. What this vote is about (2 sentences)
2. What each option means for voters
3. Why this matters

Keep it under 150 words total."""

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            explanation = response.text
        except Exception as e:
            explanation = f"Error: {str(e)}"
        
        result = {
            'poll_id': poll_id,
            'agent_type': 'explainer',
            'explanation': explanation,
            'poll_question': poll['question'],
            'options': poll['options'],
            'execution_time_ms': int((datetime.now() - start).total_seconds() * 1000)
        }
        
        # Store in database
        supabase.table('agent_analyses').insert({
            'poll_id': poll_id,
            'agent_type': 'explainer',
            'analysis_data': result,
            'risk_score': 0
        }).execute()
        
        return result

if __name__ == "__main__":
    agent = ExplainerAgent()
    result = agent.explain_poll("test-poll-1")
    print("\n" + "="*60)
    print("EXPLAINER AGENT OUTPUT")
    print("="*60)
    print(result['explanation'])
    print("="*60)
