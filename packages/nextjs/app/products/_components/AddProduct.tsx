"use client";

import { useState } from "react";
import { Chain, Models, ORAPlugin } from "@ora-io/web3-plugin-ora";
import type { NextPage } from "next";
import { Web3 } from "web3";

interface AddProductProps {
  setProductImage: (image: string | null) => void;
  setProductName: (name: string) => void;
  setProductPrice: (price: number) => void;
  setProductQuantity: (quantity: number) => void;
  submitProduct: () => void;
}

// Initialize Web3.js with Sepolia Testnet
const web3 = new Web3("https://1rpc.io/sepolia");
web3.registerPlugin(new ORAPlugin(Chain.SEPOLIA));

// Add private key to initialize a wallet (ensure this key is securely managed)
const wallet = web3.eth.accounts.wallet.add("0xbaeb072fb008216be99bd682e2778cb212f65507f88d5484b917dfbc61900d19");

const AddProduct: NextPage<AddProductProps> = ({
  setProductImage,
  setProductName,
  setProductPrice,
  setProductQuantity,
  submitProduct,
}) => {
  const [prompt, setPrompt] = useState("");
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const estimatedFee = await web3.ora.estimateFee(Models.STABLE_DIFFUSION);
      await web3.ora.calculateAIResult(wallet[0].address, Models.STABLE_DIFFUSION, prompt, estimatedFee);

      console.log("Oracle is generating result...");

      // Wait for 30 seconds to ensure the oracle returns the result
      await new Promise(resolve => setTimeout(resolve, 30000));

      const result = await web3.ora.getAIResult(Models.STABLE_DIFFUSION, prompt);

      if (result) {
        setImageResult(result);
        setProductImage(result); // Set the product image URL
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductPrice(parseFloat(e.target.value * 10 ** 6));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductQuantity(parseInt(e.target.value));
  };

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageResult) {
      submitProduct();
    } else {
      setError("Please generate an image before submitting.");
    }
  };

  return (
    <>
      <div>
        <input type="checkbox" id="my_modal_7" className="modal-toggle" />
        <div className="modal" role="dialog">
          <form onSubmit={handleSubmission} className="modal-box flex flex-col">
            <h3 className="text-lg font-bold">Add a product.</h3>
            <p className="py-4 flex flex-col justify-between items-center gap-2">
              <label className="text-blue-700" htmlFor="prompt">
                Generate Image
              </label>
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                type="text"
                placeholder="Describe the image"
                className="outline outline-1 w-1/2 p-2 rounded-xl"
                required
              />
              <button onClick={handleGenerateImage} disabled={loading || !prompt} className="btn w-[100px] bg-base-300">
                {loading ? "Generating..." : "Generate"}
              </button>

              {error && <p style={{ color: "red" }}>{error}</p>}

              {imageResult && (
                <div className="flex justify-center gap-1" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <span>Generated Image:</span>
                  <a
                    href={`https://ipfs.io/ipfs/${imageResult}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "blue", textDecoration: "underline" }}
                  >
                    View Image
                  </a>
                </div>
              )}

              <label className="text-blue-700" htmlFor="name">
                Product name
              </label>
              <input onChange={handleProductName} type="text" className="outline outline-1 w-1/2 p-2 rounded-xl" />
              <label className="text-blue-700" htmlFor="price">
                Price ($)
              </label>
              <input onChange={handlePriceChange} type="number" className="outline outline-1 p-2 rounded-xl" />
              <label className="text-blue-700" htmlFor="quantity">
                Quantity
              </label>
              <input onChange={handleQuantityChange} type="number" className="outline outline-1 w-1/2 p-2 rounded-xl" />
            </p>

            <button disabled={!imageResult} type="submit" className="btn w-[100px] bg-base-300 place-self-end">
              Post!
            </button>
          </form>
          <label htmlFor="my_modal_7" className="modal-backdrop"></label>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
