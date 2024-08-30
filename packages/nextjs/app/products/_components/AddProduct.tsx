"use client";

/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";

interface AddProductProps {
  setProductImage: (image: File | null) => void;
  setProductName: (name: string) => void;
  setProductPrice: (price: number) => void;
  setProductQuantity: (quantity: number) => void;
  submitProduct: () => void;
}

const AddProduct: NextPage<AddProductProps> = ({
  setProductImage,
  setProductName,
  setProductPrice,
  setProductQuantity,
  submitProduct,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setProductImage(file);
  };

  const handleProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductPrice(parseFloat(e.target.value));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductQuantity(parseInt(e.target.value));
  };

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    submitProduct();
  };

  return (
    <>
      <div>
        <input type="checkbox" id="my_modal_7" className="modal-toggle" />
        <div className="modal" role="dialog">
          <form onSubmit={handleSubmission} className="modal-box flex flex-col">
            <h3 className="text-lg font-bold">Add a product.</h3>
            <p className="py-4 flex flex-col justify-between items-center gap-2">
              <label htmlFor="name">Upload image</label>
              <input onChange={handleImageUpload} type="file" className="outline outline-1 p-2 rounded-lg" />
              <label htmlFor="name">Product name</label>
              <input onChange={handleProductName} type="text" className="outline outline-1 p-2 rounded-lg" />
              <label htmlFor="name">Price</label>
              <input onChange={handlePriceChange} type="number" className="outline outline-1 p-2 rounded-lg" />
              <label htmlFor="name">Quantity</label>
              <input onChange={handleQuantityChange} type="number" className="outline outline-1 p-2 rounded-lg" />
            </p>

            <button disabled={false} type="submit" className="btn w-[100px] bg-base-300 place-self-end">
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
