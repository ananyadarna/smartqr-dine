"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  Clock, 
  Users, 
  RotateCw, 
  Volume2, 
  HandPlatter,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  RefreshCw
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { socket } from "@/lib/socket";
import { getOrdersByRestaurant, updateOrderStatus } from "@/services/order.service";
import { getTablesByRestaurant } from "@/services/table.service";

// Synthesize a warning pocket-chime sound for waiters
const playWaiterChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Tone 1: Bright notification pitch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Tone 2: Higher pitch harmony
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.55);
    osc2.stop(ctx.currentTime + 0.7);
  } catch (err) {
    console.error("Audio playback blocked or failed:", err);
  }
};

// Trigger tactile pocket vibration pattern if API supported
const triggerVibration = () => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
};

export default function WaiterTerminalPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";
  const waiterName = user?.name || "Marco Rossi";

  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveBanner, setLiveBanner] = useState<string | null>(null);

  // Fetch tables and orders
  const loadData = async () => {
    if (!restaurantId) return;
    try {
      const allOrders = await getOrdersByRestaurant(restaurantId);
      const allTables = await getTablesByRestaurant(restaurantId);
      setOrders(allOrders);
      setTables(allTables);
    } catch (err) {
      console.error("Failed to load waiter dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  // Set up socket listeners
  useEffect(() => {
    if (!restaurantId || !isOnline) return;

    const joinRoom = () => {
      console.log("Waiter rejoining restaurant socket room:", restaurantId);
      socket.emit("join_restaurant", restaurantId);
    };

    joinRoom();
    socket.on("connect", joinRoom);

    const handleWaiterCalled = (data: any) => {
      console.log("Waiter received live call:", data);
      playWaiterChime();
      triggerVibration();
      
      setLiveBanner(`Table ${data.tableNumber} is calling for service!`);
      setTimeout(() => setLiveBanner(null), 5000);

      setWaiterCalls((prev) => {
        if (prev.some((call) => call.tableId === data.tableId)) return prev;
        return [...prev, { ...data, timestamp: new Date(), claimedBy: null }];
      });
    };

    const handleWaiterClaimed = (data: any) => {
      console.log("Waiter call claimed:", data);
      setWaiterCalls((prev) =>
        prev.map((call) =>
          call.tableId === data.tableId 
            ? { ...call, claimedBy: data.waiterName } 
            : call
        )
      );
    };

    const handleWaiterResolved = (data: any) => {
      console.log("Waiter call resolved:", data);
      setWaiterCalls((prev) => prev.filter((call) => call.tableId !== data.tableId));
    };

    const handleOrderStatusUpdate = (data: any) => {
      console.log("Order status updated:", data);
      if (data.status === "ready") {
        playWaiterChime();
        triggerVibration();
        setLiveBanner(`Order #${data.orderNumber.split("-")[1]?.slice(-6) || data.orderNumber} is ready for pickup!`);
        setTimeout(() => setLiveBanner(null), 5000);
      }
      loadData();
    };

    const handleNewOrder = () => {
      loadData();
    };

    socket.on("waiter_called", handleWaiterCalled);
    socket.on("waiter_claimed", handleWaiterClaimed);
    socket.on("waiter_resolved", handleWaiterResolved);
    socket.on("order_status_updated", handleOrderStatusUpdate);
    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("waiter_called", handleWaiterCalled);
      socket.off("waiter_claimed", handleWaiterClaimed);
      socket.off("waiter_resolved", handleWaiterResolved);
      socket.off("order_status_updated", handleOrderStatusUpdate);
      socket.off("new_order", handleNewOrder);
    };
  }, [restaurantId, isOnline]);

  // Claim a summons call (State Lock)
  const handleClaimCall = (tableId: string) => {
    if (!isOnline) return;
    socket.emit("claim_waiter", {
      restaurantId,
      tableId,
      waiterName
    });

    setWaiterCalls((prev) =>
      prev.map((call) =>
        call.tableId === tableId 
          ? { ...call, claimedBy: waiterName } 
          : call
      )
    );
  };

  // Resolve a summons call
  const handleResolveCall = (tableId: string) => {
    if (!isOnline) return;
    socket.emit("resolve_waiter", {
      restaurantId,
      tableId
    });

    setWaiterCalls((prev) => prev.filter((call) => call.tableId !== tableId));
  };

  // Deliver ready food and mark status as served
  const handleMarkServed = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "served");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      loadData(); // Reload to refresh table statuses
    } catch (err) {
      console.error("Failed to mark order as served:", err);
    }
  };

  // Get elapsed minutes text
  const getElapsedText = (timestamp: any) => {
    const elapsed = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    return elapsed <= 0 ? "Requested just now" : `Requested ${elapsed}m ago`;
  };

  // Filter ready orders for pickup queue
  const readyPickups = useMemo(() => {
    return orders.filter((o) => o.status === "ready");
  }, [orders]);

  // Compute My Tables status grid dynamically
  const tablesStatusGrid = useMemo(() => {
    return tables.map((t) => {
      // Find orders for this table in the current active session
      const tableOrders = orders.filter(
        (o) => String(o.tableNumber) === String(t.tableNumber) && o.tableSessionId === t.currentSessionId
      );

      let statusLabel = "AVAILABLE";
      let statusColor = "text-emerald-500 bg-emerald-50 border-emerald-100";
      let dotColor = "bg-emerald-500";
      let description = "Available";

      if (tableOrders.length > 0) {
        const allServed = tableOrders.every((o) => o.status === "served");
        const hasReady = tableOrders.some((o) => o.status === "ready");
        const hasPrep = tableOrders.some((o) => ["accepted", "preparing"].includes(o.status));
        const hasPending = tableOrders.some((o) => o.status === "pending");

        if (allServed) {
          statusLabel = "EATING";
          statusColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
          dotColor = "bg-indigo-500";
          description = "Guests eating...";
        } else if (hasReady) {
          statusLabel = "EATS READY";
          statusColor = "text-orange-600 bg-orange-50 border-orange-100";
          dotColor = "bg-orange-500";
          description = "Pickup Waiting";
        } else if (hasPrep) {
          statusLabel = "OCCUPIED";
          statusColor = "text-blue-600 bg-blue-50 border-blue-100";
          dotColor = "bg-blue-500";
          description = "Cooking...";
        } else if (hasPending) {
          statusLabel = "ORDERING...";
          statusColor = "text-amber-600 bg-amber-50 border-amber-100 border-dashed animate-pulse";
          dotColor = "bg-amber-500";
          description = "Pending Approval";
        }
      }

      // Estimate guest count from order items or fallback to default
      const latestOrder = tableOrders[tableOrders.length - 1];
      const guestEstimate = latestOrder
        ? Math.min(latestOrder.items.reduce((sum: number, i: any) => sum + i.quantity, 0), 6)
        : t.tableNumber % 2 === 0 ? 4 : 2;

      // Calculate total active bill
      const totalActiveBill = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: t.id || t._id,
        tableNumber: t.tableNumber,
        tableName: t.name || `Table ${t.tableNumber}`,
        statusLabel,
        statusColor,
        dotColor,
        description,
        guestCount: guestEstimate,
        activeBill: totalActiveBill,
      };
    }).sort((a, b) => a.tableNumber - b.tableNumber);
  }, [tables, orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#A14E1B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 max-w-md mx-auto bg-slate-50 min-h-screen pb-12 px-4 pt-4 relative select-none">
      
      {/* Live Socket Event Banner Alert */}
      <AnimatePresence>
        {liveBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 z-50 bg-[#0e1629] text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-orange-500/20"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-orange-400 animate-bounce" />
            </div>
            <span className="text-xs font-bold">{liveBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Profile Box */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          {/* Avatar frame */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-black text-orange-700 text-sm">
              {waiterName.split(" ").map(n => n[0]).join("")}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">{waiterName}</h2>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Section A • Floor 1</span>
          </div>
        </div>

        {/* Online Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center ${
              isOnline ? "bg-orange-500 justify-end" : "bg-slate-200 justify-start"
            }`}
          >
            <motion.div 
              layout 
              className="w-5.5 h-5.5 bg-white rounded-full shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* 2. Urgent Calls Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Urgent Calls</h3>
          </div>
          {waiterCalls.length > 0 && (
            <span className="text-[9px] bg-red-50 text-red-600 border border-red-150 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
              {waiterCalls.length} Active
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {waiterCalls.length === 0 ? (
            <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 bg-white rounded-2xl p-6">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">All Tables Attended</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-light">Summons will populate here in real-time.</p>
            </div>
          ) : (
            waiterCalls.map((call) => {
              const isClaimedByMe = call.claimedBy === waiterName;
              const isClaimedByOther = call.claimedBy && call.claimedBy !== waiterName;

              return (
                <motion.div
                  key={call.tableId}
                  layout
                  className={`bg-white border rounded-2xl p-3 shadow-sm flex items-center justify-between gap-4 transition ${
                    isClaimedByOther 
                      ? "border-slate-150 opacity-55 bg-slate-50/50" 
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Table Indicator Box */}
                    <div className={`w-11 h-11 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                      isClaimedByOther
                        ? "bg-slate-100 text-slate-400"
                        : "bg-red-500/10 text-red-600 border border-red-500/20"
                    }`}>
                      {String(call.tableNumber).padStart(2, "0")}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs leading-snug">
                        {isClaimedByOther ? "Assisting Table..." : "Assistance Call"}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        {isClaimedByOther ? `Claimed by ${call.claimedBy}` : getElapsedText(call.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Claim/Resolve Button */}
                  <div>
                    {!call.claimedBy ? (
                      <button
                        onClick={() => handleClaimCall(call.tableId)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm shadow-orange-500/15"
                      >
                        Acknowledge
                      </button>
                    ) : isClaimedByMe ? (
                      <button
                        onClick={() => handleResolveCall(call.tableId)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm shadow-emerald-500/15"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[8px] bg-slate-100 text-slate-450 border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold">
                        Claimed
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Ready for Pickup Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <HandPlatter className="w-5 h-5 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Ready for Pickup</h3>
          </div>
          {readyPickups.length > 0 && (
            <span className="text-[10px] text-orange-500 font-extrabold uppercase tracking-wider">
              {readyPickups.length} Orders
            </span>
          )}
        </div>

        {readyPickups.length === 0 ? (
          <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 bg-white rounded-2xl p-6">
            <HandPlatter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Pickup Counter Empty</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-light">Chefs are preparing active orders.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none snap-x">
            {readyPickups.map((order) => {
              const elapsedMinutes = Math.floor((Date.now() - new Date(order.updatedAt || order.createdAt).getTime()) / 60000);

              return (
                <div 
                  key={order.id}
                  className="w-64 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0 flex flex-col justify-between space-y-4 snap-start"
                >
                  <div className="flex justify-between items-start border-b border-slate-50 pb-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">TABLE</span>
                      <span className="font-black text-slate-850 text-base">
                        {String(order.tableNumber).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">ORDER</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        #{order.orderNumber.split("-")[1]?.slice(-6) || order.orderNumber}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2 flex-1">
                    {order.items.map((item: any, idx: number) => {
                      const customizationsText = item.customizations && item.customizations.length > 0 
                        ? item.customizations.join(", ") 
                        : null;
                      return (
                        <div key={item.foodId || idx} className="flex justify-between items-start text-xs font-semibold leading-normal">
                          <span className="text-slate-700 flex-1">
                            {item.quantity}x {item.name}
                          </span>
                          {customizationsText && (
                            <span className="text-[9px] text-orange-500 italic shrink-0 max-w-[80px] truncate text-right font-medium">
                              {customizationsText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Served trigger */}
                  <button
                    onClick={() => handleMarkServed(order.id)}
                    className="w-full py-2.5 bg-[#dbeafe] hover:bg-[#c7d2fe] text-blue-700 hover:text-blue-800 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Served
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. My Tables Grid Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4.5 h-4.5 text-slate-500" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">My Tables</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {tables.length} Tables Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tablesStatusGrid.map((t) => (
            <div 
              key={t.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[100px] relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-800 text-base leading-tight">
                    T-{String(t.tableNumber).padStart(2, "0")}
                  </h4>
                  <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded border mt-1.5 ${t.statusColor}`}>
                    {t.statusLabel}
                  </span>
                </div>
                {/* Status Dot */}
                <div className={`w-2.5 h-2.5 rounded-full ${t.dotColor}`}></div>
              </div>

              <div className="flex justify-between items-end mt-4 border-t border-slate-50 pt-2 text-[9px] font-bold text-slate-450">
                <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                  {t.guestCount}p
                </span>
                {t.statusLabel === "EATS READY" ? (
                  <span className="text-orange-500 font-black animate-pulse">Pickup Waiting</span>
                ) : t.activeBill > 0 ? (
                  <span className="text-slate-500">₹{t.activeBill}</span>
                ) : (
                  <span className="text-slate-400">Available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
