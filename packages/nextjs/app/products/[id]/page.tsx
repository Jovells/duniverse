"use client";

import ProductCard from "../_components/ProductCard";
import type { NextPage } from "next";

const Products: NextPage = () => {
  //   const products = [];

  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow flex-col bg-base-300 w-full px-8 py-12 items-center justify-center gap-10">
          <h1 className="text-[30px]">Products</h1>
          <ProductCard />
        </div>
      </div>
    </>
  );
};

export default Products;
