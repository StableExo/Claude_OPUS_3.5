# Node.js 22 Setup Guide 🟢

**Required for TheWarden v5.1.0+**

---

## Why Node.js 22?

TheWarden requires Node.js 22.12.0 or higher for:
- **ESM Support**: Native ES modules with top-level await
- **Performance**: 15% faster V8 engine
- **Security**: Latest security patches
- **TypeScript**: Better type checking support

---

## Quick Install (Recommended: NVM)

### What is NVM?
NVM (Node Version Manager) lets you easily install and switch between Node.js versions.

### Install NVM

#### macOS / Linux
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Or with wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload your shell
source ~/.bashrc  # or ~/.zshrc for zsh
```

#### Windows
Use **nvm-windows**:
1. Download from: https://github.com/coreybutler/nvm-windows/releases
2. Run the installer (`nvm-setup.exe`)
3. Open a new Command Prompt or PowerShell

### Install Node.js 22

```bash
# Install Node.js 22 (latest version)
nvm install 22

# Use Node.js 22
nvm use 22

# Verify installation
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

---

## Alternative: Direct Installation

### macOS

#### Using Homebrew
```bash
# Install or update Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 22
brew install node@22

# Link it
brew link node@22

# Verify
node --version
```

#### Using Official Installer
1. Download from: https://nodejs.org/dist/latest-v22.x/
2. Get the `.pkg` file for macOS
3. Run the installer
4. Verify: `node --version`

### Windows

#### Using Official Installer
1. Visit: https://nodejs.org/en/download/
2. Download "LTS" or "Current" (ensure it's v22.x)
3. Run the `.msi` installer
4. Follow the wizard
5. Open Command Prompt: `node --version`

#### Using Chocolatey
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js 22
choco install nodejs --version=22.0.0

# Verify
node --version
```

#### Using Winget (Windows 11+)
```powershell
# Search for Node.js
winget search nodejs

# Install specific version
winget install OpenJS.NodeJS --version 22.0.0

# Verify
node --version
```

### Linux

#### Ubuntu / Debian
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Install Node.js 22
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### Fedora / RHEL / CentOS
```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -

# Install Node.js 22
sudo yum install -y nodejs

# Verify
node --version
```

#### Arch Linux
```bash
# Update package database
sudo pacman -Sy

# Install Node.js (usually latest)
sudo pacman -S nodejs npm

# Verify
node --version
```

---

## Setup TheWarden

### 1. Verify Node.js Version
```bash
node --version
# Must show v22.12.0 or higher
```

### 2. Install Dependencies
```bash
cd /path/to/TheWarden
npm install
```

**Expected output**:
```
added 726 packages in 45s
```

### 3. Verify Installation
```bash
# Check for any issues
npm list --depth=0

# Run type check
npm run typecheck
```

---

## Troubleshooting

### Error: "Unsupported engine"
```
npm error engine Unsupported engine
npm error engine Not compatible with your version of node/npm
npm error notsup Required: {"node":">=22.12.0"}
```

**Solution**:
```bash
# Check your current version
node --version

# If it's less than v22.12.0:
nvm install 22
nvm use 22

# Or reinstall Node.js 22 using one of the methods above
```

### Error: "nvm: command not found"

**Solution**:
```bash
# Reload your shell configuration
source ~/.bashrc  # or ~/.zshrc

# If still not working, reinstall NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```

### Multiple Node.js Versions Installed

**Using NVM**:
```bash
# List installed versions
nvm list

# Switch to Node.js 22
nvm use 22

# Set as default
nvm alias default 22
```

**Without NVM** (remove old versions):
```bash
# macOS
brew uninstall node  # Remove old version
brew install node@22 # Install Node.js 22

# Ubuntu/Debian
sudo apt-get remove nodejs
# Then reinstall using the NodeSource method above
```

### Permission Errors on npm install

**Solution 1 - Use NVM (Recommended)**:
NVM installs Node.js in your home directory, avoiding permission issues.

**Solution 2 - Fix npm permissions**:
```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use this directory
npm config set prefix '~/.npm-global'

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Reload shell
source ~/.bashrc
```

### npm install is slow

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Use a faster registry (optional)
npm config set registry https://registry.npmmirror.com

# Or just install with --prefer-offline
npm install --prefer-offline
```

### Can't switch to Node.js 22 on Windows

**Solution**:
```bash
# Run Command Prompt or PowerShell as Administrator
nvm list available
nvm install 22.12.0
nvm use 22.12.0

# Set as default
nvm alias default 22.12.0
```

---

## Verifying Your Setup

Run this complete check:

```bash
# Check Node.js version
node --version
# Expected: v22.12.0 or higher

# Check npm version
npm --version
# Expected: 10.8.0 or higher

# Check TypeScript
npx tsc --version
# Expected: 5.9.x

# Install TheWarden dependencies
cd /path/to/TheWarden
npm install

# Run type check
npm run typecheck
# Expected: No errors

# Test a simple script
node --version && echo "✅ Node.js 22 ready!"
```

If all commands succeed, you're ready to run TheWarden! 🎉

---

## Next Steps

After setting up Node.js 22:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # or use your favorite editor
   ```

3. **Get testnet tokens** (optional)
   - See: `TESTNET_QUICK_START.md`
   - Or: `docs/TESTNET_TOKEN_GUIDE.md`

4. **Run TheWarden**
   ```bash
   # Test on testnet
   npm run autonomous:ankrbnb-security-enhanced -- --mode=TESTNET

   # Or recon mode (no funds needed)
   npm run autonomous:ankrbnb-security-enhanced -- --mode=RECON_ONLY
   ```

---

## FAQ

### Q: Do I need to uninstall my current Node.js?
**A**: No, if you use NVM. NVM lets you keep multiple versions and switch between them.

### Q: Will this break my other projects?
**A**: If using NVM, no. You can switch versions per project. Without NVM, other projects might require updates.

### Q: Can I use Node.js 20 or 21?
**A**: No, TheWarden requires Node.js 22.12.0 minimum. The codebase uses features only available in v22+.

### Q: How do I update Node.js in the future?
**A**: With NVM: `nvm install 22 && nvm use 22`. Without NVM: Download and install the latest from nodejs.org.

### Q: Is Node.js 22 stable?
**A**: Yes! Node.js 22 is an LTS (Long Term Support) release, meaning it's production-ready and maintained until 2027.

---

## Resources

- **Node.js Official Site**: https://nodejs.org/
- **NVM GitHub**: https://github.com/nvm-sh/nvm
- **nvm-windows**: https://github.com/coreybutler/nvm-windows
- **Node.js Version Schedule**: https://github.com/nodejs/release#release-schedule
- **npm Documentation**: https://docs.npmjs.com/

---

**Need Help?** 
- Check the troubleshooting section above
- Read TheWarden's setup guide: `SETUP_GUIDE.md`
- Open an issue: https://github.com/StableExo/TheWarden/issues

---

**Status**: ✅ Ready for Node.js 22 setup
**Generated**: December 16, 2024
