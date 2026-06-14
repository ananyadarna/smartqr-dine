"use client";

import { useCartStore } from "@/stores/cart.store";

interface Props {
  id: string;
  name: string;
  price: number;
}

export default function AddToCartButton({ id, name, price }: Props) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      onClick={() => {
        console.log("Adding item:", { id, name, price });
        addItem({ id, name, price });
      }}
      className="mt-2 bg-orange-500 text-white px-4 py-2 rounded cursor-pointer"
    >
      Add To Cart
    </button>
  );
}