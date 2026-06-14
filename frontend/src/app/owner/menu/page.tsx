"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Image as ImageIcon, 
  FolderPlus, 
  ShoppingBag, 
  Star, 
  Eye, 
  EyeOff, 
  FolderOpen 
} from "lucide-react";
import { getCategoriesByRestaurant, createCategory, deleteCategory } from "@/services/category.service";
import { getFoodItemsByCategory, createFoodItem, updateFoodItem, deleteFoodItem } from "@/services/foodItem.service";
import { useAuthStore } from "@/stores/auth.store";

// Beautiful mock food image presets for quick selection
const FOOD_IMAGE_PRESETS = [
  { label: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80" },
  { label: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80" },
  { label: "Pasta", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80" },
  { label: "Salad", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80" },
  { label: "Coffee", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80" },
  { label: "Dessert", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
  { label: "Sushi", url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80" },
  { label: "Drinks", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80" },
];

export default function MenuManagementPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [foodItems, setFoodItems] = useState<any[]>([]);
  
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Food Item form state
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemFeatured, setItemFeatured] = useState(false);
  const [itemAvailable, setItemAvailable] = useState(true);

  // Drag and Drop Image states & handlers
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setItemImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Fetch all categories
  const loadCategories = async () => {
    if (!restaurantId) return;
    try {
      const data = await getCategoriesByRestaurant(restaurantId);
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoadingCats(false);
    }
  };

  // Fetch food items for selected category
  const loadFoodItems = async (catId: string) => {
    if (!catId) return;
    setLoadingItems(true);
    try {
      const data = await getFoodItemsByCategory(catId);
      setFoodItems(data);
    } catch (err) {
      console.error("Failed to load food items:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [restaurantId]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadFoodItems(selectedCategoryId);
    } else {
      setFoodItems([]);
    }
  }, [selectedCategoryId]);

  // Handle category submission
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !restaurantId) return;
    try {
      const newCat = await createCategory({ name: catName, restaurantId });
      setCategories((prev) => [...prev, newCat]);
      setSelectedCategoryId(newCat.id);
      setCatName("");
      setShowCatModal(false);
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure you want to delete this category? All food items in it will remain on the server.")) return;
    try {
      await deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (selectedCategoryId === catId) {
        setSelectedCategoryId("");
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // Open modal for Adding / Editing food item
  const openItemModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemPrice(item.price.toString());
      setItemDesc(item.description || "");
      setItemImage(item.image || "");
      setItemFeatured(item.isFeatured || false);
      setItemAvailable(item.isAvailable ?? true);
    } else {
      setEditingItem(null);
      setItemName("");
      setItemPrice("");
      setItemDesc("");
      setItemImage("");
      setItemFeatured(false);
      setItemAvailable(true);
    }
    setShowItemModal(true);
  };

  // Handle food item form submit
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice || !selectedCategoryId || !restaurantId) return;

    const payload = {
      name: itemName,
      price: parseFloat(itemPrice),
      description: itemDesc,
      image: itemImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
      categoryId: selectedCategoryId,
      restaurantId,
      isFeatured: itemFeatured,
      isAvailable: itemAvailable,
    };

    try {
      if (editingItem) {
        // Edit flow
        const updated = await updateFoodItem(editingItem.id, payload);
        setFoodItems((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, ...updated } : item)));
      } else {
        // Create flow
        const created = await createFoodItem(payload);
        setFoodItems((prev) => [...prev, created]);
      }
      setShowItemModal(false);
    } catch (err) {
      console.error("Failed to save food item:", err);
    }
  };

  // Handle food item deletion
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this food dish?")) return;
    try {
      await deleteFoodItem(itemId);
      setFoodItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to delete food item:", err);
    }
  };

  // Handle food item availability toggle quickly in grid
  const toggleAvailability = async (item: any) => {
    try {
      const updated = await updateFoodItem(item.id, { isAvailable: !item.isAvailable });
      setFoodItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isAvailable: updated.isAvailable } : i)));
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Menu Architect
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Build and publish your dishes, prices, and categories.
          </p>
        </div>
        
        <button
          onClick={() => openItemModal()}
          disabled={!selectedCategoryId}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-500/15 disabled:shadow-none transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Food Dish
        </button>
      </div>

      {/* Main Grid: Left sidebar categories, Right grid items */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Left Sidebar - Categories */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Categories</h3>
            <button
              onClick={() => setShowCatModal(true)}
              className="text-orange-500 hover:text-orange-600 p-1 rounded-lg hover:bg-orange-50 transition"
              title="Add Category"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm space-y-1">
            {loadingCats ? (
              <div key="loading-cats" className="py-8 text-center text-slate-400 text-xs">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div key="empty-cats" className="py-8 text-center text-slate-400 text-xs">
                No categories yet.<br/>Click ＋ to create one.
              </div>
            ) : (
              categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <div 
                    key={cat.id}
                    className={`group flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isSelected 
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/10" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className="flex-1 text-left truncate mr-2"
                    >
                      {cat.name}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className={`text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 p-1 rounded transition ${
                        isSelected ? "text-white/70 hover:text-white" : ""
                      }`}
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Food Items Grid */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider px-1">
            {categories.find(c => c.id === selectedCategoryId)?.name || "Select Category"} Dishes
          </h3>

          {loadingItems ? (
            <div key="loading-items" className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : !selectedCategoryId ? (
            <div key="no-cat-selected" className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm flex flex-col items-center">
              <FolderOpen className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-medium">No category selected.</p>
              <p className="text-xs font-light mt-1">Select a category on the left or create a new one to manage dishes.</p>
            </div>
          ) : foodItems.length === 0 ? (
            <div key="empty-items" className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-medium">This category is empty.</p>
              <p className="text-xs font-light mt-1">Click the "Add Food Dish" button to fill it with delicious items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition"
                >
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    
                    {/* Featured Star Badge */}
                    {item.isFeatured && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white p-1.5 rounded-lg shadow-md">
                        <Star className="w-3.5 h-3.5 fill-white" />
                      </span>
                    )}

                    {/* Status overlay when Unavailable */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white font-bold text-xs uppercase px-3 py-1 rounded-full shadow-lg">
                          Unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                        <span className="font-extrabold text-orange-500 shrink-0">₹{item.price}</span>
                      </div>
                      <p className="text-slate-400 font-light text-xs mt-1 line-clamp-2">{item.description || "No description provided."}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                      {/* Availability toggle */}
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`p-1.5 rounded-lg border transition ${
                          item.isAvailable 
                            ? "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700" 
                            : "border-red-200 text-red-500 hover:bg-red-50"
                        }`}
                        title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      >
                        {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Edit/Delete controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openItemModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                          title="Edit dish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Creation Dialog */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCatModal(false)}
              className="absolute inset-0 bg-black"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative z-10 space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-800">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Starter, Mocktails"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 outline-none text-slate-800 transition"
                  autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCatModal(false)}
                    className="px-4 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl shadow-md shadow-orange-500/10 transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Food Item Modal (Add / Edit) */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowItemModal(false)}
              className="absolute inset-0 bg-black"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 md:p-8 relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">
                {editingItem ? "Edit Food Dish" : "Add Food Dish"}
              </h3>
              
              <form onSubmit={handleItemSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Dish Name
                    </label>
                    <input
                      type="text"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g. Margherita Pizza"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 outline-none text-slate-800 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="299"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 outline-none text-slate-800 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    placeholder="Describe flavor notes, ingredients, allergy warnings..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 outline-none text-slate-800 transition resize-none"
                  />
                </div>


                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dish Image
                  </label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload-input")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 relative overflow-hidden ${
                      isDragging 
                        ? "border-orange-500 bg-orange-50/30" 
                        : itemImage 
                          ? "border-slate-200 bg-slate-50/50" 
                          : "border-slate-200 hover:border-slate-350 bg-slate-50/20"
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload-input"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {itemImage ? (
                      <div className="space-y-3 w-full flex flex-col items-center">
                        <div className="w-24 h-24 rounded-xl border border-slate-100 p-0.5 overflow-hidden shadow-sm relative group bg-white">
                          <img src={itemImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemImage("");
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold rounded-lg"
                          >
                            Remove
                          </button>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">Click or drag new image to replace</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-700">Drag & drop your dish image here</p>
                          <p className="text-[10px] text-slate-400 font-light">or click to browse your files (PNG, JPG)</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Image presets / URL alternate options */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Or select a high-quality preset:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {FOOD_IMAGE_PRESETS.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => setItemImage(img.url)}
                          className={`px-3 py-1 rounded-lg border text-xs font-semibold shrink-0 transition ${
                            itemImage === img.url 
                              ? "bg-orange-55 text-orange-600 border-orange-500" 
                              : "bg-slate-50/50 text-slate-500 border-slate-200 hover:border-slate-350"
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="pt-1">
                      <details className="text-xs">
                        <summary className="text-orange-500 hover:text-orange-650 font-bold cursor-pointer select-none outline-none">
                          Or input custom image URL instead
                        </summary>
                        <div className="mt-2">
                          <input
                            type="url"
                            value={itemImage.startsWith("data:") ? "" : itemImage}
                            onChange={(e) => setItemImage(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2.5 outline-none text-slate-850 transition text-xs"
                          />
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemFeatured}
                      onChange={(e) => setItemFeatured(e.target.checked)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    Featured Dish
                  </label>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemAvailable}
                      onChange={(e) => setItemAvailable(e.target.checked)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                    />
                    Available to Order
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/10 transition"
                  >
                    Save Dish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
