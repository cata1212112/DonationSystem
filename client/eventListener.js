const Web3 = require('web3');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

const web3 = new Web3.Web3('ws://127.0.0.1:9545');
const response = fs.readFileSync('src/contracts/DoneeFactory.json', { cache: 'no-store' });
const jsonData = JSON.parse(response)
const doneeFactoryAddress = jsonData["networks"][Object.keys(jsonData["networks"])[0]]["address"];
const doneeFactoryABI = jsonData["abi"];
const doneeFactoryContract = new web3.eth.Contract(doneeFactoryABI, doneeFactoryAddress);

const logsFilter = {
    address: doneeFactoryAddress,
    topics: [
        Object.keys(doneeFactoryContract.events)[2],
    ],
};
listenForEvents = async () =>{
    const subscription = await web3.eth.subscribe("logs", logsFilter)
    subscription.on("data", async (log) => {

        const decodedParameters = web3.eth.abi.decodeParameters(['uint256', 'uint256'], log.data);
        const eventLog = {
            type: 'Donee Created',
            by: '0x' + decodedParameters['1'].toString(16),
            donneeContractAddress: '0x' + decodedParameters['0'].toString(16)
        };


        const doneeJsonfACTORY = fs.readFileSync('src/contracts/Donee.json', { cache: 'no-store' });
        const jsonData = JSON.parse(doneeJsonfACTORY)

        const doneeABI = jsonData["abi"];

        const doneeContract = new web3.eth.Contract(doneeABI, '0x' + decodedParameters['0'].toString(16));
        console.log()
        console.log(doneeContract.events);

        keys = Object.keys(doneeContract.events)

        const newLogFilterWithdraw = {
            address: '0x' + decodedParameters['0'].toString(16),
            topics: [
                keys[5],
            ]
        }
        const newSubscription = await web3.eth.subscribe("logs", newLogFilterWithdraw)
        newSubscription.on("data", async (log) => {
            const decodedParameters = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint256'], log.data);
            const eventLog = {
                type: 'Withdraw',
                ammount: decodedParameters['0'].toString(),
                from: '0x' + decodedParameters['1'].toString(16),
                to: '0x' + decodedParameters['2'].toString(16)
            };
            fs.appendFileSync('events.log', JSON.stringify(eventLog) + '\n', 'utf8');

        })

        const newLogFilterDonation = {
            address: '0x' + decodedParameters['0'].toString(16),
            topics: [
                keys[8],
            ]
        }
        const newSubscriptionDonation = await web3.eth.subscribe("logs", newLogFilterDonation)

        newSubscriptionDonation.on("data", async (log) => {
            const decodedParameters = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint256'], log.data);
            const eventLog = {
                type: 'Donation',
                ammount: decodedParameters['1'].toString(),
                from: '0x' + decodedParameters['0'].toString(16),
                to: '0x' + decodedParameters['2'].toString(16)
            };
            fs.appendFileSync('events.log', JSON.stringify(eventLog) + '\n', 'utf8');

        })

        fs.appendFileSync('events.log', JSON.stringify(eventLog) + '\n', 'utf8');
    });
}



app.listen(port, () => {
    listenForEvents();
});