pragma solidity ^0.4.2;

import "./DappToken.sol";

contract DusterTokenSale {
    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
// Constructor
    constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
        // Assign an admin
        admin = msg.sender;

        // Assign our token contract
        tokenContract = _tokenContract;

        // Token Price
        tokenPrice = _tokenPrice;

    }
}