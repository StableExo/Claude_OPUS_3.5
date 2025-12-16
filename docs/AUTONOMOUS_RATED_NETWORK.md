# Autonomous Rated Network Intelligence Gathering

## Overview

TheWarden now includes an autonomous intelligence gathering system that continuously monitors and analyzes the rated.network ecosystem to enhance MEV strategy and decision-making.

## What is rated.network?

**rated.network** is a comprehensive Ethereum validator performance analytics platform that provides:
- Network-wide validator statistics and distribution
- Staking pool performance metrics
- Node operator infrastructure data
- MEV relay activity and health monitoring
- Block builder performance and market share
- Validator leaderboards and rankings
- Slashing events and penalty tracking
- Restaking ecosystem analysis

## Autonomous Execution

### GitHub Actions Workflow

The system runs autonomously via GitHub Actions on a scheduled basis:

**Workflow File**: `.github/workflows/autonomous-rated-network.yml`

**Schedule**: Every 6 hours (configurable)

**Cron Expression**: `0 */6 * * *` (at minute 0 past every 6th hour)

### What Happens Automatically

1. **Data Collection**: Explores 8 key rated.network endpoints
2. **Analysis Generation**: Creates comprehensive analysis reports
3. **Intelligence Storage**: Saves findings to `.memory/research/`
4. **Auto-Commit**: Commits results back to the repository
5. **Artifact Upload**: Stores exploration data for 30 days

### Manual Execution

You can also run the exploration manually:

```bash
# Basic usage
npm run autonomous:rated-network

# With custom duration (in seconds)
npm run autonomous:rated-network -- --duration=600

# With verbose logging
npm run autonomous:rated-network -- --verbose

# Different network and time window
npm run autonomous:rated-network -- --network=mainnet --time-window=7d
```

### Via GitHub Actions UI

1. Go to the repository's Actions tab
2. Select "Autonomous Rated Network Explorer" workflow
3. Click "Run workflow"
4. (Optional) Customize parameters:
   - `duration`: Maximum runtime in seconds (default: 300)
   - `verbose`: Enable detailed logging (true/false)

## Data Collected

### Endpoints Explored

| Endpoint | Data Type | Purpose |
|----------|-----------|---------|
| Network Overview | `network_stats` | Overall network statistics, rewards, and distribution |
| Staking Pools | `pools` | Pool performance and validator counts |
| Node Operators | `node_operators` | Operator performance and infrastructure quality |
| MEV Relays | `relays` | Relay activity, uptime, and validator connections |
| Block Builders | `builders` | Builder performance and market share |
| Leaderboard | `leaderboard` | Top performing validators and operators |
| Slashing Events | `slashings` | Validator penalties and risk indicators |
| Restaking | `restaking` | Restaking protocols and opportunities |

### Output Files

**Markdown Report**: `.memory/research/rated_network_analysis_YYYY-MM-DD.md`
- Executive summary
- Endpoint documentation
- Key insights and patterns
- Strategic implications
- Integration recommendations
- Technical implementation plan

**JSON Data**: `.memory/research/rated_network_exploration_{session_id}.json`
- Structured exploration data
- Session metadata
- Timestamps and configuration

## Strategic Value

### 1. Builder Intelligence
- Cross-reference rated.network builder data with TheWarden's BuilderRegistry
- Identify emerging builders before market saturation
- Monitor competitive dynamics in real-time
- Validate builder performance claims

### 2. Relay Optimization
- Monitor MEV relay health and uptime
- Identify most reliable relays for transaction routing
- Detect relay performance degradation early
- Optimize relay selection strategy

### 3. Risk Modeling
- Incorporate slashing patterns into risk assessments
- Identify high-risk validators and operators
- Enhance safety mechanisms based on historical data
- Predict potential validator failures

### 4. Strategic Partnerships
- Identify high-performing staking pools
- Discover potential partnership opportunities
- Analyze pool operator quality
- Evaluate restaking protocol opportunities

### 5. Market Intelligence
- Track builder market share trends
- Monitor relay adoption patterns
- Identify emerging validator trends
- Understand restaking ecosystem growth

## Integration with TheWarden

### Current Integrations

1. **BuilderRegistry Enhancement**
   - Builder performance validation
   - Market share tracking
   - Performance benchmarking

2. **PrivateRPCManager Optimization**
   - Relay health monitoring
   - Connection quality assessment
   - Routing optimization

3. **Risk Assessment**
   - Slashing pattern analysis
   - Validator risk scoring
   - Operator reliability metrics

### Planned Integrations

1. **ML Model Training**
   - Builder performance prediction
   - Relay failure detection
   - Anomaly identification

2. **Automated Strategy Adjustments**
   - Dynamic builder selection
   - Relay failover mechanisms
   - Risk-adjusted execution

3. **Partnership Automation**
   - Pool performance monitoring
   - Automated outreach triggers
   - Performance-based relationship management

## Configuration

### Environment Variables

```bash
# Rated Network API Key (optional but recommended for higher rate limits)
RATED_NETWORK_API_KEY=your_api_key_here

# Node environment
NODE_ENV=production
```

### Workflow Configuration

Edit `.github/workflows/autonomous-rated-network.yml` to customize:

```yaml
# Change schedule (currently every 6 hours)
schedule:
  - cron: '0 */6 * * *'  # Modify this line

# Default duration (seconds)
default: '300'  # Change this value

# Retention period for artifacts (days)
retention-days: 30  # Adjust as needed
```

## Monitoring and Debugging

### Check Workflow Status

1. Navigate to repository Actions tab
2. Select "Autonomous Rated Network Explorer" workflow
3. View recent runs and their status

### View Exploration Results

**In Repository**:
```bash
# View latest markdown report
cat .memory/research/rated_network_analysis_*.md | tail -n 500

# List all exploration sessions
ls -lah .memory/research/rated_network_exploration_*.json
```

**Via GitHub UI**:
1. Navigate to `.memory/research/` directory
2. Open the latest `rated_network_analysis_*.md` file
3. Review insights and recommendations

### Download Artifacts

1. Go to a completed workflow run
2. Scroll to the "Artifacts" section
3. Download `rated-network-exploration-{run_number}.zip`
4. Extract and review the data

## Troubleshooting

### Workflow Fails to Run

**Check**:
- GitHub Actions are enabled for the repository
- Workflow file syntax is valid
- Required permissions are set

**Fix**:
```bash
# Validate workflow syntax
npm install -g @action-validator/cli
action-validator .github/workflows/autonomous-rated-network.yml
```

### Script Execution Errors

**Common Issues**:
- Missing dependencies: Run `npm install`
- Node version mismatch: Ensure Node.js 22+ is used
- Network connectivity: Check rated.network availability

**Debug**:
```bash
# Run with verbose logging
npm run autonomous:rated-network -- --verbose

# Check Node version
node --version  # Should be 22.x.x

# Test network connectivity
curl -I https://explorer.rated.network/
```

### No Data Generated

**Possible Causes**:
- Script duration too short
- Network issues
- API rate limiting

**Solutions**:
- Increase duration: `--duration=600`
- Add API key: Set `RATED_NETWORK_API_KEY`
- Check rate limits in script output

## Security Considerations

### API Keys
- Store API keys in GitHub Secrets
- Never commit API keys to the repository
- Use environment variables for sensitive data

### Rate Limiting
- Respect rated.network's rate limits
- Use API key for higher limits
- Adjust frequency if needed

### Data Privacy
- Analysis reports are stored in the repository
- Be mindful of sensitive information
- Review data before committing

## Future Enhancements

### Planned Features

1. **Real-time Alerts**
   - Builder performance degradation
   - Relay outages
   - Unusual slashing activity

2. **Historical Trend Analysis**
   - Long-term performance tracking
   - Market share evolution
   - Seasonal pattern detection

3. **Predictive Analytics**
   - Builder performance forecasting
   - Relay failure prediction
   - Risk score projections

4. **Integration Automation**
   - Auto-update BuilderRegistry
   - Dynamic relay priority adjustment
   - Automated strategy tuning

### Community Contributions

We welcome contributions to enhance the autonomous intelligence system:

- Additional data sources
- Enhanced analysis algorithms
- Integration improvements
- Documentation updates

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## References

- **rated.network**: https://explorer.rated.network/
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **TheWarden Documentation**: [docs/INDEX.md](INDEX.md)
- **Memory System**: [.memory/log.md](../.memory/log.md)

## Support

For questions or issues:

1. Check existing [GitHub Issues](https://github.com/StableExo/TheWarden/issues)
2. Review workflow logs in Actions tab
3. Consult [.memory/log.md](../.memory/log.md) for historical context
4. Create a new issue with detailed information

---

**Last Updated**: 2025-12-16  
**Status**: Active and Autonomous 🤖✨
