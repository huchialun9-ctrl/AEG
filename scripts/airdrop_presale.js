const hre = require("hardhat");
const fs = require("fs");

/**
 * Aegis 預售發幣工具 (Airdrop Tool)
 * 
 * 使用方式:
 * 1. 在 recipients 陣列中填入地址與數量
 * 2. 執行: npx hardhat run scripts/airdrop_presale.js --network base
 */

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--------------------------------------------------");
    console.log("🛰️  開始執行批量發幣工具...");
    console.log(`管理員地址: ${deployer.address}`);

    const AEG_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";

    // 定義發送清單
    const recipients = [
        // { address: "0x地址1...", amount: "1000" },
        // { address: "0x地址2...", amount: "500" },
    ];

    if (recipients.length === 0) {
        console.log("❌ 錯誤: 請先在腳本中填入收款名單 (recipients)！");
        return;
    }

    const abi = ["function mint(address to, uint256 amount) public"];
    const aegis = new hre.ethers.Contract(AEG_ADDRESS, abi, deployer);

    console.log(`準備為 ${recipients.length} 個地址發幣...`);

    for (let i = 0; i < recipients.length; i++) {
        const item = recipients[i];
        try {
            console.log(`⏳ [${i + 1}/${recipients.length}] 正在發送 ${item.amount} AEG 給 ${item.address}...`);
            const tx = await aegis.mint(item.address, hre.ethers.parseEther(item.amount));
            await tx.wait();
            console.log(`✅ 發送成功！Hash: ${tx.hash}`);
        } catch (err) {
            console.error(`❌ 發送失敗 (${item.address}):`, err.message);
        }
    }

    console.log("🎉 所有發幣任務已完成！");
    console.log("--------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
