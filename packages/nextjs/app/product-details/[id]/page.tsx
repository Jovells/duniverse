"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { NextPage } from "next";

/* eslint-disable @next/next/no-img-element */
const ProductDetails: NextPage = () => {
  const [productId, setProductId] = useState<any>(null);
  const route = useParams();
  useEffect(() => {
    if (route?.id) {
      setProductId(route.id);
    }
  }, [route.id]);

  return (
    <>
      <div className="p-5">
        <h1 className="w-100 font-bold text-xl">Product Details</h1>

        <div className="flex flex-wrap justify-center items-center gap-5">
          <img
            src="https://www.phonelectrics.com/cdn/shop/products/iPhone14Pro-3_5a1ed88a-5967-4937-b746-08ace739720f_900x.jpg?v=1663959701"
            alt=""
            className="w-1/4"
          />
          <div className="w-full sm:w-1/2 flex flex-col justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Iphone 15pro max 256gb</h1>
            <h2>Ghs 18,930</h2>
            <span>Category</span>
            <span>⭐⭐</span>
            <span className="w-fit">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio quae deserunt maxime asperiores
              voluptatem exercitationem molestias impedit vitae dignissimos repellat vel, in provident hic aperiam.
              Deserunt nam sit ullam incidunt!
            </span>
            <button className="bg-blue-300 p-2 rounded-lg">Buy</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
