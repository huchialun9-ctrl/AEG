import { CdpClient } from "@coinbase/cdp-sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function main() {
    try {
        console.log("--------------------------------------------------");
        console.log("🚀 開始執行受資助部署 (Gasless)...");

        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_NAME,
            apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
            walletSecret: process.env.CDP_WALLET_SECRET
        });

        // 1. 加載合約數據 (確保已執行 npx hardhat compile)
        const artifactPath = "./artifacts/contracts/AegisSale.sol/AegisSale.json";
        if (!fs.existsSync(artifactPath)) {
            console.log("❌ 找不到編譯後的合約路徑。請先執行: npx hardhat compile");
            return;
        }
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

        // 現有的 AEG 合約地址
        const AEG_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";

        // 2. 獲取已存在的受資助帳戶 (嘗試另一個)
        const accountsResult = await cdp.evm.listSmartAccounts();
        const smartAccount = accountsResult.accounts.find(a => a.address.toLowerCase() === "0x557406DbA1019062f7Fb15049addfE228be27670".toLowerCase());

        if (!smartAccount) {
            console.log("❌ 找不到指定的智能帳戶 0x557406DbA1019062f7Fb15049addfE228be27670");
            return;
        }




        console.log(`📡 使用智能帳戶: ${smartAccount.address}`);

        // 3. 編碼部署數據
        const iface = new ethers.Interface(artifact.abi);
        const deployData = ethers.concat([
            artifact.bytecode,
            iface.encodeDeploy([AEG_ADDRESS])
        ]);

        console.log("📦 正在發送 UserOperation...");

        const userOpResult = await cdp.evm.prepareAndSendUserOperation({
            smartAccount: smartAccount,
            network: "base",
            calls: [
                {
                    to: "0x0000000000000000000000000000000000000000", // Contract Creation
                    value: 0n,
                    data: deployData
                }
            ]
        });

        console.log(`✅ 已廣播！UserOp Hash: ${userOpResult.userOpHash}`);
        console.log("⏳ 等待連鎖確認...");

        const receipt = await cdp.evm.waitForUserOperation({
            smartAccountAddress: smartAccount.address,
            userOpHash: userOpResult.userOpHash
        });

        console.log(`🎉 部署成功！`);
        console.log(`📜 交易 Hash: ${receipt.transactionHash}`);
        console.log(`🔑 預售合約地址: ${receipt.contractAddress}`);
        console.log("--------------------------------------------------");

    } catch (error) {
        console.error("❌ 部署失敗:");
        console.error(error);
    }
}

main();
