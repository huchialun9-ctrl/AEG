import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Aegis = await hre.ethers.getContractFactory("Aegis");
    const aegis = await Aegis.deploy(deployer.address);

    await aegis.waitForDeployment();

    console.log("Aegis deployed to:", await aegis.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
