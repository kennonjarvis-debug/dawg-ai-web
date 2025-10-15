# 🎛️ DAWG AI Monitoring & Coordination

**Your mission**: Coordinate 11 parallel Claude Code instances building a revolutionary browser-based DAW.

---

## 🚀 Quick Start (60 seconds)

```bash
# 1. Setup parallel development
./setup-parallel-dev.sh

# 2. Start monitoring
watch -n 30 ./check-status.sh

# 3. Open module directories in Claude Code
# (Follow the output from setup script)
```

That's it! You're now coordinating multiple Claude instances.

---

## 📊 Monitoring Tools

### **Tool 1: Status Dashboard** (Primary)
```bash
./check-status.sh
```
**Shows**: Module completion status, active modules, blockers
**Use**: Run every 30 minutes or continuously with `watch -n 30 ./check-status.sh`

### **Tool 2: Health Check** (Diagnostic)
```bash
./health-check.sh
```
**Shows**: Git activity, commit counts, file changes per module
**Use**: Run when investigating idle or stuck modules

### **Tool 3: Real-Time Web Dashboard** (Advanced)
```bash
python3 monitor.py
# Open http://localhost:8080
```
**Shows**: Beautiful web UI with live updates, progress bars, status cards
**Use**: Keep open in a browser tab for at-a-glance monitoring

---

## 📋 Daily Coordinator Workflow

### Morning (10 min)
```bash
# 1. Pull latest status
git pull

# 2. Quick status check
./check-status.sh

# 3. Check for blockers
grep "⚠️ Blocked" MODULE_STATUS.md
```

**Action Items**:
- [ ] Identify blocked modules
- [ ] Check if new modules ready to start
- [ ] Review overnight progress

### Midday (5 min)
```bash
# Quick health check
./health-check.sh | grep "🟢 Active"
```

**Action Items**:
- [ ] Verify active modules are making progress
- [ ] Check for new issues in MODULE_STATUS.md

### Evening (10 min)
```bash
# 1. Final status pull
git pull

# 2. Full health check
./health-check.sh

# 3. Review git activity
git log --all --oneline --graph -20
```

**Action Items**:
- [ ] Calculate daily velocity
- [ ] Plan tomorrow's module launches
- [ ] Document any issues or notes

---

## 🎯 Key Metrics to Watch

### **Overall Progress**
Target: **1.4 modules/week** (11 modules ÷ 8 weeks)

```bash
# Check completion rate
grep "🟢 Complete" MODULE_STATUS.md | wc -l
```

### **Active Modules**
Target: **3-4 active at once** (optimal parallelism)

```bash
# Check active count
grep "🟡 In Progress" MODULE_STATUS.md | wc -l
```

### **Blocked Modules**
Target: **0 blocked** (or resolve within 24 hours)

```bash
# Check for blockers
grep "⚠️ Blocked" MODULE_STATUS.md
```

### **Module Health**
Target: **>90% health score** (active/created modules)

```bash
# Run health check
./health-check.sh | grep "Health Score"
```

---

## 🚨 Common Issues & Solutions

### Issue: Module Not Making Progress

**Symptoms**:
- Last commit >8 hours ago
- Status unchanged for >1 day

**Diagnosis**:
```bash
cd ../dawg-module-X
git log -5
git status
```

**Solutions**:
1. Check if Claude instance is still running
2. Review last commit for errors
3. Check MODULE_STATUS.md for reported issues
4. May need to restart Claude instance

### Issue: Integration Blocker

**Symptoms**:
- Module marked as ⚠️ Blocked
- "Dependencies Not Met"

**Diagnosis**:
```bash
# Check dependency status
grep "Module 2.*Status" MODULE_STATUS.md
```

**Solutions**:
1. Verify dependency module is at required progress
2. Check API_CONTRACTS.md for interface changes
3. May need to use mock implementation temporarily
4. Coordinate between blocking and blocked modules

### Issue: API Contract Mismatch

**Symptoms**:
- Module reports "interface conflict"
- Integration tests failing

**Diagnosis**:
```bash
# Check for API contract changes
git log API_CONTRACTS.md
```

**Solutions**:
1. Review the conflicting interfaces
2. Determine correct contract (vote/discuss)
3. Update API_CONTRACTS.md
4. Notify all affected modules
5. May need version bump in contracts

---

## 📈 Progress Tracking

### Weekly Velocity Chart

| Week | Target | Actual | Status |
|------|--------|--------|--------|
| 1 | 1.4 modules | - | - |
| 2 | 2.8 modules | - | - |
| 3 | 4.2 modules | - | - |
| 4 | 5.6 modules | - | - |
| 5 | 7.0 modules | - | - |
| 6 | 8.4 modules | - | - |
| 7 | 9.8 modules | - | - |
| 8 | 11 modules | - | ✅ |

**Update this weekly** in MODULE_STATUS.md

---

## 🎮 Advanced Monitoring

### Real-Time Git Watch

Keep this running in a terminal:

```bash
while true; do
  clear
  echo "🔄 Git Activity (Last 10 commits)"
  echo "=================================="
  git fetch --all 2>/dev/null
  git log --all --oneline --graph --decorate -10
  echo ""
  echo "Updated: $(date)"
  sleep 30
done
```

### Module Communication Log

Track inter-module issues:

```bash
# Create communication log
cat > MODULE_COMMS.log << EOF
$(date) - Module 3 reports: Need AudioEngine interface clarification
$(date) - Module 5 blocked: Waiting for Effect base class from Module 2
EOF

# Append new communications
echo "$(date) - Module 7: Beat generator API ready for testing" >> MODULE_COMMS.log
```

---

## 🔧 Troubleshooting Commands

### Check Module Dependencies
```bash
# See what modules are waiting on Module 2
grep "Needs Module 2" MODULE_STATUS.md
```

### Find Idle Modules
```bash
# Modules not updated in 12+ hours
./health-check.sh | grep "hours\|day"
```

### View Integration Status
```bash
# Check integration checkpoints
grep "Integration Checkpoints" -A 10 MODULE_STATUS.md
```

### Count Commits by Module
```bash
# See which modules are most active
for i in {1..11}; do
  cd ../dawg-module-$i 2>/dev/null
  COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  echo "Module $i: $COUNT commits"
  cd - > /dev/null 2>&1
done
```

---

## 📞 Communication Protocol

### How Claude Instances Report Status

Each Claude instance should:

1. **Update MODULE_STATUS.md** every 2-4 hours:
   ```bash
   # Example update
   git pull
   # Edit MODULE_STATUS.md
   git add MODULE_STATUS.md
   git commit -m "Module 3: Completed TrackManager base class"
   git push
   ```

2. **Use standardized commit messages**:
   - `"Module X: Started - [task]"`
   - `"Module X: Progress - [milestone]"`
   - `"Module X: Complete - [deliverable]"`
   - `"Module X: Blocked - [reason]"`

3. **Report blockers immediately**:
   - Update status to ⚠️ Blocked
   - Add to "Active Issues" section
   - Include severity and affected modules

---

## 🎯 Success Criteria

You're doing well if:

✅ **3-4 modules active** simultaneously
✅ **0-1 blocked modules** at any time
✅ **Daily commits** from each active module
✅ **Health score >90%**
✅ **On track** for 1.4 modules/week velocity

---

## 📚 Reference Documents

| Document | Purpose |
|----------|---------|
| `MODULE_STATUS.md` | **Real-time status** - Check this constantly |
| `API_CONTRACTS.md` | **Interface specs** - Single source of truth |
| `CLAUDE_MODULE_PROMPTS.md` | **Implementation guides** - Give to Claude instances |
| `COORDINATOR_GUIDE.md` | **Detailed procedures** - Read when stuck |
| `MONITORING_README.md` | **This file** - Quick reference |

---

## 🆘 Emergency Contacts

### Critical Issues
- **All modules blocked**: Review API_CONTRACTS.md, may need contract update
- **Timeline at risk**: Consider simplifying scope or increasing resources
- **Integration failing**: Pause all modules, fix foundation first

### Decision Matrix

| Situation | Action |
|-----------|--------|
| 1 module blocked | Investigate within 4 hours |
| 2+ modules blocked | Investigate immediately |
| Module idle >24 hours | Check Claude instance |
| Zero progress for 48 hours | Restart from checkpoint |
| API conflict | Coordinator decision, update contract |

---

## 🎵 Remember

You're coordinating **11 AI developers** building a **complex music production app** in **8 weeks**.

**Your superpowers**:
1. **Parallel execution** - Multiple Claude instances working simultaneously
2. **Real-time monitoring** - Know exactly what's happening
3. **Rapid intervention** - Fix blockers before they cascade
4. **API contracts** - Ensure everything integrates perfectly

**Stay calm. Trust the process. Monitor actively.**

---

## 🚀 Launch Checklist

Starting parallel development? Run through this:

- [ ] All scripts are executable (`chmod +x *.sh`)
- [ ] Git repository initialized
- [ ] API_CONTRACTS.md in place
- [ ] MODULE_STATUS.md created
- [ ] Worktrees created for Phase 1 (modules 1, 2, 10)
- [ ] Claude Code ready to open module directories
- [ ] Module prompts ready to paste
- [ ] Monitoring script running (`watch -n 30 ./check-status.sh`)
- [ ] Coffee brewed ☕

**You're ready to coordinate!**

---

*Good luck, Coordinator. Let's build DAWG AI! 🎵🐕🤖*
