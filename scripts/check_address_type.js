import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_NAME,
            apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
        });

        const address = "0xAfacabe4273695373fecFc69B3b1c0E530D402c3";
        console.log(`正在查核地址: ${address}`);

        try {
            const serverAccount = await cdp.evm.getAccount({ address });
            console.log("發現伺服器帳戶 (EOA):");
            console.log(JSON.stringify(serverAccount, null, 2));
        } catch (e) {
            console.log("非伺服器帳戶。");
        }

        try {
            const smartAccount = await cdp.evm.getSmartAccount({ address, owner: { address: "0xBDC4566852B6B45148dBCb2119a4695dfd4e5d77" } });
            console.log("發現智能帳戶:");
            console.log(JSON.stringify(smartAccount, null, 2));
        } catch (e) {
            console.log("非智能帳戶。");
        }

    } catch (error) {
        console.error(error);
    }
}

main();
