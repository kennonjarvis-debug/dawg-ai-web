#!/bin/bash
#
# Secrets Rotation Script
#
# Guides you through rotating all API keys and secrets for DAWG AI
# Should be run every 90 days or immediately after a suspected compromise
#
# Usage:
#   bash scripts/rotate-secrets.sh
#
# Will prompt for each secret rotation and provide step-by-step instructions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="secrets-rotation-$(date +%Y%m%d-%H%M%S).log"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo ""
}

print_step() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

confirm() {
  read -p "$1 (y/n): " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

wait_for_confirmation() {
  read -p "Press ENTER when complete..."
}

# ============================================================================
# Main Script
# ============================================================================

print_header "🔐 DAWG AI Secrets Rotation"

log "Starting secrets rotation process"

echo "This script will guide you through rotating all API keys and secrets."
echo "It is recommended to rotate secrets every 90 days or after a suspected breach."
echo ""
echo "You will need access to:"
echo "  - Supabase Dashboard (https://supabase.com/dashboard)"
echo "  - Anthropic Console (https://console.anthropic.com)"
echo "  - Deepgram Console (https://console.deepgram.com)"
echo "  - Netlify Dashboard (https://app.netlify.com)"
echo "  - Vercel Dashboard (https://vercel.com) [if applicable]"
echo ""

if ! confirm "Do you want to continue?"; then
  echo "Rotation cancelled."
  exit 0
fi

ROTATED_SECRETS=()

# ============================================================================
# 1. Supabase Keys
# ============================================================================

print_header "1/4 Rotating Supabase Keys"

echo "Supabase URL and Anon Key are used for database access and authentication."
echo ""
echo "⚠️  WARNING: Rotating Supabase keys requires project downtime!"
echo "   Schedule this during a maintenance window."
echo ""

if confirm "Rotate Supabase keys now?"; then
  echo ""
  echo "Steps to rotate Supabase keys:"
  echo ""
  echo "1. Go to: https://supabase.com/dashboard/project/_/settings/api"
  echo "2. Your project URL: https://[PROJECT_ID].supabase.co"
  echo "3. Anon/Public key can be regenerated (requires project restart)"
  echo ""
  echo "For anon key rotation:"
  echo "  a. Click 'Generate new anon key' button"
  echo "  b. Copy the new key"
  echo "  c. Update .env.local:"
  echo "     VITE_SUPABASE_ANON_KEY=[new-key]"
  echo ""
  echo "4. Update deployment platforms:"
  echo "   Netlify:"
  echo "     https://app.netlify.com/sites/dawg-ai-web/settings/env"
  echo "   Vercel (if applicable):"
  echo "     https://vercel.com/your-org/dawg-ai-web/settings/environment-variables"
  echo ""
  echo "5. Redeploy applications to pick up new keys"
  echo ""

  wait_for_confirmation

  if confirm "Did you successfully rotate Supabase keys?"; then
    ROTATED_SECRETS+=("Supabase URL & Anon Key")
    log "✓ Supabase keys rotated"
    print_step "Supabase keys updated"
  else
    print_warning "Supabase keys NOT rotated - manual follow-up required"
    log "⚠ Supabase keys NOT rotated"
  fi
else
  print_warning "Skipped Supabase rotation"
  log "Skipped Supabase rotation"
fi

# ============================================================================
# 2. Anthropic API Key
# ============================================================================

print_header "2/4 Rotating Anthropic API Key"

echo "Anthropic API key is used for Claude AI vocal coaching."
echo ""
echo "This rotation can be done with zero downtime (key rollover supported)."
echo ""

if confirm "Rotate Anthropic API key now?"; then
  echo ""
  echo "Steps to rotate Anthropic API key:"
  echo ""
  echo "1. Go to: https://console.anthropic.com/settings/keys"
  echo "2. Click 'Create Key'"
  echo "3. Name it: 'DAWG-AI-$(date +%Y%m%d)'"
  echo "4. Copy the new key (it will only be shown once!)"
  echo ""
  echo "5. Update .env.local:"
  echo "   ANTHROPIC_API_KEY=sk-ant-api03-[new-key]"
  echo ""
  echo "6. Update deployment platforms:"
  echo "   Netlify:"
  echo "     https://app.netlify.com/sites/dawg-ai-web/settings/env"
  echo "   Vercel (if applicable):"
  echo "     https://vercel.com/your-org/dawg-ai-web/settings/environment-variables"
  echo ""
  echo "7. Redeploy application"
  echo ""
  echo "8. Test that AI coaching still works"
  echo ""
  echo "9. ONLY AFTER CONFIRMING NEW KEY WORKS:"
  echo "   Delete old key from Anthropic Console"
  echo ""

  wait_for_confirmation

  if confirm "Did you successfully rotate Anthropic API key?"; then
    ROTATED_SECRETS+=("Anthropic API Key")
    log "✓ Anthropic API key rotated"
    print_step "Anthropic API key updated"
  else
    print_warning "Anthropic key NOT rotated - manual follow-up required"
    log "⚠ Anthropic key NOT rotated"
  fi
else
  print_warning "Skipped Anthropic rotation"
  log "Skipped Anthropic rotation"
fi

# ============================================================================
# 3. Deepgram API Key
# ============================================================================

print_header "3/4 Rotating Deepgram API Key"

echo "Deepgram API key is used for speech-to-text transcription."
echo ""
echo "This rotation can be done with zero downtime (key rollover supported)."
echo ""

if confirm "Rotate Deepgram API key now?"; then
  echo ""
  echo "Steps to rotate Deepgram API key:"
  echo ""
  echo "1. Go to: https://console.deepgram.com/api-keys"
  echo "2. Click 'Create a New API Key'"
  echo "3. Name it: 'DAWG-AI-$(date +%Y%m%d)'"
  echo "4. Scope: Select 'usage:write' and 'usage:read'"
  echo "5. Copy the new key (it will only be shown once!)"
  echo ""
  echo "6. Update .env.local:"
  echo "   DEEPGRAM_API_KEY=[new-key]"
  echo ""
  echo "7. Update deployment platforms:"
  echo "   Netlify:"
  echo "     https://app.netlify.com/sites/dawg-ai-web/settings/env"
  echo "   Vercel (if applicable):"
  echo "     https://vercel.com/your-org/dawg-ai-web/settings/environment-variables"
  echo ""
  echo "8. Redeploy application"
  echo ""
  echo "9. Test that speech-to-text still works"
  echo ""
  echo "10. ONLY AFTER CONFIRMING NEW KEY WORKS:"
  echo "    Delete old key from Deepgram Console"
  echo ""

  wait_for_confirmation

  if confirm "Did you successfully rotate Deepgram API key?"; then
    ROTATED_SECRETS+=("Deepgram API Key")
    log "✓ Deepgram API key rotated"
    print_step "Deepgram API key updated"
  else
    print_warning "Deepgram key NOT rotated - manual follow-up required"
    log "⚠ Deepgram key NOT rotated"
  fi
else
  print_warning "Skipped Deepgram rotation"
  log "Skipped Deepgram rotation"
fi

# ============================================================================
# 4. Deployment Webhooks (Optional)
# ============================================================================

print_header "4/4 Rotating Deployment Webhooks (Optional)"

echo "Deployment webhooks allow triggering builds remotely."
echo "Only rotate if you suspect compromise."
echo ""

if confirm "Rotate deployment webhooks?"; then
  echo ""
  echo "Steps to rotate deployment webhooks:"
  echo ""
  echo "Netlify:"
  echo "1. Go to: https://app.netlify.com/sites/dawg-ai-web/settings/deploys#build-hooks"
  echo "2. Delete old webhook"
  echo "3. Create new webhook"
  echo "4. Update any CI/CD scripts that use the webhook URL"
  echo ""
  echo "Vercel (if applicable):"
  echo "1. Go to: https://vercel.com/your-org/dawg-ai-web/settings/git"
  echo "2. Regenerate deploy hooks as needed"
  echo ""

  wait_for_confirmation

  if confirm "Did you successfully rotate webhooks?"; then
    ROTATED_SECRETS+=("Deployment Webhooks")
    log "✓ Deployment webhooks rotated"
    print_step "Deployment webhooks updated"
  else
    print_warning "Webhooks NOT rotated"
    log "⚠ Webhooks NOT rotated"
  fi
else
  print_warning "Skipped webhook rotation"
  log "Skipped webhook rotation"
fi

# ============================================================================
# Summary
# ============================================================================

print_header "🎉 Rotation Complete"

if [ ${#ROTATED_SECRETS[@]} -eq 0 ]; then
  print_warning "No secrets were rotated."
  echo "If this was intentional, no further action needed."
else
  print_step "Successfully rotated ${#ROTATED_SECRETS[@]} secret(s):"
  for secret in "${ROTATED_SECRETS[@]}"; do
    echo "  - $secret"
  done
fi

echo ""
echo "📝 Rotation log saved to: $LOG_FILE"
echo ""
echo "Next steps:"
echo "1. Verify all applications are working correctly"
echo "2. Update SECURITY_LOG.md with rotation date"
echo "3. Schedule next rotation for $(date -v+90d '+%Y-%m-%d' 2>/dev/null || date -d '+90 days' '+%Y-%m-%d' 2>/dev/null || echo '90 days from now')"
echo "4. Store this log file securely"
echo ""

log "Rotation process complete"

# Update SECURITY_LOG.md
if [ -f "docs/SECURITY_LOG.md" ]; then
  echo "" >> docs/SECURITY_LOG.md
  echo "## Rotation - $(date '+%Y-%m-%d')" >> docs/SECURITY_LOG.md
  echo "" >> docs/SECURITY_LOG.md
  for secret in "${ROTATED_SECRETS[@]}"; do
    echo "- ✓ $secret" >> docs/SECURITY_LOG.md
  done
  echo "" >> docs/SECURITY_LOG.md
  print_step "Updated docs/SECURITY_LOG.md"
else
  print_warning "docs/SECURITY_LOG.md not found - create it to track rotations"
fi

echo ""
echo -e "${GREEN}✅ All done!${NC}"
