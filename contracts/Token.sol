pragma solidity ^0.4.15;

contract Owned {
    address public owner;

    function Owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}

//* @title Custom token */
contract Token is Owned {
    string public name;
    string public symbol;
    uint8 public decimals;
    
    uint256 public totalSupply;
    uint256 public sellPrice;
    uint256 public buyPrice;

    bytes32 public currentChallenge;
    uint public timeOfLastProof;
    uint public difficulty = 10**32;

    mapping (address => uint256) public balanceOf;
    mapping (address => bool) public frozenAccount;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event FrozenFunds(address target, bool frozen);
    
    /// Create a custom token.
    function Token(
        string _name,
        string _symbol,
        uint8 _decimals, 
        uint256 initialSupply
    ) {
        owner = msg.sender;
        balanceOf[owner] = initialSupply;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        timeOfLastProof = now;
    }

    /// Send coins
    function transfer(address _to, uint256 _value) {
        require(!frozenAccount[msg.sender]);

        /* Check if sender has balance and for overflows */
        require(balanceOf[msg.sender] >= _value && 
                balanceOf[_to] + _value >= balanceOf[_to]);
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);
    }

    /// Issue more tokens
    function mintToken(address target, uint256 mintedAmount) onlyOwner {
        balanceOf[target] += mintedAmount;
        totalSupply += mintedAmount;
        Transfer(0, owner, mintedAmount);
        Transfer(owner, target, mintedAmount);
    }

    /// Freeze / unfreeze one`s account
    function freezeAccount(address target, bool freeze) onlyOwner {
        frozenAccount[target] = freeze;
        FrozenFunds(target, freeze);
    }

    /// Set buy & sell prices for token
    function setPrices(uint256 newSellPrice, uint256 newBuyPrice) onlyOwner {
        sellPrice = newSellPrice;
        buyPrice = newBuyPrice;
    }

    /// Buy tokens for ether
    function buy() payable returns (uint amount) {
        amount = msg.value / buyPrice;
        require(balanceOf[this] >= amount);
        balanceOf[msg.sender] += amount;
        balanceOf[this] -= amount;
        Transfer(this, msg.sender, amount);
    }

    /// Sell tokens for ether
    function sell(uint amount) returns (uint revenue) {
        require(balanceOf[msg.sender] >= amount);
        balanceOf[this] += amount;
        balanceOf[msg.sender] -= amount;
        revenue = amount * sellPrice;
        require(msg.sender.send(revenue));
        Transfer(msg.sender, this, amount);
    }

    /// Mine new tokens
    function proofOfWork(uint nonce) {
        bytes8 n = bytes8(sha3(nonce, currentChallenge));
        require(n >= bytes8(difficulty));

        uint timeSinceLastProof = now - timeOfLastProof;
        require(timeSinceLastProof >= 5 seconds);
        balanceOf[msg.sender] += timeSinceLastProof / 60 seconds;

        difficulty = difficulty * 10 minutes / timeSinceLastProof + 1;
        timeOfLastProof = now;
        currentChallenge = sha3(nonce, currentChallenge, block.blockhash(block.number-1));
    }
}