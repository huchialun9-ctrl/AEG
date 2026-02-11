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
        "owner_panel": "管理權限 (僅限擁有者)",
        "footer_text": "© 2026 Aegis 全球安全計畫。構建於 Base 主網。",
        "install_metamask": "請安裝 MetaMask",
        "btn_github": "查看 GitHub 存放庫",
        "btn_docs": "開發文件中心",
        "data_title": "鏈上即時數據大屏",
        "chart_burn": "通縮銷毀趨勢",
        "chart_holders": "持有人分佈",
        "stake_title": "質押挖礦 (Staking)",
        "stake_staked": "已質押數量",
        "stake_rewards": "待領取收益",
        "stake_placeholder": "輸入質押數量",
        "stake_btn": "立即質押",
        "claim_btn": "領取報酬",
        "dao_title": "治理中心 (DAO)",
        "dao_active": "目前無活躍提案",
        "dao_empty": "成為持有人即可發起提案，共同決定 Aegis 的未來。",
        "dao_propose_btn": "發起新提案",
        "dex_title": "直接兌換 (Direct Swap)",
        "trust_title": "安全與審計",
        "wp_text": "詳細了解 Aegis 的代幣經濟與技術底層",
        "wp_btn": "閱讀技術白皮書",
        "nl_title": "訂閱 Aegis 最新動態",
        "nl_btn": "立即訂閱"
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
        "claim_btn": "Claim Rewards",
        "dao_title": "Governance Center (DAO)",
        "dao_active": "No Active Proposals",
        "dao_empty": "Hold AEG to create proposals and shape the future.",
        "dao_propose_btn": "Create Proposal",
        "dex_title": "Direct Swap",
        "trust_title": "Security & Audit",
        "wp_text": "Learn more about Tokenomics & Technical background",
        "wp_btn": "Read Whitepaper",
        "nl_title": "Subscribe to Aegis Updates",
        "nl_btn": "Subscribe"
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
