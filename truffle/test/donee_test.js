const DoneeContract = artifacts.require("Donee");

contract("Donee", (accounts) => {
    let donee;
    const name = "Donee name";
    const description = "Donee description";
    const image = "Donee image";
    const donee_address = accounts[1];

    describe("init", () => {
        beforeEach(async () => {
            donee = await DoneeContract.new(name, description, image, donee_address, accounts[0]);
        });

        it("get donee name", async () => {
            const actual = await donee.name();
            assert.equal(actual, name, "names should match!");
        });
        
        it("get donee description", async () => {
            const actual = await donee.description();
            assert.equal(actual, description, "descriptions should match!");
        });
        
        it("get donee image", async () => {
            const actual = await donee.image();
            assert.equal(actual, image, "images should match!");
        });
        
        it("get donee address", async () => {
            const actual = await donee.donee_address();
            assert.equal(actual, donee_address, "addresses should match!");
        });
    });
    
    describe("setWithdrawalAddress", () => {
		const newAddress = accounts[2];
		it("update when called by owner", async () => {
			await donee.setWithdrawalAddress(newAddress, {from:accounts[0]});
			const withdrawaladdress = await donee.donee_address();
			assert.equal(withdrawaladdress, newAddress, "they should match");
		});	
		it("throws an error when non-owner tries to set withdrawal address", async () => {
	        try {
	            await donee.setWithdrawalAddress(newAddress, { from: accounts[3] });
	            assert.fail("The transaction should have reverted.");
	        } catch (err) {
	            
	        }
    	});
	});
    
    describe("make donations", () => {
		const value = web3.utils.toWei('0.03');
		const donor = accounts[2];
		it("increases donations count", async () => {
			const cnt = await donee.donationCount({from: donor});
			
			await donee.donate({from:donor, value});
			const new_cnt = await donee.donationCount({from: donor});
			
			assert.equal(1, new_cnt - cnt, "Donation count should have increased by one");
		});
		it("includes the donation in my history", async () => {
			await donee.donate({from:donor, value});
			const {values, dates} = await donee.myHistory({from:donor});
			assert.equal(value, values[0], "values should match");
			assert(dates[0], "date");
		});
		it("increase totalRaised amout", async () => {
			const raised = await donee.raised();
			await donee.donate({from:donor, value});
			const new_raised = await donee.raised();
			assert.equal(new_raised - raised, value, "should be equal");
			
		});
		it("increase donation count", async () => {
			const cnt = await donee.totalDonationCount();
			await donee.donate({from:donor, value});
			const new_cnt = await donee.totalDonationCount();
			assert.equal(new_cnt - cnt, 1, "should be equal");
		});
		it("emit events", async () => {
			const tx = await donee.donate({from:donor, value});
			const expected = "donationReceived";
			const actual = tx.logs[0].event;
			assert.equal(actual, expected, "events should match");
		});
	});
});
