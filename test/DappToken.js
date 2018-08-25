var DappToken = artifacts.require("./DappToken");

contract("DappToken", function(accounts) {
  var tokenInstance;

  it("initializes the contract with correct values", function() {
    return DappToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(function(name) {
        assert.equal(name, "DusterToken", "correct name assigned to the token");
        return tokenInstance.symbol();
      })
      .then(function(symbol) {
        assert.equal(symbol, "Dust", "correct symbol assigned to the token");
        return tokenInstance.standard();
      })
      .then(function(standard) {
        assert.equal(standard, "DusterToken v1.0", "correct standard assigned");
      });
  });

  it("alloccates the total supply on deployment", function() {
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
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(adminBalance) {
        assert.equal(
          adminBalance.toNumber(),
          10000000,
          "it allocates the initial supply to the admin"
        );
      });
  });

  it("transfers token ownership", function() {
    return DappToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        // Test `require` statement first by transferring something larger than the senders balance
        return tokenInstance.transfer.call(accounts[1], 9999999999999999999999);
      })
      .then(assert.fail)
      .catch(function(err) {
        assert(
          err.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenInstance.transfer.call(accounts[1], 2500000, {
          from: accounts[0]
        });
      })
      .then(function(success) {
        assert.equal(success, true, "successfull transaction");
        return tokenInstance.transfer(accounts[1], 2500000, {
          from: accounts[0]
        });
      })
      .then(function(reciept) {
        assert.equal(reciept.logs.length, 1, "triggers one event");
        assert.equal(
          reciept.logs[0].event,
          "Transfer",
          "should be a transfer event"
        );
        assert.equal(
          reciept.logs[0].args._from,
          accounts[0],
          "logs the account the tokens are transfered from"
        );
        assert.equal(
          reciept.logs[0].args._to,
          accounts[1],
          "logs the account the tokens are transfered to"
        );
        assert.equal(
          reciept.logs[0].args._value,
          2500000,
          "logs the transfered amount"
        );
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function(balance) {
        assert.equal(
          balance.toNumber(),
          2500000,
          "adds the amount to reciever account"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(balance) {
        assert.equal(
          balance.toNumber(),
          7500000,
          "deducts the amount from the sending acc"
        );
      });
  });
});
