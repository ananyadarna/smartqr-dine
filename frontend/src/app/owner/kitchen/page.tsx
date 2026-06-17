"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  ChefHat, 
  Clock, 
  Flame, 
  FolderCheck, 
  Inbox, 
  Play, 
  RotateCw, 
  ShoppingBag, 
  Sparkles, 
  Volume2,
  Users
} from "lucide-react";
import { getOrdersByRestaurant, updateOrderStatus } from "@/services/order.service";
import { useAuthStore } from "@/stores/auth.store";
import { socket } from "@/lib/socket";

// Helper function to synthesize a loud double chime for kitchen orders
const playKitchenChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // High Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Tone 2 (Harmonic octave pitch after delay)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.82);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.65);
    osc2.stop(ctx.currentTime + 0.85);
  } catch (err) {
    console.error("Audio chime playback failed:", err);
  }
};

export default function KitchenDashboardPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);

  // Fetch initial active orders
  const loadOrders = async () => {
    if (!restaurantId) return;
    try {
      const allOrders = await getOrdersByRestaurant(restaurantId);
      // Filter out 'served' orders to keep kitchen dashboard uncluttered
      const activeOrders = allOrders.filter((o: any) => o.status !== "served");
      setOrders(activeOrders);
    } catch (err) {
      console.error("Failed to load kitchen orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [restaurantId]);

  // Set up socket listener
  useEffect(() => {
    if (!restaurantId) return;

    socket.emit("join_restaurant", restaurantId);

    const handleNewOrder = (data: any) => {
      console.log("Kitchen received live order:", data);
      playKitchenChime();
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 5000);
      loadOrders();
    };

    const handleWaiterCalled = (data: any) => {
      console.log("Kitchen received waiter call:", data);
      playKitchenChime();
      setWaiterCalls((prev) => {
        if (prev.some((call) => call.tableId === data.tableId)) return prev;
        return [...prev, { ...data, timestamp: new Date() }];
      });
    };

    const handleWaiterResolved = (data: any) => {
      setWaiterCalls((prev) => prev.filter((call) => call.tableId !== data.tableId));
    };

    socket.on("new_order", handleNewOrder);
    socket.on("waiter_called", handleWaiterCalled);
    socket.on("waiter_resolved", handleWaiterResolved);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("waiter_called", handleWaiterCalled);
      socket.off("waiter_resolved", handleWaiterResolved);
    };
  }, [restaurantId]);

  const handleResolveWaiter = (tableId: string) => {
    socket.emit("resolve_waiter", { restaurantId, tableId });
    setWaiterCalls((prev) => prev.filter((call) => call.tableId !== tableId));
  };

  // Progress order status
  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus: "accepted" | "preparing" | "ready" | "served" = "accepted";
    
    if (currentStatus === "pending") nextStatus = "accepted";
    else if (currentStatus === "accepted") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "served";

    try {
      const data = await updateOrderStatus(orderId, nextStatus);
      
      // Update locally
      if (nextStatus === "served") {
        // Remove served orders from screen
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: data.status } : o)));
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter columns
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const cookingOrders = orders.filter((o) => ["accepted", "preparing"].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === "ready");

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Alert Header Banner */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-orange-500 text-white font-bold p-3 rounded-xl flex items-center justify-between shadow-lg shadow-orange-500/20"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 animate-bounce" />
              <span>🔔 New customer order received! Refreshing columns...</span>
            </div>
            <button onClick={() => setNewOrderAlert(false)} className="text-white font-bold px-2 py-0.5 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            Live Kitchen Terminal
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Accept and progress active dining orders. Connected to websockets.
          </p>
        </div>
        
        <button
          onClick={loadOrders}
          className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-500 transition"
          title="Manual refresh"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        
        {/* Column 1: Pending Orders */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col h-full space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-400" />
              Pending
            </span>
            <span className="bg-red-500 text-white font-black text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {pendingOrders.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-xs font-light">
                No pending orders.
              </div>
            ) : (
              pendingOrders.map((o) => (
                <KitchenOrderCard key={o.id} order={o} onAction={handleUpdateStatus} />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Cooking Orders */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col h-full space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-slate-400" />
              Preparing
            </span>
            <span className="bg-orange-500 text-white font-black text-xs px-2 py-0.5 rounded-full">{cookingOrders.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {cookingOrders.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-xs font-light">
                No active cooking.
              </div>
            ) : (
              cookingOrders.map((o) => (
                <KitchenOrderCard key={o.id} order={o} onAction={handleUpdateStatus} />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready Orders */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col h-full space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
              <FolderCheck className="w-4 h-4 text-slate-400" />
              Ready
            </span>
            <span className="bg-emerald-500 text-white font-black text-xs px-2 py-0.5 rounded-full">{readyOrders.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {readyOrders.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-xs font-light">
                No orders ready to serve.
              </div>
            ) : (
              readyOrders.map((o) => (
                <KitchenOrderCard key={o.id} order={o} onAction={handleUpdateStatus} />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Waiter Calls Notifications Panel */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {waiterCalls.map((call) => (
            <motion.div
              key={call.tableId}
              initial={{ opacity: 0, x: -100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-[#0a0f1d] border border-orange-500/40 rounded-2xl p-4 shadow-2xl shadow-orange-500/10 text-white flex items-start gap-4 pointer-events-auto"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 animate-pulse">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-orange-500 font-mono uppercase tracking-wider">WAITER SUMMONED</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full font-bold">
                    Table {call.tableNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-350 font-light mt-1">
                  Customer at {call.tableName || `Table ${call.tableNumber}`} requires assistance.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleResolveWaiter(call.tableId)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer transition shadow-md shadow-orange-500/15"
                  >
                    Resolve (Dismiss)
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Kitchen Order Card Component
function KitchenOrderCard({ order, onAction }: { order: any; onAction: (id: string, stat: string) => void }) {
  const isPending = order.status === "pending";
  const isAccepted = order.status === "accepted";
  const isPreparing = order.status === "preparing";
  const isReady = order.status === "ready";

  // Calculate elapsed time in minutes
  const elapsedMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between"
    >
      {/* Card Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="font-black text-slate-800 text-sm">
            #{order.orderNumber.split("-")[1]?.slice(-6) || order.orderNumber}
          </span>
          <h4 className="text-xs font-bold text-slate-500">Table {order.tableNumber}</h4>
        </div>
        
        {/* Elapsed Timer badge */}
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3 text-slate-400" />
          {elapsedMinutes}m ago
        </span>
      </div>

      {/* Dish Items list */}
      <div className="border-t border-b border-slate-50 py-3.5 space-y-2">
        {order.items.map((item: any, idx: number) => (
          <div key={item.foodId || idx} className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-700">{item.name}</span>
            <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-150">
              qty: {item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Customer Note (if any) */}
      {order.customerNote && (
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5 text-[10px] text-orange-700 leading-normal font-medium italic">
          <strong>Note:</strong> "{order.customerNote}"
        </div>
      )}

      {/* Action Stepper Button */}
      <button
        onClick={() => onAction(order.id, order.status)}
        className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 ${
          isPending 
            ? "bg-red-500 hover:bg-red-600 text-white" 
            : isAccepted
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : isPreparing
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
        }`}
      >
        <Play className="w-3.5 h-3.5" />
        {isPending && "Accept Order"}
        {isAccepted && "Start Cooking"}
        {isPreparing && "Order Ready"}
        {isReady && "Serve & Complete"}
      </button>
    </motion.div>
  );
}
