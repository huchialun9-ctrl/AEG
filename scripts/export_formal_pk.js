import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_NAME,
            apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
            walletSecret: process.env.CDP_WALLET_SECRET
        });

        console.log("正在嘗試導出帳戶私鑰...");
        const privateKey = await cdp.evm.exportAccount({
            address: "0xAfacabe4273695373fecFc69B3b1c0E530D402c3"
        });

        console.log("-----------------------------------------");
        console.log("✅ 成功獲取私鑰！");
        console.log(`🔑 私鑰: ${privateKey}`);
        console.log("-----------------------------------------");
        console.log("注意：此私鑰可用於 Hardhat 執行最終部署。");

    } catch (error) {
        console.error("❌ 導出失敗:");
        console.error(error.errorMessage || error);
    }
}

main();
