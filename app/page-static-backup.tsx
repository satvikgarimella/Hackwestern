"use client"

import { useState } from "react"
import { Shield, Brain, DollarSign, ChevronDown, ChevronUp, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function GovAIDashboard() {
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
    {
      id: "ledger",
      name: "Ledger",
      icon: "https://cdn.worldvectorlogo.com/logos/ledger-1.svg",
      description: "Hardware wallet for security",
    },
    {
      id: "trezor",
      name: "Trezor",
      icon: "https://trezor.io/images/suite/check-button-icon.png",
      description: "Hardware wallet protection",
    },
    {
      id: "backpack",
      name: "Backpack",
      icon: "https://backpack.app/_next/image?url=%2Flogo.png&w=256&q=75",
      description: "Crypto wallet for everyone",
    },
  ]

  const pollingQuestions = [
    {
      id: 1,
      question: "Should staking rewards be increased from 6% to 8%?",
      options: [
        { id: "yes", label: "YES – Increase rewards to 8%", votes: 0 },
        { id: "no", label: "NO – Keep rewards at 6%", votes: 0 },
      ],
    },
    {
      id: 2,
      question: "Should the protocol allocate 1,000 tokens from the treasury to fund new developer grants?",
      options: [
        { id: "yes", label: "YES – Allocate 1,000 tokens to grants", votes: 0 },
        { id: "no", label: "NO – Keep all tokens in the treasury", votes: 0 },
        { id: "reduce", label: "REDUCE – Allocate 500 tokens instead", votes: 0 },
      ],
    },
    {
      id: 3,
      question: "Should we upgrade the smart contract to version 2.0 in the next epoch?",
      options: [
        { id: "yes", label: "YES – Approve the v2.0 upgrade", votes: 0 },
        { id: "no", label: "NO – Stay on the current version", votes: 0 },
        { id: "delay", label: "DELAY – Revisit this in one more epoch", votes: 0 },
      ],
    },
  ]

  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string>("")
  const [userVotes, setUserVotes] = useState<Record<number, string>>({})
  const [expandedAgents, setExpandedAgents] = useState({
    explainer: false,
    whale: false,
    economic: false,
  })

  const toggleAgent = (agent: keyof typeof expandedAgents) => {
    setExpandedAgents((prev) => ({ ...prev, [agent]: !prev[agent] }))
  }

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId)
    setWalletConnected(true)
    setWalletModalOpen(false)
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setSelectedWallet("")
  }

  const handlePollVote = (questionId: number, optionId: string) => {
    setUserVotes((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const proposal = {
    dao: "Uniswap",
    title: "Increase Protocol Fee to 0.15% for ETH/USDC Pool",
    description:
      "This proposal seeks to increase the protocol fee from 0.05% to 0.15% on the ETH/USDC liquidity pool to generate additional revenue for the DAO treasury while maintaining competitive swap rates.",
    votes: {
      yes: { count: 4520000, percentage: 62 },
      no: { count: 2340000, percentage: 32 },
      abstain: { count: 440000, percentage: 6 },
    },
  }

  const whaleWatch = {
    riskScore: 8,
    flags: [
      { severity: "CRITICAL", message: "57% votes from wallets <7 days old" },
      { severity: "HIGH", message: "Whale concentration detected: Top 5 wallets hold 42% of votes" },
      { severity: "MEDIUM", message: "Unusual voting pattern detected" },
    ],
    stats: {
      totalVotes: 7300000,
      newWalletPercentage: 57,
    },
  }

  const economic = {
    riskScore: 4,
    metrics: [
      { label: "Treasury Runway", before: "166 months", after: "125 months" },
      { label: "Monthly Cost", change: "+2000 tokens" },
      { label: "User APY Impact", change: "+2.0%" },
    ],
    recommendation: "MEDIUM RISK - Moderate impact on treasury sustainability",
  }

  const consensusScore = Math.round((whaleWatch.riskScore + economic.riskScore) / 2)

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

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          {walletConnected ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20">
                <Wallet className="mr-2 h-4 w-4" />
                {WALLET_OPTIONS.find((w) => w.id === selectedWallet)?.name || "Connected"}
              </Button>
              <Button
                onClick={handleDisconnect}
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
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Proposal Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-card to-background p-8">
          {/* Top Section */}
          <div className="mb-8">
            <Badge className="mb-3 bg-primary/20 text-primary hover:bg-primary/30">{proposal.dao}</Badge>
            <h2 className="mb-3 text-3xl font-bold text-balance text-foreground">{proposal.title}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{proposal.description}</p>

            {/* Voting Options */}
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(proposal.votes).map(([option, data]) => (
                <Button
                  key={option}
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
          </div>

          {/* AI Agent Analysis */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-bold text-foreground">AI Agent Analysis</h3>
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
                {!expandedAgents.explainer && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">What this means (click to expand)</div>
                )}
                {expandedAgents.explainer && (
                  <div className="space-y-4 px-4 pb-4 text-sm">
                    <div>
                      <h4 className="mb-1 font-semibold text-primary">What this is about</h4>
                      <p className="text-foreground/90">
                        This proposal wants to increase the fee that Uniswap charges on trades in the ETH/USDC pool from
                        0.05% to 0.15%. This means traders will pay slightly more per swap, but the DAO will earn more
                        revenue.
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-primary">What each option means</h4>
                      <ul className="list-inside list-disc space-y-1 text-foreground/90">
                        <li>YES - Increase the fee to 0.15% to boost treasury revenue</li>
                        <li>NO - Keep the current 0.05% fee to stay competitive</li>
                        <li>ABSTAIN - No preference on this decision</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-primary">Why it matters</h4>
                      <p className="text-foreground/90">
                        Higher fees mean more sustainable funding for protocol development, but could push traders to
                        competitor DEXs with lower fees.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Whale Watch Agent */}
              <Card className={`border-[#ff4444]/30 bg-gradient-to-br ${getRiskBg(whaleWatch.riskScore)}`}>
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
                    <div className={`text-4xl font-bold ${getRiskColor(whaleWatch.riskScore)}`}>
                      {whaleWatch.riskScore}
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        whaleWatch.riskScore <= 3
                          ? "bg-accent/20 text-accent"
                          : whaleWatch.riskScore <= 6
                            ? "bg-[#ffd700]/20 text-[#ffd700]"
                            : "bg-[#ff4444]/20 text-[#ff4444]"
                      }`}
                    >
                      {getRiskLabel(whaleWatch.riskScore)}
                    </div>
                  </div>
                  {expandedAgents.whale && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-foreground">Security Flags</h4>
                        <div className="space-y-2">
                          {whaleWatch.flags.map((flag, idx) => (
                            <div key={idx} className="rounded-lg border border-red-500/30 bg-red-950/30 p-2 text-xs">
                              <span className="font-bold text-red-400">⚠️ {flag.severity}:</span>{" "}
                              <span className="text-foreground/90">{flag.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-background/50 p-2">
                          <div className="text-muted-foreground">Total Votes</div>
                          <div className="font-bold text-foreground">
                            {whaleWatch.stats.totalVotes.toLocaleString()}
                          </div>
                        </div>
                        <div className="rounded-lg bg-background/50 p-2">
                          <div className="text-muted-foreground">New Wallets</div>
                          <div className="font-bold text-foreground">{whaleWatch.stats.newWalletPercentage}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Economic Agent */}
              <Card className={`border-accent/30 bg-gradient-to-br ${getRiskBg(economic.riskScore)}`}>
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
                    <div className={`text-4xl font-bold ${getRiskColor(economic.riskScore)}`}>{economic.riskScore}</div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        economic.riskScore <= 3
                          ? "bg-accent/20 text-accent"
                          : economic.riskScore <= 6
                            ? "bg-[#ffd700]/20 text-[#ffd700]"
                            : "bg-[#ff4444]/20 text-[#ff4444]"
                      }`}
                    >
                      {getRiskLabel(economic.riskScore)}
                    </div>
                  </div>
                  {expandedAgents.economic && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {economic.metrics.map((metric, idx) => (
                          <div key={idx} className="rounded-lg border border-accent/30 bg-accent/10 p-2">
                            <div className="text-xs text-muted-foreground">{metric.label}</div>
                            <div className="text-sm font-bold text-foreground">
                              {"before" in metric && metric.before ? (
                                <>
                                  {metric.before} <span className="text-yellow-400">→</span>{" "}
                                  {"after" in metric && metric.after}
                                </>
                              ) : (
                                metric.change
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-foreground/90">{economic.recommendation}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Consensus Panel */}
          <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-r from-background to-card p-6">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              {/* Combined Risk Score */}
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

              {/* Agent Debate Transcript */}
              <div className="flex-1">
                <h4 className="mb-3 text-sm font-semibold text-primary">Agent Consensus Discussion</h4>
                <div className="space-y-2">
                  <div className="rounded-lg rounded-tl-none bg-primary/20 p-3 text-sm">
                    <span className="font-semibold text-primary">Explainer:</span>
                    <span className="text-foreground/90">
                      {" "}
                      This proposal has clear trade-offs between revenue and competitiveness.
                    </span>
                  </div>
                  <div className="rounded-lg rounded-tl-none bg-red-950/50 p-3 text-sm">
                    <span className="font-semibold text-red-400">Whale Watch:</span>
                    <span className="text-foreground/90">
                      {" "}
                      HIGH RISK - Significant vote manipulation detected. 57% from new wallets is extremely suspicious.
                    </span>
                  </div>
                  <div className="rounded-lg rounded-tl-none bg-accent/20 p-3 text-sm">
                    <span className="font-semibold text-accent">Economic:</span>
                    <span className="text-foreground/90">
                      {" "}
                      MEDIUM RISK - Economic impact is manageable but the voting integrity issues raise concerns.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Polling Questions Section */}
        <div className="mt-8">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Polling Questions</h2>
          <div className="grid gap-6">
            {pollingQuestions.map((poll) => (
              <Card key={poll.id} className="border-primary/30 bg-gradient-to-br from-card to-background p-6">
                <h3 className="mb-4 text-lg font-semibold text-balance text-foreground">{poll.question}</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {poll.options.map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handlePollVote(poll.id, option.id)}
                      className={`h-auto flex-col items-start gap-2 border-2 p-4 text-left ${
                        userVotes[poll.id] === option.id
                          ? "border-primary bg-primary/20 hover:bg-primary/30"
                          : "border-primary/30 bg-background/50 hover:border-primary hover:bg-card/80"
                      }`}
                      variant="outline"
                    >
                      <span className="text-sm font-bold text-foreground">{option.label}</span>
                      {userVotes[poll.id] === option.id && <Badge className="bg-accent text-white">Your Vote</Badge>}
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
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
                className="flex items-center gap-4 rounded-lg border border-primary/30 bg-card/50 p-4 text-left transition-all hover:border-primary hover:bg-card"
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
