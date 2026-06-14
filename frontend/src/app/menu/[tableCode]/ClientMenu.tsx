"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingBag, 
  Sparkles, 
  UtensilsCrossed, 
  CheckCircle2, 
  MapPin, 
  ChevronRight 
} from "lucide-react";
import { MenuResponse, MenuItem } from "@/types/menu";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { useCartStore } from "@/stores/cart.store";

interface ClientMenuProps {
  menu: MenuResponse;
  tableCode: string;
}

export default function ClientMenu({ menu, tableCode }: ClientMenuProps) {
  const cartItems = useCartStore((state) => state.items);
  const setTableAndRestaurant = useCartStore((state) => state.setTableAndRestaurant);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(
    menu.categories.length > 0 ? menu.categories[0].id : ""
  );

  // Store active table and restaurant context in Zustand
  useEffect(() => {
    setTableAndRestaurant(menu.table.id, menu.restaurant.id, tableCode);
  }, [menu, tableCode]);

  // Calculate total items in the cart
  const cartTotalQty = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const cartTotalAmount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // Filter items by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return menu.categories;

    return menu.categories.map((category) => {
      const filteredItems = category.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        ...category,
        items: filteredItems,
      };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery, menu.categories]);

  // Featured items list
  const featuredItems = useMemo(() => {
    const allItems: MenuItem[] = [];
    menu.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.isFeatured) {
          allItems.push(item);
        }
      });
    });
    return allItems;
  }, [menu.categories]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      {/* Restaurant Header Banner */}
      <div className="relative h-44 md:h-60 bg-slate-900 overflow-hidden">
        {menu.restaurant.banner ? (
          <img 
            src={menu.restaurant.banner} 
            alt={menu.restaurant.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#0a0f1d] to-slate-900 flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
      </div>

      {/* Restaurant Info Panel card */}
      <div className="max-w-md mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          {menu.restaurant.logo ? (
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-1 shrink-0 overflow-hidden shadow-sm">
              <img src={menu.restaurant.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
          )}
          
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-snug truncate">
              {menu.restaurant.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Table {menu.table.tableNumber}</span>
              <span className="w-1 h-1 rounded-full bg-slate-350"></span>
              <span className="text-emerald-600 font-bold">Menu Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Items slider */}
      {featuredItems.length > 0 && !searchQuery && (
        <div className="max-w-md mx-auto px-4 mt-8 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Chef's Featured
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {featuredItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-sm w-44 shrink-0 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="aspect-square w-full rounded-xl bg-slate-50 overflow-hidden relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-light line-clamp-1">{item.description}</p>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-50">
                  <span className="font-extrabold text-slate-800 text-xs">₹{item.price}</span>
                  <AddToCartButton id={item.id} name={item.name} price={item.price} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar section */}
      <div className="max-w-md mx-auto px-4 mt-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes or cuisines..."
            className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-2xl pl-11 pr-4 py-3 outline-none text-slate-800 text-sm shadow-sm transition"
          />
        </div>
      </div>

      {/* Categories Slider Menu */}
      {!searchQuery && (
        <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-30 border-b border-slate-200/40 py-3 mt-6">
          <div className="max-w-md mx-auto px-4 flex gap-2 overflow-x-auto scrollbar-none">
            {menu.categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    document.getElementById(`cat-sec-${cat.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive 
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" 
                      : "bg-white text-slate-500 border border-slate-200/80 hover:text-slate-800"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Food List */}
      <div className="max-w-md mx-auto px-4 mt-8 space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-slate-450 text-sm font-light">
            No dishes found matching your query.
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div 
              key={category.id} 
              id={`cat-sec-${category.id}`}
              className="space-y-4 scroll-mt-24"
            >
              <h2 className="font-extrabold text-base text-slate-900 border-l-4 border-orange-500 pl-2.5">
                {category.name}
              </h2>

              <div className="divide-y divide-slate-100 bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
                {category.items.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 flex gap-4 hover:bg-slate-50/50 transition relative overflow-hidden"
                  >
                    {/* Dish Preview Image */}
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 p-0.5 overflow-hidden shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    </div>

                    {/* Dish Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-1 pr-4">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-slate-450 text-xs font-light line-clamp-2 leading-relaxed">
                          {item.description || "Freshly cooked to order."}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-extrabold text-sm text-slate-900">₹{item.price}</span>
                        <AddToCartButton id={item.id} name={item.name} price={item.price} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating cart panel bar */}
      <AnimatePresence>
        {cartTotalQty > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-0 right-0 z-40 px-4"
          >
            <Link 
              href="/cart"
              className="max-w-md mx-auto bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl px-5 py-4 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition flex items-center justify-between font-bold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] text-white/70 block font-semibold uppercase tracking-wider">{cartTotalQty} Item{cartTotalQty > 1 ? "s" : ""} added</span>
                  <span className="text-sm block">View Cart</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-base text-white">₹{cartTotalAmount}</span>
                <ChevronRight className="w-5 h-5 text-white/80" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
