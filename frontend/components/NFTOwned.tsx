import { ConnectionContext } from "@/pages/_app";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { FiCornerDownRight } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Web3Storage } from "web3.storage";
import { getContract } from "viem";
import NFTVogueArtifact from "../contracts/NFTVogue.json";
import contractAddresses from "../contracts/contract-address.json";
import { createWalletClient, createPublicClient, http } from "viem";
import { lineaTestnet, polygonMumbai } from "viem/chains";
import { useAccount } from "wagmi";
import { writeContract } from "@wagmi/core";
import { getNetwork } from "@wagmi/core";

const { chain, chains } = getNetwork();

require("dotenv").config();

interface Props {
  tokenID: BigNumber;
}

type PromptForm = {
  price: number;
};

function getAccessToken() {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDkyQmMzYmEyNEMwNzIyZUZkODg5NmIzOGQxYzI5ZWE0RUFiMjdiMjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODY0NjQzNjk1NjIsIm5hbWUiOiJmb3IgbmZ0YWkifQ.dyN1087A0XVpl12LBrjON3fxQLgQrRcAXpAW25YZ0IU";
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

export default function NFTOwned({ tokenID }: Props) {
  // const { connected, address, contract } = useContext(ConnectionContext);
  const { address, isConnected, isDisconnected } = useAccount();

  const publicClient = createPublicClient({
    chain: lineaTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: lineaTestnet,
    transport: http(),
    account: address,
  });

  const contract = getContract({
    address: "0x0853212Dab358161dd4a9c497D75555Ec5DE3129",
    abi: NFTVogueArtifact.abi,
    publicClient,
    walletClient,
  });

  const [listProgress, setListProgress] = useState(false);
  const [listed, setListed] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PromptForm>();

  const [tokenMetaData, setTokenMetaData] = useState<any>(null);
  const [tokenInfoLoading, setTokenInfoLoading] = useState(false);
  const [tokenInfoError, setTokenInfoError] = useState<any>(null);

  async function retrieve(url: string): Promise<void> {
    const client = makeStorageClient();
    try {
      const res = await client.get(url);

      if (res) {
        const files = await res.files();
        for (const file of files) {
          console.log(`${file.cid} -- ${file.size}`);
          console.log(`https://dweb.link/ipfs/${file.cid}`);
          setTokenMetaData(`https://dweb.link/ipfs/${file.cid}`);
        }
      } else {
        throw new Error(`Failed to get ${url}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!isConnected || !address || !contract) {
      return;
    }
    const tokenDetailsFetcher = async () => {
      setTokenInfoLoading(true);
      try {
        const uri = await contract.read.tokenURI([tokenID]);
        console.log(uri);
        retrieve(uri as string);
      } catch (error) {
        console.log(error);
        setTokenInfoError(error);
      }

      setTokenInfoLoading(false);
    };

    tokenDetailsFetcher();
  }, [address, tokenID, listProgress]);

  if (!isConnected || !address || !contract) {
    return <></>;
  }

  if (tokenInfoLoading || tokenMetaData === null) {
    return (
      <div className="relative mb-4 w-full h-64 md:h-80 bg-[#100a25] rounded-lg ">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const onListItem = async (data: PromptForm) => {
    if (!isConnected || !address || !contract) {
      return;
    }
    if (data.price <= 0) {
      toast.error("Price must be greater than 0 $Linea");
      return;
    }

    setListProgress(true);
    setPrice(data.price);
    const task = writeContract({
      address: "0x0853212Dab358161dd4a9c497D75555Ec5DE3129",
      abi: NFTVogueArtifact.abi,
      functionName: "listNFT",
      args: [tokenID, ethers.utils.parseUnits(data.price.toString(), "ether")],
    });

    toast
      .promise(task, {
        pending: "Listing NFT...",
        success: "NFT listed successfully!",
        error: "Error listing NFT",
      })
      .then(() => {
        setListed(true);
      });

    setListProgress(false);
  };
  {
    console.log(tokenMetaData);
  }

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
          {listed ? (
            <div className="text-white">Listed for {price} Linea</div>
          ) : (
            <form onSubmit={handleSubmit(onListItem)}>
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                List
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-xs">
                  <FiCornerDownRight />
                </div>
                <input
                  type="number"
                  id="default-search"
                  className="block p-4 pl-10 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Price in Linea"
                  // disabled={generateStatus === "progress"}
                  {...register("price", { required: true })}
                />
                <button
                  type="submit"
                  disabled={listProgress}
                  className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {listProgress ? "Listing..." : "List"}
                </button>
              </div>
              {errors.price && (
                <span className="px-2 text-red-400">
                  This field is required
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
