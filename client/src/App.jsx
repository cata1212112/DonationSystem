import React, { useState, useEffect } from "react";
import getWeb3 from "./utils/getWeb3";
import "./App.css";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from './components/Home';
import NewDonee from './components/NewDonee';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    nav: {
        backgroundColor: theme.palette.background.paper,
        padding: '10px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    navList: {
        listStyle: 'none',
        display: 'flex',
        margin: 0,
        padding: 0,
        justifyContent: 'left',
    },
    navItem: {
        margin: '0 10px',
    },
    navLink: {
        color: 'black',
        textDecoration: 'none',
        '&.active': {
            color: 'blue',
        },
    }
}));

function App() {
	console.log("App component mounted");
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const classes = useStyles();

    useEffect(() => {
        const initWeb3 = async () => {
            try {
		console.log("Loading web3");
                const result = await getWeb3();
                setWeb3(result.web3);
		console.log("web3 initialized");
                const accounts = await result.web3.eth.getAccounts();
                setAccounts(accounts);
                setLoading(false);
            } catch (error) {
                alert("Failed to load web3, accounts, or contract. Make sure MetaMask is enabled.");
                console.error("Connection Error:", error);
                setLoading(false);
            }
        };
        initWeb3();

        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    console.log('Please connect to MetaMask.');
                } else {
                    setAccounts(accounts);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            const handleChainChanged = () => {
                window.location.reload();
            };

            window.ethereum.on('chainChanged', handleChainChanged);

            // Cleanup function to remove event listeners
            return () => {
                if (window.ethereum) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                }
            };
        }
    }, []);

    if (loading) {
        return <div>Loading Web3, accounts, and contract...</div>;
    }

    if (!web3) {
        return <div>Please install MetaMask!</div>;
    }

    if (!accounts || accounts.length === 0) {
        return <div>No accounts found. Please ensure MetaMask is unlocked and connected.</div>;
    }

    return (
        <div className={classes.root}>
            <nav className={classes.nav}>
                <ul className={classes.navList}>
                    <li className={classes.navItem}>
                        <NavLink to="/" className={classes.navLink}>Home</NavLink>
                    </li>
                    <li className={classes.navItem}>
                        <NavLink to="/new" className={classes.navLink}>New Donee</NavLink>
                    </li>
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/new" element={<NewDonee />} />
            </Routes>
            <div>Connected Account: {accounts[0]}</div>
        </div>
    );
}

export default App;
