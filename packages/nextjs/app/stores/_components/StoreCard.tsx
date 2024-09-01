"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { NextPage } from "next";

const StoreCard: NextPage = ({ planet }) => {
  return (
    <>
      <Link
        href={`/products/?id=${planet?.id || "1"}`}
        className="bg-white w-fit sm:w-1/5 flex items-center flex-col shadow-xl rounded-3xl aspect-auto"
      >
        <div className="p-5">
          <img
            src={
              planet?.img || planet?.planetName?.includes("Pearson")
                ? "https://assets-global.website-files.com/637d4c3b222767826da03ef4/637ff65ccfb898870679226e_Pearson-logo-p-500.png"
                : "https://www.databankgroup.com/wp-content/uploads/2018/01/databanklogo-1.png"
            }
            alt="Landscape picture"
            className="rounded-full"
            style={{ width: "700px" }}
          />
        </div>
        <div className="w-full border border-black text-center rounded-br-3xl rounded-bl-3xl p-2">
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
