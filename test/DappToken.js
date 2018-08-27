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

  it("approves token for delegated transfers", function() {
    return DappToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then(function(success) {
        assert.equal(success, true, "it returns true");
        return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then(function(reciept) {
        assert.equal(reciept.logs.length, 1, "triggers one event");
        assert.equal(
          reciept.logs[0].event,
          "Approval",
          "correct event triggered"
        );
        assert.equal(
          reciept.logs[0].args._owner,
          accounts[0],
          "logs the account the tokens are authorised by"
        );
        assert.equal(
          reciept.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are authorised to"
        );
        assert.equal(
          reciept.logs[0].args._value,
          100,
          "logs the transfer amount"
        );
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then(function(allowance) {
        assert.equal(
          allowance.toNumber(),
          100,
          "allowance for delegated transfer"
        );
      });
  });

  it("handles delegated transfers", function() {
    return DappToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // Transfer some tokens to fromAcc
        return tokenInstance.transfer(fromAccount, 100, {
          from: accounts[0]
        });
      })
      .then(function() {
        // Approve spendingAcc to spend 10 tokens from fromAccount
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount
        });
      })
      .then(function(reciept) {
        // try transferring something larger from the senders balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 10000, {
          from: spendingAccount
        });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer the amount more than available"
        );
        // Try transferring something larger than allowance of _sender
        return tokenInstance
          .transferFrom(fromAccount, toAccount, 20, {
            from: spendingAccount
          })
          .then(assert.fail)
          .catch(function(err) {
            assert(
              err.message.indexOf("revert") >= 0,
              "cannot transfer the amount more than approved amount"
            );
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
              from: spendingAccount
            });
          })
          .then(function(success) {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
              from: spendingAccount
            });
          })
          .then(function(reciept) {
            assert.equal(reciept.logs.length, 1, "triggers one event");
            assert.equal(
              reciept.logs[0].event,
              "Transfer",
              "correct event triggered"
            );
            assert.equal(
              reciept.logs[0].args._from,
              fromAccount,
              "logs the account to be transferred from"
            );
            assert.equal(
              reciept.logs[0].args._to,
              toAccount,
              "logs the account to be transferred to"
            );
            assert.equal(
              reciept.logs[0].args._value,
              10,
              "Logs the transfer amount"
            );
            return tokenInstance.balanceOf(fromAccount);
          })
          .then(function(balance) {
            assert.equal(
              balance.toNumber(),
              90,
              "deducts the amount from the sending acc"
            );
            return tokenInstance.balanceOf(toAccount);
          })
          .then(function(balance) {
            assert.equal(
              balance.toNumber(),
              10,
              "adds the transfer amount into the the recievers acc"
            );
            return tokenInstance.allowance(fromAccount, spendingAccount);
          })
          .then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, "allowance updated");
          });
      });
  });
});
