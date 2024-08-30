"use client";

import Link from "next/link";
import type { NextPage } from "next";
// import { useAccount } from "wagmi";
import { ShoppingCartIcon, WalletIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        <div className="relative flex-grow flex-col bg-base-300 w-full px-8 py-12 items-center justify-center gap-10">
          <div className="hidden absolute right-10 justify-between mb-5">
            <button className="text-[20px] font-bold outline outline-1 p-2 rounded-lg">➕ Create Store</button>
          </div>
          <h1 className="text-center flex flex-col justify-center items-center gap-10">
            <span className="block text-2xl mb-2">Decentralized Shopping</span>
            <span className="block text-4xl font-bold">D-universe</span>
          </h1>

          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row mt-10 sm:mt-20">
            <div
              className="flex flex-col px-10 py-10 text-center items-center max-w-xs rounded-3xl
              bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-50 border border-gray-100
            "
            >
              <WalletIcon className="h-8 w-8 fill-secondary" />
              <p className="flex flex-col gap-5">
                <span>Connect your wallet to begin shopping</span>
                <RainbowKitCustomConnectButton />
              </p>
            </div>
            <div
              className="flex flex-col px-10 py-10 text-center items-center max-w-xs rounded-3xl
              bg-white bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-50 border border-gray-100
            "
            >
              <ShoppingCartIcon className="h-8 w-8 fill-secondary" />
              <p className="flex flex-col">
                <span>Shop right away</span>
                <span>Explore our wide range of stores and products</span>
              </p>
              <Link href={"/stores"} className="btn btn-outline btn-primary">
                Explore Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
