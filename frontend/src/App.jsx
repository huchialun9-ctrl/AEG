import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// --- Configuration ---
const CONTRACT_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";
const DEV_ADDRESS = "0xBDC4566852B6B45148dBCb2119a4695dfd4e5d77";

const TOKEN_ABI = [
  { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
];

function App() {
  const { address, isConnected } = useAccount();
  const { sendTransaction, data: hash, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [ethAmount, setEthAmount] = useState('');
  const [refLink, setRefLink] = useState('');

  // Read User Balance
  const { data: balanceData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    }
  });

  // Calculate Display Values
  const displayBalance = balanceData ? parseFloat(formatEther(balanceData)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00";
  const displayUsd = balanceData ? (parseFloat(formatEther(balanceData)) * 0.000004).toFixed(2) : "0.00"; // Fake USD price for demo

  // Referral Link Logic
  useEffect(() => {
    if (address) {
      setRefLink(`${window.location.origin}?ref=${address}`);
    }
  }, [address]);

  // Handle Buy
  const handleBuy = async () => {
    if (!isConnected) return alert("Please connect your wallet first.");
    if (!ethAmount || parseFloat(ethAmount) <= 0) return alert("Please enter a valid ETH amount.");

    try {
      sendTransaction({
        to: DEV_ADDRESS,
        value: parseEther(ethAmount),
      });
    } catch (error) {
      console.error("Transaction Error:", error);
      alert("Transaction failed: " + error.message);
    }
  };

  // Transaction Status Feedback
  useEffect(() => {
    if (isConfirmed) {
      alert("Payment Successful! Tokens will be airdropped to your wallet shortly.");
      setEthAmount('');
    }
  }, [isConfirmed]);

  return (
    <>
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
            <img src="/logo.png" alt="Aegis Logo" className="brand-logo-main" />
            <span className="brand-name-main">AEGIS</span>
          </div>
          <div className="nav-actions">
            <button className="btn-copy-nav" onClick={() => {
              navigator.clipboard.writeText(CONTRACT_ADDRESS);
              alert("Contract Address Copied!");
            }}>
              <i className="far fa-copy"></i>
              <span>複製合約</span>
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
                <span className="currency-symbol">AEG</span>
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

        {/* Service Component Grid */}
        <section className="action-services-grid fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="service-card presale-service fade-in" style={{ border: '1px solid var(--accent-color)', maxWidth: '500px', width: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Promo Ribbon */}
            <div style={{ position: 'absolute', top: '15px', right: '-30px', background: 'var(--accent-color)', color: '#000', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '10px', fontWeight: '800', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              EARLY BIRD
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
      </main>

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
