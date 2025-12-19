# GitHub Token Setup for Gist Upload

## Problem

When running `npm run verify:upload-gist`, you may encounter this error:

```
❌ Error: GitHub API error (403): {"message":"Resource not accessible by integration","documentation_url":"https://docs.github.com/rest/gists/gists#create-a-gist","status":"403"}
```

This error occurs because:
1. You don't have a GitHub token configured, OR
2. Your GitHub token doesn't have the required "gist" scope

## Solution

### Step 1: Generate a GitHub Personal Access Token

1. Visit: https://github.com/settings/tokens/new

2. Configure the token:
   - **Note**: "TheWarden Gist Upload" (or any descriptive name)
   - **Expiration**: Choose your preferred expiration (recommended: 90 days or 1 year)
   - **Scopes**: Check **ONLY** the following:
     - ✅ **gist** - Required for creating/updating Gists

3. Click "Generate token"

4. **IMPORTANT**: Copy the token immediately! You won't be able to see it again.
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Token to Environment Variables

**Option A: Using .env file (Recommended for development)**

1. Open (or create) the `.env` file in the project root:
   ```bash
   nano .env
   # or
   code .env
   ```

2. Add one of these lines:
   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   # OR
   GH_PAT_COPILOT=ghp_your_token_here
   ```

3. Save the file

**Option B: Using shell environment (Temporary)**

```bash
export GITHUB_TOKEN=ghp_your_token_here
# OR
export GH_PAT_COPILOT=ghp_your_token_here
```

**Note**: This only works for the current terminal session

### Step 3: Verify Token Works

Run the Gist upload script:

```bash
npm run verify:upload-gist
```

You should see:

```
╔════════════════════════════════════════════════════════════════════╗
║   GitHub Gist Upload for BaseScan Contract Verification          ║
╚════════════════════════════════════════════════════════════════════╝

📁 Creating separate Gists for each contract...

🔹 FlashSwapV2:
  ✓ FlashSwapV2_flattened.sol (95932 chars)
  ✓ FlashSwapV2_constructor_args.txt (256 chars)
   ID: abc123def456
   URL: https://gist.github.com/YourUsername/abc123def456
...
```

## Troubleshooting

### Error: "Resource not accessible by integration"

**Cause**: Token doesn't have the "gist" scope

**Solution**:
1. Go to https://github.com/settings/tokens
2. Find your token
3. Click "Edit" or "Regenerate token"
4. Make sure "gist" scope is checked
5. Update the token in your `.env` file

### Error: "GitHub token not found"

**Cause**: Environment variable not set

**Solution**:
1. Check that `.env` file exists and contains the token
2. Verify the environment variable name is correct (GITHUB_TOKEN or GH_PAT_COPILOT)
3. Try restarting your terminal/IDE

### Error: "Bad credentials" or 401

**Cause**: Token is invalid or expired

**Solution**:
1. Generate a new token (Step 1)
2. Update your `.env` file with the new token

### Token Already Exists for Another Purpose

If you already have a GitHub token for other purposes (e.g., GitHub CLI, other apps):

**Option 1**: Use the existing token IF it has the "gist" scope
- Just add it to `.env` as shown above

**Option 2**: Create a separate token specifically for Gist uploads
- Follow Step 1 to create a new token
- Give it a descriptive name like "TheWarden Gist Upload"
- Use GITHUB_TOKEN for this new token

## Security Best Practices

1. **Never commit tokens to Git**
   - The `.env` file is already in `.gitignore`
   - Double-check before committing any changes

2. **Use minimal scopes**
   - Only grant "gist" scope, nothing more
   - Don't use tokens with admin or repo access for this script

3. **Rotate tokens regularly**
   - Set an expiration date when creating tokens
   - Update your `.env` file when tokens expire

4. **Use different tokens for different purposes**
   - Don't reuse tokens across multiple services
   - Makes it easier to revoke specific access if needed

## Token Scope Explanation

The "gist" scope allows:
- ✅ Creating public Gists
- ✅ Creating private Gists (won't be used by this script)
- ✅ Updating your own Gists
- ✅ Deleting your own Gists

It does **NOT** allow:
- ❌ Access to your repositories
- ❌ Access to your account settings
- ❌ Any other GitHub API operations

## Alternative: Using GitHub CLI

If you have `gh` (GitHub CLI) installed and authenticated:

```bash
# The script will automatically try to use gh auth token
gh auth login

# Then run the upload script
npm run verify:upload-gist
```

## Related Documentation

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Gist API](https://docs.github.com/en/rest/gists)
- [OAuth Scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)

## Need Help?

If you're still having issues:

1. Check that the verification files exist:
   ```bash
   ls -la verification/
   ```
   You should see:
   - `FlashSwapV2_flattened.sol`
   - `FlashSwapV2_constructor_args.txt`
   - `FlashSwapV3_flattened.sol`
   - `FlashSwapV3_constructor_args.txt`

2. Test your token manually:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
   ```
   Should return your GitHub user info

3. Verify network connectivity:
   ```bash
   curl https://api.github.com/
   ```
   Should return GitHub API root endpoint info
