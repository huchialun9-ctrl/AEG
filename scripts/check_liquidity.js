const { ethers } = require("hardhat");

async function main() {
    const AEG_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";
    const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"; // Base WETH
    const AERODROME_FACTORY = "0x420DD3807E0e105e61266CE96Eb77926e8557b44"; // Aerodrome v2 Factory

    const factoryAbi = ["function getPool(address tokenA, address tokenB, bool stable) external view returns (address)"];

    // Get the provider from hardhat
    const [deployer] = await ethers.getSigners();
    const factory = new ethers.Contract(AERODROME_FACTORY, factoryAbi, deployer);

    console.log("--------------------------------------------------");
    console.log("Checking for Aerodrome v2 Volatile Pool (ETH/AEG)...");
    console.log(`AEG: ${AEG_ADDRESS}`);
    console.log(`WETH: ${WETH_ADDRESS}`);
    console.log("--------------------------------------------------");

    try {
        const poolAddress = await factory.getPool(WETH_ADDRESS, AEG_ADDRESS, false);

        if (poolAddress === "0x0000000000000000000000000000000000000000") {
            console.log("❌ Pool not found on Aerodrome.");
            console.log("Action Required: Go to Aerodrome UI and create a Volatile pool with ETH/AEG.");
        } else {
            console.log(`✅ Pool detected at: ${poolAddress}`);

            const poolAbi = ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"];
            const pool = new ethers.Contract(poolAddress, poolAbi, deployer);

            const [r0, r1] = await pool.getReserves();
            console.log(`Current Reserves:`);
            console.log(`- Reserve 0: ${ethers.formatEther(r0)}`);
            console.log(`- Reserve 1: ${ethers.formatEther(r1)}`);

            if (r0 === 0n || r1 === 0n) {
                console.log("⚠️ Pool exists but has NO liquidity. Please add liquidity to enable trading.");
            } else {
                console.log("🚀 Liquidity is present! The 'No route found' error should be resolved.");
            }
        }
    } catch (error) {
        console.error("❌ Error checking pool:", error.message);
    }
    console.log("--------------------------------------------------");
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
