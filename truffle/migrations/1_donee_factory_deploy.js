const DoneeFactory = artifacts.require("DoneeFactory");
const MockV3Aggregator = artifacts.require("MockV3Aggregator");

module.exports = async function(deployer) {
    await deployer.deploy(MockV3Aggregator, 2907);
    const mockPriceFeed = await MockV3Aggregator.deployed();

    // Deploy the DoneeFactory contract with the mock price feed address
    await deployer.deploy(DoneeFactory, mockPriceFeed.address);
};
