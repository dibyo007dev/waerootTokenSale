var DappToken = artifacts.require("./DappToken");

contract("DappToken", function(accounts) {
  it("sets the total supply on deployment", function() {
    return DappToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function(totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          10000000,
          "sets the total supply to 10000000"
        );
      });
  });
});
