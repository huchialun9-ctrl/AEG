import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--------------------------------------------------");
    console.log("🚀 開始執行 Aerodrome 主網加流動性腳本...");
    console.log(`使用帳戶: ${deployer.address}`);

    // [IMPORTANT] AEG 合約地址
    const AEG_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";

    // Base Mainnet Router Address (Aerodrome)
    const ROUTER_ADDRESS = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";

    if (AEG_ADDRESS.startsWith("0x...")) {
        console.log("❌ 錯誤：請先在腳本中填入部署後的 AEG 合約地址！");
        return;
    }

    const aegAbi = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function balanceOf(address account) view returns (uint256)"
    ];
    const routerAbi = [
        "function addLiquidityETH(address token, bool stable, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
    ];

    const aeg = new hre.ethers.Contract(AEG_ADDRESS, aegAbi, deployer);
    const router = new hre.ethers.Contract(ROUTER_ADDRESS, routerAbi, deployer);

    // [設定] 添加流動性比例 (請根據實際募集情況修改)
    // 例如：如果您募集了 1 ETH，想以 1 ETH = 23176 AEG 的價格上池，則 aegAmount = 23176
    const ethAmount = hre.ethers.parseEther("0.1"); // 修改為您的初始 ETH
    const aegAmount = hre.ethers.parseEther("2317.6"); // 修改為對應 AEG

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 分鐘後過期

    console.log(`1. 正在授權 AEG 給 Router...`);
    const approveTx = await aeg.approve(ROUTER_ADDRESS, aegAmount);
    await approveTx.wait();
    console.log("✅ 授權成功！");

    console.log(`2. 正在向 Aerodrome 添加流動性 (ETH/AEG)...`);
    const addTx = await router.addLiquidityETH(
        AEG_ADDRESS,
        false, // Volatile 池 (標準池)
        aegAmount,
        0, // 測試用，slip=100% (正式上線可設限)
        0, // 測試用
        deployer.address,
        deadline,
        { value: ethAmount }
    );
    const receipt = await addTx.wait();
    console.log("✅ 流動性添加成功！交易 Hash:", receipt.hash);
    console.log("--------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
