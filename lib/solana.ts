/**
 * Solana blockchain integration utilities
 */
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Get RPC endpoint from environment
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

/**
 * Get wallet balance in SOL
 */
export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const publicKey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(publicKey)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return 0
  }
}

/**
 * Get wallet age in days (approximate from first transaction)
 */
export async function getWalletAge(walletAddress: string): Promise<number> {
  try {
    const publicKey = new PublicKey(walletAddress)
    
    // Get transaction history
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 })
    
    if (signatures.length === 0) {
      return 0 // Brand new wallet with no transactions
    }
    
    // Get the oldest transaction
    const oldestSignature = signatures[signatures.length - 1]
    const oldestTimestamp = oldestSignature.blockTime
    
    if (!oldestTimestamp) {
      return 0
    }
    
    // Calculate age in days
    const now = Math.floor(Date.now() / 1000)
    const ageInSeconds = now - oldestTimestamp
    const ageInDays = Math.floor(ageInSeconds / (60 * 60 * 24))
    
    return ageInDays
  } catch (error) {
    console.error('Error fetching wallet age:', error)
    return 0
  }
}

/**
 * Verify wallet signature
 */
export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    // In production, implement proper signature verification
    // For now, return true if signature exists
    return signature.length > 0
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

/**
 * Get network info
 */
export function getNetworkInfo() {
  return {
    network: SOLANA_NETWORK,
    rpcUrl: SOLANA_RPC_URL,
  }
}

