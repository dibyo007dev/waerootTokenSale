App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized ....");
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },
  initContracts: function() {
    $.getJSON("DusterTokenSale.json", function(dusterTokenSale) {
      App.contracts.DusterTokenSale = TruffleContract(dusterTokenSale);
      App.contracts.DusterTokenSale.setProvider(App.web3Provider);
      App.contracts.DusterTokenSale.deployed().then(function(dusterTokenSale) {
        console.log("Duster TokenSale Address", dusterTokenSale.address);
      });
    }).done(function() {
      $.getJSON("DappToken.json", function(dappToken) {
        App.contracts.DappToken = TruffleContract(dappToken);
        App.contracts.DappToken.setProvider(App.web3Provider);
        App.contracts.DappToken.deployed().then(function(dappToken) {
          console.log("Dapp Token Address", dappToken.address);
        });
      });
      return App.render();
    });
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        // console.log(account);
        $("#accountAddress").html("Your Account : " + account);
      }
    });

    App.contracts.DusterTokenSale.deployed()
      .then(function(instance) {
        dusterTokenSaleInstance = instance;
        return dusterTokenSaleInstance.tokenPrice();
      })
      .then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        console.log(tokenPrice.toNumber());
        $(".token-price").html(
          web3.fromWei(App.tokenPrice.toNumber(), "ether")
        );
        return dusterTokenSaleInstance.tokensSold();
      })
      .then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $(".tokens-sold").html(App.tokensSold);
        $(".tokens-available").html(App.tokensAvailable);
        // Progress status check
        // App.tokensSold = 600000;
        // console.log(App.tokensSold);
        // console.log(App.tokensAvailable);

        var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
        console.log(progressPercent);
        $("#progress").css("width", progressPercent + "%");

        // Load token contract
        return App.contracts.DappToken.deployed()
          .then(function(instance) {
            dappTokenInstance = instance;
            return dappTokenInstance.balanceOf(App.account);
          })
          .then(function(balance) {
            $(".dapp-balance").html(balance.toNumber());
          });
      });

    App.loading = false;
    loader.hide();
    content.show();
  }
};

$(function() {
  $(window).on("load", function() {
    App.init();
  });
});
