import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"

// Configuration - easily changeable
export const SOLANA_CONFIG = {
  RPC_ENDPOINT: "https://api.devnet.solana.com",
  PROGRAM_ID: "YOUR_PROGRAM_ID_HERE", // Replace when deployed
  POLL_ACCOUNT_ID: "YOUR_POLL_ACCOUNT_ID_HERE", // Replace when deployed
  POLL_INTERVAL: 10000, // 10 seconds
}

export interface PollData {
  total_votes: number
  option_1_votes: number
  option_2_votes: number
  option_3_votes: number
}

let connection: Connection | null = null

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, "confirmed")
  }
  return connection
}

// Fetch poll data from Solana account
export async function fetchPollData(): Promise<PollData | null> {
  try {
    const conn = getConnection()
    const pollAccountPubkey = new PublicKey(SOLANA_CONFIG.POLL_ACCOUNT_ID)

    const accountInfo = await conn.getAccountInfo(pollAccountPubkey)
    if (!accountInfo) {
      console.error("[v0] Poll account not found")
      return null
    }

    // This assumes: u64 total_votes, u64 option_1_votes, u64 option_2_votes, u64 option_3_votes
    // Adjust offsets if your program uses a different structure
    const data = accountInfo.data

    // Read u64 values (8 bytes each, little-endian)
    const pollData: PollData = {
      total_votes: Number(data.readBigUInt64LE(0)),
      option_1_votes: Number(data.readBigUInt64LE(8)),
      option_2_votes: Number(data.readBigUInt64LE(16)),
      option_3_votes: Number(data.readBigUInt64LE(24)),
    }

    return pollData
  } catch (error) {
    console.error("[v0] Error fetching poll data:", error)
    return null
  }
}

// Convert Solana poll data to UI format
export function convertPollDataToStats(pollData: PollData): { total: number; distribution: number[] } {
  return {
    total: pollData.total_votes,
    distribution: [pollData.option_1_votes, pollData.option_2_votes, pollData.option_3_votes],
  }
}

// Submit vote transaction to Solana
export async function submitVoteToSolana(
  voterPublicKey: PublicKey,
  optionIndex: number,
  sendTransaction: any,
): Promise<string | null> {
  try {
    const conn = getConnection()
    const programId = new PublicKey(SOLANA_CONFIG.PROGRAM_ID)
    const pollAccountPubkey = new PublicKey(SOLANA_CONFIG.POLL_ACCOUNT_ID)

    // Adjust account keys and data based on your actual program structure
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: pollAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: voterPublicKey, isSigner: true, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId,
      data: Buffer.from([optionIndex]), // Simple data: just the option index
    })

    // Create and sign transaction
    const transaction = new Transaction().add(instruction)
    const { blockhash } = await conn.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = voterPublicKey

    // Sign and send transaction
    const signature = await sendTransaction(transaction, conn)
    await conn.confirmTransaction(signature, "confirmed")

    console.log("[v0] Vote submitted successfully:", signature)
    return signature
  } catch (error) {
    console.error("[v0] Error submitting vote:", error)
    return null
  }
}
