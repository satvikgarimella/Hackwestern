#!/usr/bin/env python3
"""
Environment Configuration Checker for GovAI
Checks if all required environment variables are set
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_status(message, status='info'):
    """Print colored status message"""
    colors = {
        'success': GREEN,
        'error': RED,
        'warning': YELLOW,
        'info': BLUE
    }
    color = colors.get(status, RESET)
    symbols = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠',
        'info': 'ℹ'
    }
    symbol = symbols.get(status, '•')
    print(f"{color}{symbol} {message}{RESET}")

def check_env_file():
    """Check if .env file exists"""
    env_path = Path('.env')
    if not env_path.exists():
        print_status('.env file not found!', 'error')
        print_status('Creating .env file from template...', 'info')
        
        template = """# GovAI Environment Configuration

# Supabase Configuration (Required for voting)
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Google Gemini API (Required for AI agents)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - defaults shown
FRONTEND_URL=http://localhost:3000
"""
        env_path.write_text(template)
        print_status('.env file created! Please edit it with your credentials.', 'success')
        return False
    return True

def check_required_vars():
    """Check if all required environment variables are set"""
    load_dotenv()
    
    required_vars = {
        'SUPABASE_URL': 'Supabase project URL (https://xxx.supabase.co)',
        'SUPABASE_KEY': 'Supabase anon/public key',
        'GEMINI_API_KEY': 'Google Gemini API key for AI agents'
    }
    
    optional_vars = {
        'FRONTEND_URL': 'Frontend URL (default: http://localhost:3000)'
    }
    
    all_good = True
    
    print(f"\n{BLUE}=== Checking Required Environment Variables ==={RESET}\n")
    
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value or value.startswith('your_'):
            print_status(f'{var} - NOT SET', 'error')
            print(f"  Description: {description}")
            all_good = False
        else:
            # Show partial value for security
            masked = value[:8] + '...' if len(value) > 8 else '***'
            print_status(f'{var} - SET ({masked})', 'success')
    
    print(f"\n{BLUE}=== Optional Variables ==={RESET}\n")
    
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            print_status(f'{var} - {value}', 'success')
        else:
            print_status(f'{var} - Using default', 'info')
    
    return all_good

def test_supabase_connection():
    """Test Supabase connection"""
    load_dotenv()
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key or supabase_url.startswith('your_'):
        print_status('Skipping Supabase test - credentials not set', 'warning')
        return False
    
    try:
        from supabase import create_client
        
        print_status('Testing Supabase connection...', 'info')
        supabase = create_client(supabase_url, supabase_key)
        
        # Try to query polls table
        response = supabase.table('polls').select('*').limit(1).execute()
        print_status('Supabase connection successful!', 'success')
        return True
    except Exception as e:
        print_status(f'Supabase connection failed: {str(e)}', 'error')
        print_status('Make sure you have created the required tables in Supabase', 'warning')
        print_status('See SETUP.md for SQL schema', 'info')
        return False

def print_help():
    """Print helpful information"""
    print(f"\n{BLUE}=== How to Get Your Credentials ==={RESET}\n")
    
    print(f"{YELLOW}1. Supabase (Database){RESET}")
    print("   • Visit https://supabase.com")
    print("   • Create a new project")
    print("   • Go to Settings → API")
    print("   • Copy 'Project URL' and 'anon/public' key")
    print("   • Run the SQL commands from SETUP.md to create tables\n")
    
    print(f"{YELLOW}2. Google Gemini API (AI Agents){RESET}")
    print("   • Visit https://makersuite.google.com/app/apikey")
    print("   • Click 'Create API Key'")
    print("   • Copy the generated key\n")
    
    print(f"{YELLOW}3. Update .env file{RESET}")
    print("   • Open .env in a text editor")
    print("   • Replace 'your_xxx_here' with actual values")
    print("   • Save the file and run this script again\n")

def main():
    """Main function"""
    print(f"\n{GREEN}╔═══════════════════════════════════════╗{RESET}")
    print(f"{GREEN}║  GovAI Environment Configuration     ║{RESET}")
    print(f"{GREEN}║  Checker v1.0                        ║{RESET}")
    print(f"{GREEN}╚═══════════════════════════════════════╝{RESET}\n")
    
    # Check .env file exists
    if not check_env_file():
        print_help()
        sys.exit(1)
    
    # Check required variables
    vars_ok = check_required_vars()
    
    # Test connections if variables are set
    if vars_ok:
        print(f"\n{BLUE}=== Testing Connections ==={RESET}\n")
        supabase_ok = test_supabase_connection()
        
        if supabase_ok:
            print(f"\n{GREEN}✓ All checks passed! Your environment is ready.{RESET}\n")
            print("You can now start the backend with:")
            print(f"  {BLUE}cd backend && python main.py{RESET}\n")
            sys.exit(0)
        else:
            print(f"\n{YELLOW}⚠ Configuration incomplete. See errors above.{RESET}\n")
            sys.exit(1)
    else:
        print(f"\n{RED}✗ Missing required environment variables{RESET}\n")
        print_help()
        sys.exit(1)

if __name__ == '__main__':
    main()

