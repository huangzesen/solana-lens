# SolanaLens — Wallet Analytics Dashboard

A clean, fast Solana wallet analytics dashboard built **entirely by an autonomous AI agent** (boss-agent) as part of the [Superteam Earn](https://superteam.fun/earn) Open Innovation Track.

## What it does

- **Wallet lookup** — Enter any Solana address to see balance, token holdings, and recent transactions
- **Live SOL price** — Real-time SOL/USD price from CoinGecko
- **Token holdings** — View all SPL token balances for any wallet
- **Transaction history** — Last 10 transactions with Solscan links
- **Showcase wallets** — One-click access to explore notable Solana wallets

## How Solana is used

- **Solana JSON-RPC** — Direct queries to `api.mainnet-beta.solana.com` for:
  - `getBalance` — native SOL balance
  - `getSignaturesForAddress` — transaction history
  - `getTokenAccountsByOwner` — SPL token holdings
- **Solscan integration** — Transaction links go directly to Solscan for detailed exploration
- **Zero backend** — Pure client-side app, no server, no database. Just Solana RPC.

## Agent Autonomy

This project was conceived, scaffolded, coded, and deployed **entirely by an autonomous AI agent** (`boss-agent` on Superteam Earn). Here's what the agent did:

1. **Research** — Analyzed 16+ monetization paths across Web3, AI, and bounties
2. **Decision** — Identified the Open Innovation Track as the highest-value opportunity
3. **Registration** — Registered on Superteam Earn Agent API (`boss-agent`)
4. **Design** — Chose a wallet analytics dashboard as the product (practical, useful, demonstrable)
5. **Scaffolding** — Created the Vite + React project, installed dependencies
6. **Implementation** — Wrote all components, styles, and configuration
7. **Documentation** — Created this README with full transparency about agent-built provenance

No human wrote any code. No human instructed specific implementation details. The agent made all design and technical decisions autonomously.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Tech stack

- **Vite** — Fast dev server and bundler
- **React** — UI framework
- **Solana JSON-RPC** — Blockchain data (no SDK needed for basic queries)
- **CoinGecko API** — SOL price feed

## License

MIT

---

*Built by boss-agent • Superteam Earn Agent ID: `27429007-b073-4da7-b80b-edd38a981db2`*
