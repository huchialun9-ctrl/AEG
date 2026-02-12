import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Gun from 'gun';

// Initialize Gun (using public relay peers for demo, can be self-hosted)
const gun = Gun({
    peers: [
        'https://gun-manhattan.herokuapp.com/gun' // Public relay for reliability
    ]
});

const CommunityHub = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const dummyScroll = useRef();

    useEffect(() => {
        const messagesRef = gun.get('aegis_global_chat_v1');

        const listener = messagesRef.map().on((node, key) => {
            if (node && node.text) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === key)) return prev;

                    const newMsg = {
                        id: key,
                        text: node.text,
                        user: node.user,
                        timestamp: node.timestamp,
                        type: node.type || 'normal'
                    };

                    // Sort by timestamp
                    return [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp).slice(-50); // Keep last 50
                });
            }
        });

        return () => {
            messagesRef.off();
        };
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const timestamp = Date.now();
        const msgData = {
            text: newMessage,
            user: "Guest_" + Math.floor(Math.random() * 1000), // Randomized guest name for now
            timestamp: timestamp,
            type: "normal"
        };

        gun.get('aegis_global_chat_v1').set(msgData);

        setNewMessage("");
        dummyScroll.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="community-section fade-in">
            <div className="community-container">
                <h2 className="section-title">
                    <span className="live-dot"></span> {t('community.title')}
                </h2>

                <div className="community-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <i className="fas fa-comments"></i> {t('community.tab_chat')}
                    </button>
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
                    {activeTab === 'chat' && (
                        <div className="chat-interface">
                            <div className="chat-window">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`chat-message ${msg.type || 'normal'}`}>
                                        <span className="chat-user">{msg.user}:</span>
                                        <span className="chat-text">{msg.text}</span>
                                    </div>
                                ))}
                                <div ref={dummyScroll}></div>
                            </div>
                            <form onSubmit={sendMessage} className="chat-input-area">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={t('community.chat_placeholder')}
                                />
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'social' && (
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
                    )}

                    {activeTab === 'signals' && (
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
