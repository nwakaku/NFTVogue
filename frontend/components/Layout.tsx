import React, { ReactNode, useContext } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { ConnectionContext } from "@/pages/_app";
import ImageSlider from "@/pages";

type Props = {
  children?: ReactNode;
};

export default function Layout({ children }: Props) {
  const { connected, address, contract } = useContext(ConnectionContext);
  return (
    <div className="Light">
      <div className="min-h-screen justify-between bg-gray-100 text-black dark:bg-[#100a25] dark:text-white py-1">
        <Header />
        {connected && address && contract ? children : <ImageSlider />}
        <div className="sticky top-[100vh]">
          <Footer />{" "}
        </div>
      </div>
    </div>
  );
}
