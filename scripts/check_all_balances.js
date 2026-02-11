import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const AEG_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";

    console.log("--------------------------------------------------");
    console.log(`Checking balances for: ${deployer.address}`);

    // Check ETH balance
    const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH`);

    // Check AEG balance
    const aegAbi = ["function balanceOf(address) view returns (uint256)"];
    const aeg = new hre.ethers.Contract(AEG_ADDRESS, aegAbi, deployer);
    try {
        const aegBalance = await aeg.balanceOf(deployer.address);
        console.log(`AEG Balance: ${hre.ethers.formatEther(aegBalance)} AEG`);
    } catch (e) {
        console.log("Could not fetch AEG balance (Contract might not be verified or reachable)");
    }
    console.log("--------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
