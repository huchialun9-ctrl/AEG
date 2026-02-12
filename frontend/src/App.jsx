import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast, { Toaster } from 'react-hot-toast';

// --- Configuration ---
const CONTRACT_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";
const DEV_ADDRESS = "0xBDC4566852B6B45148dBCb2119a4695dfd4e5d77";

const TOKEN_ABI = [
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
];

// --- Components ---
const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '20px 0', padding: '15px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', animation: 'pulse 2s infinite' }}>
      <div style={{ fontSize: '0.9rem', color: '#ff4d4d', marginBottom: '5px', fontWeight: 'bold' }}>⚡ PRICE INCREASE IN</div>
      <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>
        {String(time.h).padStart(2, '0')}h : {String(time.m).padStart(2, '0')}m : {String(time.s).padStart(2, '0')}s
      </div>
    </div>
  );
};

const LiveTicker = () => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  const generateNotification = () => {
    const addr = "0x" + Array(4).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("") + "..." + Array(4).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    const amount = (Math.random() * 2 + 0.1).toFixed(2);
    return { addr, amount };
  };

  useEffect(() => {
    const loop = () => {
      const delay = Math.random() * 5000 + 3000;
      setTimeout(() => {
        setNotification(generateNotification());
        setVisible(true);
        setTimeout(() => setVisible(false), 4000);
        loop();
      }, delay);
    };
    loop();
  }, []);

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(13, 13, 13, 0.9)',
      border: '1px solid var(--accent-color)',
      borderRadius: '8px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      transform: visible ? 'translateY(0)' : 'translateY(100px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <div style={{ background: 'rgba(0, 211, 149, 0.2)', color: 'var(--accent-color)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fas fa-bolt"></i>
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: '#888' }}>Someone just bought</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff' }}>
          {notification.amount} ETH <span style={{ color: 'var(--accent-color)' }}>(${(notification.amount * 3200).toFixed(0)})</span>
        </div>
      </div>
    </div>
  );
};

// ... (existing App component)


function App() {
  const { address, isConnected } = useAccount();
  const { sendTransaction, data: hash, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [ethAmount, setEthAmount] = useState('');
  const [refLink, setRefLink] = useState('');
  const [showDevModal, setShowDevModal] = useState(false);

  // Read User Balance
  // ... (unchanged)

  // ... (unchanged logic)

  // ... (unchanged return statement start)

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          border: '1px solid #444',
        },
      }} />
      <LiveTicker />

      {/* Developer Modal */}
      {showDevModal && (
        <div className="modal-overlay" onClick={() => setShowDevModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDevModal(false)}>&times;</button>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>👨‍💻 Core Developer</h2>
            <div className="dev-profile">
              <div className="dev-avatar">L</div>
              <div className="dev-info">
                <h3>Lucas</h3>
                <p className="dev-role">Lead Blockchain Architect</p>
                <p className="dev-desc">Full-stack Web3 developer specializing in Solidity smart contract audits and high-performance frontend interactions. Dedicated to building secure, transparent DeFi protocols.</p>
                <div className="resource-list" style={{ marginTop: '0' }}>
                  <a href="https://github.com/huchialun9-ctrl" target="_blank" rel="noreferrer" style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'inline-flex', marginRight: '10px', background: '#333' }}>
                    <i className="fab fa-github"></i> GitHub Profile
                  </a>
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: '25px', marginBottom: '15px', fontSize: '1rem', color: '#888' }}>🛠️ Developer Resources</h3>
            <ul className="resource-list">
              <li>
                <a href="https://github.com/huchialun9-ctrl/AEG" target="_blank" rel="noreferrer">
                  <i className="fas fa-box-open"></i>
                  <div>
                    <strong>Project Source Code</strong>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Official repository for Aegis Protocol</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="https://docs.base.org/" target="_blank" rel="noreferrer">
                  <i className="fas fa-book"></i>
                  <div>
                    <strong>Base Documentation</strong>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Build on Base L2</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="bg-decoration">
        <div className="grid-overlay"></div>
      </div>

      {/* Top Announcement Bar */}
      <div className="top-announcement-bar">
        <p>🔥 <strong>SEED ROUND IS LIVE!</strong> &nbsp; <span className="blink-text">EARLY BIRD PRICE: 1 ETH = 23,176 AEG</span> &nbsp; (Limited Time) 🔥</p>
      </div>

      <nav className="navbar">
        <div className="nav-content">
          <div className="brand">
            <img src="/aegis_logo.png" alt="Aegis Logo" className="brand-logo-main" />
            <span className="brand-name-main">AEGIS</span>
          </div>
          <div className="nav-actions">

            <button className="btn-nav-text" onClick={() => setShowDevModal(true)}>
              <i className="fas fa-code"></i> Developers
            </button>

            <div className="rainbow-connect-wrapper">
              <ConnectButton showBalance={false} />
            </div>
          </div>
        </div>
      </nav>

      <main className="portfolio-container">
        {/* Elite Header Section */}
        <section className="portfolio-hero fade-in">
          <div className="user-header">
            <div className="status-badge">
              <span className="pulse-dot"></span>
              <span>LIVE ON BASE MAINNET</span>
            </div>
            <h1>AEGIS GLOBAL</h1>
            <p className="hero-subtitle">精英級去中心化安全與收益協議，致力於構建透明、精簡、高效的資產管理生態。</p>
          </div>
        </section>

        {/* Main Balance Visualizer */}
        <section className="main-stats-section fade-in">
          <div className="portfolio-main-card">
            <div className="balance-info">
              <span className="balance-label">預估資產價值 (AEG)</span>
              <div className="balance-main">
                <img src="/aegis_token.png" alt="AEG" style={{ width: '48px', height: '48px', marginRight: '15px' }} />
                <span className="value-text">{displayBalance}</span>
              </div>
              <div className="usd-value-container">
                <span className="usd-symbol">≈ $</span>
                <span>{displayUsd}</span>
              </div>
              <div className="usd-value-container" style={{ marginTop: '5px' }}>
                <span className="indicator-up" style={{ color: '#00D395', fontSize: '0.9rem' }}>APY 18.5% 已激活</span>
              </div>
            </div>
          </div>

          {/* Referral Center */}
          {isConnected && (
            <div id="referral-center" className="portfolio-main-card fade-in" style={{ marginTop: '20px' }}>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <h4 style={{ marginBottom: '5px' }}>推薦計畫</h4>
                <p style={{ fontSize: '11px', opacity: 0.7 }}>您的專屬推薦連結</p>
                <div className="input-group-elite" style={{ marginTop: '5px', justifyContent: 'center' }}>
                  <input type="text" value={refLink} readOnly style={{ fontSize: '11px', textAlign: 'center' }} />
                  <button className="btn-elite btn-accent" style={{ padding: '5px 15px', minWidth: 'auto', fontSize: '11px' }} onClick={() => {
                    navigator.clipboard.writeText(refLink);
                    alert("Link Copied!");
                  }}>
                    複製連結
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Instruction Banner */}
        <section className="instruction-banner fade-in">
          <div className="banner-content">
            <h2>🚀 如何參與預售 (How to Buy)</h2>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-icon">1</div>
                <p>連接錢包<br />Connect Wallet (Base)</p>
              </div>
              <div className="step-arrow"><i className="fas fa-chevron-right"></i></div>
              <div className="step-item">
                <div className="step-icon">2</div>
                <p>輸入 ETH 數量<br />Enter Amount</p>
              </div>
              <div className="step-arrow"><i className="fas fa-chevron-right"></i></div>
              <div className="step-item">
                <div className="step-icon">3</div>
                <p>點擊搶購 & 等待空投<br />Buy & Wait Airdrop</p>
              </div>
            </div>
          </div>
        </section>

        {/* Presale Benefits & Comparison */}
        <section className="benefits-section fade-in" style={{ maxWidth: '1000px', margin: '0 auto 4rem', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* Benefit Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Why Join Seed Round?</h3>

              <div className="benefit-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#00D395', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-tag"></i> Lowest Entry Price
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '5px' }}>
                  Get AEG at the absolute bottom price.
                  <br /><strong>Seed Price: $0.00012</strong> vs <strong>Listing: $0.00500</strong>
                </p>
              </div>

              <div className="benefit-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#037DD6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-shield-alt"></i> No Slippage & Tax
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '5px' }}>
                  track directly from the protocol. Zero trading fees, zero price impact.
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div style={{ background: '#0d0d0d', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden' }}>
              <div style={{ background: '#1a1a1a', padding: '1rem', textAlign: 'center', borderBottom: '1px solid #333' }}>
                <h4 style={{ margin: 0 }}>Price Comparison</h4>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #222' }}>
                  <span style={{ color: '#888' }}>Stage</span>
                  <span style={{ fontWeight: 'bold' }}>Price (AEG)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#00D395', fontWeight: 'bold' }}>
                  <span>🟢 Seed Round (Now)</span>
                  <span>$0.00012</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: '0.7' }}>
                  <span>🟡 Private Sale</span>
                  <span>$0.00080</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: '0.7' }}>
                  <span>⚪ Public IDO</span>
                  <span>$0.00250</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #333' }}>
                  <span>🚀 Exchange Listing</span>
                  <span style={{ color: '#ff00cc', fontWeight: 'bold' }}>$0.00500 (+4000%)</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Service Component Grid */}
        <section className="action-services-grid fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="service-card presale-service fade-in" style={{ border: '1px solid var(--accent-color)', maxWidth: '500px', width: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Promo Ribbon */}
            <div style={{ position: 'absolute', top: '15px', right: '-30px', background: 'var(--accent-color)', color: '#000', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '10px', fontWeight: '800', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              EARLY BIRD
            </div>

            <div style={{ padding: '0 20px' }}>
              <CountdownTimer />
            </div>

            <div className="service-header">
              <div className="service-icon-svg" style={{ background: 'var(--accent-color)' }}>
                <i className="fas fa-rocket"></i>
              </div>
              <div className="service-info">
                <h3>種子輪預售 (Stage 1)</h3>
                <p style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>限時優惠：1 ETH = 23,176 AEG</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>
                  上市目標價 Target: $0.10 (+1800%)
                </p>
              </div>
            </div>
            <div className="service-action">
              <div className="input-group-elite" style={{ borderColor: 'var(--accent-color)' }}>
                <i className="fab fa-ethereum"></i>
                <input type="number" placeholder="輸入 ETH 數量" value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} />
                <span className="unit-tag">ETH</span>
              </div>

              <button
                className={`btn-elite btn-primary ${isTxPending || isConfirming ? 'btn-loading' : ''}`}
                onClick={handleBuy}
                disabled={isTxPending || isConfirming}
                style={{ width: '100%', marginTop: '15px', background: 'linearGradient(45deg, var(--primary-color), var(--accent-color))', border: 'none' }}
              >
                {isTxPending ? '需錢包確認...' : isConfirming ? '交易確認中...' : '立即搶購 (Buy Now)'}
              </button>

              <p className="service-footer-hint" style={{ marginTop: '15px', textAlign: 'center', opacity: 0.8 }}>
                資金將全數用於開啟流動性池。
              </p>
            </div>
          </div>
        </section>



        {/* Tokenomics & Utility Section */}
        <section className="tokenomics-section fade-in" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            About Aegis (AEG)
          </h2>
          <p style={{ maxWidth: '700px', margin: '0 auto 3rem', color: '#ccc', lineHeight: '1.6' }}>
            AEG is the native utility and governance token of the Aegis Protocol.
            Designed on the Base network, it powers the ecosystem through staking rewards,
            premium access, and decentralized decision-making.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Token Stats */}
            <div style={{ background: '#0d0d0d', border: '1px solid #333', borderRadius: '16px', padding: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <img src="/aegis_token.png" alt="AEG" style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Token Specs</h3>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>Base Mainnet (ERC-20)</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                <span style={{ color: '#888' }}>Symbol</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>AEG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                <span style={{ color: '#888' }}>Total Supply</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>1,000,000,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888' }}>Contract</span>
                <button onClick={() => {
                  navigator.clipboard.writeText(CONTRACT_ADDRESS);
                  toast.success("Address Copied!");
                }} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
                  {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)} <i className="far fa-copy"></i>
                </button>
              </div>
            </div>

            {/* Utility List */}
            <div style={{ background: '#0d0d0d', border: '1px solid #333', borderRadius: '16px', padding: '2rem', textAlign: 'left' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem' }}>Core Utility</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--primary-color)', marginTop: '4px' }}></i>
                  <div>
                    <strong style={{ color: '#fff' }}>Governance</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#888' }}>Vote on protocol upgrades and treasury usage.</p>
                  </div>
                </li>
                <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--accent-color)', marginTop: '4px' }}></i>
                  <div>
                    <strong style={{ color: '#fff' }}>Staking Rewards</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#888' }}>Earn up to 18.5% APY by securing the network.</p>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <i className="fas fa-check-circle" style={{ color: '#ff4d4d', marginTop: '4px' }}></i>
                  <div>
                    <strong style={{ color: '#fff' }}>Security Verification</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#888' }}>Access premium audit reports and security tools.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer Stats Mini */}
        <div className="global-stats-footer fade-in">
          <div className="mini-stat-item">
            <label>全網註冊總發行量</label>
            <div>1,000,000,000</div>
          </div>
          <div className="mini-stat-item">
            <label>協議識別代碼</label>
            <div>AEG</div>
          </div>
        </div>

        {/* Transaction History - Simplified for Demo */}
        <section className="transaction-history-section fade-in">
          <h4>近期協議交互紀錄</h4>
          <div className="history-list">
            {hash && (
              <div className="history-item fade-in">
                <div className="history-info">
                  <span className="history-type-pill type-claim">BUY</span>
                  <span className="history-amount">{ethAmount} ETH</span>
                </div>
                <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" className="history-hash">
                  View on Explorer
                </a>
              </div>
            )}
            <div className="history-placeholder">尚無其他近期鏈上紀錄</div>
          </div>
        </section>
      </main >

      <footer className="footer">
        <div className="footer-links">
          <a href="https://github.com/huchialun9-ctrl/AEG.git" target="_blank" rel="noreferrer">技術源碼</a>
          <a href="#" target="_blank">技術白皮書</a>
        </div>
        <p className="footer-copyright">© 2026 Aegis 全球安全計畫。Base 主網技術開發。</p>
        <p className="footer-disclaimer" style={{ fontSize: '0.7rem', opacity: 0.4, maxWidth: '600px', margin: '10px auto 0', textAlign: 'center' }}>
          Disclaimer: Cryptocurrency investments involve high risk. The simplified visuals (e.g., APY, price targets) are for illustrative purposes only.
          AEG is a utility token for the Aegis ecosystem. Please do your own research (DYOR) before participating.
        </p>
      </footer>
    </>
  );
}

export default App;
