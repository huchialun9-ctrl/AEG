const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--------------------------------------------------");
    console.log("🚀 開始執行自動化加流動性腳本...");
    console.log(`使用帳戶: ${deployer.address}`);

    // [IMPORTANT] 請務必更新此地址為您部署後的 AEG 合約地址
    // 如果您剛部署完，請把輸出的地址貼在這裡
    const AEG_ADDRESS = "0x...您的合約地址";

    const ROUTER_ADDRESS = "0xcf77a3ba9A5CA399B7c97c74d54e5b1Beb874E43"; // Aerodrome Sepolia Router

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

    // 設定比例：例如存入 0.05 ETH 和 1,000 AEG
    const ethAmount = hre.ethers.parseEther("0.05");
    const aegAmount = hre.ethers.parseEther("1000");
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 分鐘後過期

    console.log(`1. 正在授權 AEG 給 Router...`);
    const approveTx = await aeg.approve(ROUTER_ADDRESS, aegAmount);
    await approveTx.wait();
    console.log("✅ 授權成功！");

    console.log(`2. 正在向 Aerodrome 添加流動性 (ETH/AEG)...`);
    const addTx = await router.addLiquidityETH(
        AEG_ADDRESS,
        false, // Volatile 池
        aegAmount,
        0, // 測試用，slip=100%
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
