import { CdpClient } from "@coinbase/cdp-sdk";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
import fs from "fs";
import { ethers } from "ethers";

dotenv.config();

async function main() {
    try {
        console.log("正在初始化 CDP Client...");
        const cdp = new CdpClient({
            apiKeyId: process.env.CDP_API_KEY_NAME,
            apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
        });

        // 導入/獲取簽署帳戶
        let wallet;
        const privateKey = process.env.PRIVATE_KEY.startsWith("0x")
            ? process.env.PRIVATE_KEY
            : `0x${process.env.PRIVATE_KEY}`;

        try {
            console.log("正在導入本地簽署帳戶至 CDP...");
            wallet = await cdp.evm.importAccount({ privateKey });
            console.log(`新導入簽署者: ${wallet.address}`);
        } catch (e) {
            if (e.errorType === 'already_exists' || e.statusCode === 409) {
                console.log("帳戶已存在於項目中，正在獲取現有對象...");
                wallet = await cdp.evm.getAccount({
                    address: "0xBDC4566852B6B45148dBCb2119a4695dfd4e5d77"
                });
                console.log(`已獲取現有簽署者: ${wallet.address}`);
            } else {
                throw e;
            }
        }

        console.log("正在獲取或建立智能帳戶...");
        const smartAccount = await cdp.evm.getOrCreateSmartAccount({
            owner: wallet,
            name: "AegisDeployer"
        });

        console.log(`使用智能帳戶: ${smartAccount.address}`);

        // 讀取合約位元組碼
        const artifactPath = "./artifacts/contracts/Aegis.sol/Aegis.json";
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        const bytecode = artifact.bytecode;

        // 編碼構造函數參數 (initialOwner = smartAccount.address)
        const abi = artifact.abi;
        const iface = new ethers.Interface(abi);
        const deployData = ethers.concat([bytecode, iface.encodeDeploy([smartAccount.address])]);

        console.log("正在發起受資助的部署 UserOperation (Base Mainnet)...");

        // 透過 CDP SDK 的 prepareAndSendUserOperation 進行部署
        // 註：使用用戶提供的 RPC 作為 paymasterUrl 嘗試引導代付
        const userOpResult = await cdp.evm.prepareAndSendUserOperation({
            smartAccount: smartAccount,
            network: "base",
            paymasterUrl: "https://api.developer.coinbase.com/rpc/v1/base/VZB6PCjLKQpCjVeVFv2aI3pB0dHyVVbJ",
            calls: [{
                to: "0x0000000000000000000000000000000000000000", // 嘗試部署新合約
                data: deployData,
                value: 0n
            }]
        });

        console.log(`UserOperation Hash: ${userOpResult.userOpHash}`);
        console.log("等待交易確認...");
        const receipt = await smartAccount.useNetwork("base").waitForUserOperation(userOpResult.userOpHash);

        console.log("=========================================");
        console.log("✅ 部署成功！");
        console.log(`交易雜湊: ${userOpResult.userOpHash}`);
        console.log("=========================================");

    } catch (error) {
        console.error("❌ 部署失敗:");
        console.error(error);
    }
}

main();
