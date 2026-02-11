const translations = {
    "zh-TW": {
        "nav_connect": "連接錢包",
        "nav_connected": "已連接",
        "hero_title": "Fund your Aegis",
        "hero_subtitle": "Get your wallet ready to use web3",
        "action_buy": "購買",
        "action_swap": "兌換",
        "banner_title": "Say hello to Aegis",
        "banner_desc": "在 Base 網路上構建、管理與保護資產。",
        "tx_history": "交易紀錄",
        "mint_btn": "執行鑄造",
        "owner_panel": "管理權限 (僅限擁有者)",
        "footer_text": "© 2026 Aegis 全球安全計畫。構建於 Base 主網。",
        "install_metamask": "請安裝 MetaMask",
        "btn_github": "GitHub 存放庫",
        "btn_docs": "技術文檔",
        "roadmap_title": "發展藍圖",
        "roadmap_q1": "Q1: 核心開發",
        "roadmap_q1_text": "智能合約審計、官網 V1 上線與種子輪部署。",
        "roadmap_q2": "Q2: 市場擴張",
        "roadmap_q2_text": "DEX 流動性注入、開啟 Staking 質押激勵與社區建設。",
        "roadmap_q3": "Q3: 生態系統",
        "roadmap_q3_text": "DAO 治理上線、跨鏈橋接到以太坊主網與二層擴展。",
        "roadmap_q4": "Q4: 全球化戰略",
        "roadmap_q4_text": "CEX 登錄、實體支付場景對接與 Aegis 安全生態成型。",
        "tokenomics_title": "代幣分配",
        "tokenomics_lp": "流動性鎖定 (60%)",
        "tokenomics_team": "核心團隊 (10%)",
        "tokenomics_rewards": "質押獎賞 (20%)",
        "tokenomics_marketing": "行銷與生態 (10%)",
        "dex_title": "直接兌換 (Direct Swap)",
        "trust_title": "安全與審計",
        "wp_text": "詳細了解 Aegis 的代幣經濟與技術底層",
        "wp_btn": "閱讀技術白皮書",
        "nl_title": "訂閱 Aegis 最新動態",
        "nl_btn": "立即訂閱",
        "stake_title": "質押中心",
        "stake_btn": "開始質押",
        "claim_btn": "領取報酬",
        "stake_placeholder": "輸入質押數量",
        "stake_staked": "已存放數量"
    },
    "en": {
        "nav_connect": "Connect Wallet",
        "nav_connected": "Connected",
        "hero_title": "Fund your Aegis",
        "hero_subtitle": "Get your wallet ready to use web3",
        "action_buy": "Buy",
        "action_swap": "Swap",
        "banner_title": "Say hello to Aegis",
        "banner_desc": "Build, manage, and secure assets on Base.",
        "tx_history": "History",
        "mint_btn": "Record Mint",
        "owner_panel": "Owner Only",
        "footer_text": "© 2026 Aegis Global Security Project. Built on Base Mainnet.",
        "install_metamask": "Install MetaMask",
        "btn_github": "GitHub",
        "btn_docs": "Docs",
        "roadmap_title": "Roadmap",
        "roadmap_q1": "Q1: Core Dev",
        "roadmap_q1_text": "Security audit, Website V1 launch, and seed deployment.",
        "roadmap_q2": "Q2: Expansion",
        "roadmap_q2_text": "DEX Liquidity, Staking implementation, and community growth.",
        "roadmap_q3": "Q3: Ecosystem",
        "roadmap_q3_text": "DAO Governance, Cross-chain bridge, and L2 expansion.",
        "roadmap_q4": "Q4: Global Vision",
        "roadmap_q4_text": "CEX Listing, Real-world integration, and security ecosystem closure.",
        "tokenomics_title": "Tokenomics",
        "tokenomics_lp": "Liquidity Lock (60%)",
        "tokenomics_team": "Team (10%)",
        "tokenomics_rewards": "Staking Rewards (20%)",
        "tokenomics_marketing": "Marketing & Ecosystem (10%)",
        "dex_title": "Direct Swap",
        "trust_title": "Security & Audit",
        "wp_text": "Learn more about Tokenomics & Technical background",
        "wp_btn": "Read Technical Paper",
        "nl_title": "Subscribe to Updates",
        "nl_btn": "Subscribe",
        "stake_title": "Staking Center",
        "stake_btn": "Stake Now",
        "claim_btn": "Claim Rewards",
        "stake_placeholder": "Amount to stake",
        "stake_staked": "Staked Amount"
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
