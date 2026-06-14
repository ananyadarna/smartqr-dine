"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Check, 
  ChefHat, 
  Clock, 
  Heart, 
  Loader2, 
  PartyPopper, 
  ShoppingBag, 
  Sparkles, 
  UtensilsCrossed 
} from "lucide-react";
import { getOrder } from "@/services/order.service";
import { socket } from "@/lib/socket";

// Helper function to synthesize status chime
const playStatusChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Tone 1
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch (err) {
    console.error("Audio chime playback blocked:", err);
  }
};

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderPage({ params }: PageProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial order details
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { orderId } = await params;
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [params]);

  // Handle live status broadcasts
  useEffect(() => {
    if (!order) return;

    const handleStatusUpdate = (data: any) => {
      console.log("Diner socket received status update:", data);
      if (data.orderId === order.id) {
        // Play notification chime
        playStatusChime();

        // Update local status states
        setOrder((prev: any) => ({
          ...prev,
          status: data.status,
          progress: {
            pending: true,
            accepted: ["accepted", "preparing", "ready", "served"].includes(data.status),
            preparing: ["preparing", "ready", "served"].includes(data.status),
            ready: ["ready", "served"].includes(data.status),
            served: data.status === "served",
          },
        }));
      }
    };

    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-slate-300 animate-spin mb-4" />
        <h2 className="font-extrabold text-lg">Order Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs font-light">We couldn't retrieve the details for this order code.</p>
      </div>
    );
  }

  const steps = [
    { key: "pending", label: "Order Received", desc: "Sent to the kitchen." },
    { key: "accepted", label: "Confirmed", desc: "Chef is reviewing." },
    { key: "preparing", label: "Cooking", desc: "Preparing your food." },
    { key: "ready", label: "Ready to Serve", desc: "Dish is hot and ready!" },
    { key: "served", label: "Delivered", desc: "Delivered to table. Enjoy!" },
  ];

  // Helper to check step state
  const isStepActive = (stepKey: string) => {
    if (order.status === stepKey) return true;
    return false;
  };

  const isStepDone = (stepKey: string) => {
    return order.progress[stepKey] === true;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header bar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/40 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-orange-600" />
          </div>
          <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">
            Order Status Tracker
          </h1>
        </div>
        
        {/* Link back to menu */}
        <Link 
          href={`/scan/${order.tableCode || ""}`}
          className="text-xs text-orange-500 hover:text-orange-600 font-bold border border-orange-500/20 hover:border-orange-500/30 px-3 py-1.5 rounded-lg transition"
        >
          Order More
        </Link>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Dynamic header summary card */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
          {order.status === "served" && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-tr from-emerald-500/20 to-emerald-500/40 rounded-bl-full flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-emerald-600 -translate-x-1.5 translate-y-1.5" />
            </div>
          )}

          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-1">
            Order #{order.orderNumber.split("-")[1]?.slice(-6) || order.orderNumber}
          </span>
          <h2 className="text-2xl font-black text-slate-800">
            {order.status === "pending" && "Waiting for Kitchen"}
            {order.status === "accepted" && "Confirmed!"}
            {order.status === "preparing" && "Chef is Cooking"}
            {order.status === "ready" && "Ready to Serve!"}
            {order.status === "served" && "Served! Bon Appétit"}
          </h2>
          <p className="text-xs text-slate-400 font-light mt-1.5 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Updates in real-time</span>
          </p>
        </div>

        {/* Live Stepper Progress Timeline */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider border-b border-slate-50 pb-2.5">
            Timeline
          </h3>
          
          <div className="relative pl-10 space-y-7">
            {/* Stepper bar vertical lines */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100 pointer-events-none"></div>
            
            {steps.map((st, idx) => {
              const active = isStepActive(st.key);
              const done = isStepDone(st.key);
              
              return (
                <div key={st.key} className="relative flex items-start gap-4">
                  {/* Stepper Bubble Indicator */}
                  <div 
                    className={`absolute -left-10 top-0.5 w-8.5 h-8.5 rounded-full flex items-center justify-center border-2 transition ${
                      done 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10" 
                        : active 
                          ? "bg-white border-orange-500 text-orange-500 shadow-md shadow-orange-500/20 animate-pulse-glow" 
                          : "bg-white border-slate-100 text-slate-350"
                    }`}
                  >
                    {done ? (
                      <Check className="w-4 h-4 text-white font-bold" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    )}
                  </div>

                  {/* Stepper Text Details */}
                  <div className="space-y-0.5">
                    <h4 className={`font-bold text-sm leading-normal ${
                      active ? "text-orange-500" : done ? "text-slate-800" : "text-slate-400"
                    }`}>
                      {st.label}
                    </h4>
                    <p className={`text-[11px] font-medium leading-normal ${
                      active ? "text-orange-400" : "text-slate-400"
                    }`}>
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Invoice summary */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider border-b border-slate-50 pb-2">
            Items Summary
          </h3>
          
          <div className="space-y-3">
            {order.items.map((item: any, idx: number) => (
              <div key={item.foodId || idx} className="flex justify-between items-center text-xs font-semibold">
                <div className="min-w-0 pr-4">
                  <span className="text-slate-700 block truncate">{item.name}</span>
                  <span className="text-slate-400 font-medium block">Qty: {item.quantity} × ₹{item.price}</span>
                </div>
                <span className="text-slate-800 shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {order.customerNote && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 leading-normal font-medium italic">
              <strong>Instructions note:</strong> "{order.customerNote}"
            </div>
          )}

          <div className="border-t border-slate-50 pt-3 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-500">Amount Paid</span>
            <span className="text-slate-850 text-base">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Order tracking footer */}
        <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          Thank you for dining with us!
        </div>

      </div>
    </div>
  );
}