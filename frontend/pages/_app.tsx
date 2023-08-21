import Layout from "@/components/Layout";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { createContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import NFTVogueArtifact from "../contracts/NFTVogue.json";
import contractAddresses from "../contracts/contract-address.json";
import { ethers } from "ethers";
import { Nifta } from "@/contracts/typechain-types";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai, lineaTestnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

// checkout this
const { chains, publicClient } = configureChains(
  [polygonMumbai, lineaTestnet],
  [
    jsonRpcProvider({
      rpc: () => ({ http: "https://polygon-mumbai.infura.io/v3/45ffec7b43da456f9b80b94e7d4257d5" }),
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "aiBuidl",
  projectId: "b5f0ef4632f1502fb2c4f1a85225fa31",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// and this

declare global {
  interface Window {
    ethereum: any;
  }
}

export type ConnectionContextType = {
  connected: boolean;
  setConnected: (connected: boolean) => void;

  address: string;
  setAddress: (address: string) => void;

  contract?: Nifta;
};

export const ConnectionContext = createContext<ConnectionContextType>(
  {} as ConnectionContextType
);

const contract = () => {
  const { ethereum } = window;
  const contractAddress = contractAddresses.NFTVogue;
  const contractABI = NFTVogueArtifact.abi;
  const contract = new ethereum.Contract(contractABI, contractAddress);
  return contract;
};

export default function App({ Component, pageProps }: AppProps) {
  const [connected, setConnected] = useState(false);
  const [address, setAddressValue] = useState("");
  const [contract, setContract] = useState<undefined | Nifta>(undefined);

  const setAddress = (address: string) => {
    setAddressValue(address);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const contract = new ethers.Contract(
      contractAddresses.NFTVogue,
      NFTVogueArtifact.abi,
      signer
    ) as Nifta;
    setContract(contract);
  };

  // useEffect(() => {
  //   // Check if MetaMask is installed
  //   // MetaMask injects the global API into window.ethereum
  //   if (window.ethereum) {
  //     window.ethereum
  //       .request({
  //         method: "wallet_switchEthereumChain",
  //         params: [{ chainId: "e704" }], // chainId must be in hexadecimal numbers
  //       })
  //       .catch((error: any) => {
  //         if (error.code === 4902) {
  //           window.ethereum
  //             .request({
  //               method: "wallet_addEthereumChain",
  //               params: [
  //                 {
  //                   chainId: "e704",
  //                   rpcUrl:
  //                     "https://linea-goerli.infura.io/v3/45ffec7b43da456f9b80b94e7d4257d5",
  //                 },
  //               ],
  //             })
  //             .catch((addError: any) => {
  //               console.error(addError);
  //             });
  //         } else {
  //           console.error(error);
  //         }
  //       });

  //     window.ethereum.on("accountsChanged", (accounts: string[]) => {
  //       if (accounts.length === 0) {
  //         setConnected(false);
  //       } else {
  //         setConnected(true);
  //         setAddress(accounts[0]);
  //       }
  //     });
  //   } else {
  //     // if no window.ethereum then MetaMask is not installed
  //     alert(
  //       "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
  //     );
  //   }
  // }, []);

  // here react context is defined and used
  const connectionContextData: ConnectionContextType = {
    connected,
    setConnected,
    address,
    setAddress,
    contract,
  };

  return (
    <>
      <Head>
        <title>NFTVogue</title>
        <meta
          name="AI generated NFTs Marketplace"
          content="AI generated NFTs on the XDC blockchain"
        />
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <ToastContainer />

      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
        {/* <ConnectionContext.Provider value={connectionContextData}> */}
          <Layout>
            <Component {...pageProps} />
          </Layout>
        {/* </ConnectionContext.Provider> */}
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}
