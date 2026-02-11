// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Aegis Token & Staking
 * @dev Implementation of the Aegis (AEG) token with integrated staking logic for the official site.
 */
contract Aegis is ERC20, ERC20Burnable, Pausable, Ownable {
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public apy = 185; // 18.5% (multiplied by 10)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event APYUpdated(uint256 oldAPY, uint256 newAPY);

    /**
     * @dev 構造函數：初始化 Aegis 代幣並鑄造初始供應量給部署者。
     * @param name 代幣名稱
     * @param symbol 代幣符號
     * @param initialSupply 最小單位數量 (18位小數)
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
        apy = 1850; // 預設 18.50% (multiplied by 100)
    }

    // --- Core Token Functions ---

    function setAPY(uint256 newAPY) public onlyOwner {
        uint256 oldAPY = apy;
        apy = newAPY;
        emit APYUpdated(oldAPY, newAPY);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // --- Staking Logic ---

    /**
     * @dev Stake AEG tokens to earn rewards.
     */
    function stake(uint256 amount) public whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // If user already has a stake, they must unstake (claim) first or it complicates math
        // Simplified for this version:
        if (stakes[msg.sender].amount > 0) {
            _unstake();
        }

        _transfer(msg.sender, address(this), amount);
        stakes[msg.sender] = Stake(amount, block.timestamp);
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Internal function to handle unstaking and reward distribution.
     */
    function _unstake() internal {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No active stake");

        uint256 reward = calculateReward(msg.sender);
        uint256 principal = userStake.amount;

        totalStaked -= principal;
        delete stakes[msg.sender];

        _transfer(address(this), msg.sender, principal);
        if (reward > 0) {
            _mint(msg.sender, reward); // Rewards are minted as inflation
        }

        emit Unstaked(msg.sender, principal, reward);
    }

    function withdrawStake() public whenNotPaused {
        _unstake();
    }

    /**
     * @dev Calculate rewards based on time and APY.
     */
    function calculateReward(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 duration = block.timestamp - userStake.startTime;
        // Reward = Amount * apy% * (Duration / 1 Year)
        // Simplified: (amount * apy * duration) / (1000 * 365 days)
        return (userStake.amount * apy * duration) / (1000 * 365 days);
    }

    // --- Hooks ---

    function _update(address from, address to, uint256 value)
        internal
        virtual
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }
}
