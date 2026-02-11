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

connectBtn.addEventListener('click', async () => {
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

async function updateDashboard(address) {
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
        userBalance.innerText = "8,888.88";
        return;
    }
    if (!contract || !address) return;
    try {
        const balance = await contract.balanceOf(address);
        userBalance.innerText = parseFloat(ethers.formatUnits(balance, 18)).toFixed(2);
    } catch (e) {
        console.error("Fail", e);
    }
}

init();
// 銷毀代幣功能
document.getElementById('burn-btn').addEventListener('click', async () => {
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
        alert("操作失敗: " + e.shortMessage || e.message);
    }
});

// 鑄造代幣功能 (Owner ONLY)
document.getElementById('mint-btn').addEventListener('click', async () => {
    if (!signer) return;
    const to = document.getElementById('mint-address').value;
    const amount = document.getElementById('mint-amount').value;

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

init();
