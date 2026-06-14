"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";

interface Props {
  id: string;
  name: string;
  price: number;
}

export default function AddToCartButton({ id, name, price }: Props) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const cartItem = items.find((item) => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="relative h-10 w-28 shrink-0">
      <AnimatePresence mode="wait">
        {quantity === 0 ? (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => addItem({ id, name, price })}
            className="w-full h-full bg-white border border-orange-500 text-orange-500 font-bold text-xs uppercase rounded-xl shadow-sm hover:bg-orange-50 active:bg-orange-100 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </motion.button>
        ) : (
          <motion.div
            key="qty-stepper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/10 flex items-center justify-between px-2"
          >
            <button
              onClick={() => decreaseQuantity(id)}
              className="p-1 hover:bg-orange-600 rounded-lg active:bg-orange-700 transition cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5 text-white" />
            </button>
            
            <span className="font-extrabold text-xs select-none">{quantity}</span>
            
            <button
              onClick={() => increaseQuantity(id)}
              className="p-1 hover:bg-orange-600 rounded-lg active:bg-orange-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}