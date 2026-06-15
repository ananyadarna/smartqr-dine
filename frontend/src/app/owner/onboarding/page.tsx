"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  Check, 
  Coffee, 
  Flame, 
  Gem, 
  Store 
} from "lucide-react";
import { createRestaurant } from "@/services/restaurant.service";
import { useAuthStore } from "@/stores/auth.store";

type ThemeType = "modern" | "cafe" | "luxury" | "fastfood";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setRestaurant, updateUserRestaurantId } = useAuthStore();

  useEffect(() => {
    if (user?.restaurantId) {
      router.push("/owner/dashboard");
    }
  }, [user?.restaurantId, router]);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [theme, setTheme] = useState<ThemeType>("modern");

  const themes: { id: ThemeType; label: string; desc: string; icon: any; color: string }[] = [
    { 
      id: "modern", 
      label: "Modern Bistro", 
      desc: "Clean fonts, orange accents, minimalist grids.", 
      icon: Store,
      color: "from-orange-500 to-amber-500" 
    },
    { 
      id: "cafe", 
      label: "Cozy Cafe", 
      desc: "Warm tones, elegant typography, organic shapes.", 
      icon: Coffee,
      color: "from-amber-600 to-yellow-500" 
    },
    { 
      id: "luxury", 
      label: "Fine Dining", 
      desc: "Deep gold, high contrast, serif typography.", 
      icon: Gem,
      color: "from-yellow-600 to-yellow-400" 
    },
    { 
      id: "fastfood", 
      label: "Quick & Diner", 
      desc: "Vibrant buttons, big item cards, quick checkout.", 
      icon: Flame,
      color: "from-red-500 to-orange-500" 
    },
  ];

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || name.trim().length < 2) {
        setError("Restaurant name must be at least 2 characters.");
        return;
      }
      if (!phone || phone.trim().length < 10) {
        setError("Phone number must be at least 10 digits.");
        return;
      }
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!address || address.trim().length < 5) {
        setError("Address must be at least 5 characters.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    
    try {
      const payload = {
        name,
        phone,
        email,
        address,
        theme,
      };

      const restaurantData = await createRestaurant(payload);
      
      // Save restaurant details in Zustand store
      setRestaurant({
        id: restaurantData.id,
        name: restaurantData.name,
        theme: restaurantData.theme,
      });

      // Update the user's restaurantId locally
      updateUserRestaurantId(restaurantData.id);

      // Go to owner dashboard
      router.push("/owner/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create restaurant. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        
        {/* Onboarding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Launch Assistant
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Setup Your Restaurant
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Configure your brand details and customer theme presets.
          </p>
        </div>

        {/* Stepper Indicators */}
        <div className="flex justify-between items-center mb-8 px-6 relative">
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 pointer-events-none"></div>
          <div 
            className="absolute left-10 top-1/2 -translate-y-1/2 h-0.5 bg-orange-500 transition-all duration-300"
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>

          {[1, 2, 3].map((s) => (
            <div key={s} className="z-10 flex flex-col items-center">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition ${
                  step > s 
                    ? "bg-orange-500 border-orange-500 text-white" 
                    : step === s 
                      ? "bg-[#0a0f1d] border-orange-500 text-orange-400 shadow-lg shadow-orange-500/20" 
                      : "bg-[#0a0f1d] border-slate-800 text-slate-500"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider mt-2 ${step === s ? "text-orange-400" : "text-slate-500"}`}>
                {s === 1 ? "Details" : s === 2 ? "Branding" : "Confirm"}
              </span>
            </div>
          ))}
        </div>

        {/* Form Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-950/40 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Step Content Card */}
        <div className="border border-slate-800 bg-[#151e36]/40 backdrop-blur-md rounded-2xl p-6 md:p-10 shadow-2xl relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Restaurant Details
                </h3>
                <p className="text-slate-400 text-xs font-light">
                  Provide your business contact information. This will be shown on customer invoices.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Restaurant Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Spice Garden"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 outline-none text-slate-200 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 outline-none text-slate-200 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hello@restaurant.com"
                          className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 outline-none text-slate-200 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Restaurant Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 w-4 h-4 text-slate-500" />
                      <textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Food Street, Downtown Sector 4"
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-orange-500 rounded-xl pl-10 pr-4 py-3 outline-none text-slate-200 transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <motion.button
                    onClick={handleNextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-orange-500/10 transition flex items-center gap-1.5"
                  >
                    Next Step
                    <Check className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Branding Theme Presets
                </h3>
                <p className="text-slate-400 text-xs font-light">
                  Select a theme style for your customer-facing digital menu. You can customize colors later in the website builder.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={`text-left p-4 rounded-xl border cursor-pointer flex gap-4 transition ${
                          isSelected 
                            ? "bg-slate-900 border-orange-500 shadow-md shadow-orange-500/10" 
                            : "bg-slate-950 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${t.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className={`font-semibold ${isSelected ? "text-orange-400" : "text-slate-200"}`}>
                            {t.label}
                          </h4>
                          <p className="text-slate-400 text-xs leading-normal font-light">
                            {t.desc}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <motion.button
                    onClick={handlePrevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold px-6 py-3 rounded-xl cursor-pointer transition"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleNextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-orange-500/10 transition flex items-center gap-1.5"
                  >
                    Next Step
                    <Check className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto mb-4 animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-100">
                    Ready to Launch!
                  </h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto font-light leading-relaxed">
                    Confirm your details to generate your digital menu and QR dashboard. You can add food dishes immediately in the next step.
                  </p>
                </div>

                <div className="border border-slate-800 bg-slate-950/50 rounded-xl p-4 max-w-md mx-auto text-left text-sm space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Name:</span>
                    <span className="text-slate-200 font-bold">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Phone:</span>
                    <span className="text-slate-300">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Theme:</span>
                    <span className="text-orange-400 font-semibold capitalize">{theme}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between max-w-md mx-auto">
                  <motion.button
                    onClick={handlePrevStep}
                    disabled={loading}
                    whileHover={loading ? {} : { scale: 1.02 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                    className="border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold px-6 py-3 rounded-xl cursor-pointer transition"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleComplete}
                    disabled={loading}
                    whileHover={loading ? {} : { scale: 1.02 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                    className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl cursor-pointer shadow-lg shadow-orange-500/10 transition flex items-center gap-1.5"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Launch Dashboard
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
