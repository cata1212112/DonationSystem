const DoneeFactoryContract = artifacts.require("DoneeFactory");

contract("DoneeFactoryDeployment", () => {
	it("deployed", async () => {
		const doneeFactory = DoneeFactoryContract.deployed();
		assert(doneeFactory, "was not deployed");
	});
});

contract("DoneeFactory: create donee", (accounts) => {
	let doneeFactory;
	
	const name = "test";
	const description = "test";
	const image = "test";
	const address = accounts[1];
	
	it("increment donee count", async () => {
		doneeFactory = await DoneeFactoryContract.deployed();
		const cnt = await doneeFactory.doneesCnt();
		await doneeFactory.createDonee(name, description, image, address);
		const new_cnt = await doneeFactory.doneesCnt();
		assert.equal(new_cnt - cnt, 1, "should be incremented by 1");
	});
	it("emits created event", async () => {
		doneeFactory = await DoneeFactoryContract.deployed();
		const tx = await doneeFactory.createDonee(name, description, image, address);
		
		const expected = "DoneeCreated";
		const actual = tx.logs[0].event;
		assert.equal(actual, expected, "events should match");
	});
});