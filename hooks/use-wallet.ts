/**
 * Custom hook for Solana wallet integration
 */
import { useState, useEffect } from 'react'
import { getWalletBalance, getWalletAge } from '@/lib/solana'

export interface WalletInfo {
  address: string
  balance: number
  ageInDays: number
  connected: boolean
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const connectWallet = async (walletId: string) => {
    setLoading(true)
    try {
      // Check if wallet is available
      const solana = (window as any).solana

      if (!solana) {
        throw new Error('Wallet not found. Please install a Solana wallet.')
      }

      // Connect to wallet
      const response = await solana.connect()
      const address = response.publicKey.toString()

      // Fetch wallet info
      const balance = await getWalletBalance(address)
      const ageInDays = await getWalletAge(address)

      const walletInfo: WalletInfo = {
        address,
        balance,
        ageInDays,
        connected: true,
      }

      setWallet(walletInfo)
      localStorage.setItem('wallet', JSON.stringify({ address, walletId }))

      return walletInfo
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    localStorage.removeItem('wallet')
  }

  const signMessage = async (message: string): Promise<string> => {
    try {
      const solana = (window as any).solana

      if (!solana || !wallet) {
        throw new Error('Wallet not connected')
      }

      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await solana.signMessage(encodedMessage, 'utf8')

      return Buffer.from(signedMessage.signature).toString('base64')
    } catch (error) {
      console.error('Error signing message:', error)
      throw error
    }
  }

  // Auto-reconnect on page load
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet')
    if (savedWallet) {
      try {
        const { address, walletId } = JSON.parse(savedWallet)
        // Attempt to reconnect
        connectWallet(walletId).catch(() => {
          // If reconnection fails, clear saved wallet
          localStorage.removeItem('wallet')
        })
      } catch (error) {
        console.error('Error auto-reconnecting wallet:', error)
      }
    }
  }, [])

  return {
    wallet,
    loading,
    connectWallet,
    disconnectWallet,
    signMessage,
  }
}

