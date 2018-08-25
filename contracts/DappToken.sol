pragma solidity ^0.4.2;

contract DappToken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens

    uint public totalSupply;
    
    constructor() public {
        totalSupply = 10000000;
    }
}