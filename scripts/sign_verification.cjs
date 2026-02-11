const { ethers } = require("hardhat");

async function main() {
    // 獲取部署者錢包 (從 .env 讀取私鑰)
    const [deployer] = await ethers.getSigners();
    console.log("Signing with address:", deployer.address);

    // 這是 BaseScan 要求簽署的精確訊息 (從用戶截圖中提取)
    const message = "[basescan.org 11/02/2026 10:28:59] I, hereby verify that I am the owner/creator of the address [0xCFEF8Ee0197E846805Af515412256f24cCE3061d]";

    // 進行簽署
    const signature = await deployer.signMessage(message);

    console.log("\n--- SIGNATURE HASH ---");
    console.log(signature);
    console.log("----------------------\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
