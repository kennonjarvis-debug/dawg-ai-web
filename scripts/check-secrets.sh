#!/bin/bash
# Pre-commit hook to detect secrets in tracked files

set -e

echo "🔍 Scanning for secrets in tracked files..."

# Check for Anthropic API keys
if git diff --cached --diff-filter=ACM | grep -E "sk-ant-[a-zA-Z0-9_-]{95,}"; then
  echo "❌ Found Anthropic API key in staged files!"
  echo "   Remove the key and use environment variables instead."
  exit 1
fi

# Check for OpenAI API keys
if git diff --cached --diff-filter=ACM | grep -E "sk-[a-zA-Z0-9]{48}"; then
  echo "❌ Found OpenAI API key in staged files!"
  echo "   Remove the key and use environment variables instead."
  exit 1
fi

# Check for Supabase keys
if git diff --cached --diff-filter=ACM | grep -E "sb_[a-zA-Z0-9_-]{100,}"; then
  echo "❌ Found Supabase key in staged files!"
  echo "   Remove the key and use environment variables instead."
  exit 1
fi

# Check for Deepgram keys
if git diff --cached --diff-filter=ACM | grep -E "[0-9a-f]{40}"; then
  echo "⚠️  Found potential Deepgram key (40-char hex) in staged files."
  echo "   If this is a secret key, remove it and use environment variables."
  # Don't fail on this one as it's less specific
fi

# Check for hardcoded secrets in config files
if git diff --cached --diff-filter=ACM --name-only | grep -E "\.(toml|json|yaml|yml)$" | xargs -I {} sh -c 'git show :"{}" | grep -qE "(password|secret|token|key).*=.*[\"'\''"][^\"'\'']+[\"'\'']"' 2>/dev/null; then
  echo "❌ Found potential secrets in config files!"
  echo "   Review your .toml, .json, or .yaml files for hardcoded secrets."
  exit 1
fi

echo "✅ No secrets detected in staged files"
exit 0
