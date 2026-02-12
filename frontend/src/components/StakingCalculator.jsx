import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const StakingCalculator = () => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState(10000);
    const [duration, setDuration] = useState(12); // months

    // Fake APY tiers
    const getAPY = (months) => {
        if (months >= 12) return 50;
        if (months >= 6) return 30;
        if (months >= 3) return 15;
        return 5;
    };

    const apy = getAPY(duration);
    const earnings = Math.floor(amount * (apy / 100) * (duration / 12));
    const total = parseInt(amount) + earnings;

    return (
        <motion.div
            className="staking-calculator-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="calc-tape"></div>
            <h3 className="handwritten-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <i className="fas fa-calculator" style={{ color: 'var(--marker-red)' }}></i> {t('staking.title', 'Staking Simulator')}
            </h3>

            <div className="calc-input-group">
                <label>{t('staking.amount_label', 'I want to stake (AEG):')}</label>
                <div className="input-wrapper-sketch">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                    />
                </div>
            </div>

            <div className="calc-input-group">
                <label>{t('staking.duration_label', 'For a duration of:')}</label>
                <div className="duration-selector">
                    {[1, 3, 6, 12].map((m) => (
                        <button
                            key={m}
                            className={`btn-duration ${duration === m ? 'active' : ''}`}
                            onClick={() => setDuration(m)}
                        >
                            {m}M
                        </button>
                    ))}
                </div>
            </div>

            <div className="calc-result-area">
                <div className="result-row">
                    <span>{t('staking.apy', 'APY')}:</span>
                    <span className="highlight-green">{apy}%</span>
                </div>
                <div className="result-row">
                    <span>{t('staking.earnings', 'Est. Earnings')}:</span>
                    <span className="highlight-blue">+{earnings.toLocaleString()} AEG</span>
                </div>
                <div className="divider-doodle"></div>
                <div className="result-total">
                    <span>{t('staking.total', 'Total Value')}:</span>
                    <strong>{total.toLocaleString()} AEG</strong>
                </div>
            </div>

            <p className="calc-disclaimer">{t('staking.disclaimer', '*Estimates only. Rates subject to DAO governance.')}</p>
        </motion.div>
    );
};

export default StakingCalculator;
