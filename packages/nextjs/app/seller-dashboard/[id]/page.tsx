"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { NextPage } from "next";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/* eslint-disable @next/next/no-img-element */
const SellerDashboard: NextPage = () => {
  const { writeContractAsync, isPending: pending } = useScaffoldWriteContract("Duniverse");
  const [productId, setProductId] = useState<any>(null);
  const [itemQty, setItemQty] = useState<any>(1);
  const [isPending, setIsPending] = useState<any>(pending);
  const route = useParams();

  const confirmDelivery = async () => {
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
      <div className="p-5 sm:px-10">
        <h1 className="w-full font-bold text-2xl underline mb-4">Dashboard</h1>
        <div className="p-5">
          <h2 className="text-xl font-bold mb-3">Pending Sales</h2>
          <table className="mb-10 w-full border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">
                  <span>Iphone 15 Pro Max</span>
                </td>
                <td className="p-3">
                  <span>13</span>
                </td>
                <td className="p-3">
                  <span className="text-yellow-600 font-semibold">Pending</span>
                </td>
                <td className="p-3">
                  <div className="space-x-2">
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">Appeal</button>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">Delivered</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-xl font-bold mb-3">Past Transactions</h2>
          <table className="w-full border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-gray-50">
                <td className="p-3">
                  <span>Iphone 15 Pro Max</span>
                </td>
                <td className="p-3">
                  <span className="text-green-600 font-semibold">Completed</span>
                </td>
                <td className="p-3">
                  <span>2024-08-28</span>
                </td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3">
                  <span>Samsung Galaxy S23</span>
                </td>
                <td className="p-3">
                  <span className="text-green-600 font-semibold">Completed</span>
                </td>
                <td className="p-3">
                  <span>2024-08-25</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;
