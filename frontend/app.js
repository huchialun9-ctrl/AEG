import { setLanguage, currentLang, translations } from './i18n.js';

// --- 配置區 ---
// [IMPORTANT] 請務必更新此地址為您在 Base 上部署的真實合約地址
const contractAddress = "0x0000000000000000000000000000000000000000";
const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function owner() view returns (address)",
    "function mint(address to, uint256 amount) public",
    "function burn(uint256 amount) public",
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
const stakedAmountDisplay = document.getElementById('staked-amount');
const walletAddrShort = document.getElementById('wallet-address-short');
const tokenSymbol = document.getElementById('token-symbol');
const totalSupplyCell = document.getElementById('total-supply');
const langSelect = document.getElementById('lang-select');

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
        return;
    }
    try {
        contract = new ethers.Contract(contractAddress, abi, provider);
        tokenSymbol.innerText = await contract.symbol();
        const total = await contract.totalSupply();
        totalSupplyCell.innerText = parseFloat(ethers.formatEther(total)).toLocaleString();
    } catch (e) {
        console.error("Contract info fetch failed:", e);
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
        if (stakedAmountDisplay) stakedAmountDisplay.innerText = "0.00 AEG";
        return;
    }

    try {
        const b = await contract.balanceOf(address);
        const balance = ethers.formatEther(b);
        const s = await contract.stakes(address);
        const staked = ethers.formatEther(s.amount);

        userBalance.innerText = parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2 });
        stakedAmountDisplay.innerText = parseFloat(staked).toLocaleString() + " AEG";

        // 更新圖表 (Real growth based on session updates)
        chartDataPoints.push(parseFloat(balance));
        if (chartDataPoints.length > 20) chartDataPoints.shift();
        portfolioChart.data.labels = chartDataPoints.map((_, i) => i);
        portfolioChart.data.datasets[0].data = chartDataPoints;
        portfolioChart.update();

    } catch (err) {
        console.error("Dashboard Real-time update failed:", err);
    }
}

function initListeners() {
    connectBtn?.addEventListener('click', async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) handleAccountsChanged(accounts);
    });

    // --- Burn ---
    document.getElementById('burn-btn')?.addEventListener('click', async () => {
        if (!signer) return alert("Connect vault first.");
        const amount = document.getElementById('burn-amount').value;
        if (!amount || amount <= 0) return alert("Invalid amount.");

        try {
            const tx = await contract.connect(signer).burn(ethers.parseEther(amount));
            await tx.wait();
            alert("Successful chain burn.");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("Blockchain Error: " + e.message); }
    });

    // --- Stake ---
    document.getElementById('stake-btn')?.addEventListener('click', async () => {
        if (!signer) return alert("Connect vault first.");
        const amount = document.getElementById('stake-amount').value;
        if (!amount || amount <= 0) return alert("Invalid amount.");

        try {
            const tx = await contract.connect(signer).stake(ethers.parseEther(amount));
            await tx.wait();
            alert("Deposit successful confirmed on Base.");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("Blockchain Error: " + e.message); }
    });

    // --- Claim ---
    document.getElementById('claim-rewards-tab')?.addEventListener('click', async () => {
        if (!signer) return alert("Connect vault first.");
        try {
            const tx = await contract.connect(signer).withdrawStake();
            await tx.wait();
            alert("Rewards Claimed & Principal Withdrawn (TX Confirmed).");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("Blockchain Error: " + e.message); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initListeners();
});
