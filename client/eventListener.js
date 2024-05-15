const {Web3} = require('web3');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'));
const doneeFactoryAddress = '0x0afF9ed7941A6BAD7F878Cbf34A49182f1A85A2f';
const doneeFactoryABI = require('./src/contracts/DoneeFactory.json').abi;
const doneeFactoryContract = new web3.eth.Contract(doneeFactoryABI, doneeFactoryAddress);


function listenForEvents() {
    doneeFactoryContract.events.DoneeCreated({}, (error, event) => {
        if (error) {
            console.error('Error listening to DoneeCreated events:', error);
            return;
        }
        console.log('DoneeCreated event:', event.returnValues);
        storeEvent(event);
    });

    doneeFactoryContract.events.allEvents({}, (error, event) => {
        if (error) {
            console.error('Error listening to events:', error);
            return;
        }
        console.log('Event:', event.event, event.returnValues);
        storeEvent(event);
    });
}


function storeEvent(event) {
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
    listenForEvents();
});
