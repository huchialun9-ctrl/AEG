// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Aegis Token
 * @dev Implementation of the Aegis (AEG) token on Base Mainnet.
 * Industrial-grade ERC20 with professional minting, burning, and pausing mechanisms.
 */
contract Aegis is ERC20, ERC20Burnable, Pausable, Ownable {
    
    /**
     * @dev Sets the name, symbol, and initial supply.
     * Initial supply is 1,000,000,000 tokens with 18 decimals.
     */
    constructor(address initialOwner) 
        ERC20("Aegis", "AEG") 
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1000000000 * 10 ** decimals());
    }

    /**
     * @dev Function to mint new tokens. Restricted to the owner.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Triggers stopped state.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     */
    function _update(address from, address to, uint256 value)
        internal
        virtual
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }
}
