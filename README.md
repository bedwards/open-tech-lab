# Open Tech Lab

[![Build Status](https://github.com/bedwards/open-tech-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/bedwards/open-tech-lab/actions)
[![codecov](https://codecov.io/gh/bedwards/open-tech-lab/branch/main/graph/badge.svg)](https://codecov.io/gh/bedwards/open-tech-lab)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Appwrite](https://img.shields.io/badge/Appwrite-1.6-f02e65)](https://appwrite.io/docs)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020)](https://developers.cloudflare.com/workers)
[![SQLite](https://img.shields.io/badge/SQLite-3.45-003b57)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> A self-hosted, community-driven tech workspace powered by Appwrite, SQLite, and Cloudflare Workers.

## Overview

Open Tech Lab is a distributed, self-contained platform where technologists can design, test, and publish micro-apps directly from their browsers. It blends edge compute, serverless logic, and a lightweight embedded database to emulate the infrastructure of a modern SaaS environment without any dependence on centralized providers.

## Philosophy

Open Tech Lab is both a tool and a statement: an act of technological mutual aid. It demonstrates that the infrastructure of modern software development can be rebuilt from open components, owned by their users, running on free, perpetual tiers. It's a digital workshop for the disenfranchised technologist, a place where the tools of creation are not monetized pipelines but shared public goods.

## Architecture

### System Components

- **Frontend**: Vanilla TypeScript with Web Components, Vite, Service Workers, and IndexedDB
- **Backend**: Appwrite (self-hosted on Fly.io free tier)
- **Database**: SQLite with Drizzle ORM and SQLCipher encryption
- **Edge**: Cloudflare Workers with Durable Objects for execution sandboxes
- **CI/CD**: GitHub Actions with automated testing, deployment, and backups

### Data Flow

```
Browser → Cloudflare Worker → Appwrite (Fly.io) → SQLite
    ↓
IndexedDB (offline)
    ↓
Service Worker (sync)
```

## Features

1. **Collaborative Editor** – Real-time project sharing via Appwrite Realtime API with CRDT-based merging
2. **Edge Execution Sandbox** – Workers simulate production deployment for instant code preview
3. **Knowledge Base** – Dynamic Markdown documentation rendered on GitHub Pages
4. **Plugin Marketplace** – Community-verified extensions stored in SQLite
5. **Analytics Dashboard** – Lightweight anonymized metrics aggregated at the edge
6. **Offline Mode** – Full editing capabilities with IndexedDB and Service Worker sync

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Fly.io CLI
- Wrangler CLI
- GitHub account

### Installation

```bash
# Clone the repository
git clone https://github.com/bedwards/open-tech-lab.git
cd open-tech-lab

# Install dependencies
npm install

# Setup Husky hooks
npm run prepare
```

### Local Development

```bash
# Start all services locally
npm run dev:all

# Or start individually:
npm run dev:frontend  # Vite dev server
npm run dev:worker    # Wrangler local preview
npm run dev:appwrite  # Local Appwrite via Docker
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Deployment

```bash
# Build for production
npm run build

# Deploy everything
npm run deploy

# Or deploy individually:
npm run deploy:pages    # GitHub Pages
npm run deploy:worker   # Cloudflare Workers
npm run deploy:appwrite # Fly.io
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
APPWRITE_ENDPOINT=https://your-app.fly.dev/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### GitHub Secrets

Required secrets for CI/CD:

- `APPWRITE_API_KEY`
- `FLY_API_TOKEN`
- `CLOUDFLARE_API_TOKEN`
- `CODECOV_TOKEN`

## Project Structure

- `/src/frontend` - Web UI components and client logic
- `/src/workers` - Cloudflare Workers for edge compute
- `/src/appwrite` - Appwrite functions and configuration
- `/src/db` - SQLite schema and migrations
- `/tests` - Vitest test suites
- `/public` - Static assets for GitHub Pages

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## License

MIT License - see [LICENSE](./LICENSE) for details

## Support

- Documentation: [Wiki](https://github.com/bedwards/open-tech-lab/wiki)
- Issues: [GitHub Issues](https://github.com/bedwards/open-tech-lab/issues)
- Discussions: [GitHub Discussions](https://github.com/bedwards/open-tech-lab/discussions)

---

**Built with ❤️ for the open tech community**
