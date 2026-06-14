"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, UtensilsCrossed } from "lucide-react";
import { registerUser } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await registerUser({ name, email, password });
      
      // Store session details in Zustand store
      setAuth(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          restaurantId: null, // New user needs onboarding
        },
        data.token
      );

      // Take user directly to restaurant onboarding wizard
      router.push("/owner/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Email might already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Panel - Brand Section */}
      <div className="w-full md:w-1/2 bg-[#0a0f1d] flex flex-col justify-center items-center p-8 md:p-12 text-white relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center max-w-md text-center z-10"
        >
          {/* Logo Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6 animate-pulse-glow">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            SmartQR Dine
          </h1>
          
          <p className="text-slate-400 text-lg leading-relaxed font-light px-4">
            The precision of a high-performance operating system, the warmth of modern hospitality.
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-white shadow-2xl">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create an Account
            </h2>
            <p className="text-slate-500 mt-2">
              Launch your restaurant QR digital experience in minutes.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white rounded-xl pl-11 pr-4 py-3 outline-none text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@restaurant.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white rounded-xl pl-11 pr-4 py-3 outline-none text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white rounded-xl pl-11 pr-10 py-3 outline-none text-slate-800 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3.5 rounded-xl cursor-pointer shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Get Started"
              )}
            </button>
          </form>

          <div className="text-center mt-8 text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-orange-600 hover:text-orange-700 font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
