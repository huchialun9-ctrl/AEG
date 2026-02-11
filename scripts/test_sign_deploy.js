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

        const account = await cdp.evm.getAccount({
            address: "0xAfacabe4273695373fecFc69B3b1c0E530D402c3"
        });

        console.log("嘗試簽署部署交易 (to: undefined)...");

        // 僅測試簽署，不廣播
        try {
            const signature = await account.signTransaction({
                transaction: {
                    data: "0x6080604052348015600f57600080fd5b50603e80601d6000396000f3fe6080604052600080fdfea26469706673582212204c355866164f0270a4a8344e976646700c01010101010101010101010101010164736f6c63430008140033",
                    value: 0n,
                    type: 2
                }
            });
            console.log("✅ 簽署成功！代表伺服器端簽署支持部署格式。");
            console.log(signature);
        } catch (e) {
            console.log("❌ 簽署失敗:");
            console.log(e.errorMessage || e);
        }

    } catch (error) {
        console.error(error);
    }
}

main();
