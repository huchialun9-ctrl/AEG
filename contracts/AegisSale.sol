// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAegis {
    function mint(address to, uint256 amount) external;
}

/**
 * @title AegisSale
 * @dev Fixed price sale for AEG tokens to raise liquidity for Aerodrome.
 */
contract AegisSale is Ownable {
    IAegis public aegisToken;
    uint256 public tokensPerEth = 23176; // 1 ETH = 23,176 AEG ($0.085 each at $1970 ETH)
    
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);

    constructor(address _aegisAddress) Ownable(msg.sender) {
        aegisToken = IAegis(_aegisAddress);
    }

    /**
     * @dev User buys tokens by sending ETH.
     * The contract must have Owner/Minter permissions on the Aegis contract.
     */
    receive() external payable {
        buyTokens();
    }

    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        
        uint256 tokenAmount = msg.value * tokensPerEth;
        
        // Mint tokens directly to the buyer
        aegisToken.mint(msg.sender, tokenAmount);
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    /**
     * @dev Adjust the price if ETH price changes significantly.
     */
    function setRate(uint256 _newRate) external onlyOwner {
        tokensPerEth = _newRate;
    }

    /**
     * @dev Withdraw collected ETH to the owner (to be used later for Aerodrome liquidity).
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}
