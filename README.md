# Decentralized Polling System
Developing a decentralized polling system using Solana and incorporating ai agents with Warp. The core idea is to build a decentralized application (dApp) where the polls are created and stored on Solana.

The Decentralized Polling System is essentially a way to run polls without someone such as a server, company, or admin controlling the results, data, or counting. Instead, you would trust a blockchain (Solana) as it provides positive outcomes like:

- Preventing Secretly changed results
- Avoids fake votes
- Anyone can verify the outcome
- The system still functions regardless of changes in parties
- User has control of identity as they keep their own ballet via wallet signatures

## Web Application
The idea is to have the "ballot box" on a public blockchain. We'll be creating a web app using React.


## Tech Stack Breakdown
- Solana:
    - Rust program (Anchor framework if you want faster dev).
    - Stores polls + final results.
- WARP:
    - Job runner + API backend:
    - HTTP endpoints to receive signed votes.
    - Cron-like jobs for “poll ended → finalize.”
    - RPC calls to Solana to verify eligibility and send transactions.
- Frontend:
    - React / Next.js (or SvelteKit) + TypeScript.
    - Wallet adapter for Solana.
    - Simple charts for results (e.g., Recharts).


## Authentication


