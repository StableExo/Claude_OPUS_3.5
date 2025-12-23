# GitHub Pages Setup for TheWarden

This document explains the GitHub Pages configuration for the AEV - TheWarden project.

## Overview

The project uses **GitHub Pages** with **Jekyll** to automatically generate and host documentation from the repository. The site is available at:

**https://stableexo.github.io/Claude_OPUS_3.5/**

## Configuration Files

### `_config.yml`
The main Jekyll configuration file that defines:
- Site metadata (title, description, author)
- Theme settings (using Primer theme)
- Navigation structure
- Build settings and exclusions
- SEO and social media tags

### `_layouts/default.html`
Custom layout template that includes:
- Navigation header
- Main content area
- Footer with quick links and community information
- Responsive design with mobile support

### `_includes/navigation.html`
Navigation component with links to:
- Home page
- Documentation index
- Getting Started guide
- API reference
- Contributing guidelines
- GitHub repository

### `Gemfile`
Ruby dependencies for Jekyll and GitHub Pages plugins:
- `github-pages` - GitHub Pages gem bundle
- `jekyll-remote-theme` - Theme support
- `jekyll-seo-tag` - SEO optimization
- `jekyll-sitemap` - Automatic sitemap generation
- `jekyll-feed` - RSS/Atom feed generation

## Documentation Structure

### Main Pages
- **`README.md`** → Homepage with project overview
- **`docs/index.md`** → Documentation landing page with organized navigation
- **`docs/INDEX.md`** → Complete documentation index (75+ files organized)

### Key Documentation Sections
All documentation in the `docs/` directory is automatically published:

- **Quick Start Guides** (`docs/guides/quick-start/`)
- **Migration Guides** (`docs/guides/migration/`)
- **Bitcoin & Mempool** (`docs/bitcoin/`)
- **Supabase Integration** (`docs/supabase/`)
- **Machine Learning** (`docs/ml/`)
- **Consciousness System** (`docs/consciousness/`)
- **MCP Configuration** (`docs/mcp/`)
- **Research & Analysis** (`docs/research/`)
- **Session Summaries** (`docs/sessions/`)

## Features

### Navigation
- Top navigation bar with key links
- Mobile-responsive design
- Consistent across all pages

### SEO Optimization
- Automatic meta tags generation
- Open Graph tags for social media
- Twitter card support
- Structured data (JSON-LD)

### Site Features
- Automatic sitemap generation
- RSS/Atom feed for updates
- Syntax highlighting for code blocks
- GitHub-flavored Markdown support
- Responsive tables and images

### Footer
- Project description
- Quick links to documentation
- Community links (GitHub, Issues, PRs)
- Recognition badges (Dark Reading feature, test count, version)
- Copyright and license information

## Building Locally

To test the site locally before pushing:

### Prerequisites
```bash
# Install Ruby (version 2.7 or higher)
# Install Bundler
gem install bundler
```

### Setup
```bash
# Install dependencies
bundle install
```

### Run Local Server
```bash
# Start Jekyll server
bundle exec jekyll serve

# Site will be available at http://localhost:4000/Claude_OPUS_3.5/
```

### Build Static Site
```bash
# Generate static files
bundle exec jekyll build

# Output in _site/ directory
```

## GitHub Pages Settings

The site is configured in the GitHub repository settings under **Pages**:

- **Source**: Deploy from a branch
- **Branch**: `main` (or your default branch)
- **Folder**: `/` (root)
- **Custom domain**: None (using GitHub's subdomain)

## Automatic Updates

GitHub Pages automatically rebuilds and deploys the site when:
1. Changes are pushed to the main branch
2. Pull requests are merged
3. Any Markdown files in the repository are updated

Typical rebuild time: 1-2 minutes

## Theme

The site uses the **Primer** theme, which is:
- GitHub's design system
- Clean and professional
- Responsive and accessible
- Optimized for documentation

## Excluded Content

The following are excluded from the published site (configured in `_config.yml`):
- Source code directories (`src/`, `scripts/`, etc.)
- Build artifacts and dependencies (`node_modules/`, `_site/`, etc.)
- Configuration files (`*.json`, `*.yml`, `*.config.*`)
- Development files (`.env*`, TypeScript, etc.)
- Private memory and data (`.memory/`, `.memory-exports/`, `data/`)

## Best Practices

### Adding New Documentation
1. Create Markdown files in the appropriate `docs/` subdirectory
2. Add front matter with layout and title:
   ```yaml
   ---
   layout: default
   title: Your Page Title
   description: Optional description
   ---
   ```
3. Update `docs/index.md` or `docs/INDEX.md` with links to new pages
4. Commit and push - site updates automatically

### Linking Between Pages
Use relative links with `.html` extension:
```markdown
[Link Text](../path/to/page.html)
```

### Images
Place images in `docs/assets/images/` or similar:
```markdown
![Alt Text](assets/images/screenshot.png)
```

### Code Blocks
Use fenced code blocks with language identifiers:
````markdown
```javascript
console.log('Hello, World!');
```
````

## Troubleshooting

### Site Not Updating
1. Check GitHub Actions tab for build status
2. Verify changes are pushed to the correct branch
3. Clear browser cache
4. Check `_config.yml` for syntax errors

### Build Errors
1. Review GitHub Pages build logs
2. Test locally with `bundle exec jekyll serve`
3. Validate YAML front matter
4. Check for unsupported plugins

### Styling Issues
1. Verify custom CSS is in `_includes/` or `_layouts/`
2. Check browser console for errors
3. Test on different screen sizes
4. Validate HTML structure

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Primer Theme](https://github.com/pages-themes/primer)
- [Markdown Guide](https://www.markdownguide.org/)

## Maintenance

### Regular Tasks
- Keep documentation up to date
- Update version numbers in footer
- Review and fix broken links
- Update navigation as structure changes
- Keep README.md comprehensive

### Version Updates
When releasing new versions:
1. Update version in README.md badges
2. Update footer in `_layouts/default.html`
3. Add entry to CHANGELOG.md
4. Rebuild site automatically on push

## Contributing to Documentation

See [CONTRIBUTING.md](../CONTRIBUTING.html) for general contribution guidelines.

For documentation-specific contributions:
1. Follow the existing structure and style
2. Keep content clear and concise
3. Include code examples where helpful
4. Test all links before committing
5. Update the index pages when adding new documents

---

**Last Updated:** December 23, 2025  
**Maintained By:** StableExo & TheWarden Team
