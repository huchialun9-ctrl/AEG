const translations = {
    "zh-TW": {
        "nav_connect": "連接錢包",
        "nav_connected": "已連接",
        "portfolio_welcome": "資產總覽",
        "portfolio_subtitle": "由 Aegis 盾級安全協議驅動，部署於 Base 主網。",
        "balance_total": "預估資產價值 (AEG)",
        "stake_title": "資產質押",
        "stake_benefit": "自動執行算力與流動性收益分配。",
        "stake_earned": "已積累獎勵餘額",
        "stake_claim": "提取收益",
        "stake_btn": "立即存入",
        "burn_title": "通縮維護",
        "burn_benefit": "執行通縮燒毀，強化協議稀缺性。",
        "burn_btn": "執行燒毀",
        "burn_hint": "手動維護能加強生態價值底層。",
        "stat_total": "全網註冊總發行量",
        "stat_symbol": "協議識別代碼",
        "footer_text": "© 2026 Aegis 全球安全計畫。Base 主網技術開發。",
        "install_metamask": "請安裝錢包擴展"
    },
    "en": {
        "nav_connect": "Connect Wallet",
        "nav_connected": "Connected",
        "portfolio_welcome": "Your Portfolio",
        "portfolio_subtitle": "Secured by the Aegis Protocol on Base Network.",
        "balance_total": "ESTIMATED ASSET BALANCE",
        "stake_title": "Wealth Staking",
        "stake_benefit": "Automate yield and liquidity distribution.",
        "stake_earned": "ACCUMULATED REWARDS",
        "stake_claim": "CLAIM",
        "stake_btn": "DEPOSIT",
        "burn_title": "Shield Support",
        "burn_benefit": "Execute deflationary burn to enhance scarcity.",
        "burn_btn": "CONFIRM BURN",
        "burn_hint": "Manual maintenance strengthens the ecosystem value.",
        "stat_total": "TOTAL REGISTERED SUPPLY",
        "stat_symbol": "CONTRACT TICKER",
        "footer_text": "© 2026 Aegis Global Security Project. Built on Base Mainnet.",
        "install_metamask": "Please Install Wallet"
    }
};

let currentLang = localStorage.getItem('aegis-lang') || 'zh-TW';

function updateUI(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
    document.documentElement.lang = lang;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('aegis-lang', lang);
    updateUI(lang);
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI(currentLang);
});

export { setLanguage, currentLang, translations };
