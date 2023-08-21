import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { ConnectionContext } from "../pages/_app";
import { ConnectButton } from '@rainbow-me/rainbowkit';


// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// create type
export type NavigationPageType = "create" | "promptshop" | "marketplace" | "owned" | "/";

export default function Header() {
  // const { connected, setConnected, address, setAddress } =
  //   useContext(ConnectionContext);
  const router = useRouter();

  const [page, setPage] = useState<NavigationPageType>();



  const get_page = (): NavigationPageType => {
    switch (router.asPath) {
      case "/create":
        return "create";
      case "/marketplace":
        return "marketplace";
      case "/owned":
        return "owned";
      case "/promptshop":
        return "promptshop";
      default:
        return "/";
    }
  };

  useEffect(() => {
    const page = get_page();
    if (page) {
      setPage(page);
    }
  }, [router.asPath]);

  return (
    <div className="sticky top-0 z-10 flex justify-center mb-3 light ">
      <div className="justify-self-center flex justify-between items-center px-6 sm:px-12 py-3	w-full max-w-screen-xl">
        <div className="flex items-center text-2xl">
          <Link href="/" legacyBehavior>
            <div>
              NFTVogue
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-8 text-lg">
          <Link href="marketplace">
            <div
              className={
                page === "marketplace"
                  ? "border-b-4 border-blue-400"
                  : "border-b-4 border-gray-900"
              }
            >
              ShowRoom
            </div>
          </Link>
          <Link href="/create">
            <div
              className={
                page === "create"
                  ? "border-b-4 border-blue-400"
                  : "border-b-4 border-gray-900"
              }
            >
              Atelier
            </div>
          </Link>
          <Link href="owned">
            <div
              className={
                page === "owned"
                  ? "border-b-4 border-blue-400"
                  : "border-b-4 border-gray-900"
              }
            >
              Brands
            </div>
          </Link>
          <Link href="promptshop">
            <div
              className={
                page === "promptshop"
                  ? "border-b-4 border-blue-400"
                  : "border-b-4 border-gray-900"
              }
            >
              PromptShop
            </div>
          </Link>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
