// getWeb3.js
import Web3 from 'web3';

const getWeb3 = () => 
    new Promise((resolve, reject) => {
        window.addEventListener('load', async () => {
            // Modern dApp browsers...
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                try {
                    // Request account access if needed
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    resolve({ web3 });
                } catch (error) {
                    reject("User denied account access.");
                }
            } 
            // Legacy dApp browsers...
            else if (window.web3) {
                // Use Mist/MetaMask's provider.
                const web3 = new Web3(window.web3.currentProvider);
                console.log('Injected web3 detected.');
                resolve({ web3 });
            } 
            // For non-dApp browsers...
            else {
                console.log('No web3 instance injected, using Local web3.');
                const provider = new Web3.providers.HttpProvider("http://127.0.0.1:9545");
                const web3 = new Web3(provider);
                resolve({ web3 });
            }
        });
    });

export default getWeb3;
