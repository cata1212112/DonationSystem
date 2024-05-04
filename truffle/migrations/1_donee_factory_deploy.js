const DoneeFactoryContract = artifacts.require("DoneeFactory");

module.exports = function(deployer) {
	deployer.deploy(DoneeFactoryContract);
}
