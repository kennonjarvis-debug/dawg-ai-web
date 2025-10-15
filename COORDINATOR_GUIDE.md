# Coordinator Guide - Monitoring Multiple Claude Instances

**Your Role**: Oversee 11 parallel Claude Code instances building DAWG AI

---

## 🎯 Quick Start Monitoring

### 1. Real-Time Status Dashboard

**Primary Method**: Watch the `MODULE_STATUS.md` file:

```bash
# Option A: Manual refresh (simple)
watch -n 30 cat MODULE_STATUS.md

# Option B: Git-based monitoring
watch -n 60 'git pull && cat MODULE_STATUS.md | grep -A 3 "Module Status Matrix"'

# Option C: Auto-refresh HTML dashboard (coming up)
python3 monitor.py  # Creates web dashboard at http://localhost:8080
```

---

## 📊 Monitoring Tools

### Tool 1: Status Check Script

Save as `check-status.sh`:

```bash
#!/bin/bash
# check-status.sh - Quick status check for all modules

echo "🎵 DAWG AI - Module Status Check"
echo "=================================="
echo ""

# Count module statuses
NOT_STARTED=$(grep -c "🔴 Not Started" MODULE_STATUS.md)
IN_PROGRESS=$(grep -c "🟡 In Progress" MODULE_STATUS.md)
COMPLETE=$(grep -c "🟢 Complete" MODULE_STATUS.md)
TESTING=$(grep -c "🔵 Testing" MODULE_STATUS.md)
BLOCKED=$(grep -c "⚠️ Blocked" MODULE_STATUS.md)
FAILED=$(grep -c "❌ Failed" MODULE_STATUS.md)

echo "📊 Status Summary:"
echo "  Not Started: $NOT_STARTED"
echo "  In Progress: $IN_PROGRESS"
echo "  Testing:     $TESTING"
echo "  Complete:    $COMPLETE"
echo "  Blocked:     $BLOCKED"
echo "  Failed:      $FAILED"
echo ""

# Calculate progress
TOTAL=11
DONE=$((COMPLETE + TESTING))
PROGRESS=$((DONE * 100 / TOTAL))

echo "📈 Overall Progress: $PROGRESS% ($DONE/$TOTAL modules)"
echo ""

# Show active modules
echo "🔄 Active Modules:"
grep "🟡 In Progress" MODULE_STATUS.md | head -5

echo ""

# Show blockers
BLOCKER_COUNT=$(grep -c "⚠️ Blocked" MODULE_STATUS.md)
if [ $BLOCKER_COUNT -gt 0 ]; then
  echo "⚠️  WARNING: $BLOCKER_COUNT modules blocked!"
  grep "⚠️ Blocked" MODULE_STATUS.md
fi

# Show failed modules
FAILED_COUNT=$(grep -c "❌ Failed" MODULE_STATUS.md)
if [ $FAILED_COUNT -gt 0 ]; then
  echo "❌ ERROR: $FAILED_COUNT modules failed!"
  grep "❌ Failed" MODULE_STATUS.md
fi

echo ""
echo "Last check: $(date)"
```

Make it executable:
```bash
chmod +x check-status.sh
./check-status.sh
```

---

### Tool 2: Real-Time Git Activity Monitor

```bash
#!/bin/bash
# watch-commits.sh - Monitor git activity from all modules

echo "Watching git commits from all modules..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
  git fetch --all 2>/dev/null

  # Show recent commits from all branches
  git log --all --oneline --graph --decorate -10

  sleep 30
  clear
done
```

---

### Tool 3: Module Health Check

```bash
#!/bin/bash
# health-check.sh - Check each module worktree

echo "🏥 Module Health Check"
echo "====================="
echo ""

MODULES=(
  "dawg-module-1:Design System"
  "dawg-module-2:Audio Engine"
  "dawg-module-3:Track Manager"
  "dawg-module-4:MIDI Editor"
  "dawg-module-5:Effects"
  "dawg-module-6:Voice Interface"
  "dawg-module-7:Beat Generator"
  "dawg-module-8:Vocal Coach"
  "dawg-module-9:Mixing/Mastering"
  "dawg-module-10:Backend"
  "dawg-module-11:Integration"
)

for module in "${MODULES[@]}"; do
  DIR="../${module%%:*}"
  NAME="${module##*:}"

  if [ -d "$DIR" ]; then
    cd "$DIR"

    # Check for recent activity
    LAST_COMMIT=$(git log -1 --format="%ar" 2>/dev/null || echo "never")
    FILES_CHANGED=$(git status --short | wc -l)

    if [ "$LAST_COMMIT" = "never" ]; then
      STATUS="⚪ Not Started"
    elif [[ "$LAST_COMMIT" == *"minute"* ]] || [[ "$LAST_COMMIT" == *"hour"* ]]; then
      STATUS="🟢 Active"
    else
      STATUS="🟡 Idle"
    fi

    echo "$STATUS | $NAME | Last commit: $LAST_COMMIT | Changes: $FILES_CHANGED"
    cd - > /dev/null
  else
    echo "⚫ Not Created | $NAME | Worktree not found"
  fi
done

echo ""
echo "Last check: $(date)"
```

---

## 🎛️ Web Dashboard (Advanced)

### Setup Python Dashboard

Create `monitor.py`:

```python
#!/usr/bin/env python3
"""
DAWG AI Module Monitor Dashboard
Live web dashboard for monitoring all Claude instances
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import re
from datetime import datetime
import threading
import time

class ModuleStatus:
    def __init__(self):
        self.modules = {}
        self.load_status()

    def load_status(self):
        """Parse MODULE_STATUS.md"""
        try:
            with open('MODULE_STATUS.md', 'r') as f:
                content = f.read()

            # Parse module statuses
            pattern = r'\| (\d+) \| (.+?) \| (🔴|🟡|🟢|🔵|⚠️|❌) (.+?) \| (\d+)%'
            matches = re.findall(pattern, content)

            for match in matches:
                module_num, name, status, status_text, progress = match
                self.modules[module_num] = {
                    'name': name.strip(),
                    'status': status,
                    'status_text': status_text.strip(),
                    'progress': int(progress)
                }
        except Exception as e:
            print(f"Error loading status: {e}")

    def to_json(self):
        return json.dumps({
            'modules': self.modules,
            'updated': datetime.now().isoformat()
        })

class DashboardHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/status':
            status = ModuleStatus()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(status.to_json().encode())
        elif self.path == '/' or self.path == '/index.html':
            self.serve_dashboard()
        else:
            super().do_GET()

    def serve_dashboard(self):
        html = """
<!DOCTYPE html>
<html>
<head>
    <title>DAWG AI - Module Monitor</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #00d9ff;
            text-align: center;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .module-card {
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s;
        }
        .module-card:hover {
            border-color: #00d9ff;
            transform: translateY(-5px);
        }
        .module-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .module-name {
            font-size: 18px;
            font-weight: 600;
        }
        .status-indicator {
            font-size: 24px;
        }
        .progress-bar {
            height: 8px;
            background: #333;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d9ff, #ff006e);
            transition: width 0.5s;
        }
        .progress-text {
            font-size: 12px;
            color: #888;
        }
        .last-update {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a1a1a;
            padding: 10px 20px;
            border-radius: 8px;
            border: 1px solid #333;
        }
        .summary {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        .summary-card {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #333;
            min-width: 150px;
            text-align: center;
        }
        .summary-value {
            font-size: 32px;
            font-weight: bold;
            color: #00d9ff;
        }
        .summary-label {
            font-size: 14px;
            color: #888;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 DAWG AI Module Monitor</h1>

        <div class="last-update">
            Last update: <span id="last-update">Loading...</span>
        </div>

        <div class="summary" id="summary"></div>

        <div class="grid" id="modules"></div>
    </div>

    <script>
        async function updateDashboard() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();

                document.getElementById('last-update').textContent =
                    new Date(data.updated).toLocaleTimeString();

                // Update summary
                const modules = Object.values(data.modules);
                const completed = modules.filter(m => m.status === '🟢').length;
                const inProgress = modules.filter(m => m.status === '🟡').length;
                const blocked = modules.filter(m => m.status === '⚠️').length;

                document.getElementById('summary').innerHTML = `
                    <div class="summary-card">
                        <div class="summary-value">${completed}</div>
                        <div class="summary-label">Completed</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${inProgress}</div>
                        <div class="summary-label">In Progress</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${blocked}</div>
                        <div class="summary-label">Blocked</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${Math.round(completed / modules.length * 100)}%</div>
                        <div class="summary-label">Overall Progress</div>
                    </div>
                `;

                // Update module cards
                const modulesDiv = document.getElementById('modules');
                modulesDiv.innerHTML = '';

                Object.entries(data.modules).forEach(([num, module]) => {
                    const card = document.createElement('div');
                    card.className = 'module-card';
                    card.innerHTML = `
                        <div class="module-header">
                            <div class="module-name">Module ${num}: ${module.name}</div>
                            <div class="status-indicator">${module.status}</div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${module.progress}%"></div>
                        </div>
                        <div class="progress-text">${module.progress}% • ${module.status_text}</div>
                    `;
                    modulesDiv.appendChild(card);
                });
            } catch (error) {
                console.error('Error updating dashboard:', error);
            }
        }

        // Update every 30 seconds
        updateDashboard();
        setInterval(updateDashboard, 30000);
    </script>
</body>
</html>
        """
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(html.encode())

def run_server():
    server = HTTPServer(('localhost', 8080), DashboardHandler)
    print('🎛️  Dashboard running at http://localhost:8080')
    print('Press Ctrl+C to stop')
    server.serve_forever()

if __name__ == '__main__':
    run_server()
```

**Run it:**
```bash
chmod +x monitor.py
python3 monitor.py
# Open http://localhost:8080 in your browser
```

---

## 📞 Communication Channels

### 1. MODULE_STATUS.md (Primary)
- **What**: Single source of truth
- **Update**: Every 2-4 hours by each Claude instance
- **View**: `cat MODULE_STATUS.md` or web dashboard

### 2. Git Commits (Secondary)
- **What**: Track actual code progress
- **Format**: `"Module X: [milestone] - [brief description]"`
- **View**: `git log --all --oneline --graph`

### 3. Issue Tracking (For Blockers)
- **What**: Document blockers and conflicts
- **Location**: Add to "Active Issues" in MODULE_STATUS.md
- **Format**:
  ```
  **Issue #1**: Module 3 blocked - AudioEngine interface mismatch
  - Reporter: Claude Instance #3
  - Affected: Module 3
  - Severity: High
  - Status: Investigating
  ```

---

## 🚦 Daily Coordinator Checklist

### Morning (Start of Day)
- [ ] Pull latest MODULE_STATUS.md: `git pull`
- [ ] Run health check: `./health-check.sh`
- [ ] Check for blocked modules (🔴 or ⚠️)
- [ ] Review overnight progress
- [ ] Identify modules ready to start

### Midday
- [ ] Pull latest status: `git pull`
- [ ] Check active modules making progress
- [ ] Review any new issues
- [ ] Verify dependencies are being met

### Evening (End of Day)
- [ ] Final status pull: `git pull`
- [ ] Calculate daily velocity (modules completed/started)
- [ ] Plan tomorrow's launches
- [ ] Document any coordination needed

---

## 🎯 Module Launch Protocol

When starting a new module:

1. **Check Dependencies**:
   ```bash
   # Check if dependencies are ready
   grep "Module 2.*🟢 Complete" MODULE_STATUS.md
   ```

2. **Create Worktree**:
   ```bash
   git worktree add ../dawg-module-X module-X
   ```

3. **Open Claude Code**:
   ```bash
   cd ../dawg-module-X
   code .  # or open in Claude Code
   ```

4. **Provide Context**:
   - Copy relevant prompt from `CLAUDE_MODULE_PROMPTS.md`
   - Reference `API_CONTRACTS.md`
   - Note any special requirements

5. **Initial Status Update**:
   - Claude instance updates MODULE_STATUS.md
   - Sets status to 🟡 In Progress
   - Records first heartbeat

---

## ⚠️ Handling Issues

### Blocker Detected
```bash
# 1. Document in MODULE_STATUS.md
# Add to Active Issues section

# 2. Notify affected modules
# Update their "Dependencies Met" status

# 3. Coordinate resolution
# May need to pause dependent modules
```

### Module Falling Behind
```bash
# 1. Check last heartbeat in MODULE_STATUS.md
# If > 8 hours, investigate

# 2. Check worktree for activity
cd ../dawg-module-X
git log -5

# 3. May need to restart Claude instance
```

### Integration Conflicts
```bash
# 1. Create integration branch
git checkout -b integration-fix-moduleX-Y

# 2. Document conflict in MODULE_STATUS.md

# 3. Coordinate between affected modules

# 4. Update API_CONTRACTS.md if needed
```

---

## 📊 Progress Metrics

Track these weekly:

| Metric | Formula | Target |
|--------|---------|--------|
| Completion Rate | Completed modules / Total | 100% by Week 8 |
| Velocity | Modules completed / Week | 1.4/week |
| Blocker Ratio | Blocked modules / Active | <10% |
| Integration Health | Dependencies met / Total | >90% |

---

## 🎬 Quick Start Commands

```bash
# 1. Setup monitoring
chmod +x *.sh
./health-check.sh

# 2. Start web dashboard
python3 monitor.py &

# 3. Watch status in terminal
watch -n 30 ./check-status.sh

# 4. Monitor git activity
./watch-commits.sh
```

---

## 🆘 Emergency Procedures

### All Modules Blocked
1. Review API_CONTRACTS.md for conflicts
2. Call sync meeting of all blocked modules
3. May need to update contracts
4. Restart affected modules with updated contracts

### Critical Bug in Foundation Module
1. Pause all dependent modules immediately
2. Focus all resources on fixing foundation
3. Update MODULE_STATUS.md with pause status
4. Resume dependents once fix is verified

### Timeline at Risk
1. Calculate remaining weeks vs remaining modules
2. Consider increasing parallelism
3. Identify modules that can be simplified
4. May need to defer non-critical features

---

## 📚 Reference Files

- `CLAUDE_MODULE_PROMPTS.md` - Module implementation guides
- `API_CONTRACTS.md` - Interface specifications
- `MODULE_STATUS.md` - Real-time status (update this!)
- `COORDINATOR_GUIDE.md` - This file

---

**As coordinator, your job is to:**
✅ Monitor progress daily
✅ Unblock stuck modules
✅ Coordinate integration points
✅ Maintain API contracts
✅ Ensure timeline adherence
✅ Communicate issues early

*Your success = All 11 modules integrate perfectly!*
