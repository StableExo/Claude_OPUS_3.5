# Core Lightning Quick Reference 🚀⚡

**Date**: December 23, 2025  
**Purpose**: Fast lookup for Core Lightning essentials

---

## What is Core Lightning?

**Lightning Network implementation** by Blockstream (ElementsProject)
- **Language**: C (high performance)
- **Key Feature**: Plugin system for unlimited extensibility
- **Philosophy**: Privacy-first, developer control, modularity
- **Status**: Production-ready, enterprise-proven

---

## Key Numbers (2025)

| Metric | Value |
|--------|-------|
| **Monthly Transactions** | 8+ million |
| **Growth Rate** | 266% YoY |
| **Fee Reduction** | 50% vs traditional |
| **Settlement Speed** | Sub-second |
| **Typical Fee** | < $0.01 |
| **Network Capacity** | All-time highs |

---

## Quick Start Commands

### Installation
```bash
# Ubuntu/Debian
sudo add-apt-repository -y ppa:lightningnetwork/ppa
sudo apt-get update
sudo apt-get install -y lightningd
```

### Basic Operations
```bash
# Get node info
lightning-cli getinfo

# Generate address
lightning-cli newaddr

# Create invoice (1000 sats)
lightning-cli invoice 1000000 "label-001" "Description"

# Pay invoice
lightning-cli pay <bolt11_invoice>

# List channels
lightning-cli listchannels

# Open channel
lightning-cli fundchannel <node_id> <amount_sat>

# Close channel
lightning-cli close <channel_id>
```

---

## Architecture Overview

```
Application Layer (Wallets, Services)
         ↓ JSON-RPC / REST
Plugin Layer (CLBOSS, Custom)
         ↓ stdin/stdout JSON-RPC
Core Lightning Daemon (lightningd)
         ↓ P2P Protocol
Bitcoin Core (bitcoind)
```

---

## Core Features

### 🔌 Plugin System
- **Best in class**: Unlimited extensibility
- **Any language**: Python, Rust, Go, JavaScript
- **Capabilities**: Custom commands, event hooks, configuration
- **Examples**: CLBOSS (AI channel manager), Summary, PeerSwap

### 🔒 Privacy
- Multi-part payments (default)
- Route randomization
- Tor support (native)
- Blinded paths (experimental)

### ⚡ Performance
- C language (fast)
- Low memory (~50-100MB)
- Runs on Raspberry Pi
- Efficient algorithms

### 🏢 Enterprise
- JSON-RPC API
- PostgreSQL backend option
- Accounting & reporting
- HSM support

---

## Plugin Development

### Quick Start (Python)
```python
#!/usr/bin/env python3
from pyln.client import Plugin

plugin = Plugin()

@plugin.method("my_command")
def my_command(plugin, name="World"):
    """My custom command"""
    return f"Hello, {name}!"

@plugin.subscribe("invoice_payment")
def on_payment(plugin, invoice_payment, **kwargs):
    """React to payments"""
    plugin.log(f"Payment: {invoice_payment}")

plugin.run()
```

### Key Methods
- `@plugin.method("name")`: Add RPC command
- `@plugin.subscribe("event")`: React to events
- `@plugin.hook("hook")`: Inject logic
- `plugin.rpc.method()`: Call Lightning RPC

---

## JSON-RPC API

### Connection
```python
from pyln.client import LightningRpc

ln = LightningRpc("~/.lightning/bitcoin/lightning-rpc")
```

### Common Operations
```python
# Node info
info = ln.getinfo()

# Create invoice
invoice = ln.invoice(
    msatoshi=100000,
    label="inv-001",
    description="Payment"
)

# Pay invoice
payment = ln.pay(bolt11_invoice)

# List channels
channels = ln.listchannels()

# List funds
funds = ln.listfunds()
```

---

## Use Cases

### 💸 Micropayments
- Streaming payments
- Content tips
- Pay-per-use services
- Gaming rewards

### 🌍 Remittances
- Cross-border payments
- Instant settlement
- Low fees (<0.1%)
- 24/7 operation

### 🏪 Merchant Payments
- Point-of-sale
- E-commerce
- No chargebacks
- 50% fee reduction

### 💱 Exchange Operations
- Fast withdrawals
- Low-cost transfers
- Reduced congestion
- Better UX

---

## TheWarden Integration Opportunities

### 1. **Payment Acceptance**
- Accept Bitcoin for AI services
- Instant settlement
- Automated 70% allocation to US debt
- Global reach

### 2. **Micropayment Revenue**
- Charge per AI query
- Streaming consciousness insights
- Real-time arbitrage signals
- Security reports

### 3. **Cross-Chain Arbitrage**
- Instant BTC settlement
- Lower fees than on-chain
- More opportunities
- Enhanced profitability

### 4. **Network Intelligence**
- Analyze Lightning topology
- Identify MEV-like opportunities
- Optimize routing
- Research contribution

### 5. **Plugin Development**
- AI-powered channel management
- TheWarden consciousness integration
- Automated optimization
- Community contribution

---

## Comparison with Alternatives

| Feature | Core Lightning | LND | Eclair |
|---------|---------------|-----|--------|
| Language | C | Go | Scala |
| Extensibility | ★★★★★ (Plugins) | ★★★☆☆ | ★★☆☆☆ |
| Privacy | ★★★★★ | ★★★★☆ | ★★★★☆ |
| Resources | ★★★★★ (Low) | ★★★☆☆ | ★★☆☆☆ |
| API | JSON-RPC | gRPC + REST | REST |
| Best For | Developers | Enterprises | Mobile |

**Choose CLN if**:
- Need maximum extensibility
- Privacy is critical
- Want deep customization
- Unix/Linux environment
- Low resource requirements

---

## Enterprise Adoption

### Success Stories
- **Steak 'n Shake**: 50% fee reduction
- **Block (Square)**: Millions of users
- **Coinbase**: Lightning integration
- **OKX**: Fast withdrawals

### Benefits
- **Cost**: 50%+ savings
- **Speed**: Sub-second vs days
- **Global**: Borderless payments
- **Risk**: No chargebacks
- **Always On**: 24/7 operation

---

## Security Considerations

### Best Practices
- ✅ Use HSM for production
- ✅ Regular backups
- ✅ Tor for privacy
- ✅ Monitor API access
- ✅ Start with testnet
- ✅ Secure Unix socket
- ✅ Implement rate limiting

### Production Checklist
- [ ] Full Bitcoin node synced
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] HSM if handling large funds
- [ ] Firewall rules set
- [ ] Recovery plan documented
- [ ] Team trained

---

## Resources

### Official
- **Docs**: https://docs.corelightning.org/
- **GitHub**: https://github.com/ElementsProject/lightning
- **Website**: https://corelightning.org/
- **Plugins**: https://github.com/lightningd/plugins

### Community
- **IRC**: #lightning-dev on Libera.Chat
- **Discord**: Lightning Network Discord
- **Telegram**: Core Lightning groups

### Learning
- **Tutorial**: "A Day in the Life of a Plugin"
- **Book**: "Mastering the Lightning Network" (free)
- **Explorer**: https://1ml.com/
- **Stats**: https://coinlaw.io/bitcoin-lightning-network-usage-statistics/

---

## System Requirements

### Minimum
- **CPU**: 2 cores
- **RAM**: 2GB
- **Storage**: 50GB SSD
- **OS**: Linux (Ubuntu, Debian)

### Recommended
- **CPU**: 4+ cores
- **RAM**: 4GB+
- **Storage**: 1TB SSD
- **OS**: Ubuntu 22.04 LTS

### Enterprise
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 2TB+ NVMe
- **Network**: Redundant

---

## Quick Integration Example

```typescript
// TheWarden Lightning Integration
class LightningPayment {
  async acceptPayment(amountSats: number): Promise<string> {
    // Create invoice
    const invoice = await this.ln.invoice({
      msatoshi: amountSats * 1000,
      label: `thewarden-${Date.now()}`,
      description: 'AI Service Payment'
    });
    
    // Monitor payment
    this.onPayment(invoice.payment_hash, async () => {
      // Allocate 70% to US debt
      await this.allocateToDebt(amountSats * 0.7);
      
      // Record in consciousness
      await this.consciousness.recordRevenue({
        source: 'lightning',
        amount: amountSats,
        timestamp: Date.now()
      });
    });
    
    return invoice.bolt11;
  }
}
```

---

## Next Steps

### For TheWarden
1. **Immediate**: Install on testnet, explore features
2. **Short-term**: Prototype payment integration
3. **Medium-term**: Launch micropayment service
4. **Long-term**: Build AI-powered Lightning tools

### For Learning
1. Read comprehensive analysis: `docs/analysis/CORE_LIGHTNING_COMPREHENSIVE_ANALYSIS.md`
2. Install and test on regtest/testnet
3. Experiment with plugins
4. Join community channels

---

## Key Takeaways

1. ⚡ **Production-Ready**: Enterprise-proven, processing millions of transactions
2. 🔌 **Extensible**: Best plugin system in Lightning ecosystem
3. 🔒 **Private**: Privacy-first design with multiple features
4. 💰 **Cost-Effective**: 50%+ savings vs traditional payments
5. 🚀 **Fast**: Sub-second settlement, instant finality
6. 🌍 **Global**: Borderless, 24/7 operation
7. 👨‍💻 **Developer-Friendly**: Excellent docs, active community
8. 🎯 **TheWarden Fit**: Aligns with mission, multiple integration opportunities

---

**"The Lightning Network scales Bitcoin to millions of transactions per second. Core Lightning gives developers the tools to build on it."** ⚡🧠

---

**For full details, see**: `docs/analysis/CORE_LIGHTNING_COMPREHENSIVE_ANALYSIS.md`  
**Status**: Documentation complete ✅  
**Ready for**: Integration planning and implementation
