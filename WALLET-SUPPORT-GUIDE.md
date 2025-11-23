# 🦊 Multi-Wallet Support Guide

## ✅ Supported Wallets

GovAI supports **three major Solana wallets**:

1. **Phantom** 👻
2. **Solflare** ☀️
3. **Backpack** 🎒

---

## 🎯 Wallet Comparison

| Feature | Phantom | Solflare | Backpack |
|---------|---------|----------|----------|
| **Platform** | Chrome, Firefox, Edge, Mobile | Chrome, Firefox, Mobile | Chrome, Mobile |
| **Best For** | Beginners | DeFi power users | Multi-chain users |
| **Built-in Swap** | ✅ Yes | ✅ Yes | ✅ Yes |
| **NFT Support** | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Security** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 📥 How to Install

### **1. Phantom Wallet** 👻
**Most Popular - Recommended for Beginners**

1. Visit [https://phantom.app/](https://phantom.app/)
2. Click **"Download"**
3. Choose your browser (Chrome, Firefox, Edge, etc.)
4. Install the extension
5. Create a new wallet or import existing one
6. **Switch to Devnet** (for testing):
   - Open Phantom
   - Click Settings ⚙️
   - Developer Settings
   - Change Network → Devnet

### **2. Solflare Wallet** ☀️
**Built for DeFi - Advanced Features**

1. Visit [https://solflare.com/](https://solflare.com/)
2. Click **"Download"**
3. Choose your browser
4. Install the extension
5. Create wallet or connect hardware wallet
6. **Switch to Devnet**:
   - Open Solflare
   - Click network dropdown (top right)
   - Select "Devnet"

### **3. Backpack Wallet** 🎒
**Multi-chain - Modern UI**

1. Visit [https://www.backpack.app/](https://www.backpack.app/)
2. Click **"Download"**
3. Install browser extension
4. Create new wallet
5. **Switch to Devnet**:
   - Open Backpack
   - Click Settings
   - Network → Devnet

---

## 🔌 How to Connect

### **Step 1: Open GovAI Dashboard**
Go to [http://localhost:3000](http://localhost:3000)

### **Step 2: Click "Connect Wallet"**
Top right corner of the dashboard

### **Step 3: Choose Your Wallet**
You'll see three options:
- 👻 **Phantom** - The crypto wallet for Solana
- ☀️ **Solflare** - Solana wallet built for DeFi
- 🎒 **Backpack** - Crypto wallet for everyone

### **Step 4: Approve Connection**
Your wallet will pop up asking to connect. Click **"Connect"** or **"Approve"**

### **Step 5: You're Connected!**
You should see:
- ✅ Your wallet address in the header (e.g., `DYw8...jQNH`)
- ✅ Your SOL balance
- ✅ Wallet name displayed

---

## 🗳️ Voting with Each Wallet

### **All Wallets Work the Same:**

1. **Connect your wallet** (any of the three)
2. **Click on a vote option** (FOR, AGAINST, ABSTAIN)
3. **Wallet popup appears** - asking you to sign
4. **Click "Approve" or "Sign"** in your wallet
5. **Vote recorded!** 🎉

### **Signing Messages:**

Each wallet handles message signing:
- **Phantom**: "Sign Message" button
- **Solflare**: "Approve" button  
- **Backpack**: "Sign" button

---

## 🔄 Switching Wallets

Want to try a different wallet?

1. **Disconnect** current wallet (click X icon next to wallet name)
2. **Connect** button appears again
3. **Choose different wallet** from the list
4. **Approve connection** in new wallet

Your votes are tied to wallet addresses, so:
- Same address = sees previous votes
- Different address = starts fresh

---

## 🐛 Troubleshooting

### **"Wallet not installed" Error**

**Problem:** You clicked a wallet you don't have installed.

**Solution:**
- The install page should open automatically
- Install the wallet extension
- Refresh the page
- Try connecting again

---

### **Wallet Won't Connect**

**Problem:** Connection fails or hangs.

**Solution:**
1. **Refresh the page** (F5 or Cmd+R)
2. **Open your wallet extension** manually
3. **Unlock your wallet** if it's locked
4. **Try connecting again**
5. **Check network**: Make sure you're on Devnet

---

### **Wrong Network**

**Problem:** Wallet is on Mainnet but GovAI uses Devnet.

**Solution:**
1. Open your wallet
2. Click network dropdown/settings
3. Switch to **Devnet**
4. Reconnect to GovAI

---

### **Balance Shows 0 SOL**

**Problem:** Connected but balance is 0.

**Solution:**
- This is normal on Devnet!
- Get test SOL from **Solana Faucet**:
  - Go to [https://faucet.solana.com/](https://faucet.solana.com/)
  - Paste your wallet address
  - Select "Devnet"
  - Click "Request Airdrop"
  - Wait a few seconds
  - Refresh GovAI dashboard

---

## 💰 Getting Test SOL (Devnet)

You need SOL to vote (for transaction fees, though usually minimal):

### **Method 1: Solana Faucet**
1. Go to [https://faucet.solana.com/](https://faucet.solana.com/)
2. Copy your wallet address from GovAI
3. Paste it in the faucet
4. Select "Devnet"
5. Click "Request Airdrop"
6. Wait 5-10 seconds
7. Refresh GovAI - you should see 1-2 SOL

### **Method 2: CLI (Advanced)**
```bash
solana airdrop 1 YOUR_WALLET_ADDRESS --url devnet
```

---

## 🔒 Security Tips

### **All Wallets:**
1. **Never share your seed phrase** - EVER!
2. **Verify URLs** - only use official wallet sites
3. **Check transaction details** - before approving
4. **Use hardware wallet** - for large amounts (Solflare supports Ledger)
5. **Keep software updated** - update wallet extensions regularly

### **GovAI Specific:**
- ✅ GovAI only asks to **sign messages** (free, no SOL cost)
- ✅ No transactions sent to blockchain (pure signature-based voting)
- ✅ Your wallet stays safe - just proving identity
- ❌ GovAI never asks for private keys or seed phrases

---

## 📊 Feature Parity

All three wallets have **identical functionality** in GovAI:

| Feature | Phantom | Solflare | Backpack |
|---------|---------|----------|----------|
| Connect | ✅ | ✅ | ✅ |
| Vote | ✅ | ✅ | ✅ |
| Change Vote | ✅ | ✅ | ✅ |
| Sign Messages | ✅ | ✅ | ✅ |
| View Balance | ✅ | ✅ | ✅ |
| See Vote History | ✅ | ✅ | ✅ |
| Disconnect | ✅ | ✅ | ✅ |

---

## 🎯 Which Wallet Should I Use?

### **Choose Phantom If:**
- ✅ You're new to Solana
- ✅ You want the easiest experience
- ✅ You want the most popular wallet
- ✅ You need excellent mobile support

### **Choose Solflare If:**
- ✅ You're a DeFi power user
- ✅ You want advanced features
- ✅ You use hardware wallets (Ledger)
- ✅ You want detailed transaction history

### **Choose Backpack If:**
- ✅ You want a modern, sleek UI
- ✅ You use multiple blockchains
- ✅ You want social features
- ✅ You like xNFTs

**Honest Answer:** They all work great! Pick whichever you like best. 😊

---

## 📱 Mobile Support

### **Phantom Mobile**
- ✅ iOS & Android
- ✅ Full DApp browser
- ✅ Can connect to GovAI via mobile browser

### **Solflare Mobile**
- ✅ iOS & Android  
- ✅ DApp browser
- ✅ Hardware wallet support

### **Backpack Mobile**
- ✅ iOS & Android
- ✅ DApp browser
- ✅ Modern UI

---

## ✅ Connection Checklist

Before voting, verify:

- [ ] Wallet extension installed
- [ ] Wallet unlocked
- [ ] Connected to Devnet (not Mainnet!)
- [ ] Wallet address showing in GovAI header
- [ ] Have some SOL for transactions (even 0.01 SOL is enough)
- [ ] Can see vote buttons (not grayed out)

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12 → Console tab)
2. **Look for error messages**
3. **Try a different browser**
4. **Try a different wallet**
5. **Clear cache and refresh**

Common fixes:
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
- Disable other wallet extensions
- Update your wallet extension
- Restart your browser

---

## 🎉 Summary

- ✅ **3 wallets supported**: Phantom, Solflare, Backpack
- ✅ **All work identically** in GovAI
- ✅ **Easy to switch** between wallets
- ✅ **Secure** - only message signing, no transactions
- ✅ **Pick your favorite** - they all work great!

Happy voting! 🗳️

---

**Last Updated:** 2025-11-23  
**Version:** 1.0

