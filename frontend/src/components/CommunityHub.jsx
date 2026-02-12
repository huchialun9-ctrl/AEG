
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const CommunityHub = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('social');

    // No simulation logic needed anymore


    return (
        <section className="community-section fade-in">
            <div className="community-container">
                <h2 className="section-title">
                    <span className="live-dot"></span> {t('community.title')}
                </h2>

                <div className="community-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        <i className="fas fa-users"></i> {t('community.tab_social')}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'signals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signals')}
                    >
                        <i className="fas fa-chart-line"></i> {t('community.tab_signals')}
                    </button>
                </div>

                <div className="community-content">
                    {activeTab === 'social' ? (
                        <div className="social-links-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '2rem' }}>
                            <a href="#" className="social-card telegram" style={{ background: 'rgba(0, 136, 204, 0.1)', border: '1px solid #0088cc', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#fff', transition: 'transform 0.2s' }}>
                                <i className="fab fa-telegram" style={{ fontSize: '2.5rem', color: '#0088cc', marginBottom: '1rem' }}></i>
                                <h3 style={{ margin: '0 0 5px' }}>Telegram</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{t('community.join_telegram')}</p>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-card twitter" style={{ background: 'rgba(29, 161, 242, 0.1)', border: '1px solid #1da1f2', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#fff', transition: 'transform 0.2s' }}>
                                <i className="fab fa-twitter" style={{ fontSize: '2.5rem', color: '#1da1f2', marginBottom: '1rem' }}></i>
                                <h3 style={{ margin: '0 0 5px' }}>Twitter / X</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{t('community.join_twitter')}</p>
                            </a>
                            <a href="#" className="social-card discord" style={{ background: 'rgba(114, 137, 218, 0.1)', border: '1px solid #7289da', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', color: '#fff', transition: 'transform 0.2s' }}>
                                <i className="fab fa-discord" style={{ fontSize: '2.5rem', color: '#7289da', marginBottom: '1rem' }}></i>
                                <h3 style={{ margin: '0 0 5px' }}>Discord</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>{t('community.join_discord')}</p>
                            </a>
                        </div>
                    ) : (
                        <div className="signals-board">
                            <div className="signal-card buy">
                                <div className="signal-header">
                                    <span className="signal-pair">AEG / ETH</span>
                                    <span className="signal-badge buy">BUY ZONE</span>
                                </div>
                                <div className="signal-body">
                                    <div className="signal-row">
                                        <span>Entry:</span>
                                        <strong>$0.0018 - $0.0022</strong>
                                    </div>
                                    <div className="signal-row">
                                        <span>Target 1:</span>
                                        <strong className="success">$0.0050 (2.5x)</strong>
                                    </div>
                                    <div className="signal-row">
                                        <span>Target 2:</span>
                                        <strong className="success">$0.0100 (5x)</strong>
                                    </div>
                                    <p className="signal-note">{t('community.signal_note1')}</p>
                                </div>
                            </div>

                            <div className="signal-card hold">
                                <div className="signal-header">
                                    <span className="signal-pair">Market Analysis</span>
                                    <span className="signal-badge hold">HODL</span>
                                </div>
                                <div className="signal-body">
                                    <p className="analysis-text">{t('community.signal_analysis')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CommunityHub;
