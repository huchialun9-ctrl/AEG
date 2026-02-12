
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const CommunityHub = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const chatBottomRef = useRef(null);

    // Simulated initial messages and auto-generated messages
    useEffect(() => {
        // Initial messages
        const initialMessages = [
            { id: 1, user: 'Whale_0x88', text: t('community.msg1'), type: 'hype', time: '10:42' },
            { id: 2, user: 'CryptoNinja', text: t('community.msg2'), type: 'normal', time: '10:43' },
            { id: 3, user: 'AlphaHunter', text: t('community.msg3'), type: 'alpha', time: '10:44' },
            { id: 4, user: 'MoonBoi', text: t('community.msg4'), type: 'hype', time: '10:45' },
        ];
        setMessages(initialMessages);

        // Auto-scroll to bottom
        const scrollToBottom = () => {
            chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        scrollToBottom();

        // Random message generator
        const interval = setInterval(() => {
            const randomUsers = ['DegenDave', 'BaseGod', 'EthMaxi', 'PepeLover', 'GemFinder'];
            const randomTexts = [
                t('community.auto_msg1'),
                t('community.auto_msg2'),
                t('community.auto_msg3'),
                t('community.auto_msg4'),
                t('community.auto_msg5'),
            ];

            const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
            const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)];

            const newMessage = {
                id: Date.now(),
                user: randomUser,
                text: randomText,
                type: 'normal',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev.slice(-50), newMessage]); // Keep last 50 messages
        }, 8000 + Math.random() * 5000); // Random interval between 8-13s

        return () => clearInterval(interval);
    }, [t]);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMessage = {
            id: Date.now(),
            user: 'You',
            text: inputValue,
            type: 'self',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
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
                        className={`tab-btn ${activeTab === 'signals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signals')}
                    >
                        <i className="fas fa-chart-line"></i> {t('community.tab_signals')}
                    </button>
                </div>

                <div className="community-content">
                    {activeTab === 'chat' ? (
                        <div className="chat-interface">
                            <div className="chat-window">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`chat-message ${msg.type}`}>
                                        <div className="msg-header">
                                            <span className="msg-user">{msg.user}</span>
                                            <span className="msg-time">{msg.time}</span>
                                        </div>
                                        <div className="msg-text">{msg.text}</div>
                                    </div>
                                ))}
                                <div ref={chatBottomRef} />
                            </div>
                            <form className="chat-input-area" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('community.chat_placeholder')}
                                    className="chat-input"
                                />
                                <button type="submit" className="chat-send-btn">
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
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
