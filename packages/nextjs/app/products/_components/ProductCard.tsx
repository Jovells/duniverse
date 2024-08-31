"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { EtherInput } from "~~/components/scaffold-eth";

const ProductCard: NextPage = ({ product }) => {
  const [ethAmount, setEthAmount] = useState(product?.price / 10 ** 6);
  return (
    <>
      <div className="bg-white w-fit sm:w-1/5 flex items-center flex-col shadow-xl rounded-xl aspect-auto">
        <Link href={`/product-details/${product?.productId}`} className="w-full cursor-pointer">
          <div className="p-5">
            <img
              src="https://www.phonelectrics.com/cdn/shop/products/iPhone14Pro-3_5a1ed88a-5967-4937-b746-08ace739720f_900x.jpg?v=1663959701"
              alt="product picture"
              style={{ width: "200px" }}
            />
          </div>
          <div className="w-full border border-black text-center rounded-br-xl rounded-bl-xl">
            <h1 className="text-lg uppercase font-bold">{product?.name}</h1>
            <div className="flex justify-center items-center gap-2 p-1">
              <div className="flex justify-start items-center gap-2 p-1 font-bold">
                <span>$</span>
                <span>{ethAmount}</span>
              </div>
            </div>
            <span>⭐⭐</span>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProductCard;
