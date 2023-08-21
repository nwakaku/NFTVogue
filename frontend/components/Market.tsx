import { ConnectionContext } from "@/pages/_app";
import { useContext, useEffect, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";

import NFTMarketItem from "./NFTMarketItem";
import { BigNumber } from "ethers";
import BounceLoader from "react-spinners/BounceLoader";

import { writeContract } from "@wagmi/core";
import NFTVogueArtifact from "../contracts/NFTVogue.json";
import { useAccount } from "wagmi";
import { getContract } from "viem";
import contractAddresses from "../contracts/contract-address.json";
import { createWalletClient, createPublicClient, http } from "viem";
import { lineaTestnet, polygonMumbai } from "viem/chains";
import { Key } from "swr";
import { getNetwork } from "@wagmi/core";

const { chain, chains } = getNetwork();
console.log(chain);

export default function Market() {
  // const { connected, address, contract } = useContext(ConnectionContext);
  const { address, isConnected, isDisconnected } = useAccount();

  const publicClient = createPublicClient({
    chain: chain?.id === 59140 ? lineaTestnet : polygonMumbai,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: chain?.id === 59140 ? lineaTestnet : polygonMumbai,
    transport: http(),
    account: address,
  });

  const contract = getContract({
    address:
      chain?.id === 59140
        ? "0x0853212Dab358161dd4a9c497D75555Ec5DE3129"
        : "0xCd210F50C3b17eA5bBA945c2e936a8A7eB17D9A5",
    abi: NFTVogueArtifact.abi,
    publicClient,
    walletClient,
  });

  const [refresh, setRefresh] = useState(1);

  const marketFetcher = async () => {
    if (!contract) {
      throw new Error("Not connected");
    }
    setMarketLoading(true);
    try {
      const data = (await contract.read.getNFTsListedForSale()) as BigNumber[];
      console.log(data);
      setMarketData(data);
    } catch (e) {
      setMarketError(e);
      console.log(e);
    }
    setMarketLoading(false);
  };

  useEffect(() => {

    if (isConnected && contract) {
      marketFetcher();
    }
  }, [address, refresh, chain]);



  const [marketData, setMarketData] = useState<BigNumber[]>([]);
  const [marketError, setMarketError] = useState<any>(null);
  const [marketLoading, setMarketLoading] = useState(false);

  if (marketLoading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center mb-10">
        <BounceLoader color="#60a5fa" />
        <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (marketError) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center mb-10">
        <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
          <p className="text-center">
            Error occurred while fetching... Please refresh!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl flex flex-col gap-4 justify-center items-center h-screen mb-10">
      <div className="mb-4 text-xl flex space-x-3">
        <p className="font-semibold">NFTs listed in the Market</p>
        <button
          onClick={() => setRefresh(refresh + 1)}
          className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none"
        >
          <RiRefreshLine className="text-white" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mx-5">
        {marketData.map((nft) => (
          // console.log(nft)
          <NFTMarketItem key={1} tokenID={nft} />
        ))}
      </div>
    </div>
  );
}
