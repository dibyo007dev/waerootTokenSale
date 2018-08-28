var DusterTokenSale = artifacts.require("./DusterTokenSale");

contract("DusterTokenSale", function(accounts) {
  var tokenSaleInstance;
  var tokenPrice = 1000000000000000; // in wei
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
});
