"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ImageIcon, 
  Check, 
  Sparkles, 
  AlertCircle 
} from "lucide-react";
import { getRestaurant, updateRestaurant } from "@/services/restaurant.service";
import { useAuthStore } from "@/stores/auth.store";

export default function SettingsPage() {
  const { user, setRestaurant } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [theme, setTheme] = useState("modern");

  // Drag and Drop Logo/Banner states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  const handleDragLogo = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDraggingLogo(true);
    } else if (e.type === "dragleave") {
      setIsDraggingLogo(false);
    }
  };

  const handleDragBanner = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDraggingBanner(true);
    } else if (e.type === "dragleave") {
      setIsDraggingBanner(false);
    }
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const processBannerFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBanner(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDropLogo = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleDropBanner = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBanner(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processBannerFile(e.dataTransfer.files[0]);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processLogoFile(e.target.files[0]);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processBannerFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!restaurantId) return;
      try {
        const data = await getRestaurant(restaurantId);
        setName(data.name);
        setPhone(data.phone);
        setEmail(data.email);
        setAddress(data.address);
        setLogo(data.logo || "");
        setBanner(data.banner || "");
        setTheme(data.theme || "modern");
      } catch (err) {
        console.error("Failed to load restaurant details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [restaurantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnLoading(true);
    setSuccess(false);
    setError("");

    try {
      const payload = {
        name,
        phone,
        email,
        address,
        logo,
        banner,
        theme,
      };

      const updated = await updateRestaurant(restaurantId, payload);
      
      // Update local store
      setRestaurant({
        id: updated.id,
        name: updated.name,
        theme: updated.theme,
        logo: logo,
        banner: banner,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update restaurant settings.");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Restaurant Settings
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Customize your brand visual themes, upload logos, and modify business details.
        </p>
      </div>

      {/* Success notification */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl text-sm flex items-center gap-2"
        >
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Branding settings updated successfully! Sidebar menu updated.</span>
        </motion.div>
      )}

      {/* Error notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-650 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Settings Panel Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Section 1: Business Profile */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Business Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Restaurant Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 outline-none text-slate-800 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 outline-none text-slate-800 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 outline-none text-slate-800 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Theme Preset
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3 py-2.5 outline-none text-slate-800 transition text-sm cursor-pointer font-medium"
              >
                <option value="modern">Modern Bistro</option>
                <option value="cafe">Cozy Cafe</option>
                <option value="luxury">Fine Dining</option>
                <option value="fastfood">Quick & Diner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Restaurant Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 outline-none text-slate-800 transition text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Custom Branding Media */}
        <div className="space-y-6 pt-2">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Custom Branding</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Restaurant Logo
              </label>
              
              <div
                onDragEnter={handleDragLogo}
                onDragOver={handleDragLogo}
                onDragLeave={handleDragLogo}
                onDrop={handleDropLogo}
                onClick={() => document.getElementById("logo-upload-input")?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 relative overflow-hidden h-48 ${
                  isDraggingLogo 
                    ? "border-orange-500 bg-orange-50/30" 
                    : logo 
                      ? "border-slate-200 bg-slate-50/50" 
                      : "border-slate-200 hover:border-slate-350 bg-slate-50/20"
                }`}
              >
                <input
                  type="file"
                  id="logo-upload-input"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />

                {logo ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="w-24 h-24 rounded-2xl border border-slate-100 p-1 overflow-hidden shadow-sm relative group bg-white">
                      <img src={logo} alt="Logo Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogo("");
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold rounded-2xl"
                      >
                        Remove
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">Click or drag image to replace</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-700 font-bold">Upload Logo Image</p>
                      <p className="text-xs text-slate-400 font-light">Drag & drop or click to upload</p>
                    </div>
                  </>
                )}
              </div>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="Or paste a logo image URL directly..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2.5 outline-none text-slate-800 transition text-xs"
              />
            </div>

            {/* Banner Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Menu Header Banner
              </label>
              
              <div
                onDragEnter={handleDragBanner}
                onDragOver={handleDragBanner}
                onDragLeave={handleDragBanner}
                onDrop={handleDropBanner}
                onClick={() => document.getElementById("banner-upload-input")?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 relative overflow-hidden h-48 ${
                  isDraggingBanner 
                    ? "border-orange-500 bg-orange-50/30" 
                    : banner 
                      ? "border-slate-200 bg-slate-50/50" 
                      : "border-slate-200 hover:border-slate-350 bg-slate-50/20"
                }`}
              >
                <input
                  type="file"
                  id="banner-upload-input"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  className="hidden"
                />

                {banner ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="w-40 h-24 rounded-xl border border-slate-100 overflow-hidden shadow-sm relative group bg-white">
                      <img src={banner} alt="Banner Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBanner("");
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold rounded-xl"
                      >
                        Remove
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">Click or drag image to replace</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-700 font-bold">Upload Banner Image</p>
                      <p className="text-xs text-slate-400 font-light">Drag & drop or click to upload</p>
                    </div>
                  </>
                )}
              </div>
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="Or paste a banner image URL directly..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2.5 outline-none text-slate-800 transition text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 flex justify-end border-t border-slate-100">
          <button
            type="submit"
            disabled={btnLoading}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl cursor-pointer shadow-lg shadow-orange-500/10 transition flex items-center gap-1.5 text-sm"
          >
            {btnLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Save Settings
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
