import { setLanguage, currentLang, translations } from './i18n.js';

const contractAddress = "0x0000000000000000000000000000000000000000"; // 部署後請更新此處
const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function owner() view returns (address)",
    "function mint(address to, uint256 amount) public",
    "function burn(uint256 amount) public",
    "function pause() public",
    "function unpause() public"
];

let provider;
let signer;
let contract;

const connectBtn = document.querySelector('#connect-wallet');
const btnText = connectBtn?.querySelector('.btn-text');
const userBalance = document.getElementById('user-balance');
const walletAddr = document.getElementById('wallet-address');
const tokenSymbol = document.getElementById('token-symbol');
const totalSupplyCell = document.getElementById('total-supply');
const ownerPanel = document.getElementById('owner-actions');
const langSelect = document.getElementById('lang-select');

// 初始化語言選擇器
if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

function shortenAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
}

const BASE_MAINNET_CHAIN_ID = "0x2105"; // 8453

async function init() {
    console.log("Aegis Web3 Initializing (V1.0.4)...");
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                handleAccountsChanged(accounts);
            }
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
            setupTokenDisplay();
        } catch (err) {
            console.error("Web3 Provider Error:", err);
        }
    } else {
        if (btnText) btnText.innerText = translations[currentLang]?.install_metamask || "Install MetaMask";
        if (connectBtn) connectBtn.onclick = () => window.open('https://metamask.io/download/', '_blank');
    }
}

async function setupTokenDisplay() {
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
        if (tokenSymbol) tokenSymbol.innerText = "AEG (DEMO)";
        if (totalSupplyCell) totalSupplyCell.innerText = "1,000,000,000";
    } else {
        try {
            contract = new ethers.Contract(contractAddress, abi, provider);
            if (tokenSymbol) tokenSymbol.innerText = await contract.symbol();
            const total = await contract.totalSupply();
            if (totalSupplyCell) totalSupplyCell.innerText = parseFloat(ethers.formatEther(total)).toLocaleString();
        } catch (e) {
            if (tokenSymbol) tokenSymbol.innerText = "AEG";
        }
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        connectBtn?.classList.remove('connected');
        if (btnText) btnText.innerText = translations[currentLang]?.nav_connect || "Connect Wallet";
        if (userBalance) userBalance.innerText = "0.00";
    } else {
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        if (network.chainId !== 8453n) await switchNetwork();

        connectBtn?.classList.add('connected');
        if (btnText) btnText.innerText = shortenAddress(address);

        updateDashboard(address);

        if (contractAddress !== "0x0000000000000000000000000000000000000000") {
            try {
                const owner = await contract.owner();
                if (ownerPanel) ownerPanel.style.display = (owner.toLowerCase() === address.toLowerCase()) ? 'block' : 'none';
            } catch (e) { }
        }
    }
}

async function updateDashboard(address) {
    if (!address) return;
    try {
        let balance;
        if (contractAddress === "0x0000000000000000000000000000000000000000") {
            balance = "1,234.56";
        } else {
            const b = await contract.balanceOf(address);
            balance = ethers.formatEther(b);
        }
        if (userBalance) userBalance.innerText = parseFloat(balance.replace(/,/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2 });
    } catch (err) {
        console.error("Dashboard Update Error:", err);
    }
}

async function switchNetwork() {
    try {
        await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_MAINNET_CHAIN_ID }] });
    } catch (e) {
        if (e.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: BASE_MAINNET_CHAIN_ID,
                        chainName: 'Base Mainnet',
                        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://mainnet.base.org'],
                        blockExplorerUrls: ['https://basescan.org']
                    }]
                });
            } catch (addError) { }
        }
    }
}

function initListeners() {
    connectBtn?.addEventListener('click', async () => {
        if (typeof window.ethereum === 'undefined') {
            window.open('https://metamask.io/download/', '_blank');
            return;
        }
        try {
            if (btnText) btnText.innerText = "...";
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) handleAccountsChanged(accounts);
        } catch (error) {
            if (btnText) btnText.innerText = translations[currentLang]?.nav_connect || "Connect Wallet";
        }
    });

    document.getElementById('burn-btn')?.addEventListener('click', async () => {
        if (!signer) return alert(translations[currentLang]?.balance_addr_none || "Please connect wallet");
        const amount = window.prompt(translations[currentLang]?.burn_placeholder || "Enter amount to burn:");
        if (!amount || amount <= 0) return;
        try {
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.burn(ethers.parseEther(amount));
            await tx.wait();
            alert("Burn successful!");
            updateDashboard(await signer.getAddress());
        } catch (e) {
            alert("Error: " + (e.shortMessage || e.message));
        }
    });

    document.getElementById('stake-btn')?.addEventListener('click', async () => {
        if (!signer) return alert("Please connect wallet");
        window.prompt("Enter amount to stake:");
        alert("Staking will be enabled in the next phase.");
    });

    document.getElementById('buy-action')?.addEventListener('click', () => {
        alert("Fiat Gateway (Demo): Aegis supports Kredit and Bank Transfer soon.");
    });

    document.getElementById('swap-btn-mock')?.addEventListener('click', () => {
        const assetSection = document.getElementById('asset-focus');
        assetSection?.scrollIntoView({ behavior: 'smooth' });
    });

    document.querySelector('.close-banner')?.addEventListener('click', (e) => {
        e.target.closest('.mm-banner').style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    initListeners();
});
