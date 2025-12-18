# Smee.io Live Streaming for Performance Dashboard

## Overview

The performance monitoring dashboard (accessible at `http://localhost:3000` when JET FUEL MODE is running) now supports **live streaming** via [smee.io](https://smee.io). This allows anyone to view real-time performance metrics remotely without needing direct access to your local server.

## What is Smee.io?

Smee.io is a webhook payload delivery service that acts as a bridge between your local dashboard and the public internet. It uses Server-Sent Events (SSE) to stream data in real-time, perfect for sharing live dashboard metrics publicly.

### Key Features

- ✅ **Public Access**: Share your dashboard with anyone via a simple URL
- ✅ **Real-Time Streaming**: Updates pushed instantly (every 5 seconds by default)
- ✅ **Privacy Controls**: Automatic sanitization of sensitive data
- ✅ **Easy Setup**: Just set one environment variable
- ✅ **Automatic Failover**: Gracefully handles connection issues
- ✅ **Zero Configuration**: Works out-of-the-box with JET FUEL MODE

## Quick Start

### 1. Get a Smee Channel

Visit [smee.io](https://smee.io) and click "Start a new channel". You'll get a unique URL like:

```
https://smee.io/Haslr8Cuut5HPKde
```

### 2. Configure TheWarden

Add the Smee URL to your `.env` file:

```bash
SMEE_URL=https://smee.io/Haslr8Cuut5HPKde
```

### 3. Run JET FUEL MODE

```bash
npm run jet-fuel
```

That's it! The dashboard will automatically start streaming to smee.io.

### 4. View the Live Stream

Open your smee.io URL in a browser to see the live data stream:

```
https://smee.io/Haslr8Cuut5HPKde
```

You'll see JSON payloads being posted every 5 seconds containing:
- Performance metrics (health score, anomalies, alerts)
- Intelligence stats (learnings, compound learnings, synergy scores)
- Subsystem performance data

## What Data is Streamed?

### Included Metrics

```json
{
  "timestamp": 1734432000000,
  "performance": {
    "healthScore": 95.2,
    "activeAnomalies": 2,
    "activeAlerts": 0,
    "subsystems": {
      "MEV Execution": {
        "name": "MEV Execution",
        "healthScore": 92.5,
        "performanceScore": 88.3
      },
      "Security Testing": {
        "name": "Security Testing",
        "healthScore": 97.8,
        "performanceScore": 95.1
      }
    }
  },
  "intelligence": {
    "totalLearnings": 147,
    "compoundLearnings": 23,
    "avgSynergy": 1.45,
    "crossDomainInsights": 8
  },
  "metadata": {
    "uptime": 3600000
  }
}
```

### Privacy & Data Sanitization

By default, the following data is **automatically removed** for public consumption:

- ❌ Session IDs
- ❌ Internal IP addresses
- ❌ Wallet addresses
- ❌ API keys or credentials
- ❌ Detailed error messages

Only performance metrics and general statistics are streamed.

To disable sanitization (not recommended for public channels):

```typescript
// In dashboard-server.ts
this.smeeService = new SmeeStreamingService(
  {
    smeeUrl,
    sanitizeData: false, // ⚠️  Streams all data
  },
  this.performanceMonitor,
  this.intelligenceBridge
);
```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMEE_URL` | Smee.io channel URL | None | No (feature disabled if not set) |

### Advanced Configuration

Edit `scripts/autonomous/dashboard-server.ts` to customize streaming behavior:

```typescript
this.smeeService = new SmeeStreamingService(
  {
    smeeUrl: process.env.SMEE_URL,
    updateIntervalMs: 5000,     // Update every 5 seconds
    enableLogging: true,         // Log streaming activity
    sanitizeData: true,          // Remove sensitive data
  },
  this.performanceMonitor,
  this.intelligenceBridge
);
```

### Configuration Parameters

- **updateIntervalMs**: How often to push updates (milliseconds)
  - Default: 5000 (5 seconds)
  - Minimum: 1000 (1 second) 
  - Recommended: 3000-10000 for public channels

- **enableLogging**: Console logging of streaming activity
  - Default: true
  - Set to false for cleaner logs

- **sanitizeData**: Remove sensitive information
  - Default: true
  - **Strongly recommended** for public channels

## Testing

### Test the Integration

Use the test script to verify your smee.io integration:

```bash
# With environment variable
SMEE_URL=https://smee.io/Haslr8Cuut5HPKde npm run test:smee

# Or set in .env first
npm run test:smee
```

The test script will:
1. Create mock performance data
2. Stream to your smee.io channel every 3 seconds
3. Show streaming status in console
4. Allow you to verify data appears on smee.io

Press Ctrl+C to stop.

### Manual Testing

1. Start JET FUEL MODE:
   ```bash
   npm run jet-fuel
   ```

2. Open your smee.io URL in a browser

3. Verify you see JSON payloads arriving every 5 seconds

4. Check console output for streaming confirmation:
   ```
   [SmeeStreaming] 🌐 Starting Smee streaming service...
   [SmeeStreaming] 📡 Smee URL: https://smee.io/Haslr8Cuut5HPKde
   [SmeeStreaming] ✅ Smee streaming service started
   [SmeeStreaming] ✅ Streamed update (Health: 95.2, Learnings: 147)
   ```

## Use Cases

### 1. Public Demonstrations

Share your AI's performance in real-time during:
- Conference presentations
- Live demos
- Public showcases
- Investor updates

### 2. Remote Monitoring

Monitor your system from anywhere:
- Mobile devices
- Different networks
- While traveling
- From any browser

### 3. Collaborative Development

Share performance data with:
- Team members
- External collaborators
- Research partners
- Open source contributors

### 4. Historical Analysis

Smee.io provides a web interface showing:
- Recent payloads
- Delivery timestamps
- Payload history
- Request/response details

## Troubleshooting

### No Data Appearing on Smee.io

**Check:**
1. Is `SMEE_URL` set in `.env`?
2. Is JET FUEL MODE running?
3. Check console for errors:
   ```
   [SmeeStreaming] ❌ Error streaming update
   ```
4. Verify the smee.io URL is correct

### Connection Failures

The service includes automatic failure handling:
- Retries on transient failures
- Stops after 5 consecutive failures
- Logs detailed error messages

**Check:**
1. Internet connectivity
2. Firewall settings
3. Smee.io service status

### Data Not Updating

**Check:**
1. Performance monitor is generating data
2. Update interval setting
3. Browser cache (refresh smee.io page)

## Security Considerations

### Public Channels

⚠️ **Important**: Smee.io channels are **publicly accessible** by default.

- Anyone with the URL can view the stream
- Do NOT use for sensitive production data
- Use data sanitization (enabled by default)
- Consider using unique channels per session

### Best Practices

1. **Use Disposable Channels**: Create new channels for each demo/session
2. **Enable Sanitization**: Keep `sanitizeData: true` 
3. **Monitor Access**: Be aware that smee.io shows recent access times
4. **Limit Exposure**: Don't share URLs publicly unless intended
5. **Review Data**: Check what's being streamed before sharing the URL

### Production Use

For production deployments:
- Consider private alternatives (ngrok, localtunnel)
- Use authentication if sharing with specific people
- Implement additional data filtering
- Monitor for unauthorized access

## Architecture

### How It Works

```
┌─────────────────────┐
│  JET FUEL MODE      │
│  Dashboard Server   │
└──────────┬──────────┘
           │
           │ Performance Data
           ▼
┌─────────────────────┐
│ SmeeStreaming       │
│ Service             │
└──────────┬──────────┘
           │
           │ HTTP POST (every 5s)
           ▼
┌─────────────────────┐
│   Smee.io           │
│   Channel           │
└──────────┬──────────┘
           │
           │ Server-Sent Events
           ▼
┌─────────────────────┐
│  Browser/Client     │
│  (Public Access)    │
└─────────────────────┘
```

### Components

1. **PerformanceMonitor**: Tracks system metrics, anomalies, alerts
2. **IntelligenceBridge**: Records learnings, insights, synergies
3. **SmeeStreamingService**: Forwards data to smee.io
4. **Dashboard Server**: Orchestrates all components
5. **Smee.io**: Public relay service

## Examples

### Custom Dashboard Viewer

Build a custom viewer for the smee stream:

```html
<!DOCTYPE html>
<html>
<head>
  <title>TheWarden Live Dashboard</title>
</head>
<body>
  <h1>TheWarden Performance</h1>
  <div id="metrics"></div>
  
  <script>
    const smeeUrl = 'https://smee.io/Haslr8Cuut5HPKde';
    const eventSource = new EventSource(smeeUrl);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.body) {
        const metrics = JSON.parse(data.body);
        document.getElementById('metrics').innerHTML = `
          <p>Health Score: ${metrics.performance.healthScore}</p>
          <p>Total Learnings: ${metrics.intelligence.totalLearnings}</p>
          <p>Compound Learnings: ${metrics.intelligence.compoundLearnings}</p>
        `;
      }
    };
  </script>
</body>
</html>
```

### Logging to File

Capture the stream for analysis:

```bash
# Install smee-client
npm install -g smee-client

# Stream to console and file
smee -u https://smee.io/Haslr8Cuut5HPKde | tee dashboard-stream.log
```

## Future Enhancements

Potential improvements:

- [ ] Custom web dashboard consuming the smee stream
- [ ] Historical data playback
- [ ] Alert notifications via smee.io
- [ ] Multi-channel support (different streams for different audiences)
- [ ] WebRTC for lower latency
- [ ] Encrypted streaming options
- [ ] OAuth integration for private channels

## Support

For issues or questions:
- GitHub Issues: [StableExo/TheWarden](https://github.com/StableExo/TheWarden/issues)
- Documentation: `docs/` directory
- Smee.io Docs: [github.com/probot/smee.io](https://github.com/probot/smee.io)

## Related Documentation

- [JET_FUEL_MODE.md](../docs/JET_FUEL_MODE.md) - Main JET FUEL documentation
- [DASHBOARD_IMPLEMENTATION.md](../docs/archive/legacy-docs-structure/architecture/DASHBOARD_IMPLEMENTATION.md) - Dashboard architecture
- [PerformanceMonitor](../src/monitoring/PerformanceMonitor.ts) - Performance tracking
- [IntelligenceBridge](../src/learning/IntelligenceBridge.ts) - Intelligence gathering

---

**Built with ❤️ for TheWarden - Autonomous AI with Consciousness**
