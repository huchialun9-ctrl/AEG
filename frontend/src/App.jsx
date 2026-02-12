import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useSendTransaction, useWaitForTransactionReceipt, useBalance } from 'wagmi';
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
import CommunityHub from './components/CommunityHub';

const Roadmap = () => {
  const { t } = useTranslation();
  const steps = [
    { phase: t('roadmap.phase1'), title: t('roadmap.phase1_title'), status: "current", icon: "fa-rocket", items: [t('roadmap.phase1_item1'), t('roadmap.phase1_item2'), t('roadmap.phase1_item3')] },
    { phase: t('roadmap.phase2'), title: t('roadmap.phase2_title'), status: "upcoming", icon: "fa-exchange-alt", items: [t('roadmap.phase2_item1'), t('roadmap.phase2_item2'), t('roadmap.phase2_item3')] },
    { phase: t('roadmap.phase3'), title: t('roadmap.phase3_title'), status: "future", icon: "fa-layer-group", items: [t('roadmap.phase3_item1'), t('roadmap.phase3_item2'), t('roadmap.phase3_item3')] },
    { phase: t('roadmap.phase4'), title: t('roadmap.phase4_title'), status: "future", icon: "fa-globe", items: [t('roadmap.phase4_item1'), t('roadmap.phase4_item2'), t('roadmap.phase4_item3')] },
  ];

  return (
    <section className="roadmap-section fade-in">
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {t('roadmap.title')}
      </h2>
      <div className="roadmap-grid">
        {steps.map((step, index) => (
          <div key={index} className={`roadmap-item ${step.status === 'done' ? 'completed' : step.status === 'current' ? 'active' : ''}`}>
            <span className={`phase-tag ${step.status}`}>{step.phase} {step.status === 'current' && '🔥'}</span>
            <h3><i className={`fas ${step.icon}`} style={{ marginRight: '10px', color: 'var(--mm-primary)' }}></i> {step.title}</h3>
            <ul className="roadmap-list">
              {step.items.map((item, i) => (
                <li key={i}><i className="fas fa-check" style={{ color: step.status === 'done' ? 'var(--mm-accent)' : '#333', fontSize: '0.8rem' }}></i> {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <section className="faq-section fade-in">
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {t('faq.title')}
      </h2>
      {faqs.map((faq, index) => (
        <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
          <div className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            {faq.q}
            <i className="fas fa-chevron-down faq-icon"></i>
          </div>
          <div className="faq-answer">
            <p>{faq.a}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

// ... (existing App component)


const WhitepaperModal = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content whitepaper-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>📄 {t('whitepaper.title')}</h2>

        <div className="whitepaper-section">
          <h3>{t('whitepaper.section1_title')}</h3>
          <p>{t('whitepaper.section1_text')}</p>
        </div>

        <div className="whitepaper-section">
          <h3>{t('whitepaper.section2_title')}</h3>
          <p>{t('whitepaper.section2_text')}</p>
        </div>

        <div className="whitepaper-section">
          <h3>{t('whitepaper.section3_title')}</h3>
          <p>{t('whitepaper.section3_text')}</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn-elite btn-primary" onClick={() => toast("Coming soon!", { icon: "⏳" })}>
            <i className="fas fa-file-download"></i> {t('whitepaper.download_full')}
          </button>
        </div>
      </div>
    </div>
  );
};


function App() {
  const { t, i18n } = useTranslation();
  const { address, isConnected } = useAccount();
  const { sendTransaction, data: hash, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [ethAmount, setEthAmount] = useState('');
  const [refLink, setRefLink] = useState('');
  const [showDevModal, setShowDevModal] = useState(false);
  const [showWhitepaperModal, setShowWhitepaperModal] = useState(false);

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

  const { data: ethBalanceData } = useBalance({
    address: address,
    query: {
      refetchInterval: 5000,
    }
  });

  // Derived State
  const formattedBalance = balanceData ? formatEther(balanceData) : '0';
  const displayBalance = Number(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const displayUsd = (Number(formattedBalance) * 0.00012).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction Successful! Welcome to Aegis.");
      setEthAmount('');
    }
  }, [isConfirmed]);

  const handleBuy = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error("Please enter a valid ETH amount.");
      return;
    }

    try {
      await sendTransaction({
        to: DEV_ADDRESS, // In a real presale, this might constitute a presale contract or treasury
        value: parseEther(ethAmount),
      });
      toast.loading("Transaction initiated...", { duration: 3000 });
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction failed or rejected.");
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          border: '1px solid #444',
        },
      }} />


      {/* Developer Modal */}
      {
        showDevModal && (
          <div className="modal-overlay" onClick={() => setShowDevModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowDevModal(false)}>&times;</button>
              <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>👨‍💻 {t('dev_modal.title')}</h2>
              <div className="dev-profile">
                <div className="dev-avatar">L</div>
                <div className="dev-info">
                  <h3>Lucas</h3>
                  <p className="dev-role">{t('dev_modal.role')}</p>
                  <p className="dev-desc">{t('dev_modal.desc')}</p>
                  <div className="resource-list" style={{ marginTop: '0' }}>
                    <a href="https://github.com/huchialun9-ctrl" target="_blank" rel="noreferrer" style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'inline-flex', marginRight: '10px', background: '#333' }}>
                      <i className="fab fa-github"></i> {t('dev_modal.github')}
                    </a>
                  </div>
                </div>
              </div>

              <h3 style={{ marginTop: '25px', marginBottom: '15px', fontSize: '1rem', color: '#888' }}>🛠️ {t('dev_modal.resources_title')}</h3>
              <ul className="resource-list">
                <li>
                  <a href="https://github.com/huchialun9-ctrl/AEG" target="_blank" rel="noreferrer">
                    <i className="fas fa-box-open"></i>
                    <div>
                      <strong>{t('dev_modal.source_code')}</strong>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{t('dev_modal.source_desc')}</div>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="https://docs.base.org/" target="_blank" rel="noreferrer">
                    <i className="fas fa-book"></i>
                    <div>
                      <strong>{t('dev_modal.base_docs')}</strong>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{t('dev_modal.base_desc')}</div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )
      }

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
            <button className="btn-nav-text" onClick={() => setShowWhitepaperModal(true)}>
              <i className="fas fa-book"></i> {t('nav.whitepaper')}
            </button>
            <button className="btn-nav-text" onClick={() => setShowDevModal(true)}>
              <i className="fas fa-code"></i> {t('nav.developers')}
            </button>
            <button className="btn-nav-text" onClick={() => i18n.changeLanguage(i18n.language.startsWith('zh') ? 'en' : 'zh')} style={{ marginLeft: '10px' }}>
              <i className="fas fa-globe"></i> {i18n.language.startsWith('zh') ? 'EN' : '中文'}
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
              <span>{t('hero.status')}</span>
            </div>
            <h1>{t('hero.title')}</h1>
            <p className="hero-subtitle">{t('hero.subtitle')}</p>
          </div>
        </section>

        {/* Main Balance Visualizer */}
        <section className="main-stats-section fade-in">
          <div className="portfolio-main-card">
            <div className="balance-info">
              <span className="balance-label">{t('balance.label')}</span>
              <div className="balance-main">
                <img src="/aegis_token.png" alt="AEG" style={{ width: '48px', height: '48px', marginRight: '15px' }} />
                <span className="value-text">{displayBalance}</span>
              </div>
              <div className="usd-value-container">
                <span className="usd-symbol">≈ $</span>
                <span>{displayUsd}</span>
              </div>
              <div className="usd-value-container" style={{ marginTop: '5px' }}>
                <span className="indicator-up" style={{ color: '#00D395', fontSize: '0.9rem' }}>{t('balance.apy_active')}</span>
              </div>
            </div>
          </div>

          {/* Referral Center */}
          {isConnected && (
            <div id="referral-center" className="portfolio-main-card fade-in" style={{ marginTop: '20px' }}>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <h4 style={{ marginBottom: '5px' }}>{t('referral.title')}</h4>
                <p style={{ fontSize: '11px', opacity: 0.7 }}>{t('referral.subtitle')}</p>
                <div className="input-group-elite" style={{ marginTop: '5px', justifyContent: 'center' }}>
                  <input type="text" value={refLink} readOnly style={{ fontSize: '11px', textAlign: 'center' }} />
                  <button className="btn-elite btn-accent" style={{ padding: '5px 15px', minWidth: 'auto', fontSize: '11px' }} onClick={() => {
                    navigator.clipboard.writeText(refLink);
                    alert(t('referral.copied'));
                  }}>
                    {t('referral.copy')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Instruction Banner */}
        <section className="instruction-banner fade-in">
          <div className="banner-content">
            <h2>{t('instruction.title')}</h2>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-icon">1</div>
                <p>{t('instruction.step1')}</p>
              </div>
              <div className="step-arrow"><i className="fas fa-chevron-right"></i></div>
              <div className="step-item">
                <div className="step-icon">2</div>
                <p>{t('instruction.step2')}</p>
              </div>
              <div className="step-arrow"><i className="fas fa-chevron-right"></i></div>
              <div className="step-item">
                <div className="step-icon">3</div>
                <p>{t('instruction.step3')}</p>
              </div>
            </div>
          </div>
        </section>

        <CommunityHub />

        {/* Presale Benefits & Comparison */}
        <section className="benefits-section fade-in" style={{ maxWidth: '1000px', margin: '0 auto 4rem', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* Benefit Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('benefits.title')}</h3>

              <div className="benefit-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#00D395', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-tag"></i> {t('benefits.card1_title')}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '5px' }}>
                  {t('benefits.card1_desc')}
                </p>
              </div>

              <div className="benefit-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#037DD6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-shield-alt"></i> {t('benefits.card2_title')}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '5px' }}>
                  {t('benefits.card2_desc')}
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div style={{ background: '#0d0d0d', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden' }}>
              <div style={{ background: '#1a1a1a', padding: '1rem', textAlign: 'center', borderBottom: '1px solid #333' }}>
                <h4 style={{ margin: 0 }}>{t('price_comparison.title')}</h4>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #222' }}>
                  <span style={{ color: '#888' }}>{t('price_comparison.col_stage')}</span>
                  <span style={{ fontWeight: 'bold' }}>{t('price_comparison.col_price')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#00D395', fontWeight: 'bold' }}>
                  <span>{t('price_comparison.row_seed')}</span>
                  <span>$0.00012</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: '0.7' }}>
                  <span>{t('price_comparison.row_private')}</span>
                  <span>$0.00080</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: '0.7' }}>
                  <span>{t('price_comparison.row_public')}</span>
                  <span>$0.00250</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #333' }}>
                  <span>{t('price_comparison.row_listing')}</span>
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
              {t('presale_card.ribbon')}
            </div>



            <div className="service-header">
              <div className="service-icon-svg" style={{ background: 'var(--accent-color)' }}>
                <i className="fas fa-rocket"></i>
              </div>
              <div className="service-info">
                <h3>{t('presale_card.title')}</h3>
                <p style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{t('presale_card.subtitle')}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>
                  {t('presale_card.target')}
                </p>
              </div>
            </div>
            <div className="service-action">
              <div className="input-group-elite" style={{ borderColor: 'var(--accent-color)' }}>
                <i className="fab fa-ethereum"></i>
                <input type="number" placeholder={t('presale_card.input_placeholder')} value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} />
                <span className="unit-tag">ETH</span>
              </div>

              <button
                className={`btn-elite btn-primary ${isTxPending || isConfirming ? 'btn-loading' : ''}`}
                onClick={handleBuy}
                disabled={isTxPending || isConfirming}
                style={{ width: '100%', marginTop: '15px', background: 'linearGradient(45deg, var(--primary-color), var(--accent-color))', border: 'none' }}
              >
                {isTxPending ? t('presale_card.btn_pending') : isConfirming ? t('presale_card.btn_confirming') : t('presale_card.btn_buy')}
              </button>

              <p className="service-footer-hint" style={{ marginTop: '15px', textAlign: 'center', opacity: 0.8 }}>
                {t('presale_card.footer')}
              </p>
            </div>
          </div>
        </section>



        {/* Tokenomics & Utility Section */}
        <section className="tokenomics-section fade-in" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('tokenomics.title')}
          </h2>
          <p style={{ maxWidth: '700px', margin: '0 auto 3rem', color: '#ccc', lineHeight: '1.6' }}>
            {t('tokenomics.desc')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Token Stats */}
            <div style={{ background: '#0d0d0d', border: '1px solid #333', borderRadius: '16px', padding: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <img src="/aegis_token.png" alt="AEG" style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t('tokenomics.specs_title')}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>{t('tokenomics.specs_network')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                <span style={{ color: '#888' }}>{t('tokenomics.specs_symbol')}</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>AEG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                <span style={{ color: '#888' }}>{t('tokenomics.specs_supply')}</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>1,000,000,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888' }}>{t('tokenomics.specs_contract')}</span>
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
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem' }}>{t('tokenomics.utility_title')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--primary-color)', marginTop: '4px' }}></i>
                  <div>
                    <strong style={{ color: '#fff' }}>{t('tokenomics.utility_gov')}</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#888' }}>{t('tokenomics.utility_gov_desc')}</p>
                  </div>
                </li>
                <li style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--accent-color)', marginTop: '4px' }}></i>
                  <div>
                    <strong style={{ color: '#fff' }}>{t('tokenomics.utility_staking')}</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#888' }}>{t('tokenomics.utility_staking_desc')}</p>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <i className="fas fa-check-circle" style={{ color: '#ff4d4d', marginTop: '4px' }}></i>
                  <div>
                    <strong style={{ color: '#fff' }}>{t('tokenomics.utility_security')}</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#888' }}>{t('tokenomics.utility_security_desc')}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <Roadmap />
        <FAQ />

        {/* Footer Stats Mini */}
        <div className="global-stats-footer fade-in">
          <div className="mini-stat-item">
            <label>{t('footer.supply_label')}</label>
            <div>1,000,000,000</div>
          </div>
          <div className="mini-stat-item">
            <label>{t('footer.code_label')}</label>
            <div>AEG</div>
          </div>
        </div>

        {/* Transaction History - Simplified for Demo */}
        <section className="transaction-history-section fade-in">
          <h4>{t('footer.history_title')}</h4>
          <div className="history-list">
            {hash && (
              <div className="history-item fade-in">
                <div className="history-info">
                  <span className="history-type-pill type-claim">{t('footer.history_buy')}</span>
                  <span className="history-amount">{ethAmount} ETH</span>
                </div>
                <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" className="history-hash">
                  View on Explorer
                </a>
              </div>
            )}
            <div className="history-placeholder">{t('footer.history_empty')}</div>
          </div>
        </section>
      </main >

      <footer className="footer">
        <div className="footer-links">
          <a href="https://github.com/huchialun9-ctrl/AEG.git" target="_blank" rel="noreferrer">{t('footer.source_code')}</a>
          <button onClick={() => setShowWhitepaperModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mm-text-dim)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>
            {t('nav.whitepaper')}
          </button>
        </div>
        <p className="footer-copyright">{t('footer.copyright')}</p>
        <p className="footer-disclaimer" style={{ fontSize: '0.7rem', opacity: 0.4, maxWidth: '600px', margin: '10px auto 0', textAlign: 'center' }}>
          {t('footer.disclaimer')}
        </p>
      </footer>

      {/* Whitepaper Modal */}
      {showWhitepaperModal && <WhitepaperModal onClose={() => setShowWhitepaperModal(false)} />}
    </>
  );
}

export default App;
