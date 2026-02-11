import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        // 核心修正：手動讀取 .env 中的變數名稱以確保與用戶提供的名稱對齊
        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_NAME,
            apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
            walletSecret: process.env.CDP_WALLET_SECRET
        });

        console.log("正在透過 CDP 組織權限生成免手續費智能帳戶...");
        const account = await cdp.evm.createAccount();

        console.log("-----------------------------------------");
        console.log("✅ 恭喜！正式帳號建立成功！");
        console.log(`🔥 你的免手續費發幣地址： ${account.address}`);
        console.log("-----------------------------------------");
        console.log("\n[下一步] 您可以將 ETH 轉入此地址，或使用代付合約進行發幣。");
    } catch (error) {
        console.error("❌ 帳號建立失敗:");
        if (error.errorMessage) {
            console.error(`原因: ${error.errorMessage}`);
        } else {
            console.error(error);
        }
    }
}

main();
