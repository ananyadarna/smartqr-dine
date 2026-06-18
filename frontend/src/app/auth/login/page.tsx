"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, UtensilsCrossed } from "lucide-react";
import { loginUser, loginWithGoogle } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError("");
    try {
      const data = await loginWithGoogle(response.credential);
      
      // Save user session in Zustand store
      setAuth(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          restaurantId: data.user.restaurantId || null,
        },
        data.token
      );

      if (data.user.restaurantId) {
        if (data.user.role === "chef") {
          router.push("/owner/kitchen");
        } else if (data.user.role === "waiter") {
          router.push("/owner/waiter");
        } else {
          router.push("/owner/dashboard");
        }
      } else {
        router.push("/owner/onboarding");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const google = (window as any).google;
    if (typeof window !== "undefined" && google) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: false,
        });

        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "rectangular",
          }
        );

        google.accounts.id.prompt();
      } catch (err) {
        console.error("Error initializing Google Sign-In:", err);
      }
    }
  };

  useEffect(() => {
    const google = (window as any).google;
    if (typeof window !== "undefined" && google) {
      initializeGoogleSignIn();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser({ email, password });
      
      // Save user session in Zustand store
      setAuth(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          restaurantId: data.user.restaurantId || null,
        },
        data.token
      );

      if (data.user.restaurantId) {
        if (data.user.role === "chef") {
          router.push("/owner/kitchen");
        } else if (data.user.role === "waiter") {
          router.push("/owner/waiter");
        } else {
          router.push("/owner/dashboard");
        }
      } else {
        router.push("/owner/onboarding");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Panel - Brand Section */}
      <div className="w-full md:w-1/2 bg-[#0a0f1d] flex flex-col justify-center items-center p-8 md:p-12 text-white relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center max-w-md text-center z-10"
        >
          {/* Logo Icon */}
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-orange-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6 animate-pulse-glow">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-white via-slate-100 to-slate-300">
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
              Welcome Back
            </h2>
            <p className="text-slate-500 mt-2">
              Manage your dining experience with ease.
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white rounded-xl pl-11 pr-4 py-3 outline-none text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition"
                >
                  Forgot?
                </Link>
              </div>
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
                "Sign In"
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <div id="google-signin-btn" className="w-full flex justify-center"></div>
            ) : (
              <button
                type="button"
                onClick={() => alert("Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your frontend/.env.local file.")}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl cursor-pointer transition font-medium text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google (Not Configured)
              </button>
            )}
          </div>

          <div className="text-center mt-8 text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-orange-600 hover:text-orange-700 font-semibold transition"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGoogleSignIn}
        strategy="afterInteractive"
      />
    </div>
  );
}
