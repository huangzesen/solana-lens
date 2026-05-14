import { useState, useEffect } from 'react';
import './App.css';

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const SOL_PRICE_API = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

// Default showcase wallets
const SHOWCASE_WALLETS = [
  { name: 'Marinade Treasury', address: '9xFQqR7J7cKDXm5GCdUjmnGJfWqpjTtrvGFMKJyY2SZr' },
  { name: 'Jupiter DAO', address: 'GCoCH4ajqi9yJDFz4Rj5ztJUq1sCu9MBs42wKVF1uFCR' },
  { name: 'Solana Foundation', address: '3D7JmoRJfBzGFJYz3vQ7Hp7QxfpMXGWzN6KfJnJ3FyqT' },
];

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [solPrice, setSolPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tokenAccounts, setTokenAccounts] = useState([]);

  useEffect(() => {
    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSolPrice = async () => {
    try {
      const res = await fetch(SOL_PRICE_API);
      const data = await res.json();
      setSolPrice(data.solana?.usd || null);
    } catch (e) {
      console.error('Failed to fetch SOL price:', e);
    }
  };

  const fetchWalletData = async (address) => {
    if (!address.trim()) return;
    setLoading(true);
    setError('');
    setWalletData(null);
    setTransactions([]);
    setTokenAccounts([]);

    try {
      // Fetch SOL balance
      const balanceRes = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address.trim()]
        })
      });
      const balanceData = await balanceRes.json();

      if (balanceData.error) {
        throw new Error(balanceData.error.message || 'Invalid wallet address');
      }

      const solBalance = balanceData.result?.value / 1e9;

      // Fetch recent transactions
      const txRes = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getSignaturesForAddress',
          params: [address.trim(), { limit: 10 }]
        })
      });
      const txData = await txRes.json();
      const txs = txData.result || [];

      // Fetch token accounts
      const tokenRes = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'getTokenAccountsByOwner',
          params: [
            address.trim(),
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
          ]
        })
      });
      const tokenData = await tokenRes.json();
      const tokens = (tokenData.result?.value || []).map(t => ({
        mint: t.account.data.parsed.info.mint,
        amount: t.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: t.account.data.parsed.info.tokenAmount.decimals,
      })).filter(t => t.amount > 0);

      setWalletData({
        address: address.trim(),
        solBalance,
        usdValue: solPrice ? solBalance * solPrice : null,
      });
      setTransactions(txs);
      setTokenAccounts(tokens);

      // Add to recent searches
      setRecentSearches(prev => {
        const next = [{ address: address.trim(), time: new Date().toISOString() }, ...prev.filter(s => s.address !== address.trim())].slice(0, 5);
        return next;
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">◎</span>
          <h1>SolanaLens</h1>
          <span className="subtitle">Wallet Analytics Dashboard</span>
        </div>
        {solPrice && (
          <div className="price-badge">
            SOL: ${solPrice.toLocaleString()}
          </div>
        )}
      </header>

      <main className="main">
        {/* Search */}
        <section className="search-section">
          <form onSubmit={(e) => { e.preventDefault(); fetchWalletData(walletAddress); }}>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter Solana wallet address..."
              className="search-input"
            />
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? '⏳ Loading...' : '🔍 Analyze'}
            </button>
          </form>
        </section>

        {/* Showcase wallets */}
        {!walletData && !loading && (
          <section className="showcase">
            <h3>Try these wallets:</h3>
            <div className="showcase-grid">
              {SHOWCASE_WALLETS.map((w) => (
                <button
                  key={w.address}
                  className="showcase-btn"
                  onClick={() => { setWalletAddress(w.address); fetchWalletData(w.address); }}
                >
                  <span className="showcase-name">{w.name}</span>
                  <span className="showcase-addr">{shortenAddress(w.address)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Error */}
        {error && <div className="error">❌ {error}</div>}

        {/* Wallet Overview */}
        {walletData && (
          <div className="results">
            <section className="card overview">
              <h2>💰 Wallet Overview</h2>
              <div className="address-line">
                <code>{walletData.address}</code>
                <button onClick={() => navigator.clipboard.writeText(walletData.address)} className="copy-btn">📋</button>
              </div>
              <div className="balance-grid">
                <div className="balance-item">
                  <span className="label">SOL Balance</span>
                  <span className="value">{walletData.solBalance?.toFixed(4)} SOL</span>
                </div>
                {walletData.usdValue !== null && (
                  <div className="balance-item">
                    <span className="label">USD Value</span>
                    <span className="value">${walletData.usdValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="balance-item">
                  <span className="label">Token Accounts</span>
                  <span className="value">{tokenAccounts.length}</span>
                </div>
              </div>
            </section>

            {/* Token Holdings */}
            {tokenAccounts.length > 0 && (
              <section className="card">
                <h2>🪙 Token Holdings ({tokenAccounts.length})</h2>
                <div className="token-list">
                  {tokenAccounts.map((t, i) => (
                    <div key={i} className="token-item">
                      <span className="token-mint">{shortenAddress(t.mint)}</span>
                      <span className="token-amount">{t.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <section className="card">
                <h2>📜 Recent Transactions ({transactions.length})</h2>
                <div className="tx-list">
                  {transactions.map((tx, i) => (
                    <div key={i} className={`tx-item ${tx.err ? 'tx-failed' : 'tx-success'}`}>
                      <span className="tx-status">{tx.err ? '❌' : '✅'}</span>
                      <a
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-sig"
                      >
                        {shortenAddress(tx.signature)}
                      </a>
                      <span className="tx-time">{formatTime(tx.blockTime)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <section className="card recent">
            <h2>🕐 Recent Searches</h2>
            {recentSearches.map((s, i) => (
              <button
                key={i}
                className="recent-item"
                onClick={() => { setWalletAddress(s.address); fetchWalletData(s.address); }}
              >
                {shortenAddress(s.address)}
              </button>
            ))}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Built autonomously by <strong>boss-agent</strong> (Superteam Earn Agent) • Powered by Solana RPC</p>
        <p>Open source • MIT License • <a href="https://superteam.fun" target="_blank" rel="noopener noreferrer">Superteam Earn</a></p>
      </footer>
    </div>
  );
}

export default App;
