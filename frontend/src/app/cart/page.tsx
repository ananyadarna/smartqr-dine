"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/stores/cart.store";
import { createOrder } from "@/services/order.service";

export default function CartPage() {
  const router = useRouter();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const [customerNote, setCustomerNote] = useState("");

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    try {
      const payload = {
        restaurantId: "6a2cf4ef79599d73f316c229",
        tableId: "6a2d23fb8dcc0170f55836c6",
        items: items.map((item) => ({
          foodId: item.id,
          quantity: item.quantity,
        })),
        customerNote,
      };

      const order = await createOrder(payload);

      clearCart();
      router.push(`/order/${order.id}`);
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Cart</h1>

      {items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded p-4"
              >
                <h2 className="font-medium">{item.name}</h2>

                <div className="flex items-center gap-3 my-2">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="px-3 py-1 border rounded cursor-pointer"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="px-3 py-1 border rounded cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <p>₹{item.price}</p>
                <p className="font-semibold">
                  Subtotal: ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Special instructions..."
              className="w-full border rounded p-3"
            />
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">
              Total: ₹{total}
            </h2>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded cursor-pointer transition"
          >
            Place Order
          </button>
        </>
      )}
    </div>
  );
}