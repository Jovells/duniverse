"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { NextPage } from "next";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/* eslint-disable @next/next/no-img-element */
const ProductDetails: NextPage = () => {
  const { writeContractAsync, isPending: pending } = useScaffoldWriteContract("Duniverse");
  const [productId, setProductId] = useState<any>(null);
  const [itemQty, setItemQty] = useState<any>(1);
  const [isPending, setIsPending] = useState<any>(pending);
  const route = useParams();

  const buyProduct = async () => {
    console.log(productId, itemQty);
    try {
      await writeContractAsync(
        {
          functionName: "purchaseProduct",
          args: [productId, itemQty],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      setIsPending(false);
      console.error("Error posting product", e);
    }
  };

  useEffect(() => {
    if (route?.id) {
      setProductId(route.id);
    }
  }, [route.id]);

  return (
    <>
      <div className="p-5">
        <h1 className="w-100 font-bold text-2xl underline">Dashboard</h1>
        <h1 className="text-xl font-bold">Pending sales</h1>
        <table className="w-full border-separate">
          <tr>
            <td>
              <span>Iphone 15promax</span>
            </td>
            <td>
              <span>Pending</span>
            </td>
            <td>
              <div>
                <button>Appeal</button>
                <button>Release</button>
              </div>
            </td>
          </tr>
        </table>
        <h1>History</h1>
        <table>
          <tr>
            <td></td>
          </tr>
        </table>
      </div>
    </>
  );
};

export default ProductDetails;
