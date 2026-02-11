import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const name = "Aegis";
    const symbol = "AEG";
    const initialSupply = hre.ethers.parseUnits("100000000", 18); // 1 億顆

    const Aegis = await hre.ethers.getContractFactory("Aegis");
    const aegis = await Aegis.deploy(name, symbol, initialSupply);

    await aegis.waitForDeployment();

    console.log("Aegis deployed to:", await aegis.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
