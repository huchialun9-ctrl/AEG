const { ethers } = require("ethers");
require("dotenv").config();

/**
 * AEG 自動發放機器人 (Autonomous Airdrop Bot) V1.0
 * 
 * 運作邏輯:
 * 1. 監聽您的開發者錢包 (0xBDC4...) 是否收到 ETH。
 * 2. 收到 ETH 後，自動讀取發送者地址。
 * 3. 使用收到的 ETH 作為 Gas，自動執行 mint() 將 AEG 發送給用戶。
 * 4. 真正實現「自動發幣」且「預售資金抵扣手續費」。
 */

// --- 配置區 ---
const RPC_URL = "https://mainnet.base.org"; // Base 主網 RPC
const PRIVATE_KEY = process.env.PRIVATE_KEY; // 您的私鑰 (需存放在 .env 中)
const AEG_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";
const DEV_ADDRESS = "0xBDC4566852B6B45148dBCb2119a4695dfd4e5d77";
const RATE = 23176; // 1 ETH = 23176 AEG

const ABI = [
    "function mint(address to, uint256 amount) public"
];

async function main() {
    if (!PRIVATE_KEY) {
        console.error("❌ 錯誤: 請在 .env 檔案中設定 PRIVATE_KEY");
        return;
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(AEG_ADDRESS, ABI, wallet);

    console.log("--------------------------------------------------");
    console.log("🤖 Aegis 自動發幣機器人已啟動...");
    console.log(`📡 監聽目標: ${DEV_ADDRESS}`);
    console.log(`🪙 代幣地址: ${AEG_ADDRESS}`);
    console.log("--------------------------------------------------");

    // 監聽區塊，尋找轉向 DEV_ADDRESS 的交易
    provider.on("block", async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber, true);
            for (const tx of block.prefetchedTransactions) {
                // 如果交易是發送給開發者地址，且金額大於 0
                if (tx.to && tx.to.toLowerCase() === DEV_ADDRESS.toLowerCase() && tx.value > 0n) {
                    const ethReceived = ethers.formatEther(tx.value);
                    const userAddress = tx.from;

                    console.log(`\n💰 偵測到新購買!`);
                    console.log(`👤 買家: ${userAddress}`);
                    console.log(`📥 金額: ${ethReceived} ETH`);

                    // 計算應發放的 AEG 數量
                    const aegToMint = parseFloat(ethReceived) * RATE;

                    console.log(`⏳ 正在自動發放 ${aegToMint.toLocaleString()} AEG...`);

                    try {
                        const mintTx = await contract.mint(userAddress, ethers.parseEther(aegToMint.toString()));
                        console.log(`✅ 發放成功! Hash: ${mintTx.hash}`);
                        console.log(`🔗 區塊鏈瀏覽器: https://basescan.org/tx/${mintTx.hash}`);
                    } catch (mintError) {
                        console.error(`❌ 發放失敗:`, mintError.message);
                        console.log("⚠️ 請檢查錢包是否有足夠 Gas (剛收到的 ETH 可能還在處理中)。");
                    }
                }
            }
        } catch (err) {
            // 忽略大多數網路或空區塊錯誤
        }
    });
}

main();
