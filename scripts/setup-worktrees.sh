#!/bin/bash

# DAWG AI - Git Worktree Setup Script
# This script creates isolated git worktrees for parallel development by multiple Claude Code instances

set -e  # Exit on error

MODULES=(
  "design-system"
  "audio-engine"
  "track-manager"
  "midi-editor"
  "effects-processor"
  "voice-interface"
  "ai-beat-generator"
  "ai-vocal-coach"
  "ai-mixing-mastering"
  "cloud-storage"
  "integration-testing"
)

WORKTREE_DIR="../dawg-worktrees"

echo "🚀 DAWG AI - Setting up git worktrees for parallel development"
echo "=================================================="
echo ""

# Check if git repository is initialized
if [ ! -d ".git" ]; then
  echo "❌ Error: Not a git repository. Please run 'git init' first."
  exit 1
fi

# Create worktree directory
mkdir -p "$WORKTREE_DIR"
echo "✓ Created worktree directory: $WORKTREE_DIR"
echo ""

# Create worktree for each module
for module in "${MODULES[@]}"; do
  branch_name="module/$module"
  worktree_path="$WORKTREE_DIR/$module"
  
  echo "📦 Setting up: $module"
  
  # Create branch if it doesn't exist
  if git show-ref --quiet refs/heads/"$branch_name"; then
    echo "   ↳ Branch '$branch_name' already exists"
  else
    echo "   ↳ Creating branch: $branch_name"
    git branch "$branch_name" 2>/dev/null || true
  fi
  
  # Create worktree if it doesn't exist
  if [ -d "$worktree_path" ]; then
    echo "   ↳ Worktree already exists at: $worktree_path"
  else
    echo "   ↳ Creating worktree: $worktree_path"
    git worktree add "$worktree_path" "$branch_name"
  fi
  
  # Copy CLAUDE.md to worktree
  if [ -f "CLAUDE.md" ]; then
    cp CLAUDE.md "$worktree_path/"
    echo "   ↳ Copied CLAUDE.md to worktree"
  fi
  
  echo ""
done

echo "=================================================="
echo "✅ All worktrees created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Navigate to a worktree: cd $WORKTREE_DIR/<module-name>"
echo "   2. Start coding in that worktree with Claude Code"
echo "   3. Each instance works independently without conflicts"
echo ""
echo "📍 Available worktrees:"
git worktree list
echo ""
echo "💡 Tip: Open multiple terminals/Claude Code instances, one per worktree"
echo ""
