import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
console.log(`私鑰對應地址: ${wallet.address}`);
