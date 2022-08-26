import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Loader from './utils/Loader';
import abi from './utils/WavePortal.json';
// import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import { Buffer } from 'buffer';
// @ts-ignore
window.Buffer = Buffer;
import { create } from 'ipfs-http-client';

const projectId = "";   //  projectId provided by IPFS
const projectSecret = "";   // projectSecret key provided by IPFS

const auth = 'Basic ' + Buffer.from(projectId + ":" + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

export default function App() {
  // const wave = () => { };

  // Just a state variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState('');
  const [walletCheck, setWalletCheck] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask! wallet');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      // Check if we are authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        // console.log('Found an authorized account', account);
        const address = document.getElementById('AccountAddress');
        address.innerText = `Account address:- ${account}`;
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get Metamask');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
      // console.log('Connected', accounts[0]);
      setWalletCheck(true);
      const address = document.getElementById('AccountAddress');
      address.innerText = `Account address:- ${accounts[0]}`;
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        // ethers is a library that helps our frontend talk to our contract. Be sure to import it at the top using import { ethers } from "ethers"; . A "Provider" is what we use to actually talk to Ethereum nodes. Remember how we were using QuickNode to deploy? Well in this case we use nodes that Metamask provides in the background to send/receive data from our deployed contract.

        const provider = new ethers.providers.Web3Provider(ethereum);
        // console.log('Provider:- ', provider);
        const signer = provider.getSigner();
        // console.log('Signer ', signer);
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        // console.log('WavePortalContract', wavePortalContract);

        let count = await wavePortalContract.getTotalWaves();
        // console.log('Retrieved total wave count...', count.toNumber());

        console.log("IPFS file ", file);

        try {
          const created = await client.add(file);
          const url = `https://ipfs.infura.io/ipfs/${created.path}`;
          console.log("Created Path: ", created.path);
          const path = created.path;
          console.log(path);
          setIpfsHash(path);
          // setUrlArr(prev => [...prev, url]);
          console.log("ipfsHash:-", ipfsHash);
          console.log("IPFS URL:- ", url);
          const waveTxn = await wavePortalContract.wave(
            title,
            created.path,
            { gasLimit: 300000 }
          );
          console.log('Minning:- ', waveTxn.hash);

          setIsLoading(true);

          await waveTxn.wait();
          console.log('Mined:- ', waveTxn.hash);

          count = await wavePortalContract.getTotalWaves();
          console.log('Retrieved total wave count....', count.toNumber());

          setIsLoading(false);
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("Ethereum Object Doesn't exists");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const contractAddress = '0x3e29B06aD92b3538754572596e23b4726c3FcfE6';

  const contractABI = abi.abi;

  const [allWaves, setAllWaves] = useState([]);

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];

        waves.forEach(wave => {
          wavesCleaned.unshift({
            address: wave.waver,
            memeHash: wave.hash,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        console.log(wavesCleaned);

        // console.log(title);

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exists!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const retrieveFile = async (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      // console.log("Buffer data: ", Buffer(reader.result));
      setFile(Buffer(reader.result));
    };
    e.preventDefault();
  };

  const [file, setFile] = useState('');
  const [title, setTitle] = useState('');
  const [hash, setHash] = useState('');
  const [ipfsHash, setIpfsHash] = useState('fjd');

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        }, ...prevState
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <h3 className="txt" id="AccountAddress">
          Account address:- Not connected
				</h3>
        <div className="header">
          👋 Hey Let's share your favorite memes!
				</div>

        <div className="bio">
          I build this app so that everyone can enjoy world's best memes.
					If you have something Do share it 😉.
				</div>

        <input
          type="file"
          accept=".jpeg .mp4, .mkv, .ogg, .wmv, .png , .jpg, .pdf , .gif"
          style={{ width: "250px" }}
          onChange={retrieveFile}
          className="bg-dark text-white file"
        />

        <input
          id="videoTitle"
          type="text"
          placeholder="Enter your message..."
          required
          onChange={e => {
            setTitle(e.target.value);
          }}
        />
        <button
          className="btn-grad"
          onClick={() => {
            wave(contractAddress, contractABI);
          }}
        >
          Share 🚀
				</button>

        {!currentAccount && (
          <button className="btn-grad2" onClick={connectWallet}>
            Connect Wallet ✨
					</button>
        )}

        {isLoading ? <Loader /> : ''}

        <h1>
          <span>Memes</span> <div className="tooltip">⚠
  <span className="tooltiptext">Can't see memes? Connect Wallet / ⟳</span>
          </div>
        </h1>

        {allWaves.map((wave, index) => {
          return (
            <div
              className="card"
              key={index}
              style={{ backgroundColor: '', marginTop: '16px', padding: '8px' }}
            >
              <div className="paddi">
                <div className="address">Address: {wave.address}</div>

                <div className="image">
                  <img
                    src={`https://memesharingdapp.infura-ipfs.io/ipfs/${wave.memeHash}`}
                    alt="Please refresh to see image."
                    width="100%"
                    height="400px"
                  />
                </div>

                <div className="message">Message: {wave.message}</div>


                <div className="time">Meme Link: <a href={`https://memesharingdapp.infura-ipfs.io/ipfs/${wave.memeHash}`}><span>{wave.memeHash}</span></a></div>
                <div className="time">Time: {wave.timestamp.toString()}</div>


              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
