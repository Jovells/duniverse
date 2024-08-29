"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { NextPage } from "next";

const StoreCard: NextPage = ({ store }) => {
  return (
    <>
      <Link
        href={"/products/1234"}
        className="bg-white flex items-center flex-col flex-grow shadow-xl w-fit rounded-3xl"
      >
        <div className="p-5">
          <img src={store?.img} alt="Landscape picture" className="rounded-full" style={{ width: "200px" }} />
        </div>
        <div className="w-full border border-black text-center rounded-3xl">
          <h1 className="text-lg uppercase font-bold">{store?.name}</h1>
          {Array.from({ length: store?.rating }).map((_, index) => (
            <span key={index}>⭐</span>
          ))}
        </div>
      </Link>
    </>
  );
};

export default StoreCard;
