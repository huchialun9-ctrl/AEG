import { setLanguage, currentLang, translations } from './i18n.js';

// --- 配置區 ---
// [IMPORTANT] 請務必更新此地址為您在 Base 上部署的真實合約地址
const contractAddress = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";
const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function totalStaked() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function owner() view returns (address)",
    "function mint(address to, uint256 amount) public",
    "function burn(uint256 amount) public",
    "function pause() view returns (bool)",
    "function apy() view returns (uint256)",
    "function stake(uint256 amount) public",
    "function withdrawStake() public",
    "function calculateReward(address user) view returns (uint256)",
    "function stakes(address) view returns (uint256 amount, uint256 startTime)"
];

let provider;
let signer;
let contract;
let portfolioChart;

const connectBtn = document.querySelector('#connect-wallet');
const btnText = connectBtn?.querySelector('.btn-text');
const userBalance = document.getElementById('user-balance');
const userUsdBalance = document.getElementById('user-usd-balance');
const stakedAmountDisplay = document.getElementById('staked-amount');
const walletAddrShort = document.getElementById('wallet-address-short');
const tokenSymbol = document.getElementById('token-symbol');
const totalSupplyCell = document.getElementById('total-supply');
const txHistoryList = document.getElementById('tx-history-list');
const langSelect = document.getElementById('lang-select');

let aegPrice = 0.085; // 預設初始價格為 0.085 USD (可動態更新)

// 初始化語言
if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
}

function shortenAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// --- Chart JS Implementation (Real Session Monitoring) ---
let chartDataPoints = [0];
function initChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Start', 'Current'],
            datasets: [{
                label: 'Asset Growth',
                data: chartDataPoints,
                borderColor: '#037DD6',
                borderWidth: 3,
                fill: true,
                backgroundColor: 'rgba(3, 125, 214, 0.05)',
                tension: 0.2,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: {
                    display: false,
                    beginAtZero: true
                }
            }
        }
    });
}

// --- 真實生態：獲取鏈上價格 ---
async function updateAegPrice() {
    try {
        if (!contract) return;

        // 未來擴展：透過 OnchainKit 或 DEX API 獲取真實價格
        // 目前若無池子，則保持為 0 或顯示 'Coming Soon'
        const hasLiquidity = false; // 這裡將接入真實檢測邏輯

        if (!hasLiquidity) {
            aegPrice = 0;
            if (userUsdBalance) userUsdBalance.innerText = "N/A";
            return;
        }

        // 真實報價邏輯...
    } catch (e) {
        console.error("Price fetch failed:", e);
        aegPrice = 0;
    }
}

async function init() {
    initChart();
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) handleAccountsChanged(accounts);

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            setupTokenDisplay();
        } catch (err) {
            console.error("Connection error:", err);
        }
    }
}

async function setupTokenDisplay() {
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
        if (tokenSymbol) tokenSymbol.innerText = "NOT_DEPLOYED";
        if (totalSupplyCell) totalSupplyCell.innerText = "0";
        return 0;
    }
    try {
        contract = new ethers.Contract(contractAddress, abi, provider);
        tokenSymbol.innerText = await contract.symbol();
        const total = await contract.totalSupply();
        totalSupplyCell.innerText = parseFloat(ethers.formatEther(total)).toLocaleString();
        return total;
    } catch (e) {
        console.error("Contract info fetch failed:", e);
        return 0;
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        connectBtn?.classList.remove('connected');
        if (btnText) btnText.innerText = translations[currentLang]?.nav_connect || "Connect Wallet";
        if (walletAddrShort) walletAddrShort.innerText = "Disconnected";
        if (userBalance) userBalance.innerText = "0.00";
    } else {
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        connectBtn?.classList.add('connected');
        if (btnText) btnText.innerText = shortenAddress(address);
        if (walletAddrShort) walletAddrShort.innerText = address;

        updateDashboard(address);
    }
}

async function updateDashboard(address) {
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
        if (userBalance) userBalance.innerText = "0.00";
        if (userUsdBalance) userUsdBalance.innerText = "0.00";
        return;
    }

    try {
        await updateAegPrice();
        const b = await contract.balanceOf(address);
        const balance = ethers.formatEther(b);
        const s = await contract.stakes(address);
        const staked = ethers.formatEther(s.amount);

        userBalance.innerText = parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2 });
        if (userUsdBalance) {
            const usdValue = parseFloat(balance) * aegPrice;
            userUsdBalance.innerText = usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        stakedAmountDisplay.innerText = parseFloat(staked).toLocaleString() + " AEG";

        // 更新圖表
        chartDataPoints.push(parseFloat(balance));
        if (chartDataPoints.length > 20) chartDataPoints.shift();
        portfolioChart.update();
    } catch (err) { }
}

function addTxToHistory(type, amount, hash) {
    if (!txHistoryList) return;
    const placeholder = txHistoryList.querySelector('.history-placeholder');
    if (placeholder) placeholder.remove();

    const item = document.createElement('div');
    item.className = 'history-item fade-in';
    const shortHash = hash.slice(0, 10) + "...";
    const scanLink = `https://basescan.org/tx/${hash}`;

    item.innerHTML = `
        <div class="history-info">
            <span class="history-type-pill type-${type}">${type}</span>
            <span><strong>${amount} AEG</strong></span>
        </div>
        <a href="${scanLink}" target="_blank" class="history-hash">${shortHash}</a>
    `;
    txHistoryList.prepend(item);
}

// 檢查連線狀態封裝
async function checkConnection() {
    if (!signer) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                await handleAccountsChanged(accounts);
                return true;
            }
        } catch (e) {
            alert("請先連接錢包才能執行此操作。");
            return false;
        }
        return false;
    }
    return true;
}

function initListeners() {
    connectBtn?.addEventListener('click', async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) handleAccountsChanged(accounts);
    });

    // --- Burn ---
    document.getElementById('burn-btn')?.addEventListener('click', async () => {
        if (!(await checkConnection())) return;
        if (contractAddress === "0x0000000000000000000000000000000000000000") return alert("合約尚未部署，無法執行此操作。");

        const amount = document.getElementById('burn-amount').value;
        if (!amount || amount <= 0) return alert("請輸入有效數量。");

        try {
            const tx = await contract.connect(signer).burn(ethers.parseEther(amount));
            alert("燒毀交易已送出...");
            addTxToHistory('burn', amount, tx.hash);
            await tx.wait();
            alert("燒毀成功！");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("交易失敗: " + e.message); }
    });

    // --- Stake ---
    document.getElementById('stake-btn')?.addEventListener('click', async () => {
        if (!(await checkConnection())) return;
        if (contractAddress === "0x0000000000000000000000000000000000000000") return alert("合約尚未部署。");

        const amount = document.getElementById('stake-amount').value;
        if (!amount || amount <= 0) return alert("請輸入有效數量。");

        try {
            const tx = await contract.connect(signer).stake(ethers.parseEther(amount));
            alert("質押交易已送出...");
            addTxToHistory('stake', amount, tx.hash);
            await tx.wait();
            alert("存入成功！開始計算收益。");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("質押失敗: " + e.message); }
    });

    // --- Claim ---
    document.getElementById('claim-rewards-tab')?.addEventListener('click', async () => {
        if (!(await checkConnection())) return;
        if (contractAddress === "0x0000000000000000000000000000000000000000") return alert("合約尚未部署。");

        try {
            const tx = await contract.connect(signer).withdrawStake();
            alert("收益領取交易送出...");
            addTxToHistory('claim', 'Unknown', tx.hash);
            await tx.wait();
            alert("收益領取成功！");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("提取失敗。"); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initListeners();
});
