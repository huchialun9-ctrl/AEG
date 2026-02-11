import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const address = "0xBDC4566852B6B45148dBCb2119a4695dfd4e5d77";
    const balance = await provider.getBalance(address);
    console.log(`地址: ${address}`);
    console.log(`餘額 (Wei): ${balance.toString()}`);
    console.log(`餘額 (ETH): ${ethers.formatEther(balance)}`);

    // 估算部署所需
    const gasPrice = (await provider.getFeeData()).maxFeePerGas;
    console.log(`當前 Gas Price: ${ethers.formatUnits(gasPrice || 0n, "gwei")} gwei`);
}
main();
