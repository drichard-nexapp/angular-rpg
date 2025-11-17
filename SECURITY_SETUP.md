# Security Setup Instructions

## CRITICAL: API Token Exposure

Your API token was previously committed to git. Follow these steps immediately:

### 1. Revoke the Exposed Token

**ACTION REQUIRED**: Go to https://artifactsmmo.com (or your API provider dashboard) and revoke the exposed token immediately.

The exposed token can be found in git history and could be used by anyone with repository access.

### 2. Remove Token from Git History

Run these commands to remove the token from git history:

```bash
# Stop tracking the file
git rm --cached src/environments/environment.local.ts

# Commit the removal
git commit -m "Remove environment.local.ts from tracking"

# Optional: Remove from entire git history (DESTRUCTIVE - backup first!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch src/environments/environment.local.ts' \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote (if you removed from history)
git push origin --force --all
```

⚠️ **Warning**: The `filter-branch` command rewrites git history. Coordinate with your team before running this.

### 3. Set Up Local Environment

```bash
# Copy the template
cp src/environments/environment.local.template.ts src/environments/environment.local.ts

# Edit the file and add your NEW token
# Replace 'YOUR_API_TOKEN_HERE' with your actual token
```

### 4. Verify Gitignore

The `.gitignore` file should already have:
```
src/environments/environment.local.*
```

However, if the file was previously tracked, git will continue tracking it. That's why step 2 is necessary.

### 5. Verify File is Untracked

```bash
# This should NOT list environment.local.ts
git status

# This should show it's ignored
git check-ignore src/environments/environment.local.ts
```

## Best Practices Going Forward

1. **Never commit tokens, API keys, or secrets**
2. **Use environment variables** for sensitive data
3. **Use template files** with placeholder values
4. **Set up pre-commit hooks** to detect secrets:
   ```bash
   npm install --save-dev @commitlint/cli husky
   npx husky install
   ```
5. **Rotate tokens regularly**
6. **Use different tokens** for development, staging, and production

## Alternative: Environment Variables

For better security, consider loading the token from environment variables:

```typescript
// environment.local.ts
export const environmentLocal = {
  production: false,
  token: (window as any).ENV?.API_TOKEN || '',
}
```

Then inject the token at build time or runtime using your deployment platform's environment variable feature.

## Verification

After completing these steps:
- [ ] Old token has been revoked
- [ ] `environment.local.ts` is removed from git tracking
- [ ] New token is in place locally
- [ ] `git status` does not show `environment.local.ts`
- [ ] File still exists locally and app works
