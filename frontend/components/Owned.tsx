import { ConnectionContext } from "@/pages/_app";
import { useContext, useEffect, useState } from "react";
import NFTOwned from "./NFTOwned";
import { RiRefreshLine } from "react-icons/ri";
import NFTListed from "./NFTListed";
import Link from "next/link";
import ScaleLoader from "react-spinners/ScaleLoader";
import { getContract } from "viem";
import NFTVogueArtifact from "../contracts/NFTVogue.json";
import contractAddresses from "../contracts/contract-address.json";
import { createWalletClient, createPublicClient, http } from "viem";
import { lineaTestnet, polygonMumbai } from "viem/chains";
import { useAccount } from "wagmi";
import { getNetwork } from "@wagmi/core";

const { chain, chains } = getNetwork();

const publicClient = createPublicClient({
  chain: chain?.id === 59140 ? lineaTestnet : polygonMumbai,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: chain?.id === 59140 ? lineaTestnet : polygonMumbai,
  transport: http(),
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

export default function Owned() {
  const { address, isConnected, isDisconnected } = useAccount();

  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [listedNFTs, setListedNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const [refresh, setRefresh] = useState(1);

  useEffect(() => {
    if (!isConnected || !address || !contract) {
      return;
    }
    const fetcher = async () => {
      setLoading(true);
      try {
        //
        const owned = await contract.read.getNFTsOfOwner([address]);
        setOwnedNFTs(owned as any[]);
        console.log(owned);

        const listed = await contract.read.getNFTsListedByUser([address]);
        setListedNFTs(listed as any[]);
        console.log(listed);
      } catch (error) {
        console.log(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center mb-10">
        <ScaleLoader color="#60a5fa" />
        <div className="w-3/4 lg:w-[48rem] flex flex-col items-center mt-4">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
    <div className="flex max-w-screen-xl flex-col gap-4 justify-center items-center mb-10">
      <div className="mb-4 text-xl flex space-x-3">
        <p className="font-semibold font-sans">Owned NFTs </p>
        <button
          onClick={() => setRefresh(refresh + 1)}
          className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none"
        >
          <RiRefreshLine className="text-white" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mx-5">
        {listedNFTs?.map((nft) => (
          <NFTListed key={nft} tokenID={nft} />
        ))}
        {ownedNFTs?.map((nft) => (
          <NFTOwned key={nft} tokenID={nft} />
        ))}
      </div>
      {listedNFTs.length === 0 && ownedNFTs.length === 0 && (
        <div className="flex flex-col justify-center items-center h-screen">
          <p className="font-semibold">This Brand Does Not Own Any NFT Yet</p>
          <p>
            <Link className="text-blue-400" href={"/create"}>
              Create
            </Link>{" "}
            or checkout the{" "}
            <Link className="text-blue-400" href={"/marketplace"}>
              Marketplace
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
