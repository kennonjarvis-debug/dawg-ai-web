#!/bin/bash
# health-check.sh - Check each module worktree health

echo "🏥 DAWG AI Module Health Check"
echo "=============================="
echo ""

MODULES=(
  "dawg-module-1:Design System"
  "dawg-module-2:Audio Engine"
  "dawg-module-3:Track Manager"
  "dawg-module-4:MIDI Editor"
  "dawg-module-5:Effects Processor"
  "dawg-module-6:Voice Interface"
  "dawg-module-7:Beat Generator"
  "dawg-module-8:Vocal Coach"
  "dawg-module-9:Mixing/Mastering"
  "dawg-module-10:Backend/Storage"
  "dawg-module-11:Integration"
)

HEALTHY=0
IDLE=0
NOT_CREATED=0

for module in "${MODULES[@]}"; do
  DIR="../${module%%:*}"
  NAME="${module##*:}"

  if [ -d "$DIR" ]; then
    cd "$DIR" > /dev/null 2>&1

    # Check for recent activity
    LAST_COMMIT=$(git log -1 --format="%ar" 2>/dev/null || echo "never")
    FILES_CHANGED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
    COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")

    # Determine health status
    if [ "$LAST_COMMIT" = "never" ]; then
      STATUS="⚪ Not Started"
      NOT_CREATED=$((NOT_CREATED + 1))
    elif [[ "$LAST_COMMIT" == *"minute"* ]] || [[ "$LAST_COMMIT" == *"hour"* ]]; then
      STATUS="🟢 Active"
      HEALTHY=$((HEALTHY + 1))
    else
      STATUS="🟡 Idle"
      IDLE=$((IDLE + 1))
    fi

    printf "%-15s | %-20s | Last: %-15s | Commits: %3s | Changes: %2s\n" \
      "$STATUS" "$NAME" "$LAST_COMMIT" "$COMMITS" "$FILES_CHANGED"

    cd - > /dev/null 2>&1
  else
    printf "%-15s | %-20s | Worktree not found\n" "⚫ Not Created" "$NAME"
    NOT_CREATED=$((NOT_CREATED + 1))
  fi
done

echo ""
echo "📊 Health Summary:"
echo "  🟢 Active:      $HEALTHY modules"
echo "  🟡 Idle:        $IDLE modules"
echo "  ⚫ Not Created: $NOT_CREATED modules"
echo ""

# Calculate health score
TOTAL=${#MODULES[@]}
CREATED=$((TOTAL - NOT_CREATED))
if [ $CREATED -gt 0 ]; then
  HEALTH_SCORE=$((HEALTHY * 100 / CREATED))
  echo "  Health Score: $HEALTH_SCORE% (active/created)"
fi

echo ""
echo "⏰ Last check: $(date)"
echo ""

# Recommendations
if [ $NOT_CREATED -gt 0 ]; then
  echo "💡 Recommendation: Create worktrees for Phase 1 modules (1, 2, 10)"
  echo "   Run: git worktree add ../dawg-module-X module-X"
fi

if [ $IDLE -gt 3 ]; then
  echo "⚠️  Warning: $IDLE modules are idle. Check if they're blocked or need attention."
fi

if [ $HEALTHY -eq 0 ] && [ $CREATED -gt 0 ]; then
  echo "❌ Alert: No active modules! Check if Claude instances are running."
fi
