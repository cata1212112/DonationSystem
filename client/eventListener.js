const {Web3} = require('web3');  // Ensure Web3 is correctly imported
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

// Initialize Web3 with an HTTP provider
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'));

// Check if Web3 is connected
web3.eth.net.isListening()
    .then(() => console.log('Web3 is connected'))
    .catch(e => console.error('Something went wrong', e));

// Read the ABI and contract address from the local JSON file
const jsonData = JSON.parse(fs.readFileSync('./src/contracts/DoneeFactory.json', 'utf8'));
const networkId = Object.keys(jsonData.networks)[0];
const doneeFactoryAddress = jsonData.networks[networkId].address;
const doneeFactoryABI = jsonData.abi;
console.log(doneeFactoryAddress)

// Create the contract instance
const doneeFactoryContract = new web3.eth.Contract(doneeFactoryABI, doneeFactoryAddress);

// console.log(doneeFactoryContract.events);

doneeFactoryContract.events.DoneeCreated(function(error, event){ console.log(event);
storeEvent(event)
})

function storeEvent(event) {
    console.log("intrat event")
    const eventLog = {
        event: event.event,
        returnValues: event.returnValues,
        timestamp: new Date().toISOString()
    };
    fs.appendFileSync('events.log', JSON.stringify(eventLog) + '\n', 'utf8');
}

app.get('/events', (req, res) => {
    fs.readFile('events.log', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading events log');
            return;
        }
        const events = data.split('\n').filter(line => line).map(line => JSON.parse(line));
        res.json(events);
    });
});

app.listen(port, () => {
    console.log(`Event listener server running at http://localhost:${port}`);
});