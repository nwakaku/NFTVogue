import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { FiSearch } from "react-icons/fi";
import { ConnectionContext } from "../pages/_app";
import { toast } from "react-toastify";
import Link from "next/link";
import axios from "axios";
import { Web3Storage } from "web3.storage";
import Image from "next/image";
import { getContract } from "viem";
import NFTVogueArtifact from "../contracts/NFTVogue.json";
import contractAddresses from "../contracts/contract-address.json";
import { createWalletClient, createPublicClient, http } from "viem";
import { lineaTestnet } from "viem/chains";
import { useAccount } from "wagmi";
import { writeContract } from "@wagmi/core";
import { getNetwork } from "@wagmi/core";


const { chain, chains } = getNetwork();


type PromptForm = {
  prompt: string;
};

type UriData = {
  b64_json: string;
  prompt: string;
};

function convertUriDataToFile(
  uriData: string,
  fileName: string
): Promise<File> {
  return fetch(uriData)
    .then((response) => response.blob())
    .then((blob) => new File([blob], `${fileName}.jpg`));
}

export default function Mint() {
  const { address, isConnected, isDisconnected } = useAccount();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PromptForm>();

  const [mintingStatus, setMintingStatus] = useState<
    "progress" | "error" | "ready" | "idle" | "minted"
  >("idle");
  const [generateStatus, setGenerateStatus] = useState<
    "progress" | "error" | "generated" | "idle"
  >("idle");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showImage, setShowImage] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedImage1, setGeneratedImage1] = useState("");
  const [generatedImage2, setGeneratedImage2] = useState("");
  const [generatedImage3, setGeneratedImage3] = useState("");
  const [generatedImage4, setGeneratedImage4] = useState("");
  const [generateProgress, setGenerateProgress] = useState(0);
  // const { connected, address, contract } = useContext(ConnectionContext);

  const onSubmit = (data: PromptForm) => {
    setMintingStatus("idle");
    setGenerateStatus("progress");
    setGeneratedImage("");
    const numberOfImages = "1";
    const x = numberOfImages === "1" ? 75 : 140;

    let result = { data: [], error: false };

    const timer = setInterval(() => {
      setGenerateProgress((oldProgress) => {
        if (oldProgress === 90) {
          if (result.data.length === 0) {
            let progresses = [70, 75, 80];
            oldProgress = progresses[Math.floor(Math.random() * 3)];
          }
        }
        if (oldProgress === 100) {
          clearInterval(timer);
          return 0;
        }

        if (result.error) {
          clearInterval(timer);
          setGenerateStatus("error");
          return 0;
        }

        return oldProgress + 1;
      });
    }, x);

    fetch("/api/gen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.prompt,
        address,
      }),
    })
      .then(async (res) => {
        if (res.status === 200) {
          setGenerateStatus("generated");
          setGeneratedPrompt(data.prompt);
          result = (await res.json()).data;
          console.log(result);
          setShowImage(
            `data:image/png;base64,${(result.data[0] as any).b64_json}`
          );
          setGeneratedImage(
            `data:image/png;base64,${(result.data[0] as any).b64_json}`
          );
          setGeneratedImage1(
            `data:image/png;base64,${(result.data[1] as any).b64_json}`
          );
          setGeneratedImage2(
            `data:image/png;base64,${(result.data[2] as any).b64_json}`
          );
          setGeneratedImage3(
            `data:image/png;base64,${(result.data[3] as any).b64_json}`
          );
          setGeneratedImage4(
            `data:image/png;base64,${(result.data[4] as any).b64_json}`
          );
          setMintingStatus("ready");
        } else {
          setGenerateStatus("error");
          return res.json();
        }
      })
      .catch((err) => {
        setGenerateStatus("error");
        console.log(err);
      });
  };

  const mintNFT = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setMintingStatus("progress");

    const timestamp = Date.now().toString();
    const msg = "SIgn transaction on Linea " + timestamp;

    const sig = await window.ethereum.request({
      method: "personal_sign",
      params: [msg, address],
    });
    const auth_token = timestamp + "." + address + "." + sig;

    const uriData = {
      b64_json: generatedImage,
      prompt: generatedPrompt,
    };

    const file = await convertUriDataToFile(uriData.b64_json, uriData.prompt);

    // For web3.storage
    const client = new Web3Storage({
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdBNjFGOTQ4RkExNWM4QUZCMzU3ZDdlNGQzMjJEMjQ0MzMzZTQ0MUQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODkyNTI4NTY1NTIsIm5hbWUiOiJhaSJ9.St6xCU6PbIKARwEBzXPYvn8pqieiQoTmee5ogLEAv8I",
    });
    const cid = await client.put([file]);

    const URI = cid;

    const task = writeContract({
      address:"0x0853212Dab358161dd4a9c497D75555Ec5DE3129",
      abi: NFTVogueArtifact.abi,
      functionName: "safeMint",
      args: [address, URI],
    });

    // const task = contract.write.safeMint([address, URI]);
    toast
      .promise(task, {
        pending: "Minting NFT...",
        success: "NFT minted!",
        error: "Error minting NFT",
      })
      .then((res) => {
        setMintingStatus("minted");
      })
      .catch((err) => {
        console.log("mint error");
        console.error(err);
        setMintingStatus("error");
      });
  };

  return (
    <div className="w-3/4 lg:w-[48rem] flex flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form code */}
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Generate
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch />
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 pl-10 text-lg text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter your prompt"
            disabled={generateStatus === "progress"}
            {...register("prompt", { required: true })}
          />
          <button
            type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {generateStatus === "progress" ? "Generating..." : "Generate"}
          </button>
        </div>
        {errors.prompt && (
          <span className="px-2 text-red-400">This field is required</span>
        )}
      </form>

      {/* Error message */}
      {generateStatus === "error" && (
        <div className="bg-red-400 text-black text-base lg:text-lg font-semibold px-4 py-[0.85rem] w-full rounded-md outline-none">
          Error generating image. Please refresh the page and try again.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-12 mt-3">
        <div className="flex flex-col gap-4">
          {/* Main image */}
          {generateStatus === "generated" && generatedImage !== "" ? (
            <div className="flex flex-col gap-4">
              <img
                src={`${generatedImage}`}
                onClick={() => setGeneratedImage(showImage)}
                alt="generated image"
                className="h-64 md:h-80 rounded-lg"
              ></img>
            </div>
          ) : (
            <div className="relative mb-4 w-full h-64 md:h-80 bg-gray-800 rounded-lg ">
              <div
                className="h-64 md:h-80 bg-gray-700 rounded-lg"
                style={{ width: Math.floor(generateProgress) + "%" }}
              ></div>
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">
                {`${Math.floor(generateProgress)}%`}
              </p>
            </div>
          )}

          {/* Four additional images */}
          <div className="flex flex-row gap-4">
            <img
              src={
                generatedImage1
                  ? generatedImage1
                  : "https://media.istockphoto.com/id/1344687455/vector/question-sing-flat-icon-vector-illustration-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=ZU6kq0hQacI7mZoYuXTqXF8KsgNnbCRaxDm_nAIdCAw="
              }
              onClick={() => setGeneratedImage(generatedImage1)}
              alt="generated image"
              className="h-15 md:h-20 rounded-lg"
            />
            <img
              src={
                generatedImage2
                  ? generatedImage2
                  : " https://media.istockphoto.com/id/1344687455/vector/question-sing-flat-icon-vector-illustration-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=ZU6kq0hQacI7mZoYuXTqXF8KsgNnbCRaxDm_nAIdCAw="
              }
              onClick={() => setGeneratedImage(generatedImage2)}
              alt="generated image"
              className="h-15 md:h-20 rounded-lg"
            />
            <img
              src={
                generatedImage3
                  ? generatedImage3
                  : "https://media.istockphoto.com/id/1344687455/vector/question-sing-flat-icon-vector-illustration-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=ZU6kq0hQacI7mZoYuXTqXF8KsgNnbCRaxDm_nAIdCAw="
              }
              onClick={() => setGeneratedImage(generatedImage3)}
              alt="generated image"
              className="h-15 md:h-20 rounded-lg"
            />
            <img
              src={
                generatedImage4
                  ? generatedImage4
                  : "https://media.istockphoto.com/id/1344687455/vector/question-sing-flat-icon-vector-illustration-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=ZU6kq0hQacI7mZoYuXTqXF8KsgNnbCRaxDm_nAIdCAw="
              }
              onClick={() => setGeneratedImage(generatedImage4)}
              alt="generated image"
              className="h-15 md:h-20 rounded-lg"
            />
          </div>
        </div>

        {/* Details section */}
        <div className="flex flex-col gap-2">
          {/* Prompt */}
          {watch("prompt") && (
            <p className="text-lg">
              {watch("prompt").split(" ").slice(0, 15).join(" ")}
              {watch("prompt").split(" ").length > 15 && "..."}
            </p>
          )}

          {/* Details */}
          <p className="font-semibold text-xl mt-3">Details</p>
          <div className="flex flex-col gap-2 font-sans">
            {/* Minted */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">Minted</p>
              <p className="text-lg text-gray-400">
                {mintingStatus === "minted"
                  ? new Date().toISOString().split("T")[0]
                  : "Not minted yet"}
              </p>
            </div>

            {/* Owned by */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">Owned by</p>
              <p className="text-lg text-gray-400">
                {mintingStatus === "minted" ? "You" : "No one"}
              </p>
            </div>

            {/* Listed */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">Listed</p>
              <p className="text-lg text-gray-400">Not listed yet</p>
            </div>

            {/* Network */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">Network</p>
              <p className="text-lg text-gray-400">{"Linea testnet"}</p>
            </div>
          </div>

          {/* View owned NFTs */}
          {mintingStatus === "minted" ? (
            <Link href={"/owned"}>
              <div className="mt-4 border border-blue-400 text-blue-400 flex justify-center items-center gap-2 font-semibold px-4 py-3 rounded-md outline-none hover:bg-blue-400 hover:text-black cursor-pointer">
                <span>View owned NFTs</span>
              </div>
            </Link>
          ) : mintingStatus === "progress" ? (
            <button className="mt-4 bg-blue-400 text-black font-semibold px-4 py-3 rounded-md outline-none hover:bg-white">
              Minting...
            </button>
          ) : (
            <button
              type="submit"
              disabled={mintingStatus !== "ready"}
              className={`mt-4 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold px-4 py-3 rounded-md outline-none hover:bg-white ${
                mintingStatus !== "ready" ? "cursor-not-allowed" : ""
              }`}
              onClick={mintNFT}
            >
              Mint NFT
            </button>
          )}

          {/* Minting error */}
          {mintingStatus === "error" && (
            <div className="bg-red-400 text-black text-base lg:text-lg font-semibold px-4 py-[0.85rem] w-full rounded-md outline-none">
              Error minting NFT. Please refresh the page and try again.
            </div>
          )}

          {/* Model and Creator details */}
          <div className="grid mt-2 grid-cols-2 gap-4 font-semibold">
            {/* Model */}
            <div className="flex flex-col gap-2 bg-gray-800 rounded-md p-4">
              <p className="text-sm">Model</p>
              <p className="text-xs md:text-sm overflow-x-scroll">DALL·E 2</p>
            </div>

            {/* Creator */}
            <div className="flex flex-col gap-2 bg-gray-800 rounded-md p-4">
              <p className="text-sm">Creator</p>
              <p className="text-xs md:text-sm overflow-x-scroll">
                {address
                  ? address.slice(0, 4) + "..." + address.slice(-4)
                  : "0x0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
