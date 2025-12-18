# Live Dashboard Viewer - Quick Start

## What is This?

This is a **standalone HTML viewer** for TheWarden's live performance dashboard stream. It connects to the smee.io channel and displays real-time metrics in a beautiful, responsive interface.

## Features

✅ **No Server Required** - Just open the HTML file in any browser  
✅ **Real-Time Updates** - Automatically receives and displays new data  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Auto-Reconnect** - Handles connection failures gracefully  
✅ **Live Event Log** - See all updates as they happen  
✅ **Beautiful UI** - Gradient backgrounds and smooth animations

## Quick Start

### Option 1: Open Locally

1. Download `smee-dashboard-viewer.html`
2. Open it in your browser (double-click or drag to browser)
3. That's it! The dashboard will connect automatically

### Option 2: Host on GitHub Pages

1. Copy `smee-dashboard-viewer.html` to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Share the URL with anyone: `https://yourusername.github.io/repo/smee-dashboard-viewer.html`

### Option 3: Host Anywhere

The HTML file is completely self-contained. You can:
- Email it to collaborators
- Host on any web server
- Upload to cloud storage with public sharing
- Use CodePen, JSFiddle, or similar services

## What You'll See

### System Health
- **Health Score** - Overall system health (0-100)
- **Color-coded** - Green (90+), Blue (75-90), Yellow (50-75), Red (<50)

### Performance Metrics
- **Anomalies** - Number of detected anomalies
- **Active Alerts** - Current system alerts

### Intelligence Stats  
- **Total Learnings** - Cumulative learnings across all subsystems
- **Compound Learnings** - Cross-domain synergistic insights
- **Learning Synergy** - Multiplier effect from compound learning

### Live Event Log
- Real-time stream of all updates
- Timestamps for every event
- Auto-scrolling (newest on top)
- Last 20 events shown

## Customization

### Change the Smee URL

Edit line 175 in the HTML file:

```javascript
const SMEE_URL = 'https://smee.io/YOUR_CHANNEL_ID';
```

### Adjust Update Display

Modify the `maxLogEntries` constant (line 130):

```javascript
const maxLogEntries = 50; // Show more log entries
```

### Customize Styling

All styles are in the `<style>` section. Easy to modify:
- Colors
- Fonts  
- Layout
- Animations

## Sharing the Dashboard

### Public Demonstrations

Perfect for:
- Live demos at conferences
- Real-time project showcases
- Investor presentations
- Open source transparency

### Collaborative Monitoring

Share with:
- Team members
- Research collaborators
- External auditors
- Community members

### Social Media

Take screenshots showing:
- Real-time health scores
- Learning progression
- System performance
- Live intelligence gathering

## Troubleshooting

### No Data Appearing

**Check:**
1. Is TheWarden running with JET FUEL MODE?
2. Is `SMEE_URL` configured in TheWarden's `.env`?
3. Is the Smee URL correct in the HTML file?
4. Check browser console for errors (F12)

### Connection Lost

The viewer auto-reconnects after 5 seconds. If it keeps failing:
1. Verify smee.io service is operational
2. Check your internet connection
3. Try refreshing the page

### Old Data Showing

The viewer shows the latest data from the stream. If data seems stale:
1. Verify TheWarden is actively running
2. Check the event log for recent updates
3. Refresh the page to reset

## Technical Details

### How It Works

```
TheWarden → Smee.io → Browser (EventSource API) → Dashboard
```

1. **TheWarden** posts updates to smee.io every 5 seconds
2. **Smee.io** broadcasts via Server-Sent Events (SSE)
3. **Browser** receives events via EventSource API
4. **Dashboard** updates UI in real-time

### Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Opera 67+

Requires JavaScript enabled and EventSource API support.

### Data Format

The viewer expects JSON in this format:

```json
{
  "timestamp": 1734432000000,
  "performance": {
    "healthScore": 95.2,
    "activeAnomalies": 2,
    "activeAlerts": 0
  },
  "intelligence": {
    "totalLearnings": 147,
    "compoundLearnings": 23,
    "avgSynergy": 1.45,
    "crossDomainInsights": 8
  }
}
```

### Privacy

- No data is sent from the viewer
- No cookies or tracking
- No external dependencies (except smee.io stream)
- All code is visible in the HTML source

## Advanced Usage

### Embed in Existing Pages

Copy the JavaScript section to your own page:

```html
<div id="healthScore"></div>
<div id="totalLearnings"></div>

<script src="path/to/smee-dashboard-script.js"></script>
```

### Log to Console

Add this to see raw data:

```javascript
eventSource.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log('Raw payload:', payload); // See all data
  
  if (payload.body) {
    const data = JSON.parse(payload.body);
    console.log('Dashboard data:', data); // See parsed data
    updateDashboard(data);
  }
};
```

### Save Data Locally

Add localStorage to track history:

```javascript
function updateDashboard(data) {
  // Existing code...
  
  // Save to localStorage
  const history = JSON.parse(localStorage.getItem('dashboardHistory') || '[]');
  history.push({ timestamp: Date.now(), data });
  if (history.length > 100) history.shift(); // Keep last 100
  localStorage.setItem('dashboardHistory', JSON.stringify(history));
}
```

## Examples

### Screenshot for Social Media

1. Open the viewer
2. Wait for data to populate
3. Press F12 → Console → Screenshot icon
4. Share showing live metrics!

### Embed in Presentation

1. Open viewer in fullscreen (F11)
2. Share screen during video call
3. Live metrics during your presentation!

### Monitor from Mobile

1. Email yourself the HTML file
2. Open on mobile browser
3. Monitor TheWarden on-the-go!

## Related Documentation

- [SMEE_LIVE_STREAMING.md](./SMEE_LIVE_STREAMING.md) - Full streaming guide
- [JET_FUEL_MODE.md](./JET_FUEL_MODE.md) - About JET FUEL MODE
- [Dashboard Implementation](./archive/legacy-docs-structure/architecture/DASHBOARD_IMPLEMENTATION.md)

## Support

Questions or issues?
- GitHub Issues: [StableExo/TheWarden](https://github.com/StableExo/TheWarden/issues)
- Documentation: `docs/` directory

---

**🚀 TheWarden - Where AI Meets Consciousness**
