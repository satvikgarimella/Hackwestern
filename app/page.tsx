"use client"

import { useState, useEffect } from "react"
import { Shield, Brain, DollarSign, ChevronDown, ChevronUp, Wallet, X, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

const BACKEND_URL = "http://localhost:8000"

export default function GovAIDashboard() {
  const { toast } = useToast()
  const [showLanding, setShowLanding] = useState(true)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string>("")
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [expandedAgents, setExpandedAgents] = useState({
    explainer: false,
    whale: false,  // Collapsed by default for cleaner UI
    economic: false,  // Collapsed by default for cleaner UI
  })
  const [backendOnline, setBackendOnline] = useState(false)
  const [loadingWallet, setLoadingWallet] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  
  // Real data from backend
  const [mainProposal, setMainProposal] = useState<any>(null)
  const [polls, setPolls] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [pollAnalyses, setPollAnalyses] = useState<Record<string, any>>({}) // Store analysis for each poll
  const [voteCounts, setVoteCounts] = useState<Record<string, any>>({})
  const [platformStats, setPlatformStats] = useState<any>(null)

  const WALLET_OPTIONS = [
    {
      id: "phantom",
      name: "Phantom",
      icon: "/phantom-logo.jpeg",
      description: "The crypto wallet for Solana",
    },
    {
      id: "solflare",
      name: "Solflare",
      icon: "/solflare-logo.jpeg",
      description: "Solana wallet built for DeFi",
    },
    {
      id: "backpack",
      name: "Backpack",
      icon: "/backpack-logo.png",
      description: "Crypto wallet for everyone",
    },
  ]

  // Check backend health and load data on mount
  useEffect(() => {
    checkBackend()
    loadData()
    loadPlatformStats()
  }, [])

  const checkBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`)
      setBackendOnline(response.ok)
    } catch {
      setBackendOnline(false)
    }
  }

  const loadData = async () => {
    try {
      // Load polls from backend
      const pollsResponse = await fetch(`${BACKEND_URL}/api/polls`)
      if (pollsResponse.ok) {
        const pollsData = await pollsResponse.json()
        setPolls(pollsData.polls || [])
        
        // Use first poll as main proposal
        if (pollsData.polls && pollsData.polls.length > 0) {
          const mainPoll = pollsData.polls[0]
          setMainProposal(mainPoll)
          
          // Load analysis for main poll (set as main)
          loadAnalysis(mainPoll.poll_id, true)
          
          // Load vote counts and analysis for ALL polls
          for (const poll of pollsData.polls) {
            loadVoteCounts(poll.poll_id)
            // Load analysis for additional polls (don't set as main)
            if (poll.poll_id !== mainPoll.poll_id) {
              loadAnalysis(poll.poll_id, false)
            }
          }
        }
        
        // Load user's existing votes if wallet connected
        if (walletAddress) {
          loadUserVotes(walletAddress)
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  const loadUserVotes = async (address: string) => {
    try {
      // Load all polls and check which ones user has voted on
      const pollsResponse = await fetch(`${BACKEND_URL}/api/polls`)
      if (pollsResponse.ok) {
        const pollsData = await pollsResponse.json()
        const votes: Record<string, string> = {}
        
        for (const poll of pollsData.polls || []) {
          const pollDetailsResponse = await fetch(`${BACKEND_URL}/api/polls/${poll.poll_id}`)
          if (pollDetailsResponse.ok) {
            const pollDetails = await pollDetailsResponse.json()
            const userVote = pollDetails.votes.find((v: any) => v.wallet_address === address)
            if (userVote) {
              votes[poll.poll_id] = userVote.vote_option
            }
          }
        }
        
        setUserVotes(votes)
      }
    } catch (error) {
      console.error("Failed to load user votes:", error)
    }
  }

  const loadAnalysis = async (pollId: string, setAsMain = true) => {
    setAnalysisLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: pollId, agent_type: "all" }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Analysis data received for", pollId, ":", data.results)
        
        // Store in pollAnalyses map
        setPollAnalyses(prev => ({ ...prev, [pollId]: data.results }))
        
        // Also set as main analysis if this is the main poll
        if (setAsMain) {
          setAnalysis(data.results)
        }
      }
    } catch (error) {
      console.error("Failed to load analysis:", error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const loadVoteCounts = async (pollId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/polls/${pollId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Count votes for each option
        const counts: Record<string, number> = {}
        let total = 0
        
        data.votes.forEach((vote: any) => {
          counts[vote.vote_option] = (counts[vote.vote_option] || 0) + 1
          total++
        })
        
        setVoteCounts({ [pollId]: { counts, total } })
      }
    } catch (error) {
      console.error("Failed to load vote counts:", error)
    }
  }

  const toggleAgent = (agent: keyof typeof expandedAgents) => {
    setExpandedAgents((prev) => ({ ...prev, [agent]: !prev[agent] }))
  }

  const handleWalletSelect = async (walletId: string) => {
    setLoadingWallet(true)
    try {
      let provider: any = null
      let walletName = ""

      if (walletId === "phantom") {
        provider = (window as any).phantom?.solana
        walletName = "Phantom"
        if (!provider) {
          window.open("https://phantom.app/", "_blank")
          throw new Error("Phantom wallet not installed. Please install it from phantom.app")
        }
      } else if (walletId === "solflare") {
        provider = (window as any).solflare
        walletName = "Solflare"
        if (!provider) {
          window.open("https://solflare.com/download", "_blank")
          throw new Error("Solflare wallet not installed. Please install it from solflare.com")
        }
      } else if (walletId === "backpack") {
        provider = (window as any).backpack
        walletName = "Backpack"
        if (!provider) {
          window.open("https://www.backpack.app/downloads", "_blank")
          throw new Error("Backpack wallet not installed. Please install it from backpack.app")
        }
      }

      if (provider) {
        console.log(`Connecting to ${walletName}...`)
        
        // Connect to wallet
        const resp = await provider.connect()
        const pubKey = resp.publicKey.toString()

        console.log(`${walletName} connected:`, pubKey)
        
        setWalletAddress(pubKey)
        setSelectedWallet(walletId)
        setWalletConnected(true)
        setWalletModalOpen(false)

        // Try to fetch balance (works differently for each wallet)
        try {
          let balance = 0
          
          // Phantom and Backpack have connection.getBalance
          if (provider.connection && typeof provider.connection.getBalance === 'function') {
            const lamports = await provider.connection.getBalance(resp.publicKey)
            balance = lamports / 1000000000 // Convert lamports to SOL
          } 
          // Solflare might need a different approach
          else if (walletId === "solflare") {
            // Solflare uses different API
            const { Connection, PublicKey } = await import('@solana/web3.js')
            const connection = new Connection('https://api.devnet.solana.com')
            const lamports = await connection.getBalance(new PublicKey(pubKey))
            balance = lamports / 1000000000
          }
          
          setWalletBalance(balance)
          console.log(`${walletName} balance:`, balance, "SOL")
        } catch (e) {
          console.log(`Could not fetch ${walletName} balance:`, e)
          setWalletBalance(0) // Set to 0 if we can't fetch
        }

        toast({
          title: `${walletName} Connected! 🎉`,
          description: `Successfully connected to ${walletName}`,
        })
        
        // Load user's existing votes
        loadUserVotes(pubKey)
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setLoadingWallet(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      // Try to disconnect from the provider if it supports it
      if (selectedWallet === "phantom" && (window as any).phantom?.solana) {
        await (window as any).phantom.solana.disconnect()
      } else if (selectedWallet === "solflare" && (window as any).solflare) {
        await (window as any).solflare.disconnect()
      } else if (selectedWallet === "backpack" && (window as any).backpack) {
        await (window as any).backpack.disconnect()
      }
    } catch (e) {
      console.log("Error disconnecting wallet:", e)
    }
    
    // Clear state
    setWalletConnected(false)
    setSelectedWallet("")
    setWalletAddress("")
    setWalletBalance(0)
    
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from wallet",
    })
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the correct wallet provider based on selected wallet
      let provider: any = null
      if (selectedWallet === "phantom") {
        provider = (window as any).phantom?.solana
      } else if (selectedWallet === "solflare") {
        provider = (window as any).solflare
      } else if (selectedWallet === "backpack") {
        provider = (window as any).backpack
      }

      if (!provider) {
        throw new Error("Wallet provider not found. Please reconnect your wallet.")
      }

      // Sign message
      const message = `Vote on poll ${pollId}: ${optionId}`
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await provider.signMessage(encodedMessage, "utf8")
      
      // Convert signature to base64 without using Buffer
      const signatureArray = new Uint8Array(signedMessage.signature)
      const signature = btoa(String.fromCharCode(...signatureArray))

      console.log("Submitting vote:", { pollId, optionId, walletAddress })

      // Submit vote to backend
      const response = await fetch(`${BACKEND_URL}/api/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poll_id: pollId,
          wallet_address: walletAddress,
          vote_option: optionId,
          signature: signature,
          wallet_age_days: 30,
          sol_balance: walletBalance,
        }),
      })

      const responseData = await response.json()
      console.log("Vote response:", responseData)

      if (response.ok) {
        setUserVotes((prev) => ({ ...prev, [pollId]: optionId }))
        
        // Show different message based on whether vote was changed or new
        if (responseData.vote_action === "changed") {
          toast({
            title: "Vote Changed! ✅",
            description: `Your vote has been updated from '${responseData.previous_vote?.toUpperCase()}' to '${optionId.toUpperCase()}'`,
          })
        } else {
          toast({
            title: "Vote Recorded! 🎉",
            description: "Your vote has been submitted to the blockchain",
          })
        }

        // Reload data for this specific poll
        await loadVoteCounts(pollId)
        // Reload analysis - set as main only if it's the main proposal
        const isMainPoll = mainProposal && pollId === mainProposal.poll_id
        await loadAnalysis(pollId, isMainPoll)
      } else {
        throw new Error(responseData.detail || "Vote submission failed")
      }
    } catch (error) {
      console.error("Vote error:", error)
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive",
      })
    }
  }

  const refreshData = async () => {
    await loadData()
    await loadPlatformStats()
    toast({
      title: "Data Refreshed",
      description: "Latest votes and analysis loaded",
    })
  }

  const loadPlatformStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`)
      if (response.ok) {
        const data = await response.json()
        setPlatformStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to load platform stats:", error)
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 2) return "text-accent"  // 1-2: Minimal
    if (score <= 4) return "text-green-400"  // 3-4: Low
    if (score <= 6) return "text-[#ffd700]"  // 5-6: Moderate
    if (score <= 8) return "text-orange-400"  // 7-8: High
    return "text-[#ff4444]"  // 9-10: Critical
  }

  const getRiskLabel = (score: number) => {
    if (score <= 2) return "MINIMAL RISK"  // 1-2
    if (score <= 4) return "LOW RISK"  // 3-4
    if (score <= 6) return "MODERATE RISK"  // 5-6
    if (score <= 8) return "HIGH RISK"  // 7-8
    return "CRITICAL RISK"  // 9-10
  }

  const getRiskBg = (score: number) => {
    if (score <= 2) return "from-accent/10 to-background/20"  // Minimal
    if (score <= 4) return "from-green-950/30 to-green-900/10"  // Low
    if (score <= 6) return "from-yellow-950/50 to-yellow-900/20"  // Moderate
    if (score <= 8) return "from-orange-950/50 to-orange-900/20"  // High
    return "from-red-950/50 to-red-900/20"  // Critical
  }

  const whaleWatch = analysis?.whale_watch || { 
    risk_score: 1,  // Minimum score is 1, not 0
    flags: [], 
    total_votes: 0,
    explanation: 'No analysis available yet. Vote to trigger analysis.',
    summary: '✅ MINIMAL RISK - No votes yet'
  }
  const economic = analysis?.economic || { 
    risk_score: 1,  // Minimum score is 1, not 0
    flags: [], 
    recommendation: "",
    explanation: 'No analysis available yet. Vote to trigger analysis.',
    summary: '✅ MINIMAL RISK - No votes yet'
  }
  const consensusScore = analysis?.consensus?.combined_risk_score || 0

  // Calculate vote percentages for main proposal
  const mainVoteCounts = mainProposal && voteCounts[mainProposal.poll_id]
  const mainVoteData = mainProposal ? (() => {
    const total = mainVoteCounts?.total || 1
    // Handle both JSON array and comma-separated string formats
    let options = []
    try {
      if (typeof mainProposal.options === 'string') {
        // Try parsing as JSON first
        try {
          options = JSON.parse(mainProposal.options)
        } catch {
          // If JSON parse fails, split by comma
          options = mainProposal.options.split(',').map((s: string) => s.trim())
        }
      } else if (Array.isArray(mainProposal.options)) {
        options = mainProposal.options
      } else {
        options = ["yes", "no", "abstain"]
      }
    } catch (e) {
      console.error("Error parsing options:", e)
      options = ["yes", "no", "abstain"]
    }
    
    return options.map((opt: string) => ({
      option: opt,
      count: mainVoteCounts?.counts?.[opt] || 0,
      percentage: mainVoteCounts ? Math.round(((mainVoteCounts.counts[opt] || 0) / total) * 100) : 0,
    }))
  })() : []

  // Landing Page
  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 text-foreground overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        {/* Main content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          {/* Logo with animation */}
          <div className="mb-8 animate-fade-in-up">
            <img 
              src="/govai-logo.jpg" 
              alt="GovAI Logo" 
              className="h-64 w-64 object-contain drop-shadow-2xl animate-float"
            />
          </div>
          
          {/* Title */}
          <div className="text-center animate-fade-in-up animation-delay-200">
            <h1 className="mb-4 text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              GovAI
            </h1>
            <p className="mb-8 text-2xl text-muted-foreground font-light">
              AI-Verified Governance Security
            </p>
          </div>
          
          {/* Description */}
          <div className="max-w-2xl text-center mb-12 animate-fade-in-up animation-delay-400">
            <p className="text-lg text-foreground/80 leading-relaxed">
              Protect your DAO from manipulation with real-time AI analysis. 
              Detect whale attacks, sybil farming, and suspicious voting patterns 
              before they compromise your governance.
            </p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-12 animate-fade-in-up animation-delay-600">
            <div className="flex flex-col items-center p-6 rounded-lg bg-card/50 border border-primary/20 backdrop-blur-sm hover:border-primary/50 transition-all">
              <Shield className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Whale Watch</h3>
              <p className="text-sm text-muted-foreground text-center">
                Detect voting power concentration and whale manipulation
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-card/50 border border-primary/20 backdrop-blur-sm hover:border-primary/50 transition-all">
              <Brain className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground text-center">
                Real-time AI agents analyze every vote pattern
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-card/50 border border-primary/20 backdrop-blur-sm hover:border-primary/50 transition-all">
              <DollarSign className="h-12 w-12 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Economic Impact</h3>
              <p className="text-sm text-muted-foreground text-center">
                Assess financial sustainability of every proposal
              </p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="animate-fade-in-up animation-delay-800">
            <Button 
              onClick={() => setShowLanding(false)}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ChevronDown className="h-6 w-6 group-hover:translate-y-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
          
          {/* Footer */}
          <div className="mt-16 text-sm text-muted-foreground animate-fade-in-up animation-delay-1000">
            <p>Powered by Solana • Built for Decentralized Governance</p>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
          }
          
          .animation-delay-400 {
            animation-delay: 0.4s;
            opacity: 0;
          }
          
          .animation-delay-600 {
            animation-delay: 0.6s;
            opacity: 0;
          }
          
          .animation-delay-800 {
            animation-delay: 0.8s;
            opacity: 0;
          }
          
          .animation-delay-1000 {
            animation-delay: 1.0s;
            opacity: 0;
          }
          
          .bg-grid-pattern {
            background-image: 
              linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}</style>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Backend Status */}
      {!backendOnline && (
        <div className="bg-yellow-950/50 border-b border-yellow-500/30 px-4 py-2 text-center text-sm text-yellow-400">
          ⚠️ Backend API offline. Make sure it's running on http://localhost:8000
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => setShowLanding(true)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">GovAI</h1>
              <p className="text-xs text-accent">AI-Verified Governance Security</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Button
              onClick={refreshData}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              disabled={!backendOnline}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {walletConnected ? (
              <>
                <div className="text-right text-sm">
                  <div className="font-mono text-xs text-muted-foreground">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </div>
                  <div className="text-xs text-accent">{walletBalance.toFixed(2)} SOL</div>
                </div>
                <Button variant="outline" className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20">
                  <Wallet className="mr-2 h-4 w-4" />
                  {WALLET_OPTIONS.find((w) => w.id === selectedWallet)?.name}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setWalletModalOpen(true)}
                className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                disabled={loadingWallet}
              >
                {loadingWallet ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Platform Stats Banner */}
      {platformStats && (
        <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Polls:</span>
                <span className="font-bold text-primary">{platformStats.total_polls}</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-primary/20" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Votes:</span>
                <span className="font-bold text-accent">{platformStats.total_votes}</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-primary/20" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Unique Voters:</span>
                <span className="font-bold text-foreground">{platformStats.unique_voters}</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-primary/20" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Voting Power:</span>
                <span className="font-bold text-yellow-500">{platformStats.total_voting_power.toFixed(2)} SOL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!mainProposal ? (
          <Card className="border-primary/30 bg-gradient-to-br from-card to-background p-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading proposals...</p>
            </div>
          </Card>
        ) : (
          <Card className="border-primary/30 bg-gradient-to-br from-card to-background p-8">
            {/* Top Section - Main Proposal */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                  {mainProposal.poll_id}
                </Badge>
                {mainVoteCounts && (
                  <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
                    📊 {mainVoteCounts.total} {mainVoteCounts.total === 1 ? 'vote' : 'votes'}
                  </Badge>
                )}
              </div>
              <h2 className="mb-3 text-3xl font-bold text-balance text-foreground">
                {mainProposal.question}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {mainProposal.description || "Cast your vote on this proposal"}
              </p>

              {/* Real Voting Options with Real Counts */}
              <div className="grid gap-4 md:grid-cols-3">
                {mainVoteData.map((voteData: any) => {
                  const isUserVote = userVotes[mainProposal.poll_id] === voteData.option
                  const hasVoted = !!userVotes[mainProposal.poll_id]
                  
                  return (
                    <Button
                      key={voteData.option}
                      onClick={() => handleVote(mainProposal.poll_id, voteData.option)}
                      disabled={!walletConnected}
                      className={`h-auto flex-col items-start gap-2 border-2 p-4 text-left ${
                        isUserVote
                          ? "border-primary bg-primary/20 hover:bg-primary/30"
                          : "border-primary/30 bg-background/50 hover:border-primary hover:bg-card/80"
                      }`}
                      variant="outline"
                    >
                    <div className="w-full">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-lg font-bold uppercase text-foreground">
                          {voteData.option}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {voteData.count} {voteData.count === 1 ? 'vote' : 'votes'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {voteData.percentage}%
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                          style={{ width: `${voteData.percentage}%` }}
                        />
                      </div>
                      {isUserVote ? (
                        <Badge className="mt-2 bg-accent text-white">✓ Your Vote</Badge>
                      ) : hasVoted && walletConnected ? (
                        <span className="mt-2 text-xs text-muted-foreground">Click to change vote</span>
                      ) : null}
                    </div>
                    </Button>
                  )
                })}
              </div>
              {!walletConnected && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Connect your wallet to vote
                </p>
              )}

              {/* Voting Statistics Panel */}
              {mainVoteCounts && mainVoteCounts.total > 0 && (
                <div className="mt-6 grid gap-3 md:grid-cols-4 rounded-lg border border-primary/20 bg-card/50 p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mainVoteCounts.total}</div>
                    <div className="text-xs text-muted-foreground">Total Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {mainVoteData[0]?.count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">{mainVoteData[0]?.option || 'FOR'} Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {mainVoteData[1]?.count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">{mainVoteData[1]?.option || 'AGAINST'} Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {mainVoteData[2]?.count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">{mainVoteData[2]?.option || 'ABSTAIN'} Votes</div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Agent Analysis */}
            <div className="mb-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">AI Agent Analysis</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Click on each agent to view detailed risk assessment</p>
                </div>
                {analysisLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Explainer Agent */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background hover:from-primary/20 transition-all">
                  <button
                    onClick={() => toggleAgent("explainer")}
                    className="flex w-full items-center justify-between p-5 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/20 p-2">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Explainer Agent</span>
                        <p className="text-xs text-muted-foreground">Breaks down the proposal</p>
                      </div>
                    </div>
                    {expandedAgents.explainer ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  {expandedAgents.explainer && analysis?.explainer && (
                    <div className="px-5 pb-5 pt-2">
                      <div className="rounded-lg border border-primary/20 bg-background/60 p-5 space-y-4">
                        {analysis.explainer.explanation ? (
                          <>
                            {analysis.explainer.explanation.split(/###?\s*\d+\./).filter(Boolean).map((section: string, idx: number) => {
                              const lines = section.trim().split('\n').filter(Boolean)
                              const title = lines[0]?.replace(/\*\*/g, '').trim()
                              const content = lines.slice(1).join('\n').trim()
                              
                              return (
                                <div key={idx} className="space-y-2">
                                  {title && (
                                    <h4 className="font-semibold text-primary text-sm flex items-center gap-2">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-xs">
                                        {idx + 1}
                                      </span>
                                      {title}
                                    </h4>
                                  )}
                                  {content && (
                                    <div className="pl-8 text-sm text-foreground/80 space-y-2">
                                      {content.split('\n').map((line: string, lineIdx: number) => {
                                        const cleanLine = line.trim().replace(/^\*+\s*/, '')
                                        if (!cleanLine) return null
                                        
                                        // Check if it's a bullet point
                                        const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-')
                                        
                                        return (
                                          <p key={lineIdx} className={isBullet ? "flex items-start gap-2" : ""}>
                                            {isBullet && <span className="text-primary mt-1">•</span>}
                                            <span className={isBullet ? "flex-1" : ""}>{cleanLine}</span>
                                          </p>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </>
                        ) : (
                          <p className="text-sm text-foreground/80">Analysis not available</p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Whale Watch Agent */}
                <Card className={`border-[#ff4444]/30 bg-gradient-to-br ${getRiskBg(whaleWatch.risk_score)} hover:border-[#ff4444]/50 transition-all`}>
                  <button
                    onClick={() => toggleAgent("whale")}
                    className="flex w-full items-center justify-between p-5 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[#ff4444]/20 p-2">
                        <Shield className="h-5 w-5 text-[#ff4444]" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Whale Watch Agent</span>
                        <p className="text-xs text-muted-foreground">Detects manipulation</p>
                      </div>
                    </div>
                    {expandedAgents.whale ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="px-5 pb-5">
                    <div className="mb-4 flex items-center gap-4 rounded-lg bg-background/30 p-4">
                      <div className={`text-5xl font-bold ${getRiskColor(whaleWatch.risk_score)}`}>
                        {whaleWatch.risk_score}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${getRiskColor(whaleWatch.risk_score)} text-xs`}>
                          {getRiskLabel(whaleWatch.risk_score)}
                        </Badge>
                        {whaleWatch.summary && (
                          <span className="text-xs text-foreground/60 leading-tight">{whaleWatch.summary}</span>
                        )}
                      </div>
                    </div>
                    {expandedAgents.whale && (
                      <div className="space-y-3">
                        {/* Detailed Explanation */}
                        {whaleWatch.explanation ? (
                          <div className="rounded-lg border border-primary/20 bg-background/60 p-5 text-sm leading-relaxed text-foreground/90">
                            <div className="prose prose-sm prose-invert max-w-none">
                              {whaleWatch.explanation.split('\n\n').map((paragraph: string, idx: number) => {
                                // Handle bold text
                                const formattedParagraph = paragraph
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                
                                return (
                                  <p key={idx} className="mb-3 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-3 text-xs text-yellow-200">
                            ⚠️ No detailed analysis available. Vote to trigger analysis.
                          </div>
                        )}
                        
                        {/* Flags */}
                        {whaleWatch.flags && whaleWatch.flags.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-foreground">Detection Alerts:</div>
                            {whaleWatch.flags.map((flag: any, idx: number) => (
                              <div key={idx} className={`rounded-lg border p-2 text-xs ${
                                flag.severity === 'CRITICAL' ? 'border-red-500/50 bg-red-950/50' :
                                flag.severity === 'HIGH' ? 'border-orange-500/50 bg-orange-950/50' :
                                flag.severity === 'MEDIUM' ? 'border-yellow-500/50 bg-yellow-950/50' :
                                'border-blue-500/50 bg-blue-950/50'
                              }`}>
                                <span className="font-bold">{flag.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Economic Agent */}
                <Card className={`border-accent/30 bg-gradient-to-br ${getRiskBg(economic.risk_score)} hover:border-accent/50 transition-all`}>
                  <button
                    onClick={() => toggleAgent("economic")}
                    className="flex w-full items-center justify-between p-5 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-accent/20 p-2">
                        <DollarSign className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Economic Agent</span>
                        <p className="text-xs text-muted-foreground">Assesses financial impact</p>
                      </div>
                    </div>
                    {expandedAgents.economic ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="px-5 pb-5">
                    <div className="mb-4 flex items-center gap-4 rounded-lg bg-background/30 p-4">
                      <div className={`text-5xl font-bold ${getRiskColor(economic.risk_score)}`}>
                        {economic.risk_score}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${getRiskColor(economic.risk_score)} text-xs`}>
                          {getRiskLabel(economic.risk_score)}
                        </Badge>
                        {economic.summary && (
                          <span className="text-xs text-foreground/60 leading-tight">{economic.summary}</span>
                        )}
                      </div>
                    </div>
                    {expandedAgents.economic && (
                      <div className="space-y-3">
                        {/* Detailed Explanation */}
                        {economic.explanation ? (
                          <div className="rounded-lg border border-primary/20 bg-background/60 p-5 text-sm leading-relaxed text-foreground/90">
                            <div className="prose prose-sm prose-invert max-w-none">
                              {economic.explanation.split('\n\n').map((paragraph: string, idx: number) => {
                                // Handle bold text and formatting
                                const formattedParagraph = paragraph
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                
                                return (
                                  <p key={idx} className="mb-3 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-3 text-xs text-yellow-200">
                            ⚠️ No detailed analysis available. Vote to trigger analysis.
                          </div>
                        )}
                        
                        {/* Flags */}
                        {economic.flags && economic.flags.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-foreground">Economic Alerts:</div>
                            {economic.flags.map((flag: any, idx: number) => (
                              <div key={idx} className={`rounded-lg border p-2 text-xs ${
                                flag.severity === 'CRITICAL' ? 'border-red-500/50 bg-red-950/50' :
                                flag.severity === 'HIGH' ? 'border-orange-500/50 bg-orange-950/50' :
                                flag.severity === 'MEDIUM' ? 'border-yellow-500/50 bg-yellow-950/50' :
                                'border-blue-500/50 bg-blue-950/50'
                              }`}>
                                <span className="font-bold">{flag.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Consensus Panel */}
            <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-r from-background to-card p-6">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                      consensusScore <= 2
                        ? "border-accent bg-accent/10"
                        : consensusScore <= 4
                          ? "border-green-400 bg-green-400/10"
                          : consensusScore <= 6
                            ? "border-[#ffd700] bg-[#ffd700]/10"
                            : consensusScore <= 8
                              ? "border-orange-400 bg-orange-400/10"
                              : "border-[#ff4444] bg-[#ff4444]/10"
                    }`}
                  >
                    <span className={`text-3xl font-bold ${getRiskColor(consensusScore)}`}>
                      {consensusScore}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Combined Risk Score (1-10)</div>
                    <div className={`text-lg font-bold ${getRiskColor(consensusScore)}`}>
                      {getRiskLabel(consensusScore)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Additional Polls */}
        {polls.length > 1 && (
          <div className="mt-8 space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Additional Polls</h2>
            {polls.slice(1).map((poll) => {
              const pollVotes = voteCounts[poll.poll_id]
              const pollAnalysis = pollAnalyses[poll.poll_id]
              
              // Handle both JSON array and comma-separated string formats
              let options = []
              try {
                if (typeof poll.options === 'string') {
                  try {
                    options = JSON.parse(poll.options)
                  } catch {
                    options = poll.options.split(',').map((s: string) => s.trim())
                  }
                } else if (Array.isArray(poll.options)) {
                  options = poll.options
                }
              } catch (e) {
                console.error("Error parsing options:", e)
                options = []
              }
              
              // Calculate vote data for this poll (show buttons even with 0 votes)
              const pollVoteData = options.length > 0 ? (() => {
                const total = pollVotes?.total || 1
                return options.map((opt: string) => ({
                  option: opt,
                  count: pollVotes?.counts?.[opt] || 0,
                  percentage: pollVotes ? Math.round(((pollVotes.counts[opt] || 0) / total) * 100) : 0,
                }))
              })() : []
              
              // Get analysis for this poll
              const pollWhaleWatch = pollAnalysis?.whale_watch || { 
                risk_score: 1, 
                flags: [], 
                explanation: 'No analysis available yet. Vote to trigger analysis.',
                summary: '✅ MINIMAL RISK - No votes yet'
              }
              const pollEconomic = pollAnalysis?.economic || { 
                risk_score: 1, 
                flags: [], 
                explanation: 'No analysis available yet. Vote to trigger analysis.',
                summary: '✅ MINIMAL RISK - No votes yet'
              }
              const pollConsensusScore = pollAnalysis?.consensus?.combined_risk_score || 1
              
              return (
                <Card key={poll.poll_id} className="border-primary/30 bg-gradient-to-br from-card to-background p-8">
                  {/* Poll Header */}
                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                        {poll.poll_id}
                      </Badge>
                      {pollVotes && (
                        <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
                          📊 {pollVotes.total} {pollVotes.total === 1 ? 'vote' : 'votes'}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-balance text-foreground">{poll.question}</h3>
                    {poll.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{poll.description}</p>
                    )}
                  </div>
                  
                  {/* Voting Options */}
                  <div className="mb-6 grid gap-3 md:grid-cols-3">
                    {options.map((option: string) => {
                      const voteCount = pollVotes?.counts[option] || 0
                      const percentage = pollVotes ? Math.round((voteCount / (pollVotes.total || 1)) * 100) : 0
                      const isUserVote = userVotes[poll.poll_id] === option
                      const hasVoted = !!userVotes[poll.poll_id]
                      
                      return (
                        <Button
                          key={option}
                          onClick={() => handleVote(poll.poll_id, option)}
                          disabled={!walletConnected}
                          className={`h-auto flex-col items-start gap-2 border-2 p-4 text-left ${
                            isUserVote
                              ? "border-primary bg-primary/20 hover:bg-primary/30"
                              : "border-primary/30 bg-background/50 hover:border-primary hover:bg-card/80"
                          }`}
                          variant="outline"
                        >
                          <div className="w-full">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-base font-bold uppercase text-foreground">{option}</span>
                              <div className="text-right">
                                <div className="text-xs font-semibold text-foreground">{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</div>
                                <div className="text-xs text-muted-foreground">{percentage}%</div>
                              </div>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${percentage}%` }} />
                            </div>
                            {isUserVote ? (
                              <Badge className="mt-2 bg-accent text-white">✓ Your Vote</Badge>
                            ) : hasVoted && walletConnected ? (
                              <span className="mt-2 text-xs text-muted-foreground">Click to change vote</span>
                            ) : null}
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                  
                  {!walletConnected && (
                    <p className="mb-6 text-center text-sm text-muted-foreground">Connect your wallet to vote</p>
                  )}
                  
                  {/* Vote Statistics Panel */}
                  {pollVotes && pollVotes.total > 0 && (
                    <div className="mb-6 grid gap-3 md:grid-cols-4 rounded-lg border border-primary/20 bg-card/50 p-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">{pollVotes.total}</div>
                        <div className="text-xs text-muted-foreground">Total Votes</div>
                      </div>
                      {pollVoteData.slice(0, 3).map((voteData: any) => (
                        <div key={voteData.option} className="text-center">
                          <div className="text-xl font-bold text-accent">{voteData.count}</div>
                          <div className="text-xs text-muted-foreground uppercase">{voteData.option} Votes</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* AI Agent Analysis for this poll */}
                  <div className="mb-6">
                    <h4 className="mb-4 text-lg font-bold text-foreground">AI Agent Analysis</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Whale Watch Agent */}
                      <Card className={`border-[#ff4444]/30 bg-gradient-to-br ${getRiskBg(pollWhaleWatch.risk_score)}`}>
                        <div className="p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-[#ff4444]" />
                            <span className="font-semibold text-sm text-foreground">Whale Watch</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`text-3xl font-bold ${getRiskColor(pollWhaleWatch.risk_score)}`}>
                              {pollWhaleWatch.risk_score}
                            </div>
                            <div className="flex flex-col">
                              <Badge className={`text-xs ${getRiskColor(pollWhaleWatch.risk_score)}`}>
                                {getRiskLabel(pollWhaleWatch.risk_score)}
                              </Badge>
                              {pollWhaleWatch.summary && (
                                <span className="mt-1 text-xs text-foreground/70">{pollWhaleWatch.summary}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      {/* Economic Agent */}
                      <Card className={`border-accent/30 bg-gradient-to-br ${getRiskBg(pollEconomic.risk_score)}`}>
                        <div className="p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-accent" />
                            <span className="font-semibold text-sm text-foreground">Economic</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`text-3xl font-bold ${getRiskColor(pollEconomic.risk_score)}`}>
                              {pollEconomic.risk_score}
                            </div>
                            <div className="flex flex-col">
                              <Badge className={`text-xs ${getRiskColor(pollEconomic.risk_score)}`}>
                                {getRiskLabel(pollEconomic.risk_score)}
                              </Badge>
                              {pollEconomic.summary && (
                                <span className="mt-1 text-xs text-foreground/70">{pollEconomic.summary}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Consensus Panel for this poll */}
                  <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-r from-background to-card p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ${
                        pollConsensusScore <= 2 ? "border-accent bg-accent/10" :
                        pollConsensusScore <= 4 ? "border-green-400 bg-green-400/10" :
                        pollConsensusScore <= 6 ? "border-[#ffd700] bg-[#ffd700]/10" :
                        pollConsensusScore <= 8 ? "border-orange-400 bg-orange-400/10" :
                        "border-[#ff4444] bg-[#ff4444]/10"
                      }`}>
                        <span className={`text-2xl font-bold ${getRiskColor(pollConsensusScore)}`}>{pollConsensusScore}</span>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Combined Risk Score (1-10)</div>
                        <div className={`text-base font-bold ${getRiskColor(pollConsensusScore)}`}>{getRiskLabel(pollConsensusScore)}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Wallet Selection Dialog */}
      <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
        <DialogContent className="border-primary/30 bg-gradient-to-br from-background to-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Connect a wallet on Solana</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select your preferred Solana wallet to continue
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {WALLET_OPTIONS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={loadingWallet}
                className="flex items-center gap-4 rounded-lg border border-primary/30 bg-card/50 p-4 text-left transition-all hover:border-primary hover:bg-card disabled:opacity-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50">
                  <img src={wallet.icon || "/placeholder.svg"} alt={wallet.name} className="h-8 w-8 object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{wallet.name}</h4>
                  <p className="text-sm text-muted-foreground">{wallet.description}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground">
            Don't have a wallet? Click any option above to install.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
