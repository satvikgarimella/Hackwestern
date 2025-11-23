"use client"

import { useState, useEffect } from "react"
import { Shield, Brain, DollarSign, ChevronDown, ChevronUp, Wallet, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { usePollAnalysis } from "@/hooks/use-poll-analysis"
import { submitVote, checkBackendHealth } from "@/lib/api"

export default function GovAIDashboard() {
  const { toast } = useToast()
  const { wallet, loading: walletLoading, connectWallet, disconnectWallet, signMessage } = useWallet()
  
  // Current poll (you'd fetch this from backend in production)
  const [currentPollId] = useState("test-poll-1")
  const { analysis, loading: analysisLoading, refresh: refreshAnalysis } = usePollAnalysis(currentPollId)
  
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [expandedAgents, setExpandedAgents] = useState({
    explainer: false,
    whale: false,
    economic: false,
  })
  const [submittingVote, setSubmittingVote] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)

  const WALLET_OPTIONS = [
    {
      id: "phantom",
      name: "Phantom",
      icon: "https://pbs.twimg.com/profile_images/1753089011339513856/hetctK5K_400x400.jpg",
      description: "The crypto wallet for Solana",
    },
    {
      id: "solflare",
      name: "Solflare",
      icon: "https://solflare.com/assets/icons/icon-512x512.png",
      description: "Solana wallet built for DeFi",
    },
  ]

  // Check if backend is online
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline)
  }, [])

  const toggleAgent = (agent: keyof typeof expandedAgents) => {
    setExpandedAgents((prev) => ({ ...prev, [agent]: !prev[agent] }))
  }

  const handleWalletSelect = async (walletId: string) => {
    try {
      await connectWallet(walletId)
      setWalletModalOpen(false)
      toast({
        title: "Wallet Connected!",
        description: `Successfully connected to ${walletId}`,
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (!wallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      })
      return
    }

    setSubmittingVote(true)
    try {
      // Sign message to verify ownership
      const message = `Vote on poll ${pollId}: ${optionId}`
      const signature = await signMessage(message)

      // Submit vote to backend
      const result = await submitVote({
        poll_id: pollId,
        wallet_address: wallet.address,
        vote_option: optionId,
        signature,
        wallet_age_days: wallet.ageInDays,
        sol_balance: wallet.balance,
      })

      toast({
        title: "Vote Submitted!",
        description: "Your vote has been recorded on the blockchain",
      })

      // Refresh analysis to show updated whale watch
      refreshAnalysis()
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive",
      })
    } finally {
      setSubmittingVote(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return "text-accent"
    if (score <= 6) return "text-[#ffd700]"
    return "text-[#ff4444]"
  }

  const getRiskLabel = (score: number) => {
    if (score <= 3) return "LOW RISK"
    if (score <= 6) return "MEDIUM RISK"
    return "HIGH RISK"
  }

  const getRiskBg = (score: number) => {
    if (score <= 3) return "from-accent/10 to-background/20"
    if (score <= 6) return "from-yellow-950/50 to-yellow-900/20"
    return "from-red-950/50 to-red-900/20"
  }

  // Mock proposal data (replace with real API call)
  const proposal = {
    dao: "Uniswap",
    title: "Increase Protocol Fee to 0.15% for ETH/USDC Pool",
    description:
      "This proposal seeks to increase the protocol fee from 0.05% to 0.15% on the ETH/USDC liquidity pool to generate additional revenue for the DAO treasury.",
    votes: {
      yes: { count: 4520000, percentage: 62 },
      no: { count: 2340000, percentage: 32 },
      abstain: { count: 440000, percentage: 6 },
    },
  }

  const whaleWatch = analysis?.whale_watch || { risk_score: 0, flags: [], total_votes: 0 }
  const economic = analysis?.economic || { risk_score: 0, flags: [], projections: {}, recommendation: "" }
  const consensusScore = analysis?.consensus?.combined_risk_score || 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Backend Status Indicator */}
      {!backendOnline && (
        <div className="bg-yellow-950/50 border-b border-yellow-500/30 px-4 py-2 text-center text-sm text-yellow-400">
          ⚠️ Backend API is offline. Some features may not work. Make sure backend is running on http://localhost:8000
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">GovAI</h1>
              <p className="text-xs text-accent">AI-Verified Governance Security</p>
            </div>
          </div>
          {wallet ? (
            <div className="flex items-center gap-2">
              <div className="text-right text-sm">
                <div className="font-mono text-xs text-muted-foreground">
                  {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                </div>
                <div className="text-xs text-accent">{wallet.balance.toFixed(2)} SOL</div>
              </div>
              <Button
                onClick={disconnectWallet}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setWalletModalOpen(true)}
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
              disabled={walletLoading}
            >
              {walletLoading ? (
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Proposal Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-card to-background p-8">
          <div className="mb-8">
            <Badge className="mb-3 bg-primary/20 text-primary hover:bg-primary/30">{proposal.dao}</Badge>
            <h2 className="mb-3 text-3xl font-bold text-balance text-foreground">{proposal.title}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{proposal.description}</p>

            {/* Voting Options */}
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(proposal.votes).map(([option, data]) => (
                <Button
                  key={option}
                  onClick={() => handleVote(currentPollId, option)}
                  disabled={!wallet || submittingVote}
                  className="h-auto flex-col items-start gap-2 border-2 border-primary/30 bg-background/50 p-4 text-left hover:border-primary hover:bg-card/80"
                  variant="outline"
                >
                  <div className="w-full">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg font-bold uppercase text-foreground">{option}</span>
                      <span className="text-sm text-muted-foreground">{data.count.toLocaleString()} votes</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-sm text-muted-foreground">{data.percentage}%</div>
                  </div>
                </Button>
              ))}
            </div>
            {!wallet && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Connect your wallet to vote on this proposal
              </p>
            )}
          </div>

          {/* AI Agent Analysis */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">AI Agent Analysis</h3>
              {analysisLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </div>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {/* Explainer Agent */}
              <Card className="border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5">
                <button
                  onClick={() => toggleAgent("explainer")}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Explainer Agent</span>
                  </div>
                  {expandedAgents.explainer ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                {expandedAgents.explainer && analysis?.explainer && (
                  <div className="px-4 pb-4 text-sm">
                    <p className="whitespace-pre-wrap text-foreground/90">{analysis.explainer.explanation}</p>
                  </div>
                )}
              </Card>

              {/* Whale Watch Agent */}
              <Card className={`border-[#ff4444]/30 bg-gradient-to-br ${getRiskBg(whaleWatch.risk_score)}`}>
                <button
                  onClick={() => toggleAgent("whale")}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#ff4444]" />
                    <span className="font-semibold text-foreground">Whale Watch Agent</span>
                  </div>
                  {expandedAgents.whale ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                <div className="px-4 pb-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`text-4xl font-bold ${getRiskColor(whaleWatch.risk_score)}`}>
                      {whaleWatch.risk_score}
                    </div>
                    <Badge className={getRiskColor(whaleWatch.risk_score)}>{getRiskLabel(whaleWatch.risk_score)}</Badge>
                  </div>
                  {expandedAgents.whale && whaleWatch.flags && (
                    <div className="space-y-2">
                      {whaleWatch.flags.map((flag: any, idx: number) => (
                        <div key={idx} className="rounded-lg border border-red-500/30 bg-red-950/30 p-2 text-xs">
                          <span className="font-bold text-red-400">⚠️ {flag.severity}:</span>{" "}
                          <span className="text-foreground/90">{flag.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Economic Agent */}
              <Card className={`border-accent/30 bg-gradient-to-br ${getRiskBg(economic.risk_score)}`}>
                <button
                  onClick={() => toggleAgent("economic")}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-foreground">Economic Agent</span>
                  </div>
                  {expandedAgents.economic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                <div className="px-4 pb-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`text-4xl font-bold ${getRiskColor(economic.risk_score)}`}>{economic.risk_score}</div>
                    <Badge className={getRiskColor(economic.risk_score)}>{getRiskLabel(economic.risk_score)}</Badge>
                  </div>
                  {expandedAgents.economic && economic.recommendation && (
                    <p className="text-xs text-foreground/90">{economic.recommendation}</p>
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
                    consensusScore <= 3
                      ? "border-accent bg-accent/10"
                      : consensusScore <= 6
                        ? "border-[#ffd700] bg-[#ffd700]/10"
                        : "border-[#ff4444] bg-[#ff4444]/10"
                  }`}
                >
                  <span className={`text-3xl font-bold ${getRiskColor(consensusScore)}`}>{consensusScore}</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Combined Risk Score</div>
                  <div className={`text-lg font-bold ${getRiskColor(consensusScore)}`}>
                    {getRiskLabel(consensusScore)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
            {WALLET_OPTIONS.map((walletOption) => (
              <button
                key={walletOption.id}
                onClick={() => handleWalletSelect(walletOption.id)}
                disabled={walletLoading}
                className="flex items-center gap-4 rounded-lg border border-primary/30 bg-card/50 p-4 text-left transition-all hover:border-primary hover:bg-card disabled:opacity-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50">
                  <img src={walletOption.icon || "/placeholder.svg"} alt={walletOption.name} className="h-8 w-8 object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{walletOption.name}</h4>
                  <p className="text-sm text-muted-foreground">{walletOption.description}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

