import { setLanguage, currentLang, translations } from './i18n.js';

const contractAddress = "0x0000000000000000000000000000000000000000"; // 部署後更新
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
const stakedAmount = document.getElementById('staked-amount');
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

// --- Chart JS Implementation ---
function initChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Asset Growth',
                data: [1000, 1050, 1020, 1100, 1200, 1150, 1234.56],
                borderColor: '#037DD6',
                borderWidth: 4,
                fill: true,
                backgroundColor: 'rgba(3, 125, 214, 0.1)',
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
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
        } catch (err) { }
    }
}

async function setupTokenDisplay() {
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
        if (tokenSymbol) tokenSymbol.innerText = "AEG";
    } else {
        try {
            contract = new ethers.Contract(contractAddress, abi, provider);
            const total = await contract.totalSupply();
            totalSupplyCell.innerText = parseFloat(ethers.formatEther(total)).toLocaleString();
        } catch (e) { }
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        connectBtn?.classList.remove('connected');
        if (btnText) btnText.innerText = translations[currentLang]?.nav_connect || "Connect";
        if (walletAddrShort) walletAddrShort.innerText = "Disconnected";
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
    try {
        let balance, staked;
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            balance = "1,234.56";
            staked = "500.00";
        } else {
            const b = await contract.balanceOf(address);
            balance = ethers.formatEther(b);
            const s = await contract.stakes(address);
            staked = ethers.formatEther(s.amount);

            // Update Chart Data (Mocking relative to real balance)
            const baseVal = parseFloat(balance);
            portfolioChart.data.datasets[0].data = [baseVal * 0.8, baseVal * 0.85, baseVal * 0.9, baseVal * 0.95, baseVal * 1.0, baseVal * 1.02, baseVal];
            portfolioChart.update();
        }
        userBalance.innerText = parseFloat(balance.replace(/,/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2 });
        stakedAmount.innerText = parseFloat(staked).toLocaleString() + " AEG";
    } catch (err) { }
}

function initListeners() {
    connectBtn?.addEventListener('click', async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) handleAccountsChanged(accounts);
    });

    // --- User Services: Burn ---
    document.getElementById('burn-btn')?.addEventListener('click', async () => {
        const amount = document.getElementById('burn-amount').value;
        if (!amount || amount <= 0) return alert("Please specify an amount.");
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            alert("Shield active! Tokens burned successfully (Demo).");
            return;
        }
        try {
            const tx = await contract.connect(signer).burn(ethers.parseEther(amount));
            await tx.wait();
            alert("Successful burn transaction on Base.");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("Action cancelled: " + e.message); }
    });

    // --- User Services: Deposit (Stake) ---
    document.getElementById('stake-btn')?.addEventListener('click', async () => {
        const amount = document.getElementById('stake-amount').value;
        if (!amount || amount <= 0) return alert("Please enter deposit amount.");
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            alert("Wealth secured! Staking deposit successful (Demo).");
            return;
        }
        try {
            const tx = await contract.connect(signer).stake(ethers.parseEther(amount));
            await tx.wait();
            alert("Success! Your wealth is now yielding rewards.");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("Deposit failed: " + e.message); }
    });

    // --- User Services: Claim ---
    document.getElementById('claim-rewards-tab')?.addEventListener('click', async () => {
        if (!signer) return alert("Please connect your vault.");
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            alert("Harvest complete! Rewards delivered to your balance.");
            return;
        }
        try {
            const tx = await contract.connect(signer).withdrawStake();
            await tx.wait();
            alert("Yield collected successfully!");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert("Collection error."); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initListeners();
});
