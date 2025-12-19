#!/usr/bin/env node
/**
 * Upload Contract Verification Files to GitHub Gist
 * 
 * This script uploads flattened contracts and constructor arguments to GitHub Gist
 * for use in BaseScan contract verification when source code is too large to paste directly.
 * 
 * BaseScan supports using Gist URLs in the verification form instead of pasting code.
 * 
 * Usage:
 *   npm run verify:upload-gist
 *   
 * Environment Variables Required:
 *   - GITHUB_TOKEN or GH_PAT_COPILOT: GitHub Personal Access Token with 'gist' scope
 *   
 * Generates:
 *   - Public Gist with both flattened contracts
 *   - verification/GIST_URLS.md with URLs for BaseScan verification
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface GistFile {
  content: string;
}

interface GistResponse {
  id: string;
  html_url: string;
  files: {
    [filename: string]: {
      raw_url: string;
    };
  };
}

/**
 * Create a GitHub Gist for a single contract
 * BaseScan fetches the FIRST file in the Gist, so we ensure the .sol file is first
 */
async function createContractGist(
  token: string,
  contractName: string,
  flattenedFile: string,
  constructorArgsFile: string
): Promise<GistResponse> {
  const verificationDir = join(process.cwd(), 'verification');
  
  // Read files
  const flattenedPath = join(verificationDir, flattenedFile);
  const argsPath = join(verificationDir, constructorArgsFile);
  
  if (!existsSync(flattenedPath)) {
    throw new Error(`File not found: ${flattenedPath}`);
  }
  if (!existsSync(argsPath)) {
    throw new Error(`File not found: ${argsPath}`);
  }
  
  const flattenedContent = readFileSync(flattenedPath, 'utf8');
  const argsContent = readFileSync(argsPath, 'utf8');
  
  console.log(`  ✓ ${flattenedFile} (${flattenedContent.length} chars)`);
  console.log(`  ✓ ${constructorArgsFile} (${argsContent.length} chars)`);
  
  // Create the gist with flattened contract as FIRST file
  // This is critical because BaseScan fetches the first file only
  const gistData = {
    description: `TheWarden ${contractName} - BaseScan Contract Verification`,
    public: true,
    files: {
      [flattenedFile]: { content: flattenedContent },
      [constructorArgsFile]: { content: argsContent },
    },
  };
  
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(gistData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }
  
  const gist: GistResponse = await response.json();
  console.log(`   ID: ${gist.id}`);
  console.log(`   URL: ${gist.html_url}`);
  
  return gist;
}

/**
 * Create separate Gists for each contract
 */
async function createGists(token: string): Promise<{ v2: GistResponse; v3: GistResponse }> {
  console.log('📁 Creating separate Gists for each contract...\n');
  
  console.log('🔹 FlashSwapV2:');
  const v2Gist = await createContractGist(
    token,
    'FlashSwapV2',
    'FlashSwapV2_flattened.sol',
    'FlashSwapV2_constructor_args.txt'
  );
  
  console.log('\n🔹 FlashSwapV3:');
  const v3Gist = await createContractGist(
    token,
    'FlashSwapV3',
    'FlashSwapV3_flattened.sol',
    'FlashSwapV3_constructor_args.txt'
  );
  
  return { v2: v2Gist, v3: v3Gist };
}

/**
 * Generate documentation with Gist URLs and BaseScan verification instructions
 */
function generateGistUrlsDoc(v2Gist: GistResponse, v3Gist: GistResponse): void {
  const verificationDir = join(process.cwd(), 'verification');
  const outputPath = join(verificationDir, 'GIST_URLS.md');
  
  const v2FlattenedUrl = v2Gist.files['FlashSwapV2_flattened.sol']?.raw_url || '';
  const v2ArgsUrl = v2Gist.files['FlashSwapV2_constructor_args.txt']?.raw_url || '';
  const v3FlattenedUrl = v3Gist.files['FlashSwapV3_flattened.sol']?.raw_url || '';
  const v3ArgsUrl = v3Gist.files['FlashSwapV3_constructor_args.txt']?.raw_url || '';
  
  const doc = `# GitHub Gist URLs for Contract Verification

Generated on: ${new Date().toISOString()}

## ⚡ Quick Start - BaseScan Verification

BaseScan supports fetching Solidity code from GitHub Gist by entering the **GistID**.

### FlashSwapV2 Verification

**📍 Contract Address:** \`0x6e2473E4BEFb66618962f8c332706F8f8d339c08\`

**🔗 Direct Verification Link:**
https://basescan.org/verifyContract-solc?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08&c=v0.8.20%2bcommit.a1b79de6&lictype=3

**📋 Gist Information:**
- **Gist URL:** ${v2Gist.html_url}
- **GistID:** \`${v2Gist.id}\`

**🎯 Verification Steps:**

1. Visit the verification link above
2. In the "Enter the Solidity Contract Code below" field:
   - **Option A (Recommended):** Enter GistID: \`${v2Gist.id}\`
   - **Option B:** Paste Gist URL: ${v2Gist.html_url}
   - **Option C:** Paste raw URL: ${v2FlattenedUrl}

3. Compiler Settings (pre-filled):
   - Compiler Version: \`v0.8.20+commit.a1b79de6\`
   - License: MIT License (3)
   - Optimization: **Yes**
   - Runs: **200**
   - EVM Version: **shanghai**

4. Constructor Arguments (ABI-encoded):
\`\`\`
${readFileSync(join(verificationDir, 'FlashSwapV2_constructor_args.txt'), 'utf8').trim()}
\`\`\`

5. Click "Verify and Publish"

---

### FlashSwapV3 Verification

**📍 Contract Address:** \`0x4926E08c0aF3307Ea7840855515b22596D39F7eb\`

**🔗 Direct Verification Link:**
https://basescan.org/verifyContract-solc?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb&c=v0.8.20%2bcommit.a1b79de6&lictype=3

**📋 Gist Information:**
- **Gist URL:** ${v3Gist.html_url}
- **GistID:** \`${v3Gist.id}\`

**🎯 Verification Steps:**

1. Visit the verification link above
2. In the "Enter the Solidity Contract Code below" field:
   - **Option A (Recommended):** Enter GistID: \`${v3Gist.id}\`
   - **Option B:** Paste Gist URL: ${v3Gist.html_url}
   - **Option C:** Paste raw URL: ${v3FlattenedUrl}

3. Compiler Settings (pre-filled):
   - Compiler Version: \`v0.8.20+commit.a1b79de6\`
   - License: MIT License (3)
   - Optimization: **Yes**
   - Runs: **200**
   - EVM Version: **shanghai**

4. Constructor Arguments (ABI-encoded):
\`\`\`
${readFileSync(join(verificationDir, 'FlashSwapV3_constructor_args.txt'), 'utf8').trim()}
\`\`\`

5. Click "Verify and Publish"

---

## 📝 Important Notes

### How BaseScan Fetches from Gist

When you enter a **GistID** in BaseScan's verification form:
- BaseScan automatically fetches the **FIRST file** in the Gist
- Our script ensures the \`.sol\` file is always first
- No need to manually copy/paste 2000+ lines of code!

### Alternative: Use Raw URLs

If entering the GistID doesn't work, use the raw URLs:

**FlashSwapV2 Raw URL:**
\`\`\`
${v2FlattenedUrl}
\`\`\`

**FlashSwapV3 Raw URL:**
\`\`\`
${v3FlattenedUrl}
\`\`\`

---

## 🔄 Regenerate Gists

If you need to regenerate these Gists (e.g., after contract updates):

\`\`\`bash
npm run verify:upload-gist
\`\`\`

This will create new Gists and update this file.

---

## 🔗 Useful Links

### FlashSwapV2
- **Gist:** ${v2Gist.html_url}
- **Raw Contract:** ${v2FlattenedUrl}
- **Constructor Args:** ${v2ArgsUrl}
- **BaseScan (after verification):** https://basescan.org/address/0x6e2473E4BEFb66618962f8c332706F8f8d339c08#code

### FlashSwapV3
- **Gist:** ${v3Gist.html_url}
- **Raw Contract:** ${v3FlattenedUrl}
- **Constructor Args:** ${v3ArgsUrl}
- **BaseScan (after verification):** https://basescan.org/address/0x4926E08c0aF3307Ea7840855515b22596D39F7eb#code

---

## 💡 Why Use Gist for Verification?

✅ **Avoids character limits** - No need to paste 2000+ lines manually
✅ **Version control** - Gists track changes if you update contracts
✅ **Reusable** - Same Gist can be used across multiple verifications
✅ **Reliable** - GitHub's infrastructure ensures high availability
✅ **Simple** - Just enter the GistID and BaseScan does the rest

---

*Generated by TheWarden Contract Verification System*
`;
  
  writeFileSync(outputPath, doc);
  console.log(`\n📝 Documentation generated: ${outputPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║   GitHub Gist Upload for BaseScan Contract Verification          ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  
  // Get GitHub token
  const token = process.env.GITHUB_TOKEN || process.env.GH_PAT_COPILOT;
  
  if (!token) {
    console.error('❌ Error: GitHub token not found');
    console.error('\nSetup required:');
    console.error('  1. Install dependencies: nvm install 22 && nvm use 22 && npm install');
    console.error('  2. Generate token at: https://github.com/settings/tokens/new');
    console.error('     Required scope: gist');
    console.error('  3. Add to .env file:');
    console.error('     GITHUB_TOKEN=ghp_your_token_here');
    console.error('     OR');
    console.error('     GH_PAT_COPILOT=ghp_your_token_here\n');
    process.exit(1);
  }
  
  try {
    // Create separate gists for each contract
    const { v2, v3 } = await createGists(token);
    
    // Generate documentation
    generateGistUrlsDoc(v2, v3);
    
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                        SUCCESS! 🎉                                 ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 Summary:\n');
    console.log(`   FlashSwapV2 Gist:  ${v2.html_url}`);
    console.log(`   FlashSwapV2 ID:    ${v2.id}`);
    console.log(`   FlashSwapV3 Gist:  ${v3.html_url}`);
    console.log(`   FlashSwapV3 ID:    ${v3.id}`);
    console.log(`   Documentation:     verification/GIST_URLS.md`);
    
    console.log('\n📖 Next Steps:\n');
    console.log('   1. Open verification/GIST_URLS.md for detailed instructions');
    console.log('   2. Visit BaseScan verification page for each contract');
    console.log(`   3. Enter GistID in BaseScan form:\n`);
    console.log(`      FlashSwapV2 GistID: ${v2.id}`);
    console.log(`      FlashSwapV3 GistID: ${v3.id}\n`);
    
    console.log('🔗 Quick Links:\n');
    console.log(`   FlashSwapV2 Verification: https://basescan.org/verifyContract?a=0x6e2473E4BEFb66618962f8c332706F8f8d339c08`);
    console.log(`   FlashSwapV3 Verification: https://basescan.org/verifyContract?a=0x4926E08c0aF3307Ea7840855515b22596D39F7eb\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    console.error('\nTroubleshooting:');
    console.error('  1. Verify your GitHub token has "gist" scope');
    console.error('  2. Check that verification files exist in ./verification/');
    console.error('  3. Ensure you have network connectivity to GitHub API\n');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { createContractGist, createGists, generateGistUrlsDoc };
