// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AegisStaking
 * @dev 簡單的線性收益質押合約，用戶質押 AEG 獲得收益。
 */
contract AegisStaking is Ownable, ReentrancyGuard {
    IERC20 public stakingToken;
    uint256 public rewardRate = 10; // 每個區塊的收益率 (基點)
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardsClaimed;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        stakingToken = IERC20(_token);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        
        // 如果已有質押，先領取舊獎勵 (簡化版邏輯)
        if (stakes[msg.sender].amount > 0) {
            _claimReward();
        }

        stakingToken.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].timestamp = block.timestamp;
        
        emit Staked(msg.sender, _amount);
    }

    function withdraw() external nonReentrant {
        uint256 amount = stakes[msg.sender].amount;
        require(amount > 0, "Nothing to withdraw");
        
        _claimReward();
        
        stakes[msg.sender].amount = 0;
        stakingToken.transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external nonReentrant {
        _claimReward();
    }

    function _claimReward() internal {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            stakes[msg.sender].timestamp = block.timestamp;
            // 這裡假定合約裡有足夠的獎勵代幣
            stakingToken.transfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    function calculateReward(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;
        
        uint256 timePassed = block.timestamp - userStake.timestamp;
        // 簡單公式：數量 * 時間 * 速率 / 10000
        return (userStake.amount * timePassed * rewardRate) / 8640000; 
    }
}
