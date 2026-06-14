"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  ArrowUpRight, 
  Bell, 
  ChefHat, 
  DollarSign, 
  FileText, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { getDashboardStats, getRecentOrders } from "@/services/dashboard.service";
import { useAuthStore } from "@/stores/auth.store";
import { socket } from "@/lib/socket";

// Helper function to synthesize a cool chime alert sound
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Tone 2 (Harmonic fifth)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15); // G5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.95);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.85);
    osc2.stop(ctx.currentTime + 1.0);
  } catch (err) {
    console.error("Audio playback blocked or failed:", err);
  }
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId;

  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    servedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any | null>(null);

  // Fetch initial dashboard stats & recent orders
  const loadDashboardData = async () => {
    if (!restaurantId) return;
    try {
      const statsData = await getDashboardStats(restaurantId);
      const ordersData = await getRecentOrders(restaurantId);
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [restaurantId]);

  // Handle live WebSocket updates
  useEffect(() => {
    if (!restaurantId) return;

    // Join the restaurant socket room
    socket.emit("join_restaurant", restaurantId);
    console.log("Socket: Joined restaurant room:", restaurantId);

    // Listen for incoming orders
    const handleNewOrder = (data: any) => {
      console.log("Socket received new order:", data);
      
      // Synthesize chime alert sound
      playChime();

      // Show toast banner
      setToast({
        id: data.orderId,
        orderNumber: data.orderNumber,
        tableNumber: data.tableNumber,
        totalAmount: data.totalAmount,
      });

      // Update statistics locally
      setStats((prev: any) => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pendingOrders: prev.pendingOrders + 1,
      }));

      // Prepend order to feed
      setRecentOrders((prev) => [
        {
          id: data.orderId,
          orderNumber: data.orderNumber,
          tableNumber: data.tableNumber,
          totalAmount: data.totalAmount,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    };

    // Listen for order status updates
    const handleStatusUpdate = (data: any) => {
      console.log("Socket received order status update:", data);
      
      // Reload the stats to keep everything accurate
      loadDashboardData();
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, [restaurantId]);

  // Auto-hide toast notification after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define stat cards
  const cards = [
    { 
      label: "Total Sales", 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
    },
    { 
      label: "Total Orders", 
      value: stats.totalOrders, 
      icon: ShoppingBag, 
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20" 
    },
    { 
      label: "Pending Orders", 
      value: stats.pendingOrders, 
      icon: AlertCircle, 
      color: stats.pendingOrders > 0 
        ? "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse-glow" 
        : "bg-slate-500/10 text-slate-600 border-slate-500/20"
    },
    { 
      label: "Cooking Now", 
      value: stats.preparingOrders, 
      icon: ChefHat, 
      color: "bg-orange-500/10 text-orange-600 border-orange-500/20" 
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 relative"
    >
      {/* Decorative background blur blobs for high-end visual design */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none z-0"></div>
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0a0f1d] border border-orange-500/40 rounded-2xl p-4 shadow-2xl shadow-orange-500/10 max-w-sm w-full text-white flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 animate-bounce">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-orange-400">NEW ORDER IN!</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">Table {toast.tableNumber}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Order #{toast.orderNumber.split("-")[1]?.slice(-6) || toast.orderNumber}</p>
              <p className="text-sm font-extrabold text-white">Amount: ₹{toast.totalAmount}</p>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time insights and order logs for your restaurant.
          </p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <Link 
            href="/owner/kitchen" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-500/15 transition flex items-center gap-2 text-sm"
          >
            <ChefHat className="w-4 h-4" />
            Kitchen Terminal
          </Link>
        </motion.div>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ 
                y: -6, 
                scale: 1.02,
                boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.08)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: i * 0.05 
              }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{c.label}</span>
                <h3 className="text-2xl font-black text-slate-800">{c.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Split Layout: Left - Recent Orders, Right - Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left 2 Columns: Recent Orders Feed */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Recent Orders Feed
            </h3>
            <span className="text-xs text-slate-400 font-medium">Auto-updating</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-medium">No orders received yet.</p>
                <p className="text-xs font-light mt-1">Orders will pop up here in real-time when customers scan and order.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-4">Order Code</th>
                      <th className="p-4">Table</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.slice(0, 8).map((order, index) => (
                      <motion.tr 
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        className="hover:bg-slate-50/50 transition border-b border-slate-100 last:border-b-0"
                      >
                        <td className="p-4 font-bold text-slate-700">
                          #{order.orderNumber.split("-")[1]?.slice(-6) || order.orderNumber}
                        </td>
                        <td className="p-4 font-semibold text-slate-600">
                          Table {order.tableNumber}
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          ₹{order.totalAmount}
                        </td>
                        <td className="p-4">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              order.status === "pending" 
                                ? "bg-red-50 text-red-600 border border-red-200/50" 
                                : order.status === "accepted"
                                  ? "bg-blue-50 text-blue-600 border border-blue-200/50"
                                  : order.status === "preparing"
                                    ? "bg-orange-50 text-orange-600 border border-orange-200/50"
                                    : order.status === "ready"
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                                      : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400 font-medium">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right 1 Column: Orders Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            Preparation Stats
          </h3>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-500">Pending</span>
                  <span className="text-slate-700 font-bold">{stats.pendingOrders}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-red-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-orange-500">Preparing / Cooking</span>
                  <span className="text-slate-700 font-bold">{stats.preparingOrders}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalOrders > 0 ? (stats.preparingOrders / stats.totalOrders) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-500">Ready to Serve</span>
                  <span className="text-slate-700 font-bold">{stats.readyOrders}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalOrders > 0 ? (stats.readyOrders / stats.totalOrders) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Completed & Served</span>
                  <span className="text-slate-700 font-bold">{stats.servedOrders}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-slate-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalOrders > 0 ? (stats.servedOrders / stats.totalOrders) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2 text-center">
              <span className="text-xs text-slate-400 font-medium">Total Orders Handled: {stats.totalOrders}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}