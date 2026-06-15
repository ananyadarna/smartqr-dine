"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  BarChart3, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Layers, 
  QrCode, 
  Smartphone, 
  Sparkles, 
  UtensilsCrossed 
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

// 3D Parallax Tilt Feature Card Component
function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    setRotateX((yc - y) / 8);
    setRotateY((x - xc) / 8);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`
          : 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'none' : 'transform 0.5s ease',
        transformStyle: "preserve-3d"
      }}
      className="border border-slate-800 bg-[#0a0f1d] hover:border-orange-500/30 p-8 rounded-2xl group transition duration-300 cursor-default select-none shadow-sm"
    >
      <div 
        style={{ transform: "translateZ(30px)" }}
        className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition duration-300"
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 
        style={{ transform: "translateZ(20px)" }}
        className="text-xl font-bold mb-3 text-slate-200 group-hover:text-white transition"
      >
        {title}
      </h3>
      <p 
        style={{ transform: "translateZ(10px)" }}
        className="text-slate-400 font-light text-sm leading-relaxed"
      >
        {description}
      </p>
    </motion.div>
  );
}

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const [isScrolled, setIsScrolled] = useState(false);

  // 3D Perspective Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Order Simulation State
  const [ordersToday, setOrdersToday] = useState(141);
  const [activeOrders, setActiveOrders] = useState([
    { id: "o1", name: "Steak Frites, Caesar Salad", table: "T-4", status: "PREPARING", color: "orange" },
    { id: "o2", name: "Mushroom Risotto (x2)", table: "T-12", status: "READY", color: "blue" },
  ]);
  const [mobileActionState, setMobileActionState] = useState<"idle" | "ordering" | "sent">("idle");
  const [showFlyingPacket, setShowFlyingPacket] = useState(false);

  // Mouse hover listener for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    setRotateX((yc - y) / 18);
    setRotateY((x - xc) / 18);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Step 1: mobile button triggers order
      setMobileActionState("ordering");

      // Step 2: flying packet emerges
      setTimeout(() => {
        setMobileActionState("sent");
        setShowFlyingPacket(true);

        // Step 3: packet lands, update stats & add card
        setTimeout(() => {
          setShowFlyingPacket(false);
          setOrdersToday(prev => prev + 1);

          const newOrder = {
            id: "o3-" + Date.now(),
            name: "Truffle Pizza, Diet Cola",
            table: "T-2",
            status: "PENDING",
            color: "red"
          };
          setActiveOrders(prev => [newOrder, ...prev.slice(0, 2)]);

          // Step 4: shift PENDING -> PREPARING
          setTimeout(() => {
            setActiveOrders(prev => 
              prev.map(o => o.id === newOrder.id ? { ...o, status: "PREPARING", color: "orange" } : o)
            );

            // Step 5: shift PREPARING -> READY
            setTimeout(() => {
              setActiveOrders(prev => 
                prev.map(o => o.id === newOrder.id ? { ...o, status: "READY", color: "blue" } : o)
              );

              // Step 6: served & complete (fade out list)
              setTimeout(() => {
                setActiveOrders(prev => prev.filter(o => o.id !== newOrder.id));
                setMobileActionState("idle");
              }, 2000);

            }, 2000);

          }, 2000);

        }, 1500); // 1.5s flight time

      }, 1500); // 1.5s mobile interaction time

    }, 11000); // Repeat every 11 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-125 h-125 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-100 h-100 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Header / Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#0a0f1d]/85 backdrop-blur-md border-b border-slate-800/50 py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-300">
              SmartQR Dine
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-slate-400 font-medium">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#solutions" className="hover:text-white transition">Solutions</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                href={user.restaurantId ? "/owner/dashboard" : "/owner/onboarding"}
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-slate-300 hover:text-white font-semibold px-4 py-2 transition"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Next-Gen Dining Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6"
          >
            Transform Your Restaurant With{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 to-amber-400">
              Smart QR Ordering
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-10"
          >
            Empower your guests to scan tables, view high-quality menus, place orders in real-time, and watch fulfillment happen. Boost average tickets by 20% and reduce staff fatigue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm mb-16"
          >
            <Link 
              href="/auth/register"
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition flex items-center justify-center gap-2 text-base"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              See Features
            </a>
          </motion.div>

          {/* Interactive Screen Mockups with 3D Tilt and Live Simulation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              transform: isHovered
                ? `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`
                : 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
              transition: isHovered ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              transformStyle: "preserve-3d"
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-5xl mx-auto rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-2xl relative cursor-default"
          >
            {/* Window controls */}
            <div className="flex gap-1.5 mb-4 px-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/85"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/85"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/85"></span>
              <span className="text-xs text-slate-500 ml-4 font-mono">dashboard_preview.app</span>
            </div>
            
            {/* Internal layout mockup */}
            <div className="aspect-video w-full rounded-lg bg-[#0c1224] border border-slate-800/50 flex overflow-hidden relative">
              {/* Sidebar Mockup */}
              <div className="w-48 border-r border-slate-800/60 p-4 hidden md:flex flex-col justify-between shrink-0 bg-slate-950/40">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="h-4 w-20 bg-slate-800/60 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 w-full bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center px-2">
                      <div className="h-3 w-16 bg-orange-500/40 rounded"></div>
                    </div>
                    <div className="h-7 w-full hover:bg-slate-800/20 rounded-lg flex items-center px-2">
                      <div className="h-3 w-20 bg-slate-800/30 rounded"></div>
                    </div>
                    <div className="h-7 w-full hover:bg-slate-800/20 rounded-lg flex items-center px-2">
                      <div className="h-3 w-14 bg-slate-800/30 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="h-6 w-24 bg-slate-800/30 rounded"></div>
              </div>
              
              {/* Content Panel Mockup */}
              <div className="flex-1 p-6 flex flex-col justify-between text-left relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white tracking-tight">Performance Overview</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Real-time insights for Today, Oct 24th.</p>
                  </div>
                  <div className="h-7 px-3 bg-orange-500/15 border border-orange-500/35 rounded-full flex items-center justify-center text-[9px] font-bold text-orange-400">
                    Live Room Connected
                  </div>
                </div>

                {/* Metrics Cards row */}
                <div className="grid grid-cols-3 gap-4 my-4">
                  <div className="border border-slate-800/80 bg-slate-950/40 p-3.5 rounded-xl space-y-1 cursor-default hover:border-slate-700/55 transition">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Revenue</span>
                    <span className="text-sm font-black text-slate-200">
                      ₹{(4280 + (ordersToday - 141) * 320).toLocaleString()}
                    </span>
                  </div>
                  <div className="border border-slate-800/80 bg-slate-950/40 p-3.5 rounded-xl space-y-1 cursor-default hover:border-slate-700/55 transition relative overflow-hidden">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Orders Today</span>
                    <motion.span 
                      key={ordersToday}
                      initial={{ scale: 1.2, color: "#f97316" }}
                      animate={{ scale: 1, color: "#e2e8f0" }}
                      className="text-sm font-black text-slate-200 block"
                    >
                      {ordersToday}
                    </motion.span>
                  </div>
                  <div className="border border-slate-800/80 bg-slate-950/40 p-3.5 rounded-xl space-y-1 cursor-default hover:border-slate-700/55 transition">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Avg. Turn Time</span>
                    <span className="text-sm font-black text-slate-200">12m</span>
                  </div>
                </div>

                {/* Dynamic Active Orders List */}
                <div className="flex-1 border border-slate-800 bg-slate-950/25 rounded-xl p-4 flex flex-col justify-start overflow-hidden relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Active Kitchen Orders</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout">
                      {activeOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 220, damping: 18 }}
                          className={`flex justify-between items-center bg-slate-900/35 border p-2.5 rounded-xl text-[11px] ${
                            order.status === "PENDING"
                              ? "border-red-500/25 shadow-lg shadow-red-500/5"
                              : "border-slate-800/80"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5.5 h-5.5 rounded-lg bg-[#0c1224] text-white flex items-center justify-center font-bold text-[9px] border border-slate-800">
                              {order.table}
                            </span>
                            <span className="font-bold text-slate-200">{order.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 border rounded-full text-[8px] font-extrabold tracking-wider shrink-0 ${
                            order.status === "PENDING"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : order.status === "PREPARING"
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}>
                            {order.status}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping mobile screen with dynamic order flow */}
            <div className="absolute -right-6 -bottom-10 w-52 aspect-9/18 bg-[#0c1224] border border-slate-700/80 rounded-[36px] p-2.5 shadow-2xl hidden lg:block overflow-hidden z-20">
              <div className="w-full h-full border border-slate-800/80 rounded-[26px] bg-slate-950 p-3 flex flex-col justify-between text-left">
                {/* Mobile Header */}
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <div className="space-y-0.5">
                    <div className="h-2 w-14 bg-slate-800 rounded"></div>
                    <div className="h-1.5 w-8 bg-slate-900 rounded"></div>
                  </div>
                  <span className="text-[7px] text-orange-400 font-extrabold uppercase bg-orange-500/10 border border-orange-500/20 px-1 rounded-sm">Table 2</span>
                </div>
                
                {/* Mobile Menu List */}
                <div className="flex-1 py-3 space-y-2.5">
                  <div className={`h-16 border rounded-xl p-2.5 flex flex-col justify-between transition ${
                    mobileActionState === "ordering" 
                      ? "border-orange-500/40 bg-orange-500/5" 
                      : "border-slate-900/60 bg-slate-900/25"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-200">Truffle Pizza</span>
                      <span className="text-[9px] text-slate-400">₹320</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-500">Double Truffle Glaze</span>
                      <span className="text-[8px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-black">x1 Added</span>
                    </div>
                  </div>

                  <div className="h-16 border border-slate-900/60 bg-slate-900/20 rounded-xl p-2.5 flex flex-col justify-between opacity-60">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-200">Classic Margherita</span>
                      <span className="text-[9px] text-slate-400">₹240</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-500">Fresh Basil & Olive Oil</span>
                      <span className="text-[8px] text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded font-bold">+ Add</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Float Cart Button */}
                <motion.div 
                  animate={
                    mobileActionState === "ordering" 
                      ? { scale: [1, 0.96, 1], backgroundColor: "#d97706" } 
                      : mobileActionState === "sent"
                        ? { scale: 1, backgroundColor: "#047857" }
                        : {}
                  }
                  transition={mobileActionState === "ordering" ? { repeat: Infinity, duration: 0.8 } : {}}
                  className="h-8 w-full bg-orange-500 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-md cursor-pointer select-none"
                >
                  {mobileActionState === "ordering" ? (
                    "Ordering..."
                  ) : mobileActionState === "sent" ? (
                    "Order Sent! ✓"
                  ) : (
                    "Send Order to Kitchen"
                  )}
                </motion.div>
              </div>
            </div>

            {/* Flying Order Capsule Animation (Floating 3D Packet) */}
            <AnimatePresence>
              {showFlyingPacket && (
                <motion.div
                  initial={{ 
                    left: "86%",
                    top: "78%",
                    scale: 1.2, 
                    opacity: 1,
                    rotate: 15,
                    boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)"
                  }}
                  animate={{ 
                    left: "52%",
                    top: "58%",
                    scale: 0.8, 
                    opacity: [1, 1, 0.9, 0],
                    rotate: -10,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute z-50 pointer-events-none p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl border border-white/20 text-white text-[9px] font-extrabold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>Table 2 Order #104</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900/60 bg-[#070b16]/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Equipped with Everything to Serve Excellence
            </h2>
            <p className="text-slate-400 font-light">
              We've engineered a seamless connection between your guests, your waiting staff, and your kitchen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Smartphone}
              title="Interactive Mobile Menu"
              description="Customers scan a table QR code and browse beautiful categories, rich descriptions, and add items with animations."
            />
            <FeatureCard 
              icon={Clock}
              title="Live Order Feeds"
              description="Kitchen dashboards update in real-time using Socket.io. Chime notifications alert chefs the exact second an order lands."
            />
            <FeatureCard 
              icon={QrCode}
              title="QR Code Architect"
              description="Generate elegant, high-contrast QR codes for each dining table. Download card overlays ready for printing."
            />
            <FeatureCard 
              icon={Layers}
              title="Live Order Timeline"
              description="Keep diners informed. The customer tracking screen shows a stepper reflecting order receipt, cooking, ready, and served."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Rich Business Analytics"
              description="Track revenue, total orders, and top-selling items using visual dashboards. Understand peek traffic hours."
            />
            <FeatureCard 
              icon={CheckCircle}
              title="Brand Customizer"
              description="Set restaurant logo, banner headers, contact settings, and custom presets (Modern, Cafe, Luxury, Fastfood)."
            />
          </div>
        </div>
      </section>

      {/* Solutions / Call To Action */}
      <section id="solutions" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto rounded-3xl bg-linear-to-tr from-orange-600 to-amber-500 p-8 md:p-16 text-center shadow-xl shadow-orange-600/10 relative overflow-hidden">
          {/* Sparkles overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[12px_12px]"></div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10 leading-tight">
            Ready to upgrade your business?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-10 text-base md:text-lg font-light relative z-10">
            Sign up today and get your restaurant onboarded under 5 minutes. No credit card required.
          </p>
          
          <div className="relative z-10 flex justify-center">
            <Link 
              href="/auth/register"
              className="bg-white text-orange-600 hover:bg-slate-50 font-bold px-8 py-4 rounded-xl cursor-pointer shadow-lg shadow-black/10 transition inline-flex items-center gap-2"
            >
              Get Started For Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 px-6 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-300">SmartQR Dine</span>
          </div>
          
          <p>© 2026 SmartQR Dine. All rights reserved.</p>
          
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-400 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}