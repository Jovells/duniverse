"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { NextPage } from "next";

const StoreCard: NextPage = ({ planet }) => {
  return (
    <>
      <Link
        href={`/products/${planet?.planetId || "1"}`}
        className="bg-white flex items-center flex-col flex-grow shadow-xl w-fit rounded-3xl"
      >
        <div className="p-5">
          <img
            src={
              planet?.img ||
              "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ABSA_Group_Limited_Logo.svg/800px-ABSA_Group_Limited_Logo.svg.png"
            }
            alt="Landscape picture"
            className="rounded-full"
            style={{ width: "200px" }}
          />
        </div>
        <div className="w-full border border-black text-center rounded-3xl">
          <h1 className="text-lg uppercase font-bold">{planet?.planetName}</h1>
          <p>{planet?.planetDescription}</p>
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index}>⭐</span>
          ))}
        </div>
      </Link>
    </>
  );
};

export default StoreCard;
