/* eslint-disable prettier/prettier */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "../_components/ProductCard";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { THE_GRAPH_URL } from "~~/app/constants";
import AddProduct from "../_components/AddProduct";


const Products: NextPage = () => {
  const { writeContractAsync, isPending } = useScaffoldWriteContract("Duniverse");
  const { address: connectedAddress } = useAccount();

  const [products, setProducts] = useState([])
  const [productImage, setProductImage] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState<any>(0);
  const [productQuantity, setProductQuantity] = useState<any>(0);
  const [planetId, setPlanetId] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false)

  const route = useParams();

  async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
    setIsLoading(true)
    const response = await fetch(THE_GRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables,
        operationName,
      }),
    });
    setIsLoading(false)
  
    return await response.json();
  }

  
  const operation = `
  query MyQuery {
    products(where: { planet: "${route?.id}"  }) {
      id
      name
      price
      id
      quantity
      seller 
    }
  }
  `;
  
  function fetchMyQuery() {
    return fetchGraphQL(operation, 'MyQuery', {});
  }

  async function submitProduct() {
    const payload = {
      productImage: productImage,
      productName: productName,
      planetId: planetId ?? 1,
      seller: connectedAddress,
      quantity: productQuantity as any,
      price: productPrice as any,
    };
    if(productName && planetId && productImage && connectedAddress && productQuantity && productPrice) {
      try {
        console.log("Payload1", payload);
        await writeContractAsync(
          {
            functionName: "addProduct",
            args: [productName, planetId, productImage, connectedAddress, productQuantity, productPrice]
          },
          {
            onBlockConfirmation: txnReceipt => {
              console.log("📦 Transaction blockHash", txnReceipt.blockHash);
            },
          },
        );
        location.reload()
      } catch (e) {
        console.error("Error posting product", e);
      }
    } else {
      return
    }
  }

  const isFormComplete = () => {
    return productName && productPrice && productQuantity && planetId
  }

  // check the planet and product id
  useEffect(() => {
    if (route?.id) {
      setPlanetId(route.id || 1);
    }
  }, [route.id]);

  // Graphql query to fetch products per planet id
  useEffect(() => {
    fetchMyQuery()
    .then(({ data, errors }) => {
      if (errors) {
        console.error(errors);
      } else {
        setProducts(data.products)
        console.log(data?.products);
      }
    })
    .catch(error => {
      console.error('Error fetching query:', error);
    });
  }, [])


  return (
    <>
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow flex-col bg-base-300 w-full px-8 py-5 items-center justify-center gap-10">
          <div className="flex justify-between mb-5">
            <h1 className="text-[25px] font-bold">Products</h1>
            {/* <button className="text-[20px] font-bold outline outline-1 p-2 rounded-lg">➕ Post</button> */}
            <div className="absolute flex right-10 justify-between">
              <label htmlFor="my_modal_7" className="text-[18px] font-bold outline outline-1 p-2 rounded-lg cursor-pointer">
                ➕ Post Product
              </label>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-start gap-5">
            {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : products?.length ? (
                products?.map((product: any, index: number) => <ProductCard key={index} product={product} />)
              ) : (
                <h2>No Products available</h2>
              )
            }
          </div>
        </div>

        <AddProduct 
          setProductImage={setProductImage}
          setProductName={setProductName}
          setProductPrice={setProductPrice}
          setProductQuantity={setProductQuantity}
          submitProduct={submitProduct}
        />
      </div>
    </>
  );
};

export default Products;
