async function initWeb3() {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return web3;
        } catch (error) {
            console.error("User denied account access", error);
        }
    }
    else {
        console.error('Non-Ethereum browser detected. Consider trying MetaMask!');
    }
}