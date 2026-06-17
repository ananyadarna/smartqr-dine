"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ChefHat, 
  Clock, 
  Heart, 
  Loader2, 
  PartyPopper, 
  ShoppingBag, 
  UtensilsCrossed,
  Bell,
  ShoppingCart
} from "lucide-react";
import { getOrder, getOrdersByTable, getOrdersBySession } from "@/services/order.service";
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
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);

  // Fetch initial order details
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { orderId } = await params;
        const data = await getOrder(orderId);
        setOrder(data);
        if (data.tableSessionId) {
          const orders = await getOrdersBySession(data.tableSessionId);
          setTableOrders(orders);
        } else if (data.tableId) {
          const orders = await getOrdersByTable(data.tableId);
          setTableOrders(orders);
        }
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
      
      const hasOrder = tableOrders.some((o: any) => o.id === data.orderId);
      const isCurrentOrder = data.orderId === order.id;

      if (isCurrentOrder || hasOrder) {
        // Play notification chime
        playStatusChime();

        if (isCurrentOrder) {
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

        // Update in tableOrders too
        setTableOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === data.orderId
              ? { ...o, status: data.status }
              : o
          )
        );
      }
    };

    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, [order, tableOrders]);

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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          Title: "Received",
          Description: "The kitchen is reviewing your order",
          Icon: <ShoppingBag className="w-7 h-7 text-[#A14E1B]" />,
          EstTime: "Est. 10 MIN REMAINING",
          StepIndex: 0,
        };
      case "accepted":
        return {
          Title: "Confirmed",
          Description: "The kitchen has confirmed your order",
          Icon: <Check className="w-7 h-7 text-[#A14E1B]" />,
          EstTime: "Est. 8 MIN REMAINING",
          StepIndex: 0,
        };
      case "preparing":
        return {
          Title: "Preparing",
          Description: "The chef is crafting your order",
          Icon: <UtensilsCrossed className="w-7 h-7 text-[#A14E1B]" />,
          EstTime: "Est. 6 MIN REMAINING",
          StepIndex: 1,
        };
      case "ready":
        return {
          Title: "Ready to Serve",
          Description: "Your order is hot and ready!",
          Icon: <ChefHat className="w-7 h-7 text-[#A14E1B]" />,
          EstTime: "READY",
          StepIndex: 2,
        };
      case "served":
        return {
          Title: "Served",
          Description: "Enjoy your delicious meal!",
          Icon: <PartyPopper className="w-7 h-7 text-[#A14E1B]" />,
          EstTime: "SERVED",
          StepIndex: 3,
        };
      default:
        return {
          Title: "Pending",
          Description: "Waiting for kitchen response",
          Icon: <UtensilsCrossed className="w-7 h-7 text-[#A14E1B]" />,
          EstTime: "Est. -- MIN REMAINING",
          StepIndex: 0,
        };
    }
  };

  // Helper to merge duplicate items (same foodId and customizations key)
  const mergeOrderItems = (ordersList: any[]) => {
    const mergedMap = new Map<string, any>();
    ordersList.forEach(o => {
      if (!o.items) return;
      o.items.forEach((item: any) => {
        const customizationsKey = item.customizations 
          ? [...item.customizations].sort().join(",") 
          : "";
        const key = `${item.foodId}_${customizationsKey}`;
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key);
          existing.quantity += item.quantity;
        } else {
          mergedMap.set(key, { ...item });
        }
      });
    });
    return Array.from(mergedMap.values());
  };

  // Find the current tracked order's creation time
  const currentOrderInList = tableOrders.find((o: any) => o.id === order.id) || order;
  const currentOrderCreatedAt = currentOrderInList?.createdAt ? new Date(currentOrderInList.createdAt).getTime() : 0;

  // Divide tableOrders into previous, current, subsequent
  const previousOrders = tableOrders.filter((o: any) => {
    if (o.id === order.id) return false;
    const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return t < currentOrderCreatedAt;
  });

  const subsequentOrders = tableOrders.filter((o: any) => {
    if (o.id === order.id) return false;
    const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return t > currentOrderCreatedAt;
  });

  const previousItems = mergeOrderItems(previousOrders);
  const currentItems = mergeOrderItems([currentOrderInList]);
  const subsequentItems = mergeOrderItems(subsequentOrders);

  const previousSubtotal = previousItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currentSubtotal = currentItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subsequentSubtotal = subsequentItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const grandTotal = previousSubtotal + currentSubtotal + subsequentSubtotal;

  // Active preparation status driven by the latest active order (the one they are actively waiting for)
  const activeOrder = [...tableOrders]
    .reverse()
    .find((o: any) => o.status !== "served") || tableOrders[tableOrders.length - 1] || order;

  const statusInfo = getStatusInfo(activeOrder.status);

  const horizontalSteps = [
    {
      label: "Received",
      icon: ShoppingBag,
      activeSub: "Received",
      completedSub: activeOrder.createdAt ? new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Done",
      inactiveSub: "--:--",
    },
    {
      label: "Preparing",
      icon: UtensilsCrossed,
      activeSub: "In Progress",
      completedSub: "Prepared",
      inactiveSub: "Waiting",
    },
    {
      label: "Ready",
      icon: ChefHat,
      activeSub: "Waiting",
      completedSub: "Ready",
      inactiveSub: "Waiting",
    },
    {
      label: "Served",
      icon: PartyPopper,
      activeSub: "Served",
      completedSub: "Served",
      inactiveSub: "--:--",
    },
  ];

  // Handle waiter resolved events and join socket room
  useEffect(() => {
    if (!order) return;

    socket.emit("join_restaurant", order.restaurantId);

    const handleWaiterResolved = (data: any) => {
      console.log("Guest received waiter resolved:", data);
      if (data.tableId === order.tableId) {
        setWaiterCalled(false);
      }
    };

    socket.on("waiter_resolved", handleWaiterResolved);

    return () => {
      socket.off("waiter_resolved", handleWaiterResolved);
    };
  }, [order]);

  const handleCallWaiter = () => {
    if (!order) return;

    socket.emit("call_waiter", {
      restaurantId: order.restaurantId,
      tableId: order.tableId,
      tableNumber: order.tableNumber,
      tableName: order.tableName,
    });

    setWaiterCalled(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 relative">
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
          href={`/scan/${activeOrder.tableCode || order.tableCode || ""}`}
          className="text-xs text-orange-500 hover:text-orange-600 font-bold border border-orange-500/20 hover:border-orange-500/30 px-3 py-1.5 rounded-lg transition"
        >
          Order More
        </Link>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Top: Status Summary Card */}
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-3xl p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Cutler Icon */}
            <div className="w-16 h-16 rounded-2xl bg-orange-500/5 flex items-center justify-center mb-4 border border-orange-500/10 text-[#A14E1B]">
              {statusInfo.Icon}
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-black text-[#A14E1B] tracking-tight">
              {statusInfo.Title}
            </h2>
            
            {/* Description */}
            <p className="text-slate-400 text-xs mt-2 max-w-[240px] font-medium leading-relaxed">
              {statusInfo.Description}
            </p>
            
            {/* Order Reference Number */}
            <span className="text-[10px] text-slate-450 font-mono mt-3.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg block font-semibold">
              #{activeOrder.orderNumber.split("-")[1]?.slice(-6) || activeOrder.orderNumber}
            </span>
          </motion.div>

          {/* Overlapping Est. remaining time capsule */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="-mt-5.5 z-10 bg-[#0e1629] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 border border-[#1e293b]"
          >
            <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-sans">
              {statusInfo.EstTime}
            </span>
          </motion.div>
        </div>

        {/* Stepper Progress Timeline (Horizontal) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-100"
        >
          <div className="relative flex items-center justify-between px-2 py-4">
            {/* Background Gray Line */}
            <div className="absolute left-6 right-6 top-[36px] -translate-y-1/2 h-0.5 bg-slate-100 pointer-events-none"></div>
            
            {/* Active Orange Line */}
            <div className="absolute left-6 right-6 top-[36px] -translate-y-1/2 h-0.5 pointer-events-none">
              <motion.div 
                className="h-full bg-orange-500"
                initial={{ width: "0%" }}
                animate={{ width: `${(statusInfo.StepIndex / 3) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* Stepper Dots */}
            {horizontalSteps.map((stepItem, idx) => {
              const isCompleted = statusInfo.StepIndex > idx;
              const isActive = statusInfo.StepIndex === idx;
              const StepIcon = stepItem.icon;
              
              return (
                <div key={idx} className="z-10 flex flex-col items-center text-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted 
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                        : isActive 
                          ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 animate-pulse-glow" 
                          : "bg-white border-slate-100 text-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white stroke-[3px]" />
                    ) : (
                      <StepIcon className={`w-4 h-4 ${isActive ? "text-white animate-pulse" : "text-slate-400"}`} />
                    )}
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <span className={`block text-[11px] font-black tracking-tight ${
                      isActive || isCompleted ? "text-[#A14E1B]" : "text-slate-450"
                    }`}>
                      {stepItem.label}
                    </span>
                    <span className="block text-[9px] text-slate-450 font-medium whitespace-nowrap">
                      {isActive ? stepItem.activeSub : isCompleted ? stepItem.completedSub : stepItem.inactiveSub}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions (Call Waiter & Order More) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            onClick={handleCallWaiter}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-slate-100 hover:bg-slate-200/80 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-350 gap-2.5 border border-slate-200/30"
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-orange-600">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Call Waiter</span>
          </motion.button>

          <Link href={`/scan/${activeOrder.tableCode || order.tableCode || ""}`} className="block w-full">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-100 hover:bg-slate-200/80 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-350 gap-2.5 border border-slate-200/30 h-full w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-orange-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Order More</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Order Details: Items summary receipt */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4"
        >
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 flex justify-between items-center">
            <span>Your Table {activeOrder.tableName || activeOrder.tableNumber || order.tableName || order.tableNumber}</span>
            <span className="text-[10px] text-slate-400 normal-case font-mono">Session Bill</span>
          </h3>
          
          <div className="space-y-6">
            {/* Section 1: Previous Orders */}
            {previousItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 px-2.5 py-1.5 rounded-lg">
                  <span>Previously Ordered</span>
                  <span className="text-[#A14E1B]">Subtotal: ₹{previousSubtotal}</span>
                </div>
                <div className="divide-y divide-slate-50/50">
                  {previousItems.map((item: any, idx: number) => (
                    <div key={item.foodId || idx} className="flex justify-between items-center py-2.5 px-1">
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-orange-50/5 flex items-center justify-center shrink-0 border border-orange-500/5 text-[#A14E1B]">
                            <UtensilsCrossed className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-slate-750 text-xs font-black block truncate">{item.name}</span>
                          <span className="text-slate-400 text-[10px] font-bold block mt-0.5">
                            x{item.quantity} {item.customizations && item.customizations.length > 0 ? `• ${item.customizations.join(", ")}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-700 text-xs font-black shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: This Order */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-450 font-black uppercase tracking-wider bg-orange-500/5 text-orange-700 px-2.5 py-1.5 rounded-lg border border-orange-500/10">
                <span>This Order</span>
                <span>Subtotal: ₹{currentSubtotal}</span>
              </div>
              <div className="divide-y divide-slate-50/50">
                {currentItems.map((item: any, idx: number) => (
                  <div key={item.foodId || idx} className="flex justify-between items-center py-2.5 px-1">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-orange-500/5 flex items-center justify-center shrink-0 border border-orange-500/10 text-[#A14E1B]">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-slate-850 text-xs font-black block truncate">{item.name}</span>
                        <span className="text-slate-400 text-[10px] font-bold block mt-0.5">
                          x{item.quantity} {item.customizations && item.customizations.length > 0 ? `• ${item.customizations.join(", ")}` : ""}
                        </span>
                      </div>
                    </div>
                    <span className="text-slate-800 text-xs font-black shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Ordered After */}
            {subsequentItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 px-2.5 py-1.5 rounded-lg">
                  <span>Ordered After</span>
                  <span className="text-[#A14E1B]">Subtotal: ₹{subsequentSubtotal}</span>
                </div>
                <div className="divide-y divide-slate-50/50">
                  {subsequentItems.map((item: any, idx: number) => (
                    <div key={item.foodId || idx} className="flex justify-between items-center py-2.5 px-1">
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-orange-50/5 flex items-center justify-center shrink-0 border border-orange-500/5 text-[#A14E1B]">
                            <UtensilsCrossed className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-slate-750 text-xs font-black block truncate">{item.name}</span>
                          <span className="text-slate-400 text-[10px] font-bold block mt-0.5">
                            x{item.quantity} {item.customizations && item.customizations.length > 0 ? `• ${item.customizations.join(", ")}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-700 text-xs font-black shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {order.customerNote && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 leading-normal font-medium italic mt-4">
              <strong>Instructions note:</strong> "{order.customerNote}"
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-500">Total Session Amount</span>
            <span className="text-[#A14E1B] text-lg font-black">₹{grandTotal}</span>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 py-4">
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          Thank you for dining with us!
        </div>

      </div>

      {/* Summon Waiter Live Toast Notification */}
      <AnimatePresence>
        {waiterCalled && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-[#0e1629] text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-orange-400 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-xs">Waiter Summoned!</h4>
              <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                A server will be at your table shortly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}