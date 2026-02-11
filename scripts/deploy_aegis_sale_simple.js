import hre from "hardhat";

async function main() {
    console.log("--------------------------------------------------");
    console.log("🚀 Deploying AegisSale using private key...");

    const AEG_ADDRESS = "0xCFEF8Ee0197E846805Af515412256f24cCE3061d";

    const AegisSale = await hre.ethers.getContractFactory("AegisSale");
    const sale = await AegisSale.deploy(AEG_ADDRESS);

    await sale.waitForDeployment();

    const address = await sale.getAddress();

    console.log(`✅ AegisSale deployed to: ${address}`);
    console.log("--------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
