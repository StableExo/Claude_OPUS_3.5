# Self-Hosted SSE Server - Complete Control, Zero Cost 🚀

## Overview

The Self-Hosted Server-Sent Events (SSE) server provides **complete control** over TheWarden's performance dashboard streaming without relying on external services like smee.io. This is the production-ready solution for autonomous operation.

## Why Self-Hosted SSE?

### Advantages

✅ **Zero Cost** - No subscription fees, no API limits  
✅ **Complete Control** - Full ownership of infrastructure  
✅ **No External Dependencies** - No reliance on third-party services  
✅ **Privacy** - All data stays on your infrastructure  
✅ **Unlimited Clients** - Scale to thousands of connections  
✅ **Low Latency** - Direct streaming, no intermediate relay  
✅ **Customizable** - Modify behavior as needed  
✅ **Auto-Reconnection** - Built into SSE protocol  
✅ **Production Ready** - Battle-tested technology  

### When to Use

- **Production deployments**
- **When you want full control**
- **For privacy-sensitive data**
- **When scaling to many clients**
- **For 24/7 autonomous operation**

## Quick Start

### 1. Enable in Configuration

```bash
# .env
ENABLE_SSE_SERVER=true
SSE_PORT=3001
```

### 2. Run JET FUEL MODE

```bash
npm run jet-fuel
```

The SSE server starts automatically alongside the dashboard!

### 3. Connect Clients

```javascript
// Browser/Node.js client
const eventSource = new EventSource('http://localhost:3001/stream/dashboard');

eventSource.addEventListener('dashboard-update', (event) => {
  const data = JSON.parse(event.data);
  console.log('Dashboard update:', data);
  console.log('Health Score:', data.performance.healthScore);
  console.log('Total Learnings:', data.intelligence.totalLearnings);
});

eventSource.onerror = (error) => {
  console.error('Connection error:', error);
  // EventSource auto-reconnects!
};
```

## Architecture

```
┌─────────────────────┐
│  JET FUEL MODE      │
│  Dashboard Server   │
│  (Port 3000)        │
└──────────┬──────────┘
           │
           │ Shared PerformanceMonitor
           │ & IntelligenceBridge
           ▼
┌─────────────────────┐
│ Self-Hosted SSE     │
│ Server (Port 3001)  │
└──────────┬──────────┘
           │
           │ Server-Sent Events
           │ (HTTP/1.1 Persistent Connection)
           ▼
┌─────────────────────┐
│  Multiple Clients   │
│  (Browsers, Apps)   │
└─────────────────────┘
```

## API Endpoints

### Streaming Endpoint

**GET** `/stream/dashboard`

Opens an SSE connection for real-time updates.

**Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Format:**
```
id: 123
event: dashboard-update
data: {"timestamp":1734...,"performance":{...},"intelligence":{...}}

```

---

### REST API Endpoint

**GET** `/api/dashboard`

Get current dashboard data (one-time request).

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": 1734432000000,
    "performance": {
      "healthScore": 95.2,
      "activeAnomalies": 2,
      "activeAlerts": 0,
      "subsystems": { ... }
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
  },
  "timestamp": 1734432000000
}
```

---

### Status Endpoint

**GET** `/api/status`

Get server health and connection count.

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "connectedClients": 5,
    "eventsSent": 1247,
    "uptime": 86400
  }
}
```

---

### Health Check

**GET** `/health`

Simple health check for monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1734432000000
}
```

---

## Configuration

### Environment Variables

```bash
# Enable/disable SSE server
ENABLE_SSE_SERVER=true

# Server port (default: 3001)
SSE_PORT=3001

# CORS origin (default: *)
# Set to specific domain in production
SSE_CORS_ORIGIN=*

# Update interval in milliseconds (default: 5000)
SSE_UPDATE_INTERVAL=5000

# Enable data sanitization (default: true)
SSE_SANITIZE_DATA=true

# Enable logging (default: true)
SSE_ENABLE_LOGGING=true
```

### Programmatic Configuration

```typescript
import { SelfHostedSSEService } from './src/streaming/SelfHostedSSEService';

const sseService = new SelfHostedSSEService(
  {
    port: 3001,
    enableLogging: true,
    sanitizeData: true,
    updateIntervalMs: 5000,
    corsOrigin: '*', // or 'https://yourdomain.com'
  },
  performanceMonitor,
  intelligenceBridge
);

await sseService.start();
```

## Client Examples

### Browser (Vanilla JS)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Warden Dashboard</title>
</head>
<body>
  <h1>TheWarden Live Metrics</h1>
  <div id="health">Loading...</div>
  <div id="learnings">Loading...</div>
  
  <script>
    const sse = new EventSource('http://localhost:3001/stream/dashboard');
    
    sse.addEventListener('dashboard-update', (event) => {
      const data = JSON.parse(event.data);
      document.getElementById('health').textContent = 
        `Health: ${data.performance.healthScore.toFixed(1)}`;
      document.getElementById('learnings').textContent = 
        `Learnings: ${data.intelligence.totalLearnings}`;
    });
    
    sse.onerror = () => {
      document.getElementById('health').textContent = 'Disconnected (reconnecting...)';
    };
  </script>
</body>
</html>
```

### React Hook

```typescript
import { useEffect, useState } from 'react';

interface DashboardData {
  performance: { healthScore: number; };
  intelligence: { totalLearnings: number; };
}

export function useDashboardStream(url: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.addEventListener('dashboard-update', (event) => {
      const parsed = JSON.parse(event.data);
      setData(parsed);
      setConnected(true);
    });

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => eventSource.close();
  }, [url]);

  return { data, connected };
}

// Usage
function Dashboard() {
  const { data, connected } = useDashboardStream('http://localhost:3001/stream/dashboard');
  
  return (
    <div>
      <div>Status: {connected ? 'Live' : 'Connecting...'}</div>
      {data && (
        <>
          <div>Health: {data.performance.healthScore}</div>
          <div>Learnings: {data.intelligence.totalLearnings}</div>
        </>
      )}
    </div>
  );
}
```

### Node.js Client

```javascript
import EventSource from 'eventsource';

const sse = new EventSource('http://localhost:3001/stream/dashboard');

sse.addEventListener('dashboard-update', (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
});

sse.onerror = (error) => {
  console.error('Error:', error);
};
```

### Python Client

```python
import sseclient
import requests
import json

url = 'http://localhost:3001/stream/dashboard'
response = requests.get(url, stream=True)
client = sseclient.SSEClient(response)

for event in client.events():
    if event.event == 'dashboard-update':
        data = json.loads(event.data)
        print(f"Health: {data['performance']['healthScore']}")
        print(f"Learnings: {data['intelligence']['totalLearnings']}")
```

## Production Deployment

### With Reverse Proxy (Recommended)

#### Nginx Configuration

```nginx
upstream sse_server {
    server localhost:3001;
}

server {
    listen 80;
    server_name dashboard.yourwardeninstance.com;

    location /stream/ {
        proxy_pass http://sse_server/stream/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_cache off;
        
        # SSE specific
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    location /api/ {
        proxy_pass http://sse_server/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Caddy Configuration

```
dashboard.yourwardeninstance.com {
    reverse_proxy /stream/* localhost:3001 {
        flush_interval -1
    }
    reverse_proxy /api/* localhost:3001
}
```

### With HTTPS (Let's Encrypt)

```bash
# Using Caddy (automatic HTTPS)
caddy reverse-proxy --from dashboard.yourwardeninstance.com --to localhost:3001

# Using Certbot + Nginx
sudo certbot --nginx -d dashboard.yourwardeninstance.com
```

### Docker Deployment

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3001

CMD ["node", "--import", "tsx", "scripts/autonomous/autonomous-jet-fuel-mode.ts"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  warden-sse:
    build: .
    ports:
      - "3001:3001"
    environment:
      - ENABLE_SSE_SERVER=true
      - SSE_PORT=3001
    restart: unless-stopped
```

### PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "warden-sse" -- run jet-fuel

# Save config
pm2 save

# Auto-start on reboot
pm2 startup
```

## Testing

### Test the Server

```bash
# Run test script
npm run test:sse

# Output:
# 🧪 Testing Self-Hosted SSE Server
# 📊 Generating mock performance data...
# 🧠 Generating mock intelligence data...
# 🌐 Creating Self-Hosted SSE service...
# 🚀 Self-Hosted SSE Server Started
# 📡 Streaming URL: http://localhost:3001/stream/dashboard
# ...
```

### Curl Test

```bash
# Test SSE stream (will stay open)
curl -N http://localhost:3001/stream/dashboard

# Test REST API
curl http://localhost:3001/api/dashboard | jq

# Test status
curl http://localhost:3001/api/status | jq

# Test health
curl http://localhost:3001/health
```

## Monitoring & Observability

### Metrics to Track

- Connected clients count
- Events sent per second
- Connection duration
- Error rate
- Bandwidth usage

### Integration with Grafana

```javascript
// Add Prometheus metrics
import prometheus from 'prom-client';

const clientsGauge = new prometheus.Gauge({
  name: 'sse_connected_clients',
  help: 'Number of connected SSE clients'
});

const eventsCounter = new prometheus.Counter({
  name: 'sse_events_sent_total',
  help: 'Total SSE events sent'
});

// Update in broadcast method
clientsGauge.set(this.clients.size);
eventsCounter.inc();
```

## Troubleshooting

### No Data Received

**Check:**
1. Server running? `curl http://localhost:3001/health`
2. Port accessible? `telnet localhost 3001`
3. Firewall blocking? `sudo ufw status`
4. CORS issues? Check browser console

### Connection Drops

**Solutions:**
1. Increase timeout: `SSE_UPDATE_INTERVAL=10000`
2. Add keep-alive comments in broadcast
3. Check reverse proxy buffering settings
4. Monitor server resources

### High Memory Usage

**Solutions:**
1. Limit connected clients
2. Clean up disconnected clients more frequently
3. Reduce update frequency
4. Monitor with `process.memoryUsage()`

## Security

### Best Practices

1. **Use HTTPS in production**
2. **Restrict CORS origins**: Set `SSE_CORS_ORIGIN=https://yourdomain.com`
3. **Rate limiting**: Limit connections per IP
4. **Authentication**: Add token-based auth for sensitive data
5. **Sanitization**: Keep `SSE_SANITIZE_DATA=true`

### Adding Authentication

```typescript
// In setupRoutes()
this.app.get('/stream/dashboard', authenticate, (req, res) => {
  this.handleSSEConnection(req, res);
});

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (isValidToken(token)) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

## Performance

### Scalability

- **Vertical**: Single server can handle 10,000+ connections
- **Horizontal**: Use Redis pub/sub for multi-server setup

### Optimization Tips

1. Use connection pooling
2. Compress data with gzip
3. Batch updates if needed
4. Use CDN for static assets
5. Monitor and tune Node.js memory

## Comparison with Alternatives

| Feature | Self-Hosted SSE | Smee.io | Socket.IO |
|---------|----------------|---------|-----------|
| Cost | Free | Free | Free (self-host) |
| Control | Full | Limited | Full |
| Setup | Medium | Easy | Medium |
| Dependencies | None | External | None |
| Scalability | Excellent | Limited | Excellent |
| Bidirectional | No | No | Yes |
| Production Ready | ✅ | ⚠️ | ✅ |

## Next Steps

1. **Deploy to production** with HTTPS
2. **Add authentication** for sensitive endpoints
3. **Set up monitoring** with Grafana
4. **Configure reverse proxy** for better performance
5. **Scale horizontally** if needed

---

**Built with 🤖 by TheWarden - Complete Control, Zero Cost, Maximum Autonomy**

*See also:*
- [Live Streaming Alternatives](./LIVE_STREAMING_ALTERNATIVES.md)
- [Smee.io Guide](./SMEE_LIVE_STREAMING.md)
- [JET FUEL MODE](./JET_FUEL_MODE.md)
