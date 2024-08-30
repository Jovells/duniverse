/* eslint-disable prettier/prettier */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "../_components/ProductCard";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";


const Products: NextPage = () => {
  const { writeContractAsync, isPending } = useScaffoldWriteContract("Duniverse");
  const { address: connectedAddress } = useAccount();

  const [productImage, setProductImage] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productQuantity, setProductQuantity] = useState(0);
  const [planetId, setPlanetId] = useState<any>(null);

  const route = useParams();

  const submitProduct = async(event: any) => {
    event?.preventDefault();
    const payload = {
      productImage: productImage,
      productName: productName,
      planetId: planetId ?? 1,
      seller: connectedAddress,
      quantity: productQuantity as any,
      price: productPrice as any,
    };
    
    try {
      console.log("Payload1", payload);
      await writeContractAsync(
        {
          functionName: "addProduct",
          args: [payload.productName, payload.planetId, payload.seller, payload.quantity, payload.price]
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error posting product", e);
    }
  };

  const isFormComplete = () => {
    return productName && productPrice && productQuantity && planetId
  }

  // check the planet and product id
  useEffect(() => {
    if (route?.planetId) {
      setPlanetId(route.planetId);
    }
  }, [route.planetId]);



  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow flex-col bg-base-300 w-full px-8 py-5 items-center justify-center gap-10">
          <div className="flex justify-between mb-5">
            <h1 className="text-[30px]">Products</h1>
            {/* <button className="text-[20px] font-bold outline outline-1 p-2 rounded-lg">➕ Post</button> */}
            <div className="absolute flex right-10 justify-between mb-5">
              <label htmlFor="my_modal_7" className="text-[20px] font-bold outline outline-1 p-2 rounded-lg cursor-pointer">
                ➕ Post Product
              </label>
            </div>
          </div>
          <ProductCard />
        </div>

        {/* Put this part before </body> tag */}
        <input type="checkbox" id="my_modal_7" className="modal-toggle" />
        <div className="modal" role="dialog">
          <form onSubmit={(e) => submitProduct(e)} className="modal-box flex flex-col">
            <h3 className="text-lg font-bold">Add a product.</h3>
            <p className="py-4 flex flex-col justify-between items-center gap-2">
              <label htmlFor="name">Upload image</label>
              <input
                onChange={e => setProductImage(e.target.value)}
                type="file"
                className="outline outline-1 p-2 rounded-lg"
              />
              <label htmlFor="name">Product name</label>
              <input
                onChange={e => setProductName(e.target.value)}
                type="text"
                className="outline outline-1 p-2 rounded-lg"
              />
              <label htmlFor="name">Price</label>
              <input
                onChange={e => setProductPrice(e.target.value)}
                type="number"
                className="outline outline-1 p-2 rounded-lg"
              />
              <label htmlFor="name">Quantity</label>
              <input
                onChange={e => setProductQuantity(e.target.value)}
                type="number"
                className="outline outline-1 p-2 rounded-lg"
              />
            </p>

            <button disabled={!isFormComplete} type="submit" className="btn w-[100px] bg-base-300 place-self-end">
              Post!
            </button>
          </form>
          <label htmlFor="my_modal_7" className="modal-backdrop"></label>
        </div>
      </div>
    </>
  );
};

export default Products;
