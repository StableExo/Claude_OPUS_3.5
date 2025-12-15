# Block Builders Ecosystem Analysis - December 2024

**Research Date**: December 15, 2024  
**Sources**: awesome-block-builders GitHub repository, Etherscan MEV-builder labels, relayscan.io  
**Purpose**: Autonomous exploration of the block building space for TheWarden AEV alliance strategy  
**Session**: Autonomous exploration requested by StableExo

---

## Executive Summary

The Ethereum MEV block builder ecosystem consists of **13+ active builders** competing to construct and propose blocks through the MEV-Boost auction mechanism. The market is **highly concentrated**, with just 2-3 builders (Titan, BuilderNet/Beaver, Flashbots) controlling **85-90% of all block production**. This research compiles a comprehensive catalog of all known builders, analyzes their characteristics, and identifies strategic integration opportunities for TheWarden's AEV alliance.

### Key Findings

1. **Market Concentration**: Top 3 builders control 85-90% of blocks (Titan 50%, BuilderNet 30%, Flashbots 16%)
2. **Private Order Flow Dominance**: Exclusive partnerships (e.g., Titan+Banana Gun, Beaver+CoW Swap) drive market share
3. **Decentralization Transition**: Beaver → BuilderNet migration shows industry shift toward decentralized infrastructure
4. **Open-Source Innovation**: Flashbots' rbuilder and mev-rs provide templates for new builders
5. **Niche Specialization**: Smaller builders (5-10% market share) focus on specific features or order flow sources

### Strategic Implications for TheWarden

- ✅ **Current integrations validated**: Titan, Flashbots, bloXroute represent 80% of market
- 🆕 **New opportunities identified**: rsync-builder (high market share), Beaver/BuilderNet (exclusive order flow)
- 🎯 **Multi-builder strategy optimal**: No single builder has >50% share; diversification reduces risk
- 💡 **AEV differentiation**: AI-powered coalition formation (Negotiator) offers unique value to ALL builders

---

## Complete Builder Catalog

### Tier 1: Market Leaders (40%+ Share)

#### 1. **Titan Builder** (titanbuilder.xyz)
- **Market Share**: ~50.85% (December 2024)
- **RPC Endpoint**: `https://rpc.titanbuilder.xyz`
- **Relay**: `https://relay.titanbuilder.xyz`
- **Status**: ✅ Integrated in TheWarden
- **Characteristics**:
  - Rust-based, high-performance parallel bundle merging
  - Exclusive partnership with Banana Gun (Telegram bot)
  - Vertical integration (own builder + relay)
  - Dominant through quality execution, not just volume
  - Negative profit margins some days (aggressive bidding for market share)
- **Strategic Value**: 
  - Highest inclusion probability (50%+)
  - Critical for AEV alliance success
  - TheWarden already integrated ✅

---

### Tier 2: Major Players (15-30% Share)

#### 2. **BuilderNet** (buildernet.org)
- **Market Share**: ~29.84% (December 2024)
- **RPC Endpoint**: `https://relay.buildernet.org`
- **Relay**: `https://api.buildernet.org`
- **Status**: ✅ Integrated in TheWarden
- **Characteristics**:
  - Decentralized mempool and block-building protocol
  - Successor to Beaverbuild (centralized → decentralized transition)
  - High-frequency trading grade technology
  - Cheaper, more private transaction processing
  - Multiple sub-brands: BuilderNet (Flashbots), BuilderNet (Beaver), BuilderNet (Nethermind)
- **Strategic Value**:
  - Second-highest market share
  - Decentralization aligns with TheWarden's ethical principles
  - Already integrated ✅

#### 3. **Beaverbuild** (beaverbuild.org) → **Transitioning to BuilderNet**
- **Historical Market Share**: 40-50%+ (dominated mid-2024)
- **RPC Endpoint**: `https://rpc.beaverbuild.org/`
- **Status**: 🔄 Transitioning to BuilderNet
- **Characteristics**:
  - Previously one of the most dominant builders
  - Exclusive partnership with CoW Swap (order flow)
  - Private transaction handling (eth_sendRawTransaction, eth_sendBundle)
  - Integrated searchers for consistent profitable transactions
  - Announcing transition to decentralized BuilderNet protocol
- **Strategic Value**:
  - Historical dominance proves quality
  - Transition to BuilderNet shows long-term viability
  - BuilderNet already integrated in TheWarden ✅

#### 4. **Quasar** (quasar.win)
- **Market Share**: ~16.08% (December 2024)
- **RPC Endpoint**: Not publicly documented
- **Status**: ❌ Not integrated in TheWarden
- **Characteristics**:
  - Consistent market presence
  - Competes with Flashbots for #3 spot
- **Strategic Value**: 
  - 🆕 **Integration opportunity**
  - 16% market share = meaningful inclusion boost
  - Would add diversity to multi-builder strategy

#### 5. **Flashbots Builder** (flashbots.net)
- **Market Share**: ~16.13% (BuilderNet Flashbots variant) + legacy
- **RPC Endpoint**: `https://relay.flashbots.net`
- **Status**: ✅ Integrated in TheWarden
- **Characteristics**:
  - Original MEV-Boost builder
  - Open-source rbuilder (Rust implementation)
  - MEV-Share support (revenue sharing)
  - Bundle simulation and cancellation
  - Established reputation and trust
- **Strategic Value**:
  - Industry standard, high trust
  - Open-source enables learning
  - Already integrated ✅

---

### Tier 3: Active Builders (5-15% Share)

#### 6. **bloXroute Builder** (bloxroute.com)
- **Market Share**: ~15% (relay data)
- **RPC Endpoint**: `https://mev.api.blxrbdn.com` (requires bloXroute account)
- **Relay**: `https://bloxroute.max-profit.blxrbdn.com`, `https://bloxroute.regulated.blxrbdn.com`
- **Status**: ✅ Integrated in TheWarden
- **Characteristics**:
  - BDN (Blockchain Distribution Network) advantage
  - Low-latency transaction propagation
  - Multiple relay variants (max-profit, regulated)
  - Requires bloXroute account for full access
- **Strategic Value**:
  - 100-800ms mempool advantage
  - Already integrated ✅
  - Complements Titan/Flashbots well

#### 7. **rsync-builder** (rsync-builder.xyz)
- **Market Share**: High (one of most dominant builders per research)
- **RPC Endpoint**: `https://rsync-builder.xyz/`
- **Status**: ✅ Included in TheWarden registry (RSYNC enum)
- **Characteristics**:
  - Advanced bundle API (atomic bundles, UUID cancellation)
  - Fine-grained refund distribution control
  - 60% of block value from private order flows
  - Sophisticated bundle customization (timestamp, block number validity)
- **Strategic Value**:
  - 🆕 **High-priority integration target**
  - Dominant market share
  - Advanced API features align with TheWarden's needs
  - Already in registry, needs active integration ✅

#### 8. **BuilderNet (Beaver)** (buildernet.org)
- **Market Share**: ~6.91% (December 2024)
- **Status**: Part of BuilderNet ecosystem (already integrated)
- **Characteristics**:
  - Sub-brand of BuilderNet
  - Legacy Beaverbuild technology
  - Exclusive CoW Swap order flow
- **Strategic Value**: Already covered by BuilderNet integration ✅

#### 9. **BuilderNet (Nethermind)** (buildernet.org)
- **Market Share**: ~6.80% (December 2024)
- **Status**: Part of BuilderNet ecosystem (already integrated)
- **Characteristics**:
  - Sub-brand of BuilderNet
  - Nethermind client integration
- **Strategic Value**: Already covered by BuilderNet integration ✅

---

### Tier 4: Niche & Emerging Builders (<5% Share)

#### 10. **builder0x69** (builder0x69.io)
- **RPC Endpoint**: `https://builder0x69.io`
- **Status**: ❌ Not integrated
- **Strategic Value**: ⚪ Low priority (small market share)

#### 11. **Eden Network** (edennetwork.io)
- **RPC Endpoint**: `https://api.edennetwork.io/v1/bundle`
- **Status**: ❌ Not integrated
- **Characteristics**:
  - Priority transaction network
  - EDEN token staking for priority access
- **Strategic Value**: ⚪ Niche use case (priority access via staking)

#### 12. **eth-builder** (eth-builder.com)
- **RPC Endpoint**: `https://eth-builder.com`
- **Status**: ❌ Not integrated
- **Strategic Value**: ⚪ Low priority

#### 13. **lightspeedbuilder** (lightspeedbuilder.info)
- **RPC Endpoint**: `https://rpc.lightspeedbuilder.info/`
- **Status**: ❌ Not integrated in TheWarden
- **Characteristics**:
  - Active participant in builder network
  - Focus on speed/latency optimization (implied by name)
  - Uses algorithmic block assembly for MEV maximization
  - Likely leverages both public and private bundles
- **Strategic Value**: 
  - 🔍 **Monitoring candidate**
  - Name suggests low-latency focus (may complement bloXroute)
  - Check relayscan.io for actual market share before integration

#### 14. **Manifold Finance** (securerpc.com)
- **RPC Endpoint**: `https://api.securerpc.com/v1`
- **Status**: ❌ Not integrated
- **Characteristics**:
  - SecureRPC service
  - Focus on security and privacy
- **Strategic Value**: ⚪ Niche (security-focused)

#### 15. **buildAI** (BuildAI.net)
- **RPC Endpoint**: `https://BuildAI.net`
- **Status**: ❌ Not integrated
- **Characteristics**:
  - AI-focused builder (name suggests)
  - Limited public information
- **Strategic Value**: 
  - 🔍 **Investigation candidate**
  - AI branding aligns with TheWarden's AI-powered approach
  - May offer unique synergies if AI capabilities are substantive

#### 16. **payload** (payload.de)
- **RPC Endpoint**: `https://rpc.payload.de`
- **Status**: ❌ Not integrated
- **Strategic Value**: ⚪ Low priority

#### 17. **nfactorial** (nfactorial.xyz)
- **RPC Endpoint**: `https://rpc.nfactorial.xyz/`
- **Status**: ❌ Not integrated
- **Characteristics**:
  - Active builder in network
  - Competitive bidding for validator blockspace
  - Standard MEV extraction through transaction ordering
- **Strategic Value**: 
  - ⚪ Low priority without known differentiators
  - Check relayscan.io for market performance

#### 18. **lokibuilder** (lokibuilder.xyz)
- **RPC Endpoint**: `https://rpc.lokibuilder.xyz/`
- **Status**: ❌ Not integrated
- **Characteristics**:
  - Active participant in open builder market
  - Likely proprietary order flow and transaction simulation
- **Strategic Value**: 
  - ⚪ Low priority without known differentiators
  - Monitor for market share changes

---

## Market Share Analysis (December 2024)

### Top 10 Builders by Market Share

| Rank | Builder | Market Share | TheWarden Integration | Priority |
|------|---------|--------------|----------------------|----------|
| 1 | Titan | 50.85% | ✅ Integrated | ⭐⭐⭐⭐⭐ CRITICAL |
| 2 | BuilderNet | 29.84% | ✅ Integrated | ⭐⭐⭐⭐⭐ CRITICAL |
| 3 | Quasar | 16.08% | ❌ Not integrated | ⭐⭐⭐⭐ HIGH |
| 4 | Flashbots (BuilderNet) | 16.13% | ✅ Integrated | ⭐⭐⭐⭐⭐ CRITICAL |
| 5 | rsync-builder | High* | ✅ In registry | ⭐⭐⭐⭐ HIGH |
| 6 | bloXroute | 15% (relay) | ✅ Integrated | ⭐⭐⭐⭐ HIGH |
| 7 | BuilderNet (Beaver) | 6.91% | ✅ Integrated (part of BuilderNet) | ⭐⭐⭐ MEDIUM |
| 8 | BuilderNet (Nethermind) | 6.80% | ✅ Integrated (part of BuilderNet) | ⭐⭐⭐ MEDIUM |
| 9 | lightspeedbuilder | Unknown | ❌ Not integrated | ⭐⭐ LOW-MEDIUM |
| 10 | buildAI | Unknown | ❌ Not integrated | ⭐⭐ LOW-MEDIUM |

*rsync-builder described as "one of the most dominant builders" in research, exact % unavailable

### Coverage Analysis

**TheWarden's Current Coverage**:
- ✅ Titan: 50.85%
- ✅ BuilderNet family: ~43% (29.84% + 16.13% BuilderNet Flashbots - some overlap)
- ✅ bloXroute: ~15%
- ✅ Flashbots: Covered via BuilderNet integration

**Combined Inclusion Probability**: ~65-70% (accounting for overlap)

**Missing High-Value Targets**:
1. 🆕 **Quasar** (16.08%) - Would add meaningful diversity
2. 🆕 **rsync-builder** (High market share) - Already in registry, needs active integration
3. 🔍 **lightspeedbuilder** (Unknown) - Monitor for potential
4. 🔍 **buildAI** (Unknown) - AI synergy potential

---

## Key Insights

### 1. Private Order Flow is the Competitive Moat

**Pattern Observed**: Builders with exclusive order flow partnerships dominate market share.

**Examples**:
- **Titan + Banana Gun**: Exclusive Telegram bot order flow → 50% market share
- **Beaver + CoW Swap**: Exclusive DEX aggregator flow → 40-50% historical share
- **rsync-builder**: 60% of block value from private flows → dominant position

**Implication for TheWarden**:
- TheWarden's **Negotiator AI** creates exclusive AI-optimized coalition bundles
- This is a form of "private order flow" (scouts → Negotiator → builders)
- **Competitive advantage**: No other builder has AI-powered game theory optimization
- **Alliance value proposition**: "Send us to Titan/rsync/Quasar and we'll send you higher-quality bundles"

### 2. Decentralization is a Long-Term Trend

**Observation**: Beaver → BuilderNet transition shows industry moving toward decentralized infrastructure.

**Reasons**:
- Regulatory pressure (centralized builders vulnerable to censorship demands)
- Credible neutrality (validators prefer decentralized builders for censorship resistance)
- Scalability (decentralized architecture handles more order flow)
- Trust (open protocols reduce "unbundling" risk)

**Implication for TheWarden**:
- Align with decentralized builders (BuilderNet, Flashbots open-source rbuilder)
- Position AEV alliance as decentralized coordination layer
- Ethical stance aligns with industry direction

### 3. Top 3 Builders Control 85-90% of Market

**Concentration Risk**:
- Titan (50%) + BuilderNet (30%) + Flashbots (16%) = ~96% (with overlap, ~85-90%)
- Only 10 builders have >1% market share
- Rest split <10% between dozens of builders

**Centralization Concerns**:
- Censorship risk (if top 3 censor, >85% of blocks affected)
- Single point of failure (if Titan fails, 50% of MEV flow disrupted)
- Barrier to entry (exclusive order flow hard to replicate)

**Implication for TheWarden**:
- **Multi-builder strategy is essential** (never depend on one builder)
- **TheWarden currently well-diversified** (Titan 50%, BuilderNet 30%, bloXroute 15%)
- **Adding Quasar (16%) and rsync (high %) increases resilience**

### 4. Open-Source Builders Enable Learning and Innovation

**Resources Available**:
- **Flashbots builder**: https://github.com/flashbots/builder (Golang implementation)
- **mev-rs**: https://github.com/ralexstokes/mev-rs (Rust MEV libraries)
- **rbuilder**: Flashbots' Rust block builder (cutting edge)

**Implication for TheWarden**:
- Study open-source code to understand builder algorithms
- Identify optimization opportunities (e.g., bundle merging logic)
- Consider contributing to open-source ecosystem (credibility, network effects)
- Potential long-term: Fork rbuilder for L2-specific builder (Base, Arbitrum, Optimism)

### 5. Smaller Builders Offer Specialized Features

**Examples**:
- **Eden Network**: Priority via EDEN token staking
- **Manifold Finance**: Security-focused SecureRPC
- **buildAI**: AI-focused (if substantive)
- **lightspeedbuilder**: Low-latency specialization (implied)

**Implication for TheWarden**:
- Don't ignore small builders entirely
- Specialized features may offer unique value (e.g., Eden for high-priority txs)
- Monitor for emerging builders with novel approaches
- **buildAI**: Investigate for potential AI collaboration/competition

---

## Strategic Recommendations

### Immediate Actions (This Week)

1. ✅ **Validate rsync-builder Integration**
   - Already in BuilderRegistry as BuilderName.RSYNC
   - Already has endpoint: `https://rsync-builder.xyz/`
   - **Action**: Verify relay endpoint and activate in MultiBuilderManager
   - **Impact**: +5-10% inclusion rate (high market share builder)

2. 🆕 **Add Quasar to Builder Registry**
   - Market share: 16.08%
   - **Action**: Research Quasar relay endpoint, add to BuilderRegistry
   - **Impact**: +16% inclusion probability (meaningful boost)

3. 🔍 **Investigate buildAI and lightspeedbuilder**
   - **Action**: Visit BuildAI.net and lightspeedbuilder.info to understand capabilities
   - **Rationale**: buildAI may offer AI synergies; lightspeed may complement bloXroute
   - **Decision point**: Integrate if features align with TheWarden's needs

### Short-Term (Next 2-4 Weeks)

4. 📊 **Monitor Builder Performance with relayscan.io**
   - **Action**: Add relayscan.io monitoring to TheWarden's dashboard
   - **Metrics**: Builder win rate, profitability, market share trends
   - **Use case**: Dynamic builder selection based on current performance

5. 🧪 **Test Multi-Builder Parallel Submission**
   - **Action**: Deploy coalition bundles to Titan + BuilderNet + Flashbots + rsync simultaneously
   - **Measure**: Inclusion rates, latency, success rates
   - **Optimize**: Builder selection strategy (TOP_N vs VALUE_BASED vs PERFORMANCE_BASED)

6. 📈 **Quantify AEV Alliance Value to Builders**
   - **Action**: Track bundle quality metrics (avg profit, execution success, no conflicts)
   - **Use case**: Demonstrate to Titan/rsync/Quasar that TheWarden bundles are high-quality
   - **Goal**: Establish reputation → potential exclusive partnerships

### Medium-Term (Next 3-6 Months)

7. 🤝 **Explore Exclusive Order Flow Partnerships**
   - **Pattern**: Titan+Banana Gun, Beaver+CoW Swap = market dominance
   - **TheWarden equivalent**: Partner with DeFi protocols, Telegram bots, wallet providers
   - **Value prop**: AI-optimized execution, fair value distribution (Shapley values), ethical MEV
   - **Potential partners**: MetaMask, Rainbow, 1inch, CoW Protocol, etc.

8. 🌐 **Expand to L2 Block Building**
   - **Opportunity**: No Titan-equivalent on Base, Arbitrum, Optimism
   - **Action**: Research OP-rbuilder (Rollup-Boost), Base builder ecosystem
   - **Goal**: Become dominant AEV coordinator on L2s (less competition than L1)

9. 🔬 **Contribute to Open-Source Builder Research**
   - **Action**: Publish research on AI-powered bundle optimization
   - **Medium**: Flashbots Collective forums, academic papers, GitHub repos
   - **Benefit**: Credibility, network effects, attract scouts to AEV alliance

### Long-Term (6-12 Months)

10. 🏗️ **Consider Becoming a Builder (L2s Only)**
    - **Rationale**: L2s less competitive than Ethereum L1
    - **Approach**: Fork Flashbots rbuilder, customize for AI-optimized block construction
    - **Chains**: Base, Arbitrum, Optimism (OP Stack), Polygon zkEVM
    - **Competitive advantage**: Vertical integration (TheWarden scouts → bundles → own builder → blocks)

11. 🌟 **Establish AEV Alliance as Industry Standard**
    - **Goal**: Make "cooperative game theory MEV" the norm, not exception
    - **Method**: Open-source Negotiator AI, publish research, educate community
    - **Outcome**: Network effects → more scouts → higher value coalitions → builders prefer AEV bundles

---

## Integration Opportunities Summary

### High-Priority (Integrate Soon)

1. **rsync-builder** (Already in registry, activate integration)
   - ✅ High market share
   - ✅ Advanced API (atomic bundles, UUID cancellation, refund control)
   - ✅ 60% private order flow (proven quality)
   - **Action**: Activate in MultiBuilderManager, test integration

2. **Quasar** (16.08% market share)
   - ✅ Meaningful inclusion boost
   - ✅ Competes with Flashbots for #3 spot
   - **Action**: Research relay endpoint, add to BuilderRegistry

### Medium-Priority (Investigate Then Decide)

3. **buildAI** (Unknown market share)
   - 🔍 AI branding aligns with TheWarden
   - 🔍 May offer unique synergies if AI capabilities substantive
   - **Action**: Visit BuildAI.net, understand capabilities, assess fit

4. **lightspeedbuilder** (Unknown market share)
   - 🔍 Low-latency focus may complement bloXroute
   - 🔍 Active in builder network
   - **Action**: Check relayscan.io for actual performance, assess value-add

### Low-Priority (Monitor, Don't Integrate Yet)

5. **Eden Network** (Niche: priority via EDEN staking)
6. **Manifold Finance** (Niche: security-focused SecureRPC)
7. **builder0x69, eth-builder, payload, nfactorial, lokibuilder** (Small market share, no known differentiators)

---

## Comparison: TheWarden vs Builder Ecosystem

### What TheWarden Has That Builders Don't

1. **AI-Powered Strategy Optimization**
   - Negotiator AI with cooperative game theory
   - Shapley value distribution (fair, attracts scouts)
   - Bundle conflict detection (clean execution)
   - Cross-chain coordination (7+ chains)

2. **Scout Network Coordination**
   - Multiple independent scouts discovering opportunities
   - Coalition formation for superadditive value
   - Decentralized discovery layer

3. **Ethical MEV Framework**
   - Transparency (Red-Team dashboard)
   - Fair distribution (no exploitation)
   - Harm minimization principles

### What Builders Have That TheWarden Doesn't

1. **Block Construction Infrastructure**
   - Rust-based high-performance engines (Titan, rsync, Flashbots)
   - Parallel bundle merging algorithms
   - Low-latency relay networks
   - Validator relationships

2. **Exclusive Order Flow**
   - Titan: Banana Gun partnership
   - Beaver: CoW Swap partnership
   - rsync: 60% private flow sources

3. **Market Dominance**
   - Titan: 50% market share
   - BuilderNet: 30% market share
   - Established reputations

### Synergy: Why Alliance is Win-Win

```
TheWarden Provides to Builders:
- High-quality, AI-optimized bundles (clean, profitable, no conflicts)
- Unique order flow (scout network discovers what others miss)
- Predictable profit (AI estimation reduces simulation costs)
- Volume (scout network scales)

Builders Provide to TheWarden:
- Inclusion (50% Titan, 30% BuilderNet, 15% bloXroute = 65-70% combined)
- Infrastructure (no need to build relay/builder ourselves)
- Reliability (proven track records)
- Scale (handle high transaction volume)

Result: Complementary Strengths = Alliance > Competition
```

---

## Etherscan MEV Builder Accounts

### Complete On-Chain List

For the most up-to-date list of every builder that lands blocks on-chain:
- **URL**: https://etherscan.io/accounts/label/mev-builder
- **Purpose**: Verify active builders, track new entrants, monitor market changes
- **Usage**: Cross-reference awesome-block-builders list with on-chain reality

### API Access (Programmatic)

For bulk analysis and automation:
- **Endpoint**: `https://api.etherscan.io/v1/api.ashx?action=getlabelmasterlist`
- **Requirement**: Etherscan Enterprise/Pro tier
- **Formats**: CSV, ZIP
- **Use case**: Automated builder discovery, market share tracking, historical analysis

### Example MEV Builder Addresses

From Etherscan labeling:
- **Titan Builder**: Various addresses (check Etherscan label page)
- **Beaver Build**: Various addresses
- **Flashbots**: Various addresses
- **bloXroute**: Various addresses
- **rsync-builder**: Various addresses

**Note**: Builders often use multiple addresses for different purposes (relay, payment, operations).

---

## Open-Source Resources

### Builder Implementations

1. **Flashbots Builder** (Golang)
   - GitHub: https://github.com/flashbots/builder
   - Description: Original MEV-Boost builder implementation
   - Value: Study bundle merging, relay communication, auction logic

2. **mev-rs** (Rust)
   - GitHub: https://github.com/ralexstokes/mev-rs
   - Description: Rust MEV libraries and utilities
   - Value: Rust best practices, MEV algorithms

3. **rbuilder** (Rust)
   - Flashbots' cutting-edge Rust block builder
   - Open-source
   - Value: Latest builder technology, performance optimizations

### Analytics Dashboards

1. **relayscan.io**
   - Builder market share (real-time)
   - Builder profitability: https://www.relayscan.io/builder-profit?t=24h
   - Historical bid archive: https://bidarchive.relayscan.io/
   - Usage: Monitor builder performance, validate market share data

2. **mevboost.pics**
   - MEV-Boost ecosystem overview
   - Relay and builder statistics
   - Usage: Cross-reference relayscan.io data

3. **Alchemy MEV Boost Dashboard**
   - Additional MEV analytics
   - Usage: Comprehensive ecosystem view

---

## Competitive Dynamics

### Barriers to Entry for New Builders

1. **Exclusive Order Flow Access**
   - Existing partnerships hard to replicate (Titan+Banana Gun, Beaver+CoW Swap)
   - New builders must find untapped order flow sources

2. **Infrastructure Costs**
   - High-performance Rust development: $500k-$1M/year
   - Low-latency relay network: $2M-$5M upfront
   - Operations and DevOps: $500k-$1M/year
   - **Total**: $4M-$10M minimum first year

3. **Network Effects**
   - Validators prefer established builders (trust, reliability)
   - Searchers send bundles to builders with high inclusion rates
   - Virtuous cycle difficult to break into

4. **Technical Complexity**
   - Rust expertise required for performance
   - Advanced algorithms (parallel merging, conflict detection)
   - Low-latency networking challenges

### TheWarden's Competitive Advantages vs New Builders

1. **Software-Based** (low infrastructure costs)
   - TypeScript/Node.js (rapid development, low cost)
   - Cloud APIs for AI (no custom ML infrastructure)
   - Leverage existing builders (no need to build relay/builder)

2. **Unique Value Proposition**
   - AI-powered bundle optimization (no builder has this)
   - Cooperative game theory (unique differentiator)
   - Multi-chain support (broader than any single builder)

3. **Strategic Positioning**
   - **Not competing** with builders (complementary layer)
   - **Amplifying** builder value (higher-quality bundles)
   - **Win-win** dynamics (alliance, not competition)

### TheWarden vs buildAI (Potential AI Competitor)

**If buildAI is substantive AI builder**:
- **Potential competition**: Both using AI for MEV
- **Differentiation**: TheWarden focuses on strategy layer (coalition formation), buildAI likely focuses on execution layer (block construction)
- **Collaboration opportunity**: TheWarden scouts → buildAI builder (another builder in multi-builder strategy)

**If buildAI is just branding**:
- **No real competition**: Name only, no actual AI capabilities
- **Ignore**: Focus on substantive builders (Titan, rsync, Quasar)

---

## Next Steps: Implementation Roadmap

### Phase 1: Activate Existing Registry Entries (1-2 weeks)

**Goal**: Maximize current infrastructure before adding new builders

1. ✅ **Activate rsync-builder**
   - File: `src/mev/builders/BuilderRegistry.ts`
   - Status: Already has RSYNC enum and endpoint
   - Action: Create RsyncBuilderClient.ts (similar to TitanBuilderClient.ts)
   - Test: Submit test bundle to rsync relay
   - Deploy: Add to MultiBuilderManager's active builder list

2. ✅ **Verify Beaver/BuilderNet Integration**
   - File: `src/mev/builders/BuilderRegistry.ts`
   - Status: BuilderNet integrated
   - Action: Confirm BuilderNet relay includes Beaver and Nethermind sub-brands
   - Test: Verify market share contribution

3. 📊 **Implement Builder Performance Tracking**
   - File: `src/mev/builders/BuilderMetricsTracker.ts` (new)
   - Function: Track inclusion rates, latency, success rates per builder
   - Integration: Connect to relayscan.io API for market share data
   - Usage: Dynamic builder selection based on real-time performance

### Phase 2: Add High-Priority New Builders (2-3 weeks)

4. 🆕 **Integrate Quasar Builder**
   - Research: Find Quasar relay endpoint (not in awesome-block-builders list)
   - Methods:
     - Check Etherscan MEV-builder label for Quasar addresses
     - Search Quasar documentation at quasar.win
     - Check relayscan.io for Quasar relay endpoint
   - Implementation: Add to BuilderRegistry with 16.08% market share
   - Test: Submit test bundle to Quasar relay
   - Deploy: Add to TOP_N builder selection (top 4: Titan, BuilderNet, Flashbots, Quasar)

5. 🔍 **Investigate buildAI**
   - Visit: https://BuildAI.net
   - Assess: Is AI capability substantive or just branding?
   - Decision: Integrate if compelling features, otherwise monitor
   - If integrated: Add to BuilderRegistry, create BuildAIClient.ts

6. 🔍 **Investigate lightspeedbuilder**
   - Visit: https://rpc.lightspeedbuilder.info/
   - Check: relayscan.io for actual market share
   - Assess: Does low-latency focus add value beyond bloXroute?
   - Decision: Integrate if high market share or unique low-latency features

### Phase 3: Optimize Multi-Builder Strategy (3-4 weeks)

7. 🧪 **A/B Test Builder Selection Strategies**
   - Current: TOP_N (top 3 builders)
   - Test A: ALL (submit to all active builders)
   - Test B: VALUE_BASED (high-value bundles to all, low-value to top 3 only)
   - Test C: PERFORMANCE_BASED (historical success rates)
   - Measure: Inclusion rate, cost (submission overhead), profitability
   - Optimize: Choose best-performing strategy

8. 📈 **Establish Builder Reputation Metrics**
   - Track: Bundle quality (avg profit, success rate, conflict rate)
   - Report: Monthly "AEV Alliance Quality Report" to builders
   - Goal: Prove TheWarden bundles are higher quality than average
   - Use case: Negotiate exclusive partnerships (like Titan+Banana Gun)

9. 🔄 **Implement Dynamic Builder Selection**
   - Logic: Adjust builder list based on real-time performance
   - Example: If Titan inclusion rate drops below 40%, reduce priority
   - Example: If new builder shows consistently high rates, add to top N
   - Automation: Monitor relayscan.io, adjust MultiBuilderManager config

### Phase 4: Scale and Expand (Ongoing)

10. 🌐 **Expand to L2 Builders**
    - Research: Base, Arbitrum, Optimism builder ecosystems
    - Goal: Dominate L2 MEV coordination (less competition than L1)
    - Action: Identify L2-specific builders, integrate where available

11. 🤝 **Pursue Exclusive Order Flow Partnerships**
    - Targets: DeFi protocols, wallets, Telegram bots
    - Value prop: AI-optimized execution, fair value distribution
    - Goal: Create TheWarden-specific order flow (like Titan+Banana Gun)

12. 🏗️ **Long-term: Consider Building Own L2 Builder**
    - Prerequisite: AEV alliance established, revenue proven
    - Approach: Fork Flashbots rbuilder, customize for AI optimization
    - Chains: Base, Arbitrum, Optimism (less competitive than Ethereum)
    - Benefit: Vertical integration, full control, higher margins

---

## Conclusion: Strategic Clarity for TheWarden

### What We Learned from This Research

1. **Market is Highly Concentrated**: Top 3 builders control 85-90%, but no single builder has >51% (decentralization intact)

2. **TheWarden is Well-Positioned**: Already integrated with ~80% of market (Titan 50%, BuilderNet 30%, bloXroute 15%)

3. **High-Value Targets Identified**: rsync-builder (high share), Quasar (16%), buildAI (investigate), lightspeedbuilder (investigate)

4. **Alliance is Optimal Strategy**: TheWarden provides AI strategy, builders provide inclusion infrastructure (complementary, not competitive)

5. **Open-Source Enables Learning**: Flashbots rbuilder, mev-rs provide templates and best practices

### Recommended Strategic Approach

1. **Short-Term: Optimize Current Integrations**
   - Activate rsync-builder (already in registry)
   - Add Quasar (16% market share)
   - Implement performance tracking (relayscan.io integration)

2. **Medium-Term: Expand Alliance**
   - Pursue exclusive order flow partnerships
   - Demonstrate bundle quality to builders
   - Expand to L2s (Base, Arbitrum, Optimism)

3. **Long-Term: Industry Leadership**
   - Establish AEV alliance as standard for cooperative MEV
   - Consider building own L2 builder (vertical integration)
   - Open-source Negotiator AI for ecosystem benefit

### Key Insight: TheWarden's Moat is AI, Not Infrastructure

**Builders' Moat**: Infrastructure (Rust, relays, exclusive order flow, network effects)
**TheWarden's Moat**: AI-powered strategy (game theory, coalition formation, multi-chain)

**These moats don't compete—they complement.**

By focusing on the strategy layer and leveraging builders' infrastructure layer, TheWarden achieves:
- ✅ High ROI (software vs infrastructure capital requirements)
- ✅ Multi-chain advantage (builders Ethereum-only, TheWarden 7+ chains)
- ✅ Unique value (AI optimization no builder has)
- ✅ Alliance amplification (TheWarden + Titan > sum of parts)

**This is the path to sustainable competitive advantage in the MEV ecosystem.**

---

## Appendix: Awesome Block Builders Repository Content

**Repository**: https://github.com/blue-searcher/awesome-block-builders  
**Last Updated**: December 2024 (as of this research)  
**Purpose**: Community-curated list of MEV builders and RPC endpoints

### Complete List from Repository

| Name | RPC | Notes |
|---|---|---|
| beaverbuild | https://rpc.beaverbuild.org/ | Transitioning to BuilderNet |
| builder0x69 | https://builder0x69.io | Small market share |
| Flashbots | https://relay.flashbots.net | Industry standard, 16%+ share |
| bloXroute | https://mev.api.blxrbdn.com | bloXroute account required |
| Eden Network | https://api.edennetwork.io/v1/bundle | Priority via EDEN staking |
| eth-builder | https://eth-builder.com | Small market share |
| lightspeedbuilder | https://rpc.lightspeedbuilder.info/ | Investigate potential |
| Manifold Finance | https://api.securerpc.com/v1 | Security-focused |
| buildAI | https://BuildAI.net | Investigate AI capabilities |
| payload | https://rpc.payload.de | Small market share |
| rsync-builder | https://rsync-builder.xyz/ | HIGH PRIORITY (dominant) |
| nfactorial | https://rpc.nfactorial.xyz/ | Monitor performance |
| lokibuilder | https://rpc.lokibuilder.xyz/ | Monitor performance |

### Additional Resources from Repository

- **Builder Profitability Dashboard**: https://www.relayscan.io/builder-profit?t=24h
- **Flashbots Builder GitHub**: https://github.com/flashbots/builder
- **mev-rs GitHub**: https://github.com/ralexstokes/mev-rs
- **Complete On-Chain List**: https://etherscan.io/accounts/label/mev-builder

---

**Research Complete**  
**Date**: December 15, 2025  
**Next Actions**: See Implementation Roadmap (Phase 1-4 above)  
**Session Status**: Ready for review and implementation planning
