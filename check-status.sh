#!/bin/bash
# check-status.sh - Quick status check for all modules

echo "🎵 DAWG AI - Module Status Check"
echo "=================================="
echo ""

# Count module statuses
NOT_STARTED=$(grep -c "🔴 Not Started" MODULE_STATUS.md 2>/dev/null || echo "0")
IN_PROGRESS=$(grep -c "🟡 In Progress" MODULE_STATUS.md 2>/dev/null || echo "0")
COMPLETE=$(grep -c "🟢 Complete" MODULE_STATUS.md 2>/dev/null || echo "0")
TESTING=$(grep -c "🔵 Testing" MODULE_STATUS.md 2>/dev/null || echo "0")
BLOCKED=$(grep -c "⚠️ Blocked" MODULE_STATUS.md 2>/dev/null || echo "0")
FAILED=$(grep -c "❌ Failed" MODULE_STATUS.md 2>/dev/null || echo "0")

echo "📊 Status Summary:"
echo "  🔴 Not Started: $NOT_STARTED"
echo "  🟡 In Progress: $IN_PROGRESS"
echo "  🔵 Testing:     $TESTING"
echo "  🟢 Complete:    $COMPLETE"
echo "  ⚠️  Blocked:     $BLOCKED"
echo "  ❌ Failed:      $FAILED"
echo ""

# Calculate progress
TOTAL=11
DONE=$((COMPLETE))
PROGRESS=$((DONE * 100 / TOTAL))

echo "📈 Overall Progress: $PROGRESS% ($DONE/$TOTAL modules complete)"
echo ""

# Show active modules
if [ $IN_PROGRESS -gt 0 ]; then
  echo "🔄 Active Modules:"
  grep "| 🟡" MODULE_STATUS.md 2>/dev/null | head -5
  echo ""
fi

# Show completed modules
if [ $COMPLETE -gt 0 ]; then
  echo "✅ Completed Modules:"
  grep "| 🟢" MODULE_STATUS.md 2>/dev/null | head -5
  echo ""
fi

# Show blockers
if [ $BLOCKED -gt 0 ]; then
  echo "⚠️  WARNING: $BLOCKED modules blocked!"
  grep "| ⚠️" MODULE_STATUS.md 2>/dev/null
  echo ""
fi

# Show failed modules
if [ $FAILED -gt 0 ]; then
  echo "❌ ERROR: $FAILED modules failed!"
  grep "| ❌" MODULE_STATUS.md 2>/dev/null
  echo ""
fi

# Check for recent git activity
echo "📝 Recent Commits (last 5):"
git log --all --oneline --graph --decorate -5 2>/dev/null || echo "  No git history yet"
echo ""

echo "⏰ Last check: $(date)"
echo ""
echo "💡 Tip: Run './health-check.sh' for detailed module health"
