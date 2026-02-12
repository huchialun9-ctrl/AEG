import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const MysteryBox = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [reward, setReward] = useState(null);

    const handleOpen = () => {
        if (isOpen) return;

        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
            setIsOpen(true);

            // Random Reward
            const rewards = [
                '500 AEG Bonus',
                'Sketchy NFT Badge',
                'ETH Gas Rebate',
                'Better Luck Next Time'
            ];
            const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
            setReward(randomReward);

            if (randomReward !== 'Better Luck Next Time') {
                toast.success(`You won: ${randomReward}!`);
            }
        }, 1000);
    };

    return (
        <div className="mystery-box-container">
            <div className={`mystery-box ${isShaking ? 'shake' : ''} ${isOpen ? 'open' : ''}`} onClick={handleOpen}>
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
                        {t('mystery.reset', 'Try Again')}
                    </button>
                </div>
            )}

            {!isOpen && (
                <p className="mystery-hint">{t('mystery.hint', 'Click to Open Your Bonus!')}</p>
            )}
        </div>
    );
};

export default MysteryBox;
