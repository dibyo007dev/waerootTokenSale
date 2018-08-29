var DusterTokenSale = artifacts.require("./DusterTokenSale");
var DappToken = artifacts.require("./DappToken");

contract("DusterTokenSale", function(accounts) {
  var tokenInstance;
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000; // in wei
  var tokensAvailable = 750000;
  var numberOfTokens = 10;
  it("initializes the contract with correct values", function() {
    return DusterTokenSale.deployed()
      .then(function(instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then(function(address) {
        assert.notEqual(address, 0x0, "contains an address");
        return tokenSaleInstance.tokenContract();
      })
      .then(function(tokenAddr) {
        assert.notEqual(tokenAddr, 0x0, "contains a token addr");
        return tokenSaleInstance.tokenPrice();
      })
      .then(function(price) {
        assert.equal(price, tokenPrice, "correct price given");
      });
  });

  it("facilitates token buying", function() {
    return DappToken.deployed()
      .then(function(instance) {
        // Grab the token first
        tokenInstance = instance;
        return DusterTokenSale.deployed();
      })
      .then(function(instance) {
        // Then grab the token sale instance
        tokenSaleInstance = instance;
        // Provision 75% of the token to the token sale
        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokensAvailable,
          { from: admin }
        );
      })
      .then(function(reciept) {
        var value = numberOfTokens * tokenPrice;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: value
        });
      })
      .then(function(reciept) {
        assert.equal(reciept.logs.length, 1, "triggers one event");
        assert.equal(reciept.logs[0].event, "Sell", "correct event triggered");
        assert.equal(
          reciept.logs[0].args._buyer,
          buyer,
          "logs the acc. that purchased the token"
        );
        assert.equal(
          reciept.logs[0].args._amount,
          numberOfTokens,
          "logs the number of tokens purchased"
        );
        return tokenSaleInstance.tokensSold();
      })
      .then(function(amount) {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increments the number of tokens sold"
        );
        return tokenInstance.balanceOf(buyer);
      })
      .then(function(balance) {
        assert.equal(
          balance.toNumber(),
          numberOfTokens,
          "buyer balance updated"
        );
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function(balance) {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        // Try to buy tokens different from  the ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1
        });
      })
      .then(assert.fail)
      .catch(function(err) {
        assert(
          err.message.indexOf("revert") >= 0,
          "msg.value should be equal to the token in wei"
        );
        // Try to buy more tokens than available
        return tokenSaleInstance.buyTokens(800000000, {
          from: buyer,
          value: numberOfTokens * tokenPrice
        });
      })
      .then(assert.fail)
      .catch(function(err) {
        assert(
          err.message.indexOf("revert") >= 0,
          "cannot purchase more tokens than available"
        );
      });
  });
});
