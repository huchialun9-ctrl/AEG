import { CdpClient } from "@coinbase/cdp-sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function main() {
    try {
        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_NAME,
            apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
            walletSecret: process.env.CDP_WALLET_SECRET
        });

        // 1. 加載合約數據 (確保已執行 npx hardhat compile)
        const artifactPath = "./artifacts/contracts/Aegis.sol/Aegis.json";
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        const abi = artifact.abi;
        const bytecode = artifact.bytecode;

        // 2. 獲取正式智能帳戶 (0xAfacabe...)
        // 注意：智能帳戶的部署需要其 owner 有簽署能力
        const ownerAccount = await cdp.evm.getAccount({
            address: "0xAfacabe4273695373fecFc69B3b1c0E530D402c3"
        });

        const smartAccount = await cdp.evm.getOrCreateSmartAccount({
            name: "AegisDeployerSmartAccount",
            owner: ownerAccount
        });

        console.log(`🚀 使用智能帳戶部署: ${smartAccount.address}`);

        // 3. 編碼部署數據 (符合您提供的構造函數參數)
        const iface = new ethers.Interface(abi);
        const deployData = ethers.concat([
            bytecode,
            iface.encodeDeploy(["Aegis", "AEG", ethers.parseEther("100000000")])
        ]);

        console.log("📦 正在發起受資助部署 (Gasless)...");

        // 4. 正式發起受資助 UserOperation (合約部署)
        // 在 SDK v1.44 中，部署合約是透過發送 data 但 to 設為 null 的 transaction
        // 智能帳戶通常透過 factory 部署，但這裡我們透過 UserOp 直接建立
        const userOpResult = await cdp.evm.prepareAndSendUserOperation({
            smartAccount: smartAccount,
            network: "base",
            calls: [
                {
                    to: "0x0000000000000000000000000000000000000000", // 代表 contract creation 的佔位或 factory
                    value: 0n,
                    data: deployData
                }
            ]
        });

        console.log(`✅ 部署操作已廣播！UserOp Hash: ${userOpResult.userOpHash}`);

        console.log("⏳ 正在等待交易確認...");
        const receipt = await cdp.evm.waitForUserOperation({
            smartAccountAddress: smartAccount.address,
            userOpHash: userOpResult.userOpHash
        });

        console.log(`🎉 部署成功！交易 Hash: ${receipt.transactionHash}`);
        // 對於部署交易，receipt.contractAddress 可能在 event 中或直接返回
        console.log("🔍 請在 BaseScan 查核您的合約地址。");

    } catch (error) {
        console.error("❌ 部署失敗:");
        console.error(error);
    }
}

main();
