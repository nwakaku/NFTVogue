import { ConnectionContext } from "@/pages/_app";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import { Web3Storage } from 'web3.storage';
import { getContract } from "viem";
import NFTVogueArtifact from "../contracts/NFTVogue.json";
import contractAddresses from "../contracts/contract-address.json";
import { createWalletClient, createPublicClient, http } from "viem";
import { lineaTestnet } from "viem/chains";
import { useAccount } from "wagmi";
import { writeContract } from '@wagmi/core'


const publicClient = createPublicClient({
  chain: lineaTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: lineaTestnet,
  transport: http(),
});

const contract = getContract({
  address: "0x0853212Dab358161dd4a9c497D75555Ec5DE3129",
  abi: NFTVogueArtifact.abi,
  publicClient,
  walletClient
});

interface Props {
  tokenID: BigNumber;
}

type ListedDetail = [boolean, BigNumber, string] & {
  isListed: boolean;
  price: BigNumber;
  lastOwner: string;
};


function getAccessToken () {
  
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDkyQmMzYmEyNEMwNzIyZUZkODg5NmIzOGQxYzI5ZWE0RUFiMjdiMjkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODY0NjQzNjk1NjIsIm5hbWUiOiJmb3IgbmZ0YWkifQ.dyN1087A0XVpl12LBrjON3fxQLgQrRcAXpAW25YZ0IU"
}

function makeStorageClient () {
  return new Web3Storage({ token: getAccessToken() })
}



export default function NFTOwned({ tokenID }: Props) {
  // const { connected, address, contract } = useContext(ConnectionContext);
  const { address, isConnected, isDisconnected } = useAccount();


  const [tokenMetaData, setTokenMetaData] = useState<any>(null);
  const [tokenListedData, setTokenListedData] = useState<ListedDetail | null>(
    null
  );
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
        setTokenMetaData(`https://dweb.link/ipfs/${file.cid}`)
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
        retrieve(uri as string);

        const tokenListedData = await contract.read.nftDetails([tokenID]);
        console.log(tokenListedData);
        setTokenListedData(tokenListedData as ListedDetail);
      } catch (error) {
        console.log(error);
        setTokenInfoError(error);
      }

      setTokenInfoLoading(false);
    };

    tokenDetailsFetcher();
  }, [address, tokenID]);

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
          {tokenListedData &&
            
             (console.log(tokenListedData),
              <div className="dark:text-white">
                Listed for {ethers.utils.formatEther(tokenListedData[1])}{" "}
                $Linea_Testnet
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
