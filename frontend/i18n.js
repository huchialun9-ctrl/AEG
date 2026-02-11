const translations = {
    "zh-TW": {
        "nav_connect": "連接錢包",
        "nav_connected": "已連接",
        "hero_title": "創世盾計畫 (AEG)",
        "hero_subtitle": "建立 Base 網路的核心安全資產",
        "stat_overview": "代幣概況",
        "stat_symbol": "代幣符號",
        "stat_total": "總發行量",
        "balance_title": "您的資產",
        "balance_addr_none": "未連接",
        "action_title": "核心交互",
        "burn_placeholder": "輸入銷毀數量 (Burn)",
        "burn_btn": "確認銷毀",
        "mint_btn": "執行鑄造",
        "owner_panel": "管理權限 (Owner Only)",
        "footer_text": "© 2026 Aegis Global Security Project. Built on Base Mainnet.",
        "install_metamask": "請安裝 MetaMask",
        "btn_github": "查看 GitHub",
        "btn_docs": "開發文檔",
        "data_title": "鏈上實時數據大屏",
        "chart_burn": "通縮銷毀趨勢",
        "chart_holders": "持有人分佈",
        "stake_title": "質押挖礦 (Staking)",
        "stake_staked": "已質押",
        "stake_rewards": "待領取收益",
        "stake_placeholder": "輸入質押數量",
        "stake_btn": "立即質押",
        "claim_btn": "領取報酬"
    },
    "en": {
        "nav_connect": "Connect Wallet",
        "nav_connected": "Connected",
        "hero_title": "Aegis Genesis Shield (AEG)",
        "hero_subtitle": "Building Core Security Assets for Base Network",
        "stat_overview": "Token Overview",
        "stat_symbol": "Symbol",
        "stat_total": "Total Supply",
        "balance_title": "Your Assets",
        "balance_addr_none": "Not Connected",
        "action_title": "Core Interactions",
        "burn_placeholder": "Enter amount to burn",
        "burn_btn": "Confirm Burn",
        "mint_btn": "Record Mint",
        "owner_panel": "Owner Panel",
        "footer_text": "© 2026 Aegis Global Security Project. Built on Base Mainnet.",
        "install_metamask": "Install MetaMask",
        "btn_github": "GitHub Repository",
        "btn_docs": "Documentation",
        "data_title": "Real-time On-chain Dashboard",
        "chart_burn": "Deflationary Burn Trend",
        "chart_holders": "Holder Distribution",
        "stake_title": "Staking & Yield",
        "stake_staked": "Staked Amount",
        "stake_rewards": "Pending Rewards",
        "stake_placeholder": "Enter amount to stake",
        "stake_btn": "Stake Now",
        "claim_btn": "Claim Rewards"
    }
};

let currentLang = localStorage.getItem('aegis-lang') || 'zh-TW';

function updateUI(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateUI(currentLang);
});

export { setLanguage, currentLang, translations };
