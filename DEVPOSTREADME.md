## Inspiration
Our inspiration came from a shared interest in building technology that combines **AI**, **software engineering**, and **finance** in a meaningful way. As we reviewed the categories and sponsor challenges in this year’s Hackathon, Solana immediately stood out — not only because of its real-world impact, but because it presented the **greatest technical challenge**. With very few recent projects and a steep learning curve, building on Solana pushed us far outside our comfort zone. That challenge itself became our motivation.

## What it does
Our platform allows users to participate in **fully decentralized, trustless polls** powered by the Solana blockchain.

Users begin by connecting their crypto wallet — we support **Phantom**, **Solflare**, and **Backpack** via the Solana Wallet Adapter. Once authenticated through their wallet signature, users are redirected back to our app where their identity is cryptographically verified. They can then browse available polls and cast a vote.

Each vote is:
- **Signed** by the user’s wallet  
- **Recorded on the Solana blockchain**  
- **Impossible to alter, delete, or manipulate**

The result is a transparent polling system where no admin or server can change the outcome.

## How we built it
Our tech stack is composed of three main components:

### **Frontend**
- React + TypeScript
- Solana Wallet Adapter integration
- Realtime UI updates with account polling

### **WARP (Backend)**
- API endpoints to handle and relay signed transactions
- Job runner for scheduled updates
- Cron-like jobs for syncing poll data to the frontend

### **Solana (On-chain)**
- Anchor framework (Rust) for rapid development
- Custom Solana program to store polls, options, and vote counts
- On-chain accounts representing poll state and results

## Challenges we ran into
Our biggest challenge was building and deploying the **Solana on-chain program**.  
Solana development involves:
- learning the Anchor framework  
- managing PDAs and account constraints  
- understanding serialization and on-chain state  
- dealing with cryptic compiler errors  

Solana also had fewer active resources and examples, which made debugging difficult. Integrating the on-chain program with our Warp backend and React frontend required us to deeply understand how transactions flow across all three layers.

## Accomplishments that we're proud of
We are incredibly proud that we successfully:
- deployed a **fully functional Solana program**,  
- integrated wallet authentication,  
- built real **on-chain voting logic**, and  
- connected all three layers of our system into a polished final product.

For all of us, Solana was new territory — accomplishing this in under 36 hours is something we consider a major achievement.

## What we learned
We learned how **centralized polling systems depend on trust** — trust in servers, databases, and admins — and how easily those systems can be manipulated.  
By contrast, building on Solana helped us understand how decentralization, cryptographic signatures, and transparent ledgers create **tamper-proof, verifiable voting systems**.

We also gained hands-on experience with:
- Rust & Anchor  
- wallet integrations  
- decentralized architecture  
- Warp job runners  
- cross-system communication between Web2 and Web3 components  

This was our first time working with Solana, and it gave us a deeper appreciation for blockchain engineering.

## What's next for Gov AI: Decentralized Polling System
We want to expand this project beyond a hackathon prototype by:
- adding **multi-option polls** and large-scale vote aggregation  
- integrating **AI agents** to auto-generate poll insights, summaries, and fraud detection  
- allowing communities or organizations to **create their own polls** through our platform  
- improving UI/UX for smoother wallet onboarding  
- deploying the system on Solana Mainnet with better performance optimizations  

Our long-term vision is to create a **trustless governance platform** that empowers communities, organizations, and DAOs to make transparent and verifiable decisions at scale.

