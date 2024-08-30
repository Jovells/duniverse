"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { EtherInput } from "~~/components/scaffold-eth";

const ProductCard: NextPage = ({ product }) => {
  const [ethAmount, setEthAmount] = useState(product?.price);
  return (
    <>
      <div className="bg-white flex items-center flex-col flex-grow shadow-xl w-fit rounded-xl">
        <Link href={`/product-details/${product?.productId}`}>
          <div className="p-5">
            <img
              src="https://www.phonelectrics.com/cdn/shop/products/iPhone14Pro-3_5a1ed88a-5967-4937-b746-08ace739720f_900x.jpg?v=1663959701"
              alt="product picture"
              style={{ width: "200px" }}
            />
          </div>
        </Link>
        <div className="w-full flex flex-col border border-black text-center rounded-xl">
          <h1 className="text-lg uppercase font-bold">{product?.name}</h1>
          <div className="flex justify-center items-center gap-2 p-1">
            <span>Wei/$</span> <EtherInput value={ethAmount} disabled onChange={amount => setEthAmount(amount)} />
          </div>
          <span>⭐⭐</span>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
