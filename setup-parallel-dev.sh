#!/bin/bash
# setup-parallel-dev.sh - Setup parallel development environment

echo "🎵 DAWG AI - Parallel Development Setup"
echo "======================================="
echo ""

# Check if we're in the right directory
if [ ! -f "CLAUDE_MODULE_PROMPTS.md" ]; then
  echo "❌ Error: Run this script from the dawg-ai-v0 directory"
  exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit: DAWG AI project setup"
fi

echo "🔧 Setup Options:"
echo ""
echo "  1. Phase 1 Only (Modules 1, 2, 10) - Recommended for starting"
echo "  2. Phase 1 + 2 (Modules 1-5, 10) - More aggressive"
echo "  3. All Modules (1-11) - Maximum parallelism"
echo "  4. Custom Selection"
echo ""

read -p "Choose option (1-4): " OPTION

case $OPTION in
  1)
    MODULES=(1 2 10)
    PHASE="Phase 1: Foundation"
    ;;
  2)
    MODULES=(1 2 3 4 5 10)
    PHASE="Phase 1 + 2: Foundation + Core"
    ;;
  3)
    MODULES=(1 2 3 4 5 6 7 8 9 10 11)
    PHASE="All Modules"
    ;;
  4)
    read -p "Enter module numbers separated by spaces (e.g., 1 2 3): " -a MODULES
    PHASE="Custom Selection"
    ;;
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac

echo ""
echo "📋 Setting up: $PHASE"
echo "   Modules: ${MODULES[*]}"
echo ""

read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "🏗️  Creating git worktrees..."
echo ""

for module in "${MODULES[@]}"; do
  BRANCH="module-$module"
  DIR="../dawg-module-$module"

  # Create branch if it doesn't exist
  if ! git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git branch "$BRANCH"
  fi

  # Create worktree if it doesn't exist
  if [ ! -d "$DIR" ]; then
    echo "  Creating worktree for Module $module..."
    git worktree add "$DIR" "$BRANCH" 2>/dev/null

    # Copy necessary files to worktree
    cp API_CONTRACTS.md "$DIR/"
    cp MODULE_STATUS.md "$DIR/"

    echo "    ✅ Created: $DIR"
  else
    echo "    ⏭️  Already exists: $DIR"
  fi
done

echo ""
echo "✅ Worktree setup complete!"
echo ""

# Create a quick reference file
echo "📝 Creating module reference..."

cat > MODULE_REFERENCE.txt << EOF
DAWG AI - Module Worktree Reference
Generated: $(date)

Modules Created:
EOF

for module in "${MODULES[@]}"; do
  DIR="../dawg-module-$module"
  MODULE_NAMES=(
    "Design System"
    "Audio Engine Core"
    "Track Manager"
    "MIDI Editor"
    "Effects Processor"
    "Voice Interface"
    "AI Beat Generator"
    "AI Vocal Coach"
    "AI Mixing & Mastering"
    "Backend/Storage"
    "Integration & Testing"
  )
  NAME="${MODULE_NAMES[$((module-1))]}"
  echo "  Module $module: $NAME" >> MODULE_REFERENCE.txt
  echo "    Directory: $DIR" >> MODULE_REFERENCE.txt
  echo "    Command: cd $DIR && code ." >> MODULE_REFERENCE.txt
  echo "" >> MODULE_REFERENCE.txt
done

cat >> MODULE_REFERENCE.txt << EOF

Quick Start Commands:
=====================

1. Check status:
   ./check-status.sh

2. Health check:
   ./health-check.sh

3. Monitor continuously:
   watch -n 30 ./check-status.sh

4. Open a module:
   cd ../dawg-module-X
   code .  # or open in Claude Code

5. View all modules:
   git worktree list

Next Steps:
===========

1. Open Claude Code in each module directory
2. Copy the relevant prompt from CLAUDE_MODULE_PROMPTS.md
3. Paste into Claude Code
4. Let each instance work autonomously
5. Monitor progress with check-status.sh

Remember:
=========
- Each module should update MODULE_STATUS.md every 2-4 hours
- Check for blockers daily
- Review API_CONTRACTS.md for interface definitions
- Use COORDINATOR_GUIDE.md for monitoring help

EOF

cat MODULE_REFERENCE.txt

echo ""
echo "📚 Reference saved to MODULE_REFERENCE.txt"
echo ""

# Run initial health check
echo "🏥 Running initial health check..."
echo ""
./health-check.sh

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Open each module directory in Claude Code:"
for module in "${MODULES[@]}"; do
  DIR="../dawg-module-$module"
  echo "   cd $DIR && code ."
done
echo ""
echo "2. In each Claude Code instance:"
echo "   - Open CLAUDE_MODULE_PROMPTS.md from the main repo"
echo "   - Copy the Module $module prompt"
echo "   - Paste into Claude Code"
echo "   - Let it work autonomously"
echo ""
echo "3. Monitor progress:"
echo "   ./check-status.sh"
echo ""
echo "4. For continuous monitoring:"
echo "   watch -n 30 ./check-status.sh"
echo ""
echo "📖 Full coordinator guide: COORDINATOR_GUIDE.md"
echo ""
echo "Good luck! 🚀🎵🐕🤖"
