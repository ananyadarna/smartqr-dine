"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

          {/* Interactive Screen Mockups */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-5xl mx-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-2xl relative"
          >
            {/* Window controls */}
            <div className="flex gap-1.5 mb-4 px-2">
              <span className="w-3 h-3 rounded-full bg-red-500/85"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/85"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/85"></span>
              <span className="text-xs text-slate-500 ml-4 font-mono">dashboard_preview.app</span>
            </div>
            
            {/* Internal layout mockup */}
            <div className="aspect-video w-full rounded-lg bg-[#0c1224] border border-slate-800/50 flex overflow-hidden">
              {/* Sidebar Mockup */}
              <div className="w-48 border-r border-slate-800/60 p-4 hidden md:flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-slate-800/60 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-full bg-orange-500/10 border border-orange-500/20 rounded"></div>
                    <div className="h-5 w-full bg-slate-800/30 rounded"></div>
                    <div className="h-5 w-full bg-slate-800/30 rounded"></div>
                    <div className="h-5 w-full bg-slate-800/30 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-24 bg-slate-800/30 rounded"></div>
              </div>
              
              {/* Content Panel Mockup */}
              <div className="flex-1 p-6 flex flex-col justify-between text-left">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-6 w-36 bg-slate-800/60 rounded"></div>
                    <div className="h-3 w-48 bg-slate-800/30 rounded"></div>
                  </div>
                  <div className="h-8 w-24 bg-orange-500/20 border border-orange-500/30 rounded-full"></div>
                </div>

                <div className="grid grid-cols-3 gap-4 my-6">
                  <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl space-y-2">
                    <div className="h-3 w-16 bg-slate-800/50 rounded"></div>
                    <div className="h-6 w-12 bg-slate-500/20 rounded"></div>
                  </div>
                  <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl space-y-2">
                    <div className="h-3 w-20 bg-slate-800/50 rounded"></div>
                    <div className="h-6 w-16 bg-orange-500/20 rounded"></div>
                  </div>
                  <div className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl space-y-2">
                    <div className="h-3 w-12 bg-slate-800/50 rounded"></div>
                    <div className="h-6 w-8 bg-slate-500/20 rounded"></div>
                  </div>
                </div>

                <div className="flex-1 border border-slate-800 bg-slate-900/20 rounded-xl p-4 flex items-center justify-center">
                  <div className="w-full h-full flex flex-col justify-around">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-40 bg-slate-800/50 rounded"></div>
                      <div className="h-4 w-12 bg-slate-800/50 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-slate-800/50 rounded"></div>
                      <div className="h-4 w-12 bg-slate-800/50 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-48 bg-slate-800/50 rounded"></div>
                      <div className="h-4 w-12 bg-orange-500/30 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping mobile screen */}
            <div className="absolute -right-6 -bottom-10 w-52 aspect-9/18 bg-[#0c1224] border border-slate-700/80 rounded-4xl p-2.5 shadow-2xl hidden lg:block overflow-hidden">
              <div className="w-full h-full border border-slate-800 rounded-[22px] bg-slate-950 p-3 flex flex-col justify-between text-left">
                {/* Mobile Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="space-y-0.5">
                    <div className="h-2 w-16 bg-slate-800 rounded"></div>
                    <div className="h-1.5 w-10 bg-slate-900 rounded"></div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                </div>
                {/* Mobile Menu List */}
                <div className="flex-1 py-3 space-y-2.5">
                  <div className="h-16 border border-slate-900 bg-slate-900/30 rounded-lg p-2 space-y-1">
                    <div className="h-3 w-16 bg-slate-800 rounded"></div>
                    <div className="h-2 w-24 bg-slate-800/40 rounded"></div>
                    <div className="h-2 w-8 bg-orange-500/20 rounded"></div>
                  </div>
                  <div className="h-16 border border-slate-900 bg-slate-900/30 rounded-lg p-2 space-y-1">
                    <div className="h-3 w-20 bg-slate-800 rounded"></div>
                    <div className="h-2 w-20 bg-slate-800/40 rounded"></div>
                    <div className="h-2 w-8 bg-orange-500/20 rounded"></div>
                  </div>
                  <div className="h-16 border border-slate-900 bg-slate-900/30 rounded-lg p-2 space-y-1">
                    <div className="h-3 w-12 bg-slate-800 rounded"></div>
                    <div className="h-2 w-28 bg-slate-800/40 rounded"></div>
                    <div className="h-2 w-8 bg-orange-500/20 rounded"></div>
                  </div>
                </div>
                {/* Mobile Float Cart Button */}
                <div className="h-7 w-full bg-orange-500 rounded-lg flex items-center justify-center">
                  <div className="h-2.5 w-12 bg-white/40 rounded"></div>
                </div>
              </div>
            </div>
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
            {/* Feature 1 */}
            <div className="border border-slate-800 bg-[#0a0f1d] hover:border-orange-500/30 p-8 rounded-2xl group transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Mobile Menu</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Customers scan a table QR code and browse beautiful categories, rich descriptions, and add items with animations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-slate-800 bg-[#0a0f1d] hover:border-orange-500/30 p-8 rounded-2xl group transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Order Feeds</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Kitchen dashboards update in real-time using Socket.io. Chime notifications alert chefs the exact second an order lands.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-slate-800 bg-[#0a0f1d] hover:border-orange-500/30 p-8 rounded-2xl group transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">QR Code Architect</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Generate elegant, high-contrast QR codes for each dining table. Download card overlays ready for printing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="border border-slate-800 bg-[#0a0f1d] hover:border-orange-500/30 p-8 rounded-2xl group transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Order timeline</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Keep diners informed. The customer tracking screen shows a stepper reflecting order receipt, cooking, ready, and served.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="border border-slate-800 bg-[#0a0f1d] hover:border-orange-500/30 p-8 rounded-2xl group transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rich Business Analytics</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Track revenue, total orders, and top-selling items using visual dashboards. Understand peek traffic hours.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="border border-slate-800 bg-[#0a0f1d] hover:border-orange-500/30 p-8 rounded-2xl group transition duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-105 transition">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Brand Customizer</h3>
              <p className="text-slate-400 font-light text-sm leading-relaxed">
                Set restaurant logo, banner headers, contact settings, and custom presets (Modern, Cafe, Luxury, Fastfood).
              </p>
            </div>
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