var CareerTracker = artifacts.require("./CareerTracker.sol");

module.exports = function(deployer) {
  deployer.deploy(CareerTracker);
};
