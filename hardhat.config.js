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
        base: {
            url: "https://mainnet.base.org",
            accounts: [process.env.PRIVATE_KEY]
        },
        "base-sepolia": {
            url: "https://sepolia.base.org",
            accounts: [process.env.PRIVATE_KEY]
        }
    },
};
