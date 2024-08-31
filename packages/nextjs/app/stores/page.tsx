/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { THE_GRAPH_URL } from "../constants";
import StoreCard from "./_components/StoreCard";
import type { NextPage } from "next";

// import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Stores: NextPage = () => {
  // const { data, isLoading } = useScaffoldReadContract({
  //   contractName: "Duniverse",
  //   functionName: "",
  // });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stores, setStores] = useState<any[]>([]);

  async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
    setIsLoading(true);
    const response = await fetch(THE_GRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables,
        operationName,
      }),
    });
    setIsLoading(false);
    return await response.json();
  }

  const operation = `
    query MyQuery {
      planets(first: 10, orderBy: id) {
        planetDescription
        id
        planetName
      }
    }
  `;

  async function fetchMyQuery() {
    const { data, errors } = await fetchGraphQL(operation, "MyQuery", {});

    if (errors) {
      console.error(errors);
      return;
    }

    console.log(data?.planets);
    setStores(data?.planets);
  }

  useEffect(() => {
    fetchMyQuery().catch(error => {
      console.error("Error fetching query:", error);
    });
  }, []);

  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow flex-col bg-base-300 w-full px-8 py-12 items-center justify-center gap-10">
          <h1 className="flex justify-start items-center gap-2">
            <img src="/planet.png" alt="planet" className="w-[50px] animate-bounce opacity-50"/>
            <span className="text-[30px] font-bold">Planets</span>
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : stores?.length ? (
              stores?.map((store: any, index: number) => <StoreCard key={index} planet={store} className="cursor-pointer" />)
            ) : (
              <h2>No Planets available</h2>
            )}
          </div>
          <img src="/solar.gif" alt="planet" className="w-[300px] absolute right-10 bottom-0" />
        </div>
      </div>
    </>
  );
};

export default Stores;
