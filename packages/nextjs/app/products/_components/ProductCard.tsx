"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";

const ProductCard: NextPage = ({ product }) => {
  const [ethAmount] = useState(product?.price / 10 ** 6);
  return (
    <>
      <div className="bg-white w-fit sm:w-1/5 flex items-center flex-col shadow-xl rounded-xl aspect-auto">
        <Link href={`/product-details/?id=${product?.id || "1"}`} className="w-full cursor-pointer">
          <div className="p-5">
            <img
              src={`https://ipfs.io/ipfs/${product?.productImage}`}
              alt="product picture"
              style={{ width: "200px" }}
            />
          </div>
          <div className="w-full border border-black text-center rounded-br-xl rounded-bl-xl flex flex-col justify-center items-center">
            <h1 className="text-lg uppercase font-bold">{product?.name}</h1>
            <div className="flex justify-center items-center gap-2 p-1">
              <div className="flex justify-start items-center gap-2 p-1 font-bold">
                <span>$</span>
                <span>{ethAmount}</span>
              </div>
            </div>
            <Address address={product?.seller} />
            <span>⭐⭐</span>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProductCard;
