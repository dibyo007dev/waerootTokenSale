var DappToken = artifacts.require("./DappToken.sol");
var DusterTokenSale = artifacts.require("./DusterTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(DappToken, 10000000).then(function() {
    // Token price is 0.001 eth
    var tokenPrice = 1000000000000000;
    return deployer.deploy(DusterTokenSale, DappToken.address, tokenPrice);
  });
};
