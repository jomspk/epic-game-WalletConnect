import React, { useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from "./Components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import { ethers } from "ethers";
import myEpicGame from "./utils/MyEpicGame.json";
import Arena from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator";
import WalletConnectProvider from '@walletconnect/web3-provider';

// Constants
const TWITTER_HANDLE = 'Bazar1305';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
let provider = null;
let connectProvider = null;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  //const [web3Provider, setWeb3Provider] = useState(null);

  const checkNetwork = async () => {
    try {
      const { chainId } = provider;
      console.log(chainId);
      if (chainId != "4") {
        alert("Rinkeby Test Network に接続してください!");
        await provider.disconnect();
        window.location.reload();
      } else {
        console.log("Rinkeby に接続されています。");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator/>;
    }
    if (!currentAccount) {
      return (
        <div className='connect-wallet-container'>
          <img src='https://i.imgur.com/TXBQ4cC.png' alt="LUFFY"/>
          <button className='cta-button connect-wallet-button' onClick={connectWalletAction}>Connect Wallet to Get Started</button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT}/>
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    }
  }

  const connectWalletAction = async () => {
    setIsLoading(true);
    try {
      provider = new WalletConnectProvider({
        rpc: {
          4: "https://rinkeby.infura.io/v3/kbFs7RUqezB7Ywq2jVEAgY_Z-2942DFX",
        },
        chainId: 4,
        qrcodeModalOptions: {
          mobileLinks: [
            "rainbow",
            "metamask",
            "argent",
            "trust",
            "imtoken",
            "pillar",
          ],
        },
      });
      console.log(provider);
      await provider.enable();
      provider.updateRpcUrl(4);
      connectProvider = new ethers.providers.Web3Provider(provider);
      //setWeb3Provider(new ethers.providers.Web3Provider(provider));
      let { accounts } = provider;
      await checkNetwork();
      setCurrentAccount(accounts[0]);
      console.log("Checking for Character NFT on address:", currentAccount);
      const signer = connectProvider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("Install metamask or use WalletConnect");
      console.log(error);
      setIsLoading(false);
    }

    await subscribeToEvents();
  };

  const subscribeToEvents = async () => {
    if (!provider) {
      return;
    }

    provider.on("accountsChanged", async (accounts) => {
      console.log("User changed account");
      console.log(accounts);
    });

    provider.on("chainChainged", async (chainId) => {
      console.log("User changed chainId!!");
      console.log(chainId);
    });

    provider.on("disconnect", async (code, reason) => {
      console.log("User disconnect!!!");
      console.log(code, reason);
    });
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚡️ METAVERSE GAME ⚡️</p>
          <p className="sub-text">プレイヤーと協力してボスを倒そう✨</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
