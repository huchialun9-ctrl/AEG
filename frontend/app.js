import { setLanguage, currentLang, translations } from './i18n.js';
import { initCharts } from './charts.js';

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
const btnText = connectBtn.querySelector('.btn-text');
const userBalance = document.getElementById('user-balance');
const walletAddr = document.getElementById('wallet-address');
const tokenSymbol = document.getElementById('token-symbol');
const totalSupplyCell = document.getElementById('total-supply');
const ownerPanel = document.getElementById('owner-actions');
const langSelect = document.getElementById('lang-select');

// 初始化語言選擇器狀態
if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

// 格式化地址
function shortenAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
}

const BASE_MAINNET_CHAIN_ID = "0x2105"; // 8453

async function init() {
    console.log("Initializing Web3...");
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.BrowserProvider(window.ethereum);

        // 嘗試自動連接（如果用戶之前授權過）
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            handleAccountsChanged(accounts);
        }

        // 監聽帳號與網路變化
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());

        // 顯示代幣基本資訊
        setupTokenDisplay();
    } else {
        btnText.innerText = translations[currentLang]?.install_metamask || "Install MetaMask";
        connectBtn.onclick = () => window.open('https://metamask.io/download/', '_blank');
        connectBtn.style.background = "var(--accent)";
    }
}

async function setupTokenDisplay() {
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
        tokenSymbol.innerText = "AEG (DEMO)";
        totalSupplyCell.innerText = "1,000,000,000";
    } else {
        try {
            contract = new ethers.Contract(contractAddress, abi, provider);
            tokenSymbol.innerText = await contract.symbol();
            const total = await contract.totalSupply();
            totalSupplyCell.innerText = parseFloat(ethers.formatEther(total)).toLocaleString();
        } catch (e) {
            tokenSymbol.innerText = "AEG";
            totalSupplyCell.innerText = "1,000,000,000";
        }
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // 用戶斷開連線
        connectBtn.classList.remove('connected');
        btnText.innerText = translations[currentLang]?.nav_connect || "Connect Wallet";
        walletAddr.innerText = translations[currentLang]?.balance_addr_none || "Not Connected";
        userBalance.innerText = "0.00";
        ownerPanel.style.display = 'none'; // 隱藏管理面板
    } else {
        signer = await provider.getSigner();
        const address = await signer.getAddress();

        // 檢查網路是否為 Base Mainnet
        const network = await provider.getNetwork();
        if (network.chainId !== 8453n) {
            await switchNetwork();
        }

        connectBtn.classList.add('connected');
        btnText.innerText = shortenAddress(address);
        walletAddr.innerText = address;
        walletAddr.style.color = "#00d395";

        updateDashboard(address);

        // 檢查是否為 Owner 以顯示管理面板
        if (contractAddress !== "0x0000000000000000000000000000000000000000") {
            try {
                const owner = await contract.owner();
                if (owner.toLowerCase() === address.toLowerCase()) {
                    ownerPanel.style.display = 'block';
                } else {
                    ownerPanel.style.display = 'none';
                }
            } catch (e) { }
        }
    }
}

async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_MAINNET_CHAIN_ID }],
        });
    } catch (switchError) {
        // 如果錢包沒這個網路，則執行添加
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: BASE_MAINNET_CHAIN_ID,
                        chainName: 'Base Mainnet',
                        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://mainnet.base.org'],
                        blockExplorerUrls: ['https://basescan.org']
                    }],
                });
            } catch (addError) {
                console.error(addError);
            }
        }
    }
}

// 核心事件監聽
function initListeners() {
    // 錢包連接
    connectBtn?.addEventListener('click', async () => {
        if (typeof window.ethereum === 'undefined') return;
        try {
            btnText.innerText = "...";
            await provider.send("eth_requestAccounts", []);
            const accounts = await provider.listAccounts();
            handleAccountsChanged(accounts);
        } catch (error) {
            btnText.innerText = translations[currentLang]?.nav_connect || "Connect Wallet";
            alert("Fail: " + error.message);
        }
    });

    // 銷毀代幣
    document.getElementById('burn-btn')?.addEventListener('click', async () => {
        if (!signer) return alert("請先連接錢包");
        const amount = document.getElementById('burn-amount').value;
        if (!amount || amount <= 0) return alert("請輸入有效數量");
        try {
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.burn(ethers.parseEther(amount));
            alert("交易已發送，等待區塊鏈確認...");
            await tx.wait();
            alert("銷毀成功！");
            updateDashboard(await signer.getAddress());
        } catch (e) {
            alert("操作失敗: " + (e.shortMessage || e.message));
        }
    });

    // 鑄造代幣 (Owner ONLY)
    document.getElementById('mint-btn')?.addEventListener('click', async () => {
        if (!signer) return alert("請管理員連接錢包");
        const to = document.getElementById('mint-address').value;
        const amount = document.getElementById('mint-amount').value;
        if (!to || !amount) return alert("請填寫地址與數量");
        try {
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.mint(to, ethers.parseEther(amount));
            await tx.wait();
            alert("鑄造成功！");
            updateDashboard(await signer.getAddress());
        } catch (e) {
            alert("鑄造失敗: " + e.message);
        }
    });

    // 質押與治理交互
    document.getElementById('stake-btn')?.addEventListener('click', () => {
        alert("質押功能將於合約部署後實機啟動！目前合約地址為測試佔位。");
    });

    document.getElementById('claim-btn')?.addEventListener('click', () => {
        alert("獎勵領取功能將隨質押系統一同開啟。");
    });

    document.getElementById('propose-btn')?.addEventListener('click', () => {
        alert("DAO 治理功能：僅限 AEG 持有人發起提案。");
    });
}

// 啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
    init();
    initListeners();
    initCharts();

    // 註冊 PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => { });
    }

    // 電子報按鈕
    document.getElementById('nl-btn')?.addEventListener('click', () => {
        const email = document.getElementById('nl-email').value;
        if (email && email.includes('@')) {
            alert("感謝訂閱！您將會收到 Aegis 的最新動態。");
            document.getElementById('nl-email').value = "";
        } else {
            alert("請輸入有效的 Email 地址。");
        }
    });
});
