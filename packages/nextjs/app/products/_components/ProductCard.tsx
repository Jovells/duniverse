"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { NextPage } from "next";

const ProductCard: NextPage = () => {
  return (
    <>
      <Link
        href={"/product-details/123"}
        className="bg-white flex items-center flex-col flex-grow shadow-xl w-fit rounded-xl"
      >
        <div className="p-5">
          <img
            src="https://www.phonelectrics.com/cdn/shop/products/iPhone14Pro-3_5a1ed88a-5967-4937-b746-08ace739720f_900x.jpg?v=1663959701"
            alt="product picture"
            style={{ width: "200px" }}
          />
        </div>
        <div className="w-full border border-black text-center rounded-xl">
          <h1 className="text-lg uppercase font-bold">Iphone 15pro max</h1>
          <h1>Ghs 18,600</h1>
          <span>⭐⭐</span>
        </div>
      </Link>
    </>
  );
};

export default ProductCard;
