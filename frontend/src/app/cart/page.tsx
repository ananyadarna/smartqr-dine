"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  FileText, 
  ShoppingBag, 
  Trash2, 
  Utensils 
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { createOrder } from "@/services/order.service";
import AddToCartButton from "@/components/ui/AddToCartButton";

export default function CartPage() {
  const router = useRouter();
  
  const items = useCartStore((state) => state.items);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const tableId = useCartStore((state) => state.tableId);
  const tableCode = useCartStore((state) => state.tableCode);
  const tableSessionId = useCartStore((state) => state.tableSessionId);
  const clearCart = useCartStore((state) => state.clearCart);

  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!restaurantId || !tableId || items.length === 0) {
      setError("Session context invalid. Please scan a table QR code again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        restaurantId,
        tableId,
        tableSessionId,
        items: items.map((item) => ({
          foodId: item.id,
          quantity: item.quantity,
        })),
        customerNote,
      };

      const order = await createOrder(payload);

      // Clear the local cart items
      clearCart();

      // Go to real-time status tracker page
      router.push(`/order/${order.id}`);
    } catch (err: any) {
      console.error("Failed to place order:", err);
      setError(err.response?.data?.error || "Failed to submit order. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!tableCode && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-extrabold text-lg">No Active Scan Found</h2>
        <p className="text-xs text-slate-400 max-w-xs mt-2 font-light">
          Please scan the QR code located on your dining table to browse the menu and start ordering.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Header navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/40 z-40 px-6 py-4 flex items-center gap-3">
        <Link 
          href={tableCode ? `/menu/${tableCode}` : "/"} 
          className="p-1 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">
          My Cart Summary
        </h1>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Error notification banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-650 p-4 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Empty Cart layout */}
        {items.length === 0 ? (
          <div className="bg-white border border-slate-200/50 rounded-3xl p-10 text-center shadow-sm flex flex-col items-center py-16">
            <ShoppingBag className="w-12 h-12 text-slate-200 mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Your cart is empty</h3>
            <p className="text-xs text-slate-400 font-light mt-1 mb-6">Browse the menu to add delicious dishes!</p>
            <Link
              href={`/menu/${tableCode}`}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl shadow-md shadow-orange-500/15 transition cursor-pointer"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Added Items List Card */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider px-1">Added Items</h3>
              
              <div className="bg-white border border-slate-200/50 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: -50 }}
                      className="p-4 flex justify-between items-center gap-4 hover:bg-slate-50/20 transition"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                        <span className="font-extrabold text-slate-400 text-xs block">₹{item.price} each</span>
                      </div>

                      {/* AddToCart quantity controller component */}
                      <AddToCartButton id={item.id} name={item.name} price={item.price} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Chef Instructions TextArea */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                Cooking Instructions
              </h3>
              
              <div className="bg-white border border-slate-200/50 rounded-2xl p-4 shadow-sm">
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="e.g. Make it extra spicy, no onions, allergies warning..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-orange-500 rounded-xl px-4 py-3 outline-none text-slate-800 text-xs transition resize-none font-medium"
                />
              </div>
            </div>

            {/* Bill Details Invoice */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Bill Details</h3>
              
              <div className="space-y-2.5 text-xs border-b border-slate-100 pb-3">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Subtotal Amount</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Taxes & Service Charge</span>
                  <span className="text-emerald-600 font-bold">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-extrabold text-sm text-slate-850">Grand Total</span>
                <span className="font-black text-lg text-orange-600">₹{total}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-650 active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl cursor-pointer shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Send Order to Kitchen
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </>
        )}

      </div>
    </div>
  );
}