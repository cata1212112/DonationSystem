import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import getWeb3 from "../utils/getWeb3";
import FactoryContract from "../contracts/DoneeFactory.json";

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    width: '100%', // Ensures the container takes full width
  },
  textField: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  button: {
    width: '100%',
    padding: theme.spacing(1),
  },
}));

const NewFundraiser = () => {
  const classes = useStyles();
  const [web3, setWeb3] = useState(null); // Adding state for web3
  const [name, setFundraiserName] = useState("");
  const [description, setFundraiserDescription] = useState("");
  const [image, setImage] = useState("");
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);

 useEffect(() => {
    const init = async () => {
        try {
            console.log("Initializing web3...");
            const web3Results = await getWeb3();
            const web3 = web3Results.web3;
            console.log("Web3 initialized.");

            console.log("Fetching accounts...");
            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                console.log("No accounts found. Ensure MetaMask is unlocked.");
                return;
            } else {
                console.log("Accounts found:", accounts);
            }

            console.log("Getting network ID...");
            const networkId = await web3.eth.net.getId();
            console.log("Network ID:", networkId);

            console.log("Accessing contract...");
            const deployedNetwork = FactoryContract.networks[networkId];
            if (!deployedNetwork) {
                console.log(`No contract found for network ID: ${networkId}`);
                alert('Failed to deploy contract on the current network.');
                return;
            }

            const instance = new web3.eth.Contract(
                FactoryContract.abi,
                deployedNetwork.address,
            );
            console.log("Contract instance created:", instance);

            setWeb3(web3);
            setAccounts(accounts);
            setContract(instance);
        } catch (error) {
            alert("Failed to load web3, accounts, or contract. Check console for details.");
            console.error("Initialization error:", error);
        }
    };
    init();
}, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!contract || accounts.length === 0) {
      alert('Contract not loaded or no accounts available.');
      return;
    }

    try {
      await contract.methods.createFundraiser(
        name,
        image,
        description,
        address,
      ).send({ from: accounts[0] });
      console.log("Submitted:", { name, description, image, address });
      alert('Fundraiser created successfully!');
    } catch (error) {
      console.error("Error submitting:", error);
      alert('Error submitting the fundraiser. See console for more details.');
    }
  };

  return (
    <form className={classes.container} onSubmit={handleSubmit}>
      <TextField label="Name" placeholder="Fundraiser Name" value={name} onChange={(e) => setFundraiserName(e.target.value)} variant="outlined" className={classes.textField} />
      <TextField label="Description" placeholder="Fundraiser Description" value={description} onChange={(e) => setFundraiserDescription(e.target.value)} variant="outlined" className={classes.textField} />
      <TextField label="Image URL" placeholder="Fundraiser Image URL" value={image} onChange={(e) => setImage(e.target.value)} variant="outlined" className={classes.textField} />
      <TextField label="Ethereum Address" placeholder="Fundraiser Ethereum Address" value={address} onChange={(e) => setAddress(e.target.value)} variant="outlined" className={classes.textField} />
      <Button type="submit" variant="contained" color="primary" className={classes.button}>
        Submit
      </Button>
    </form>
  );
};

export default NewFundraiser;
