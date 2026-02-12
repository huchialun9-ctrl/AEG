import React from 'react';
import { useTranslation } from 'react-i18next';

const ReferralLeaderboard = () => {
    const { t } = useTranslation();

    // Mock Data
    const leaders = [
        { rank: 1, name: 'Whale_0x88', invites: 142 },
        { rank: 2, name: 'AlphaHunter', invites: 98 },
        { rank: 3, name: 'CryptoNinja', invites: 76 },
        { rank: 4, name: 'MoonBoi', invites: 45 },
        { rank: 5, name: 'Guest_291', invites: 32 },
    ];

    return (
        <div className="leaderboard-card">
            <h3 className="handwritten-title">
                <i className="fas fa-trophy" style={{ color: 'var(--marker-yellow)' }}></i> {t('leaderboard.title', 'Honor Roll')}
            </h3>
            <ul className="leaderboard-list">
                {leaders.map((leader) => (
                    <li key={leader.rank} className={`leader-item rank-${leader.rank}`}>
                        <div className="leader-info">
                            <span className="rank-num">#{leader.rank}</span>
                            <span className="leader-name">{leader.name}</span>
                        </div>
                        <span className="invite-count">{leader.invites} {t('leaderboard.invites', 'Invites')}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReferralLeaderboard;
