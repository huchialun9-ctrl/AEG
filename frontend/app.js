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

const connectBtn = document.querySelector('#connect-wallet');
const btnText = connectBtn?.querySelector('.btn-text');
const userBalance = document.getElementById('user-balance');
const stakedAmount = document.getElementById('staked-amount');
const walletAddr = document.getElementById('wallet-address');
const tokenSymbol = document.getElementById('token-symbol');
const totalSupplyCell = document.getElementById('total-supply');
const ownerPanel = document.getElementById('owner-actions');
const langSelect = document.getElementById('lang-select');

// 初始化語言選擇
if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
}

function shortenAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
}

async function init() {
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
        if (tokenSymbol) tokenSymbol.innerText = "AEG (DEMO)";
    } else {
        try {
            contract = new ethers.Contract(contractAddress, abi, provider);
            tokenSymbol.innerText = await contract.symbol();
            const total = await contract.totalSupply();
            totalSupplyCell.innerText = parseFloat(ethers.formatEther(total)).toLocaleString();
        } catch (e) { }
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        connectBtn?.classList.remove('connected');
        if (btnText) btnText.innerText = translations[currentLang]?.nav_connect || "Connect";
    } else {
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        connectBtn?.classList.add('connected');
        if (btnText) btnText.innerText = shortenAddress(address);
        if (walletAddr) walletAddr.innerText = address;

        updateDashboard(address);

        if (contractAddress !== "0x0000000000000000000000000000000000000000") {
            try {
                const owner = await contract.owner();
                if (ownerPanel) ownerPanel.style.display = (owner.toLowerCase() === address.toLowerCase()) ? 'block' : 'none';
            } catch (e) { }
        } else {
            if (ownerPanel) ownerPanel.style.display = 'block';
        }
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

    // --- Burn ---
    document.getElementById('burn-btn')?.addEventListener('click', async () => {
        const amount = document.getElementById('burn-amount').value;
        if (!amount || amount <= 0) return alert("Enter amount");
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            alert("Demo: Transacting 0x... Burn successful!");
            return;
        }
        try {
            const tx = await contract.connect(signer).burn(ethers.parseEther(amount));
            await tx.wait();
            alert("Burn confirmed!");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert(e.message); }
    });

    // --- Stake ---
    document.getElementById('stake-btn')?.addEventListener('click', async () => {
        const amount = document.getElementById('stake-amount').value;
        if (!amount || amount <= 0) return alert("Enter amount");
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            alert("Demo: Staking 0x... Stake successful!");
            return;
        }
        try {
            const tx = await contract.connect(signer).stake(ethers.parseEther(amount));
            await tx.wait();
            alert("Staked!");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert(e.message); }
    });

    // --- Claim / Unstake ---
    document.getElementById('claim-rewards-tab')?.addEventListener('click', async () => {
        if (!signer) return alert("Connect first");
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            alert("Demo: Claiming rewards... Distributed!");
            return;
        }
        try {
            const tx = await contract.connect(signer).withdrawStake();
            await tx.wait();
            alert("Rewards Claimed & Principal Withdrawn!");
            updateDashboard(await signer.getAddress());
        } catch (e) { alert(e.message); }
    });

    // --- Mint (Owner) ---
    document.getElementById('mint-btn')?.addEventListener('click', async () => {
        const to = document.getElementById('mint-address').value;
        const amount = document.getElementById('mint-amount').value;
        if (!to || !amount) return alert("Fields missing");
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            alert("Demo Owner Action: Minted " + amount + " to " + to);
            return;
        }
        try {
            const tx = await contract.connect(signer).mint(to, ethers.parseEther(amount));
            await tx.wait();
            alert("Minted!");
        } catch (e) { alert(e.message); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initListeners();
});
