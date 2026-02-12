import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { getUserData, updateLeaderboardScore } from '../services/gun';

const MysteryBox = () => {
    const { t } = useTranslation();
    const { address, isConnected } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [reward, setReward] = useState(null);
    const [cooldown, setCooldown] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    // Check cooldown on mount
    useEffect(() => {
        if (!address) return;

        const userNode = getUserData(address);
        userNode.get('last_box_open').once((lastOpen) => {
            if (lastOpen) {
                const now = Date.now();
                const diff = now - lastOpen;
                // 24 hour cooldown
                if (diff < 86400000) {
                    setCooldown(true);
                    setTimeLeft(86400000 - diff);
                }
            }
        });
    }, [address]);

    const handleOpen = () => {
        if (!isConnected) {
            toast.error("Connect wallet to play!");
            return;
        }
        if (isOpen || cooldown) return;

        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
            setIsOpen(true);

            // Random Reward Logic
            const rewards = [
                { name: '500 AEG Bonus', score: 50 },
                { name: 'Sketchy NFT Badge', score: 20 },
                { name: 'ETH Gas Rebate', score: 100 },
                { name: 'Better Luck Next Time', score: 0 }
            ];

            // Weighted random could go here, simplicity for now
            const w = Math.random();
            const selected = w > 0.6 ? rewards[0] : w > 0.3 ? rewards[1] : w > 0.05 ? rewards[3] : rewards[2];

            setReward(selected.name);
            setCooldown(true);
            setTimeLeft(86400000);

            if (selected.name !== 'Better Luck Next Time') {
                toast.success(`You won: ${selected.name}!`);

                // Save to Gun.js
                const userNode = getUserData(address);
                userNode.get('last_box_open').put(Date.now());

                // Update Leaderboard Score (as "invites" or "points" for now)
                updateLeaderboardScore(address, selected.score);
            } else {
                // Even if lost, set cooldown
                const userNode = getUserData(address);
                userNode.get('last_box_open').put(Date.now());
            }

        }, 1000);
    };

    return (
        <div className="mystery-box-container">
            <div className={`mystery-box ${isShaking ? 'shake' : ''} ${isOpen ? 'open' : ''}`} onClick={handleOpen} style={{ cursor: cooldown ? 'not-allowed' : 'pointer', opacity: cooldown ? 0.7 : 1 }}>
                <div className="box-lid">
                    <span className="question-mark">?</span>
                </div>
                <div className="box-body">
                    <div className="lock-hole"></div>
                </div>
            </div>

            {isOpen && (
                <div className="reward-message fade-in">
                    <h4>{t('mystery.congrats', 'You Found:')}</h4>
                    <p className="reward-text">{reward}</p>
                    <button className="btn-elite btn-accent" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        setReward(null);
                    }}>
                        {t('mystery.reset', 'Close')}
                    </button>
                </div>
            )}

            {!isOpen && (
                <div style={{ marginTop: '15px' }}>
                    {cooldown ? (
                        <p className="mystery-hint" style={{ color: '#888', animation: 'none' }}>
                            Next box in: {Math.floor(timeLeft / 3600000)}h {Math.floor((timeLeft % 3600000) / 60000)}m
                        </p>
                    ) : (
                        <p className="mystery-hint">{t('mystery.hint', 'Click to Open Your Bonus!')}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MysteryBox;
