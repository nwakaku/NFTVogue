import { ConnectionContext } from "@/pages/_app";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Web3Storage } from "web3.storage";
import { writeContract } from "@wagmi/core";
import NFTVogueArtifact from "../contracts/NFTVogue.json";
import { useAccount } from "wagmi";
import { getContract } from "viem";
import contractAddresses from "../contracts/contract-address.json";
import { createWalletClient, createPublicClient, http } from "viem";
import { lineaTestnet, polygonMumbai } from "viem/chains";
import { getNetwork } from "@wagmi/core";

const { chain, chains } = getNetwork();

interface Props {
  tokenID: BigNumber;
}
type ListedDetail = [boolean, BigNumber, string] & {
  isListed: boolean;
  price: BigNumber;
  lastOwner: string;
};

function getAccessToken() {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDkyQmMzYmEyNEMwNzIyZUZkODg5NmIzOGQxYzI5ZWE0RUFiMjdiMjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODY0NjQzNjk1NjIsIm5hbWUiOiJmb3IgbmZ0YWkifQ.dyN1087A0XVpl12LBrjON3fxQLgQrRcAXpAW25YZ0IU";
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

export default function NFTListed({ tokenID }: Props) {
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

  // const { connected, address, contract } = useContext(ConnectionContext);
  const [purchaseProgress, setPurchaseProgress] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const [tokenMetaData, setTokenMetaData] = useState<any>(null);
  const [tokenOwnerAddress, settokenOwnerAddress] = useState<string | null>(
    null
  );
  const [tokenListedData, settokenListedData] = useState<ListedDetail | null>(
    null
  );
  const [tokenListedDataError, settokenListedDataError] = useState<any>(null);
  const [tokenListedDataLoading, settokenListedDataLoading] = useState(false);

  async function retrieve(url: string): Promise<void> {
    const client = makeStorageClient();
    try {
      const res = await client.get(url);

      if (res) {
        const files = await res.files();
        for (const file of files) {
          console.log(`${file.cid} -- ${file.size}`);
          setTokenMetaData(`https://dweb.link/ipfs/${file.cid}`);
        }
      } else {
        throw new Error(`Failed to get ${url}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const sameOwner = useMemo(
    () =>
      tokenOwnerAddress &&
      address &&
      tokenOwnerAddress.toLowerCase() === address.toLowerCase(),
    [tokenOwnerAddress, address]
  );
  useEffect(() => {
    const tokenDetailsFetcher = async () => {
      if (!isConnected || !address) {
        return;
      }

      settokenListedDataLoading(true);
      // const { hash } = await writeContract({
      //   address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
      //   abi: wagmigotchiABI,
      //   functionName: 'feed',
      //   args: [],
      // })
      const uri = await contract.read.tokenURI([tokenID]);
      console.log(uri);

      try {
        retrieve(uri as string);

        const info = (await contract.read.nftDetails([
          tokenID,
        ])) as ListedDetail;
        settokenListedData(info);

        settokenOwnerAddress(info[2]);
      } catch (error) {
        settokenListedDataError(error);
      } finally {
        settokenListedDataLoading(false);
      }
    };

    if (address) {
      tokenDetailsFetcher();
    }
  }, [address, tokenID, purchaseProgress]);

  if (!isConnected || !address || !contract) {
    return <></>;
  }

  if (tokenListedDataLoading || !tokenListedData || !tokenMetaData) {
    return (
      <div className="relative mb-4 w-full h-64 md:h-80 bg-[#100a25] rounded-lg ">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (tokenListedDataError) {
    return (
      <div className="relative mb-4 w-full h-64 md:h-80 bg-[#100a25] rounded-lg ">
        <p className="text-lg">An error occurred.</p>
      </div>
    );
  }

  const onBuy = () => {
    if (!isConnected || !address || !contract || !tokenListedData) {
      return;
    }

    setPurchaseProgress(true);
    const task = writeContract({
      address:
        chain?.id === 59140
          ? "0x0853212Dab358161dd4a9c497D75555Ec5DE3129"
          : "0xCd210F50C3b17eA5bBA945c2e936a8A7eB17D9A5",
      abi: NFTVogueArtifact.abi,
      functionName: "purchase",
      args: [tokenID, tokenListedData.price],
    });
    // const task = contract.purchase(tokenID, {
    //   value: tokenListedData.price,
    //   gasLimit: 5000000,
    // });
    toast
      .promise(task, {
        pending: "Purchasing NFT...",
        success: "NFT purchased successfully!",
        error: "Transaction failed",
      })
      .then(() => {
        setPurchased(true);
      })
      .catch((err) => {
        console.log("NFT purchase error");
        console.log(err);
      })
      .finally(() => {
        setPurchaseProgress(false);
      });
  };

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <a href="#">
        <img
          className="p-8 rounded-t-lg"
          src={tokenMetaData}
          alt="product image"
        />
      </a>
      <div className="px-5 pb-5">
        <a href="#">
          <h5 className="text-md font-semibold tracking-tight text-gray-900 dark:text-white">
            UMN #{tokenID.toString()}
          </h5>
        </a>

        <div className="my-2">
          {purchased && (
            <>
              <div className="text-white py-1">Purchase successful.</div>
              <div className="text-white py-1 bg-slate-600 rounded text-center my-1">
                You own this NFT
              </div>{" "}
            </>
          )}

          {tokenListedData && tokenListedData[0] && !purchased && (
            <div className="text-white py-1">
              Listed for {ethers.utils.formatEther(tokenListedData[1])}{" "}
              Linea_Testnet
            </div>
          )}

          {tokenOwnerAddress && sameOwner && !purchased && (
            <div className="text-white py-1 bg-slate-600 rounded text-center my-1">
              You own this NFT
            </div>
          )}
          {tokenListedData &&
            tokenListedData.isListed &&
            tokenOwnerAddress &&
            !sameOwner &&
            !purchased && (
              <button
                onClick={onBuy}
                disabled={purchaseProgress}
                className="text-white py-1 bg-blue-600 rounded text-center my-1 w-full"
              >
                {purchaseProgress ? "Loading..." : "Buy"}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
