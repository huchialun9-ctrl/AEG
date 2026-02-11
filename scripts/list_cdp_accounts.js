import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_NAME,
            apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
        });

        console.log("正在列出智能帳戶...");
        const result = await cdp.evm.listSmartAccounts();
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error(error);
    }
}

main();
