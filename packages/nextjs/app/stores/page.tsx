"use client";

import { useState } from "react";
import StoreCard from "./_components/StoreCard";
import type { NextPage } from "next";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";


const Stores: NextPage = () => {
  // const { data, isLoading } = useScaffoldReadContract({
  //   contractName: "Duniverse",
  //   functionName: "",
  // });

  const [stores] = useState<any[]>([
    {
      name: "Absa Bank",
      rating: 5,
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ABSA_Group_Limited_Logo.svg/800px-ABSA_Group_Limited_Logo.svg.png",
    },
    {
      name: "Despite Group",
      rating: 3,
      img: "https://play-lh.googleusercontent.com/x2ILS6dHlRL6kmmV3IL0Sj5frCB65iteZKTOQZyGrSs2wKmh52rLddV_z2Kx4HHqQ24",
    },
    {
      name: "KodeTech Gh Ltd.",
      rating: 2,
      img: "https://kodetechgh.com/images/logo-blue.png",
    },
    {
      name: "Zoom Lion Co. Ltd",
      rating: 5,
      img: "https://zoomlionghana.com/wp-content/uploads/2023/08/cropped-zl_logo-01.png",
    },
  ]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow flex-col bg-base-300 w-full px-8 py-12 items-center justify-center gap-10">
          <h1 className="text-[30px]">Stores</h1>
          <div className="flex flex-wrap justify-center items-center gap-5">
            {stores.map((store: any, index: number) => (
              <StoreCard key={index} store={store} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Stores;
