import hre from "hardhat";

async function main() {
    const buyerAddress = "0x91E715f334Cb4Fbaf5fab554222f4bcC5c76d5b4";
    console.log("--------------------------------------------------");
    console.log(`Checking balance for buyer: ${buyerAddress}`);

    const balance = await hre.ethers.provider.getBalance(buyerAddress);
    console.log(`ETH Balance: ${hre.ethers.formatEther(balance)} ETH`);
    console.log("--------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
