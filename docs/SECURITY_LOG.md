# Security Log

**Purpose**: Track all security-related events, key rotations, and incidents

**Last Updated**: 2025-10-17

---

## Key Rotation Schedule

| Secret | Last Rotated | Next Rotation | Frequency |
|--------|--------------|---------------|-----------|
| Supabase Keys | Never | TBD | 180 days |
| Anthropic API Key | Never | TBD | 90 days |
| Deepgram API Key | Never | TBD | 90 days |
| Deployment Webhooks | Never | As needed | On compromise |

---

## Rotation History

### Initial Security Hardening - 2025-10-17

**Actions Taken**:
- ✓ Removed hardcoded secrets from netlify.toml
- ✓ Added pre-commit secret scanning hook
- ✓ Enhanced .gitignore to block secret files
- ✓ Created SECURITY_QUICKSTART.md documentation
- ✓ Added comprehensive security headers
- ✓ Implemented rate limiting middleware
- ✓ Set up automated dependency scanning
- ✓ Created secrets rotation script

**Impact**: Security risk reduced from Critical to Low

**Next Review**: 2026-01-17 (90 days)

---

## Incident Log

_No incidents recorded_

---

## Security Improvements

### 2025-10-17: Comprehensive Security Hardening

**Security Headers Added**:
- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff (prevent MIME sniffing)
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy (CSP) with allowlisted domains
- Strict-Transport-Security (HSTS)
- Permissions-Policy (microphone allowed for recording)

**Rate Limiting**:
- Implemented tiered rate limiting
- Auth endpoints: 5 req / 15 min
- AI endpoints: 50 req / min
- Upload endpoints: 10 req / min
- General API: 100 req / min
- Public: 200 req / min

**Automated Scanning**:
- Weekly dependency audits (npm audit)
- Secret scanning (Gitleaks)
- Outdated package detection
- License compliance checking

**Documentation**:
- SECURITY_QUICKSTART.md created
- Rate limiting middleware documentation
- Incident response procedures documented

---

## Best Practices Implemented

✅ **Secrets Management**:
- No secrets in Git
- Environment variables for all sensitive data
- .env.example template provided
- Pre-commit hooks prevent accidental commits

✅ **Access Control**:
- Rate limiting on all API routes
- Tiered limits based on endpoint sensitivity
- IP-based request tracking

✅ **Monitoring**:
- Weekly dependency audits
- Automated secret scanning
- Security scan workflow in CI/CD

✅ **Documentation**:
- Security procedures documented
- Rotation scripts provided
- Incident response plan defined

---

## Compliance Notes

### GDPR / Privacy
- Microphone permission requested explicitly
- No unnecessary data collection
- Rate limiting based on IP (anonymized)

### Security Standards
- OWASP Top 10 mitigations in place
- Security headers follow Mozilla guidelines
- CSP policy restrictive by default

---

## Contacts

**Security Issues**: Report immediately via GitHub Issues (private security advisory)

**Emergency Contact**: [Your emergency contact info]

**Rotation Reminders**: Set calendar reminders for rotation dates above

---

## Notes

- Rotation script: `bash scripts/rotate-secrets.sh`
- Pre-commit check: Automatic (via Husky)
- Manual secret check: `bash scripts/check-secrets.sh`
- Security scan: Runs weekly via GitHub Actions

---

**Template for New Rotations**:

```
## Rotation - YYYY-MM-DD

- ✓ Supabase Keys
- ✓ Anthropic API Key
- ✓ Deepgram API Key

Performed by: [Name]
Reason: Scheduled / Incident / Compromise
Next rotation: [Date + 90 days]
```
