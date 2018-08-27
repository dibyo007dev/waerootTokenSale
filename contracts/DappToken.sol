pragma solidity ^0.4.2;

contract DappToken {
    // Add a name 
    string public name = "DusterToken";
    // Add a symbol
    string public symbol = "Dust";
    // Add a standard
    string public standard = "DusterToken v1.0";
    
    uint public totalSupply;

    mapping(address => uint256) public balanceOf;
    // Allowance
    mapping(address => mapping(address => uint256) )public allowance;

    // Transfer Event
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    // Approve Event

    event Approval(
        address indexed _owner,
        address indexed _spender,
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

    // Delegated Transfers

    // Approve
    function approve(address _spender, uint256 _value) public returns(bool) {
        // Handle the allowance
        allowance[msg.sender][_spender] = _value;
        // Handle the approve event 
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    // Transfer from
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {

        // Require the from acc have enough tokens
        require(_value <= balanceOf[_from], "not enough balance");
        // Requre the allowance is big enough
        require(_value <= allowance[_from][msg.sender], " transfer values is not allowed for the sender");
        // Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // Update the alownace
        allowance[_from][msg.sender] -= _value;
        // Transfer event
        emit Transfer(_from, _to, _value);
        // Returns a boolean      
        return true;
    }
}