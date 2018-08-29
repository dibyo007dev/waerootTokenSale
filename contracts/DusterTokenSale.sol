pragma solidity ^0.4.2;

import "./DappToken.sol";

contract DusterTokenSale {
    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );
// Constructor
    constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
        // Assign an admin
        admin = msg.sender;

        // Assign our token contract
        tokenContract = _tokenContract;

        // Token Price
        tokenPrice = _tokenPrice;
    }   

    // Multiply func

    function multiply(uint256 x, uint256 y) internal pure returns(uint z){
        require(y == 0 || (z = x * y) / y == x);

    }

    // Buying tokens
    function buyTokens(uint256 _numberOfTokens) public payable {

        // Require that the value is same as the tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice), "sender not sending the correct amout of eth for the transaction");
        // Require that the contract have enough balance
        require(tokenContract.balanceOf(this) >= _numberOfTokens, "not enough balance");
        // Require the transaction is successfull
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // Keep track of no. of tokens sold
        tokensSold += _numberOfTokens;
        // Emit a Sell event
        emit Sell(msg.sender, _numberOfTokens);
        
    }
    // Ending the TokenSale

    function endSale() public {
        // Require admin
        require(msg.sender == admin);

        // Transfer the remaining dapp tokens to the admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));
        
        // Destroy DusterTokenSaleContract
        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        admin.transfer(address(this).balance);   
    }
}