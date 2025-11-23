from supabase import create_client
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

# Test Supabase
print("Testing Supabase connection...")
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)
result = supabase.table('polls').select("*").execute()
print(f"✅ Supabase connected! Found {len(result.data)} polls")

# Test Gemini
print("\nTesting Gemini API...")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("Say 'API working!' in 3 words")
print(f"✅ Gemini connected! Response: {response.text}")
