// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VulnerableLiquidETH - Test Contract
 * @notice This is a DEMONSTRATION contract that replicates the vulnerability
 *         found in LiquidETHV1 at 0x7e772ed6e4bfeae80f2d58e4254f6b6e96669253
 * 
 * ⚠️  WARNING: This contract is INTENTIONALLY VULNERABLE for educational purposes
 *     DO NOT USE IN PRODUCTION
 * 
 * Demonstrates:
 * 1. No minimum/maximum bounds on exchange rate
 * 2. No rate-of-change validation
 * 3. No timelock protection
 * 4. Single oracle = single point of failure
 */
contract VulnerableLiquidETH {
    // State variables
    uint256 private _exchangeRate;
    address public oracle;
    address public owner;
    
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    
    string public constant name = "Vulnerable Liquid ETH (Test)";
    string public constant symbol = "vLETH";
    uint8 public constant decimals = 18;
    
    // Events
    event ExchangeRateUpdated(address indexed oracle, uint256 newExchangeRate);
    event OracleUpdated(address indexed newOracle);
    event Deposit(address indexed user, uint256 ethAmount, uint256 tokensReceived);
    event Withdrawal(address indexed user, uint256 tokensRedeemed, uint256 ethReceived);
    
    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        oracle = msg.sender; // Initially owner is oracle
        _exchangeRate = 1.05 ether; // 1.05 ETH per token (5% premium)
    }
    
    /**
     * @notice Get current exchange rate
     * @return Current exchange rate in wei
     */
    function exchangeRate() external view returns (uint256) {
        return _exchangeRate;
    }
    
    /**
     * @notice Update exchange rate
     * @dev ❌ VULNERABLE: Only checks > 0, no other validation
     * @param newExchangeRate New exchange rate value
     */
    function updateExchangeRate(uint256 newExchangeRate) external onlyOracle {
        require(newExchangeRate > 0, "cannot be 0");  // ❌ ONLY validation!
        
        // No minimum bound check
        // No maximum bound check
        // No rate-of-change validation
        // No timelock delay
        
        _exchangeRate = newExchangeRate;
        emit ExchangeRateUpdated(msg.sender, newExchangeRate);
    }
    
    /**
     * @notice Update oracle address
     * @dev ❌ VULNERABLE: No timelock delay
     * @param newOracle New oracle address
     */
    function updateOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle");
        
        // No timelock delay
        oracle = newOracle;
        emit OracleUpdated(newOracle);
    }
    
    /**
     * @notice Deposit ETH and receive tokens
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit ETH");
        
        // Calculate tokens to mint based on exchange rate
        // tokens = ethAmount / exchangeRate
        uint256 tokensToMint = (msg.value * 1 ether) / _exchangeRate;
        
        _balances[msg.sender] += tokensToMint;
        _totalSupply += tokensToMint;
        
        emit Deposit(msg.sender, msg.value, tokensToMint);
    }
    
    /**
     * @notice Withdraw ETH by burning tokens
     * @param tokenAmount Amount of tokens to burn
     */
    function withdraw(uint256 tokenAmount) external {
        require(_balances[msg.sender] >= tokenAmount, "Insufficient balance");
        
        // Calculate ETH to return based on exchange rate
        // eth = tokenAmount * exchangeRate
        uint256 ethToReturn = (tokenAmount * _exchangeRate) / 1 ether;
        
        require(address(this).balance >= ethToReturn, "Insufficient contract balance");
        
        _balances[msg.sender] -= tokenAmount;
        _totalSupply -= tokenAmount;
        
        (bool success, ) = msg.sender.call{value: ethToReturn}("");
        require(success, "ETH transfer failed");
        
        emit Withdrawal(msg.sender, tokenAmount, ethToReturn);
    }
    
    /**
     * @notice Get total token supply
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    /**
     * @notice Get token balance of account
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @notice Allow contract to receive ETH
     */
    receive() external payable {}
}
