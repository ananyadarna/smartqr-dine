"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Bell,
  ChefHat, 
  ClipboardList, 
  Menu as MenuIcon, 
  QrCode, 
  Settings, 
  LogOut, 
  Store, 
  TableProperties, 
  User as UserIcon, 
  UtensilsCrossed,
  X 
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, restaurant, setRestaurant, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Auto-fetch restaurant details if logged in but details are missing in Zustand store
  useEffect(() => {
    const restId = user?.restaurantId;
    if (!hydrated || !restId) return;
    if (restaurant && restaurant.id === restId) return;

    const fetchRestaurantDetails = async () => {
      try {
        const { getRestaurant } = await import("@/services/restaurant.service");
        const resData = await getRestaurant(restId);
        setRestaurant({
          id: resData.id,
          name: resData.name,
          theme: resData.theme,
          logo: resData.logo,
          banner: resData.banner,
        });
      } catch (err) {
        console.error("Failed to load restaurant details:", err);
      }
    };

    fetchRestaurantDetails();
  }, [hydrated, user?.restaurantId, restaurant, setRestaurant]);

  // Handle hydration mismatch with Zustand persist
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user || !user.id) {
      router.push("/auth/login");
      return;
    } 
    
    if (!user.restaurantId && pathname !== "/owner/onboarding") {
      router.push("/owner/onboarding");
      return;
    }

    // Role-based route guarding
    const routePermissions: Record<string, string[]> = {
      "/owner/dashboard": ["owner", "admin"],
      "/owner/analytics": ["owner", "admin"],
      "/owner/menu": ["owner", "admin"],
      "/owner/tables": ["owner", "admin"],
      "/owner/kitchen": ["owner", "admin", "chef"],
      "/owner/waiter": ["owner", "admin", "waiter"],
      "/owner/settings": ["owner", "admin", "chef", "waiter"],
    };

    const allowedRoles = routePermissions[pathname];
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.warn(`Access denied to ${pathname} for role: ${user.role}. Redirecting...`);
      if (user.role === "chef") {
        router.push("/owner/kitchen");
      } else if (user.role === "waiter") {
        router.push("/owner/waiter");
      } else {
        router.push("/owner/dashboard");
      }
    }
  }, [user, hydrated, pathname, router]);

  if (!hydrated || !user || (!user.restaurantId && pathname !== "/owner/onboarding")) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (pathname === "/owner/onboarding") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/owner/dashboard", icon: ClipboardList, allowedRoles: ["owner", "admin"] },
    { label: "Live Kitchen", href: "/owner/kitchen", icon: ChefHat, allowedRoles: ["owner", "admin", "chef"] },
    { label: "Waiter Terminal", href: "/owner/waiter", icon: Bell, allowedRoles: ["owner", "admin", "waiter"] },
    { label: "Menu Architect", href: "/owner/menu", icon: Store, allowedRoles: ["owner", "admin"] },
    { label: "Tables & QRs", href: "/owner/tables", icon: TableProperties, allowedRoles: ["owner", "admin"] },
    { label: "Analytics Insights", href: "/owner/analytics", icon: BarChart3, allowedRoles: ["owner", "admin"] },
    { label: "Settings", href: "/owner/settings", icon: Settings, allowedRoles: ["owner", "admin", "chef", "waiter"] },
  ];

  const allowedNavItems = navItems.filter(item => 
    item.allowedRoles.includes(user?.role || "")
  );

  return (
    <div className="h-screen flex bg-slate-50 text-slate-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#0a0f1d] text-white hidden md:flex flex-col justify-between border-r border-slate-800/80 shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <UtensilsCrossed className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="overflow-hidden">
              <span className="font-extrabold text-lg tracking-tight block">SmartQR Dine</span>
              <span className="text-xs text-orange-400 font-bold block truncate mt-0.5">{restaurant?.name || "Restaurant"}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                    isActive 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15" 
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Controls */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 mb-3 bg-slate-900/40 rounded-xl">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <UserIcon className="w-4.5 h-4.5 text-slate-400" />
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-sm block truncate text-slate-200">{user.name}</span>
                <span className="text-xs text-slate-400 block truncate capitalize font-medium">{user.role}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs text-red-400 hover:bg-red-500/10 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar Drawers */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-[#0a0f1d] text-white px-6 py-4 flex md:hidden justify-between items-center border-b border-slate-800 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">SmartQR Dine</span>
          </Link>
          
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 hover:bg-slate-900 rounded-lg transition"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              ></motion.div>

              {/* Sidebar Panel Drawer */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed inset-y-0 left-0 w-64 bg-[#0a0f1d] text-white z-50 p-6 flex flex-col justify-between md:hidden border-r border-slate-800"
              >
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-extrabold text-lg tracking-tight">SmartQR Dine</span>
                    <button 
                      onClick={() => setMobileOpen(false)}
                      className="p-1.5 hover:bg-slate-900 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1.5">
                    {allowedNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                            isActive 
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15" 
                              : "text-slate-400 hover:bg-slate-900/60 hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-3 mb-4 bg-slate-900/40 p-2.5 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4.5 h-4.5 text-slate-400" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold text-sm block text-slate-200">{user.name}</span>
                      <span className="text-xs text-slate-400 block capitalize font-medium">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
