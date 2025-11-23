import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Configure the client to use the devnet cluster
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey("GYzboJk8vMriHVHHcVB1jkcgvjjx2E3p9taf6sMYtKAQ");

// Basic test - verify program is deployed
async function main() {
  console.log("Program ID:", PROGRAM_ID.toString());
  console.log("Provider:", provider.connection.rpcEndpoint);
  
  // Check if program exists
  const programInfo = await provider.connection.getAccountInfo(PROGRAM_ID);
  if (programInfo) {
    console.log("✅ Program is deployed and accessible!");
    console.log("Program data length:", programInfo.data.length, "bytes");
  } else {
    console.log("❌ Program not found");
  }
}

main().catch(console.error);

