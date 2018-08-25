pragma solidity ^0.4.2;

contract DappToken {
    // Add a name 
    string public name = "DusterToken";
    // Add a symbol
    string public symbol = "Dust";
    // Add a standard
    string public standard = "DusterToken v1.0";
    
    uint public totalSupply;

    mapping(address => uint) public balanceOf;

    // Transfer Event
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    constructor(uint _initialSupply) public {
        // allocate the entire supply
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer
    function transfer(address _to, uint256 _value) public returns (bool success) {
    // Exception if account doesn't have enough
        require(balanceOf[msg.sender] >= _value, "not enough balance to transfer");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

    // Transfer event
        emit Transfer(msg.sender, _to, _value);

    // Return a boolean
        return true;

    }
}