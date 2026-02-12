import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeaderboard } from '../services/gun';

const ReferralLeaderboard = () => {
    const { t } = useTranslation();
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        const leaderboardNode = getLeaderboard();
        const loadedUsers = {};

        // Subscribe to leaderboard updates
        leaderboardNode.map().on((data, key) => {
            if (data && data.address && data.score) {
                loadedUsers[key] = {
                    address: data.address,
                    score: data.score
                };

                // Convert to array and sort
                const sorted = Object.values(loadedUsers)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10) // Top 10
                    .map((user, index) => ({
                        rank: index + 1,
                        name: `${user.address.slice(0, 6)}...${user.address.slice(-4)}`,
                        invites: user.score
                    }));

                setLeaders(sorted);
            }
        });

        // Cleanup (Gun.js doesn't have a simple off for map(), but React unmount handles most)
        return () => {
            // potential cleanup if needed
        };
    }, []);

    return (
        <motion.div
            className="leaderboard-card"
            initial={{ opacity: 0, rotate: -5, x: 50 }}
            animate={{ opacity: 1, rotate: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
        >
            <h3 className="handwritten-title">
                <i className="fas fa-trophy" style={{ color: 'var(--marker-yellow)' }}></i> {t('leaderboard.title', 'Honor Roll')}
            </h3>
            {leaders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontStyle: 'italic' }}>
                    Loading data from decentralized network...
                </div>
            ) : (
                <ul className="leaderboard-list">
                    <AnimatePresence>
                        {leaders.map((leader) => (
                            <motion.li
                                key={leader.rank}
                                className={`leader-item rank-${leader.rank}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: leader.rank * 0.1 }}
                            >
                                <div className="leader-info">
                                    <span className="rank-num">#{leader.rank}</span>
                                    <span className="leader-name">{leader.name}</span>
                                </div>
                                <span className="invite-count">{leader.invites} {t('leaderboard.invites', 'Invites')}</span>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </motion.div>
    );
};

export default ReferralLeaderboard;
