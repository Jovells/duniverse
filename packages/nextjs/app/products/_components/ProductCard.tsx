"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { NextPage } from "next";

const ProductCard: NextPage = () => {
  return (
    <>
      <Link
        href={"/product-details/123"}
        className="bg-white flex items-center flex-col flex-grow shadow-xl w-fit rounded-3xl"
      >
        <div className="p-5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ABSA_Group_Limited_Logo.svg/800px-ABSA_Group_Limited_Logo.svg.png"
            alt="Landscape picture"
            style={{ width: "200px" }}
          />
        </div>
        <div className="w-full border border-black text-center rounded-3xl">
          <h1 className="text-lg uppercase font-bold">Iphone 15pro max</h1>
          <h1>Ghs 18,600</h1>
          <span>⭐⭐</span>
        </div>
      </Link>
    </>
  );
};

export default ProductCard;
