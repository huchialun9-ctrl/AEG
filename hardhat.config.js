import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

export default {
    solidity: "0.8.20",
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
