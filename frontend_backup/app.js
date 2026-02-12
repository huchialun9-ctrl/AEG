// --- Aegis (AEG) Frontend Logic V1.2.0 ---

// --- 配置區 ---
const contractAddress = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";
const devAddress = "0xBDC4566852B6B45148dBCb2119a4695dfd4e5d77";

const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function mint(address to, uint256 amount) public"
];

const translations = {
    "zh-TW": {
        "nav_copy": "複製合約",
        "nav_connect": "連接錢包",
        "portfolio_balance": "預估資產價值 (AEG)",
        "presale_title": "種子輪預售",
        "presale_desc": "直接使用 ETH 兌換 AEG (固定匯率)",
        "presale_btn": "立即購買",
        "presale_hint": "資金將全數用於開啟 Aerodrome 流動性池。",
        "referral_title": "推薦計畫",
        "referral_link": "您的專屬推薦連結：",
        "referral_copy": "複製連結",
        "stat_total": "全網註冊總發行量",
        "stat_symbol": "協議識別代碼",
        "history_title": "近期協議交互紀錄",
        "history_empty": "尚無近期鏈上紀錄"
    },
    "en": {
        "nav_copy": "Copy Contract",
        "nav_connect": "Connect Wallet",
        "portfolio_balance": "Total Asset Value (AEG)",
        "presale_title": "Seed Presale",
        "presale_desc": "Swap ETH to AEG at a fixed rate",
        "presale_btn": "Buy Now",
        "presale_hint": "All funds will be used for Aerodrome liquidity.",
        "referral_title": "Referral Program",
        "referral_link": "Your Referral Link:",
        "referral_copy": "Copy Link",
        "stat_total": "Total Registered Supply",
        "stat_symbol": "Protocol Identifier",
        "history_title": "Recent Protocol Interactions",
        "history_empty": "No recent on-chain records"
    }
};

// --- Referral System Logic ---
const urlParams = new URLSearchParams(window.location.search);
const referral = urlParams.get('ref');
if (referral && ethers.isAddress(referral)) {
    localStorage.setItem('aegis-referral', referral);
    console.log("🔗 Detected Referral:", referral);
}

let provider;
let signer;
let contract;
let currentLang = 'zh-TW';

const connectBtn = document.querySelector('#connect-wallet');
const userBalance = document.getElementById('user-balance');
const userUsdBalance = document.getElementById('user-usd-balance');
const txHistoryList = document.getElementById('tx-history-list');

async function init() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) handleAccountsChanged(accounts);
        } catch (err) { console.warn("Wallet init error:", err); }

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }

    document.getElementById('lang-select').addEventListener('change', (e) => {
        currentLang = e.target.value;
        updateUIStrings();
    });

    updateUIStrings();
}

function updateUIStrings() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
}

function shortenAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        connectBtn?.classList.remove('connected');
        connectBtn.innerText = translations[currentLang]?.nav_connect || "Connect Wallet";
        if (userBalance) userBalance.innerText = "0.00";
    } else {
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        connectBtn?.classList.add('connected');
        connectBtn.innerText = shortenAddress(address);
        contract = new ethers.Contract(contractAddress, abi, provider);
        updateDashboard(address);
    }
}

async function updateDashboard(address) {
    try {
        const b = await contract.balanceOf(address);
        const balance = ethers.formatEther(b);
        userBalance.innerText = parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2 });

        // --- Referral Link Display ---
        const referralCenter = document.getElementById('referral-center');
        const refInput = document.getElementById('ref-link-input');
        if (referralCenter && refInput) {
            const link = window.location.origin + window.location.pathname + "?ref=" + address;
            refInput.value = link;
            referralCenter.style.display = 'block';
        }

        updateLeaderboard();
    } catch (err) { console.error("Update Dashboard Error:", err); }
}

async function updateLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list || !contract) return;

    try {
        // 獲取過去 5000 個區塊的轉帳事件
        const filter = contract.filters.Transfer(null, null);
        const events = await contract.queryFilter(filter, -5000);

        // 統計每個地址的接收量 (簡單版:以此作為活躍買家依據)
        const buyers = {};
        events.forEach(ev => {
            const to = ev.args[1];
            const val = parseFloat(ethers.formatEther(ev.args[2]));
            if (to !== ethers.ZeroAddress && to !== "0x000000000000000000000000000000000000dEaD") {
                buyers[to] = (buyers[to] || 0) + val;
            }
        });

        // 轉為陣列並排序
        const sorted = Object.entries(buyers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // 取前 5 名

        if (sorted.length === 0) {
            list.innerHTML = '<div class="history-placeholder">尚無近期買家數據</div>';
            return;
        }

        list.innerHTML = '';
        sorted.forEach((item, index) => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);';
            row.innerHTML = `
                <span>#${index + 1} ${shortenAddress(item[0])}</span>
                <span style="color: var(--accent-color);">${item[1].toLocaleString()} AEG</span>
            `;
            list.appendChild(row);
        });

    } catch (err) {
        console.error("Leaderboard Error:", err);
        list.innerHTML = '<div class="history-placeholder">載入失敗: 鏈上數據暫時無法存取</div>';
    }
}


function addTxToHistory(type, amount, hash) {
    if (!txHistoryList) return;
    const placeholder = txHistoryList.querySelector('.history-placeholder');
    if (placeholder) placeholder.remove();

    const item = document.createElement('div');
    item.className = 'history-item fade-in';
    const scanLink = `https://basescan.org/tx/${hash}`;

    item.innerHTML = `
        <div class="history-info">
            <span class="history-type">${type.toUpperCase()}</span>
            <span class="history-amount">${amount}</span>
        </div>
        <a href="${scanLink}" target="_blank" class="history-link">
            <i class="fas fa-external-link-alt"></i>
        </a>
    `;
    txHistoryList.prepend(item);
}

async function checkConnection() {
    if (!signer) {
        alert("請先連接錢包。");
        return false;
    }
    return true;
}

function initListeners() {
    // --- Connect Wallet (Open Modal) ---
    const modal = document.getElementById('wallet-modal');
    const closeModal = document.getElementById('close-modal-btn');

    connectBtn?.addEventListener('click', () => {
        // If already connected, do nothing or disconnect logic
        if (connectBtn.classList.contains('connected')) return;
        modal.style.display = 'flex';
    });

    closeModal?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close on click outside
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // --- Wallet Selection ---
    document.getElementById('wallet-metamask')?.addEventListener('click', async () => {
        if (!window.ethereum) return alert("請安裝 MetaMask！");
        modal.style.display = 'none'; // Close modal
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleAccountsChanged(accounts);
        } catch (err) {
            console.error(err);
        }
    });

    // --- Copy Contract ---
    document.getElementById('copy-contract')?.addEventListener('click', () => {
        navigator.clipboard.writeText(contractAddress);
        alert("合約地址已複製！");
    });

    // --- Referral Link Copy ---
    document.getElementById('copy-ref-link')?.addEventListener('click', () => {
        const refInput = document.getElementById('ref-link-input');
        if (refInput) {
            refInput.select();
            navigator.clipboard.writeText(refInput.value);
            alert("推薦連結已複製！");
        }
    });

    // --- Presale Buy (Manual Strategy) ---
    document.getElementById('buy-tokens-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('buy-tokens-btn');
        if (btn.classList.contains('btn-loading')) return;

        if (!(await checkConnection())) return;

        const ethAmount = document.getElementById('buy-eth-amount').value;
        if (!ethAmount || ethAmount <= 0) return alert("請輸入有效的 ETH 數量。");

        // Set Loading State
        const originalText = btn.innerHTML;
        btn.classList.add('btn-loading');

        try {
            // 直接發送 ETH 給開發者 (由後端機器人負責發幣)
            const tx = await signer.sendTransaction({
                to: devAddress,
                value: ethers.parseEther(ethAmount)
            });

            alert("付款成功！系統將在 1-2 分鐘內自動發放 AEG 至您的錢包。");
            addTxToHistory('presale', ethAmount + ' ETH', tx.hash);

            await tx.wait();
            // 等待一下讓區塊確認，然後更新餘額 (實際上需要等機器人發幣)
            setTimeout(async () => {
                updateDashboard(await signer.getAddress());
            }, 5000);

        } catch (e) {
            console.error(e);
            if (e.code === 'ACTION_REJECTED') {
                alert("使用者取消了交易。");
            } else {
                alert("交易失敗: " + (e.reason || e.message));
            }
        } finally {
            // Reset Button State
            btn.classList.remove('btn-loading');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initListeners();
});
