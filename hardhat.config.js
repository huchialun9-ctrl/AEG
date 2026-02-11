import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

export default {
    solidity: {
        version: "0.8.24",
        settings: {
            evmVersion: "cancun",
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        "base-sepolia": {
            url: "https://sepolia.base.org",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        },
        "base-mainnet": {
            url: "https://mainnet.base.org",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 100000000, // 0.1 gwei - Base gas is low
        },
    },
};
