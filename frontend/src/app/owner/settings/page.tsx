"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ImageIcon, 
  Check, 
  Sparkles, 
  AlertCircle,
  Users,
  Shield,
  Trash2,
  Plus,
  User as UserIcon,
  ChefHat,
  Bell
} from "lucide-react";
import { getRestaurant, updateRestaurant } from "@/services/restaurant.service";
import { getStaffMembers, createStaffMember, deleteStaffMember } from "@/services/staff.service";
import { useAuthStore } from "@/stores/auth.store";

export default function SettingsPage() {
  const { user, setRestaurant } = useAuthStore();
  const restaurantId = user?.restaurantId || "";
  const userRole = user?.role || "owner";

  // Tab State
  // Owners can see branding and staff. Chefs/Waiters can only see personal profile tab.
  const isOwner = userRole === "owner" || userRole === "admin";
  const [activeTab, setActiveTab] = useState<"branding" | "staff" | "profile">(
    isOwner ? "branding" : "profile"
  );

  // Form loading states
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Restaurant Branding Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [theme, setTheme] = useState("modern");

  // Drag and Drop states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  // Staff Management Console states
  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState("");
  const [staffError, setStaffError] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"chef" | "waiter">("waiter");
  const [newStaffLoading, setNewStaffLoading] = useState(false);

  // Drag & drop handlers
  const handleDragLogo = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDraggingLogo(true);
    else if (e.type === "dragleave") setIsDraggingLogo(false);
  };

  const handleDragBanner = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDraggingBanner(true);
    else if (e.type === "dragleave") setIsDraggingBanner(false);
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setLogo(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processBannerFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setBanner(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Fetch initial data
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

  const loadStaffData = async () => {
    if (!isOwner) return;
    setStaffLoading(true);
    try {
      const staffList = await getStaffMembers();
      setStaff(staffList);
    } catch (err) {
      console.error("Failed to load staff list:", err);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurantData();
    loadStaffData();
  }, [restaurantId]);

  // Handle branding form submit
  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnLoading(true);
    setSuccess(false);
    setError("");

    try {
      const payload = { name, phone, email, address, logo, banner, theme };
      const updated = await updateRestaurant(restaurantId, payload);
      
      setRestaurant({
        id: updated.id,
        name: updated.name,
        theme: updated.theme,
        logo,
        banner,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update settings.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Handle adding new staff member
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewStaffLoading(true);
    setStaffError("");
    setStaffSuccess("");

    try {
      const payload = {
        name: newStaffName,
        email: newStaffEmail,
        password: newStaffPassword,
        role: newStaffRole,
      };

      const newMember = await createStaffMember(payload);
      setStaff((prev) => [...prev, newMember]);

      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPassword("");
      setNewStaffRole("waiter");

      setStaffSuccess("Staff account created successfully!");
      setTimeout(() => setStaffSuccess(""), 4000);
    } catch (err: any) {
      setStaffError(err.response?.data?.error || "Failed to add staff member.");
    } finally {
      setNewStaffLoading(false);
    }
  };

  // Handle deleting staff member
  const handleDeleteStaffMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member? This will immediately revoke their dashboard access.")) {
      return;
    }
    setStaffError("");
    setStaffSuccess("");
    try {
      await deleteStaffMember(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      setStaffSuccess("Staff member deleted successfully.");
      setTimeout(() => setStaffSuccess(""), 4000);
    } catch (err: any) {
      setStaffError(err.response?.data?.error || "Failed to delete staff member.");
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
    <div className="max-w-3xl space-y-6">
      
      {/* Page Title & Navigation Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">
          {isOwner 
            ? "Manage branding, staff console, and credentials."
            : "Review your staff profile details."}
        </p>
      </div>

      {/* Tabs list (Only visible to owners) */}
      {isOwner && (
        <div className="flex gap-2 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab("branding")}
            className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === "branding"
                ? "border-orange-500 text-[#A14E1B]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Restaurant Branding
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "staff"
                ? "border-orange-500 text-[#A14E1B]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Staff Management
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-orange-500 text-[#A14E1B]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Profile
          </button>
        </div>
      )}

      {/* Panels Container */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          
          {/* Tab 1: Branding settings */}
          {activeTab === "branding" && isOwner && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {success && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-600 p-4 rounded-xl text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Branding settings updated successfully!</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-650 p-4 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleBrandingSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                
                {/* Business Profile */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Business Profile</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Restaurant Name</label>
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
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
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
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
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
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Theme Preset</label>
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Restaurant Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
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

                {/* Custom Branding Media */}
                <div className="space-y-6 pt-2">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">Custom Branding</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Restaurant Logo</label>
                      <div
                        onDragEnter={handleDragLogo}
                        onDragOver={handleDragLogo}
                        onDragLeave={handleDragLogo}
                        onDrop={(e) => {
                          e.preventDefault(); e.stopPropagation(); setIsDraggingLogo(false);
                          if (e.dataTransfer.files?.[0]) processLogoFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => document.getElementById("logo-upload-input")?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 relative overflow-hidden h-48 ${
                          isDraggingLogo ? "border-orange-500 bg-orange-50/30" : "border-slate-200 hover:border-slate-300 bg-slate-50/20"
                        }`}
                      >
                        <input
                          type="file" id="logo-upload-input" accept="image/*" className="hidden"
                          onChange={(e) => { if (e.target.files?.[0]) processLogoFile(e.target.files[0]); }}
                        />
                        {logo ? (
                          <div className="space-y-3 w-full flex flex-col items-center">
                            <div className="w-24 h-24 rounded-2xl border border-slate-100 p-1 overflow-hidden shadow-sm relative group bg-white">
                              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                              <button
                                type="button" onClick={(e) => { e.stopPropagation(); setLogo(""); }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold rounded-2xl"
                              >
                                Remove
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">Click or drag image to replace</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-700 font-bold">Upload Logo Image</p>
                              <p className="text-[10px] text-slate-450 font-light">Drag & drop or click</p>
                            </div>
                          </>
                        )}
                      </div>
                      <input
                        type="url" value={logo} onChange={(e) => setLogo(e.target.value)}
                        placeholder="Or paste a logo image URL..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2 outline-none text-slate-800 transition text-xs"
                      />
                    </div>

                    {/* Banner */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Menu Header Banner</label>
                      <div
                        onDragEnter={handleDragBanner}
                        onDragOver={handleDragBanner}
                        onDragLeave={handleDragBanner}
                        onDrop={(e) => {
                          e.preventDefault(); e.stopPropagation(); setIsDraggingBanner(false);
                          if (e.dataTransfer.files?.[0]) processBannerFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => document.getElementById("banner-upload-input")?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 relative overflow-hidden h-48 ${
                          isDraggingBanner ? "border-orange-500 bg-orange-50/30" : "border-slate-200 hover:border-slate-300 bg-slate-50/20"
                        }`}
                      >
                        <input
                          type="file" id="banner-upload-input" accept="image/*" className="hidden"
                          onChange={(e) => { if (e.target.files?.[0]) processBannerFile(e.target.files[0]); }}
                        />
                        {banner ? (
                          <div className="space-y-3 w-full flex flex-col items-center">
                            <div className="w-40 h-24 rounded-xl border border-slate-100 overflow-hidden shadow-sm relative group bg-white">
                              <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                              <button
                                type="button" onClick={(e) => { e.stopPropagation(); setBanner(""); }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold rounded-xl"
                              >
                                Remove
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">Click or drag image to replace</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-700 font-bold">Upload Banner Image</p>
                              <p className="text-[10px] text-slate-450 font-light">Drag & drop or click</p>
                            </div>
                          </>
                        )}
                      </div>
                      <input
                        type="url" value={banner} onChange={(e) => setBanner(e.target.value)}
                        placeholder="Or paste a banner image URL..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2 outline-none text-slate-800 transition text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <button
                    type="submit" disabled={btnLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-8 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 text-xs shadow-md shadow-orange-500/15"
                  >
                    {btnLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Save Branding
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Tab 2: Staff Management */}
          {activeTab === "staff" && isOwner && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Add Staff Member Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  <h3 className="font-extrabold text-slate-850 text-sm tracking-tight">Add Staff Account</h3>
                </div>

                {staffSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-xl text-xs font-semibold">
                    {staffSuccess}
                  </div>
                )}
                {staffError && (
                  <div className="bg-red-50 border border-red-205 text-red-600 p-3 rounded-xl text-xs font-semibold">
                    {staffError}
                  </div>
                )}

                <form onSubmit={handleAddStaffSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text" required value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 outline-none text-slate-800 transition text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email" required value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 outline-none text-slate-800 transition text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                    <input
                      type="password" required value={newStaffPassword} onChange={(e) => setNewStaffPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 outline-none text-slate-800 transition text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Staff Role</label>
                    <select
                      value={newStaffRole} onChange={(e: any) => setNewStaffRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3 py-2 outline-none text-slate-800 transition text-xs font-semibold cursor-pointer"
                    >
                      <option value="waiter">Waiter (Floor Staff)</option>
                      <option value="chef">Chef (Kitchen Staff)</option>
                    </select>
                  </div>

                  <button
                    type="submit" disabled={newStaffLoading}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md shadow-orange-500/10 flex justify-center items-center gap-1.5"
                  >
                    {newStaffLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Create Staff Account
                        <Plus className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Staff Members List */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <h3 className="font-extrabold text-slate-850 text-sm tracking-tight">Active Staff Accounts</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{staff.length} Total</span>
                </div>

                {staffLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : staff.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 border border-dashed border-slate-150 rounded-xl">
                    <Users className="w-8 h-8 text-slate-250 mx-auto mb-2" />
                    <p className="text-xs font-semibold">No Staff Registered</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Use the console on the left to add your first waiter or chef.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {staff.map((s) => (
                      <div 
                        key={s.id} 
                        className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50/20 rounded-xl flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            s.role === "chef" 
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}>
                            {s.role === "chef" ? <ChefHat className="w-4.5 h-4.5" /> : <Bell className="w-4.5 h-4.5" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-850 text-xs">{s.name}</h4>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{s.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 border rounded-md tracking-wider ${
                            s.role === "chef"
                              ? "bg-amber-50 border-amber-100 text-amber-650"
                              : "bg-blue-50 border-blue-100 text-blue-650"
                          }`}>
                            {s.role}
                          </span>
                          <button
                            onClick={() => handleDeleteStaffMember(s.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 border border-red-150 text-red-500 hover:text-red-700 rounded-lg transition cursor-pointer"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 3: Personal Profile details */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-xl"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#A14E1B]">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm tracking-tight">Staff Member Profile</h3>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Credential Details</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Staff Name</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                    {user?.name}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Registered Email</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1.5">Security Role Access</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-orange-500/10 text-orange-600 px-3.5 py-1 rounded-full border border-orange-500/20 font-black uppercase tracking-wider">
                      {userRole}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      (Assigned automatically on registration)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
