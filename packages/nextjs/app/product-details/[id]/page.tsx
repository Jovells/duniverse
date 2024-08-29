"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { NextPage } from "next";

const ProductDetails: NextPage = () => {
  const [productId, setProductId] = useState<any>(null);
  const route = useParams();
  useEffect(() => {
    if (route?.id) {
      setProductId(route.id);
    }
  }, [route.id]);

  return <>Heyy! this is Product - {productId}</>;
};

export default ProductDetails;
