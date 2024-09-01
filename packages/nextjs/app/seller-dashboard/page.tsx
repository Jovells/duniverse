"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import { THE_GRAPH_URL } from "~~/app/constants";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/* eslint-disable @next/next/no-img-element */
const SellerDashboard: NextPage = () => {
  const { writeContractAsync, isPending: pending } = useScaffoldWriteContract("Duniverse");
  const [data, setData] = useState();
  const [productId, setProductId] = useState<any>(null);
  const [isPending, setIsPending] = useState<any>(pending);
  const [isPendingRelease, setIsPendingRelease] = useState<any>(pending);

  const [pendingSales, setPendingSales] = useState([]);
  const [completedSales, setCompletedSales] = useState([]);
  const searchParams = useSearchParams();

  // graphql
  async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
    const response = await fetch(THE_GRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables,
        operationName,
      }),
    });

    return await response.json();
  }

  const buyerAddress = searchParams.get("id")?.toLowerCase();

  const operation = `
    query MyQuery {
      purchases(where: {buyer: "0x00a0e8ee15281e0fffb7863cc2bd89397483366d"}) {
        id
        isDelivered
        isRefunded
        isReleased
        product {
          id
          name
          price
          productImage
          quantity
        }
      }
    }
  `;

  function fetchMyQuery() {
    return fetchGraphQL(operation, "MyQuery", {});
  }

  const raiseAppeal = async (purchaseId: any) => {
    setIsPending(true);
    try {
      await writeContractAsync(
        {
          functionName: "raiseAppeal",
          args: [purchaseId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error raising appeal", e);
    } finally {
      setIsPending(false);
    }
  };

  const releaseFund = async (purchaseId: any) => {
    setIsPendingRelease(true);
    try {
      await writeContractAsync(
        {
          functionName: "release",
          args: [purchaseId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
      location.reload();
    } catch (e) {
      console.error("Error releasing fund", e);
    } finally {
      setIsPendingRelease(false);
    }
  };


  useEffect(() => {
    // check the user address
    const currentId = searchParams.get("id");
    if (currentId) {
      setProductId(currentId || 1);
    }

    fetchMyQuery()
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
        } else {
          console.log(data?.purchases);
          setData(data?.purchases);
          const pending = data?.purchases?.filter(data => data?.isReleased !== true);
          setPendingSales(pending);
          const completed = data?.purchases?.filter(
            data => data?.isReleased == true || (data?.isReleased == false && data?.isRefunded == true),
          );
          setCompletedSales(completed);
        }
      })
      .catch(error => {
        console.error("Error fetching query:", error);
      });
  }, []);

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
              {pendingSales?.map((purchase, index) => (
                <tr className="border-b" key={index}>
                  <td className="p-3">
                    <span>{purchase?.product?.name}</span>
                  </td>
                  <td className="p-3">
                    <span>{purchase?.product?.quantity || "N/A"}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-yellow-600 font-semibold">
                      {purchase?.isDelivered ? "Delivered" : "Pending"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="space-x-2">
                      <button
                        onClick={() => raiseAppeal(purchase?.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      >
                        {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Appeal"}
                      </button>
                      <button
                        onClick={() => releaseFund(purchase?.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                      >
                        {isPendingRelease ? <span className="loading loading-spinner loading-sm"></span> : "Release"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              {completedSales?.map((purchase, index) => (
                <tr className="border-b bg-gray-50" key={index}>
                  <td className="p-3">
                    <span>{purchase?.product?.name}</span> ({purchase?.product?.quantity || "N/A"}) Qty
                  </td>
                  <td className="p-3">
                    <span className="text-green-600 font-semibold">Completed</span>
                  </td>
                  <td className="p-3">
                    <span>2024-08-28</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SellerDashboard;
