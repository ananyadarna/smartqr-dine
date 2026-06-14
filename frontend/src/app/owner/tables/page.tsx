"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  ExternalLink, 
  Grid, 
  Plus, 
  QrCode, 
  RefreshCw, 
  TableProperties, 
  Trash2 
} from "lucide-react";
import { getTablesByRestaurant, createTable, deleteTable, updateTable } from "@/services/table.service";
import { generateQR } from "@/services/qr.service";
import { useAuthStore } from "@/stores/auth.store";

export default function TablesManagementPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [tableNum, setTableNum] = useState("");
  const [tableName, setTableName] = useState("");

  const loadTables = async () => {
    if (!restaurantId) return;
    try {
      const data = await getTablesByRestaurant(restaurantId);
      setTables(data);
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [restaurantId]);

  // Handle single table creation
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tableNum);
    if (isNaN(num) || num <= 0 || !restaurantId) return;

    setBtnLoading(true);
    setError("");

    try {
      // 1. Create table object on backend
      const tableData = await createTable({ restaurantId, tableNumber: num });
      
      // 2. Immediately trigger QR generation so it has a valid image
      const qrData = await generateQR(tableData.id);
      
      // 3. Prepend to state
      const completeTable = {
        ...tableData,
        qrCodeUrl: qrData.qrCodeUrl,
      };

      setTables((prev) => [...prev, completeTable].sort((a,b) => a.tableNumber - b.tableNumber));
      setTableNum("");
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Table already exists or creation failed.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Trigger QR regeneration for a specific table
  const handleRegenerateQR = async (tableId: string) => {
    try {
      const qrData = await generateQR(tableId);
      setTables((prev) => 
        prev.map((t) => (t.id === tableId ? { ...t, qrCodeUrl: qrData.qrCodeUrl } : t))
      );
    } catch (err) {
      console.error("Failed to regenerate QR:", err);
    }
  };

  // Toggle Table Active status
  const handleToggleActive = async (table: any) => {
    try {
      const updated = await updateTable(table.id, { isActive: !table.isActive });
      setTables((prev) => 
        prev.map((t) => (t.id === table.id ? { ...t, isActive: updated.isActive } : t))
      );
    } catch (err) {
      console.error("Failed to toggle table status:", err);
    }
  };

  // Delete table
  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Are you sure you want to delete this table? Dynamically generated QR codes will stop redirecting!")) return;
    try {
      await deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    } catch (err) {
      console.error("Failed to delete table:", err);
    }
  };

  // Trigger browser base64 download helper
  const downloadQR = (table: any) => {
    if (!table.qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = table.qrCodeUrl;
    link.download = `${table.name.replace(/\s+/g, "_")}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Tables & QR Codes
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Setup your dining layout, view active tables, and export scannable QR cards.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-500/15 transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Dining Table
        </button>
      </div>

      {/* Grid of Tables */}
      {tables.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm flex flex-col items-center">
          <TableProperties className="w-12 h-12 text-slate-200 mb-3" />
          <p className="font-medium">No tables configured yet.</p>
          <p className="text-xs font-light mt-1">Click the button above to register your first dining table.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => (
            <motion.div
              key={table.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 group hover:shadow-md transition ${
                !table.isActive ? "bg-slate-50 border-dashed opacity-80" : ""
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{table.name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold font-mono select-all">Code: {table.tableCode}</span>
                </div>
                <button
                  onClick={() => handleToggleActive(table)}
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                    table.isActive 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200/50" 
                      : "bg-red-50 text-red-600 border-red-200/50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200/50"
                  }`}
                  title={table.isActive ? "Mark Inactive" : "Mark Active"}
                >
                  {table.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              {/* QR Image Graphic Section */}
              <div className="relative aspect-square max-w-[150px] mx-auto bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                {table.qrCodeUrl ? (
                  <img 
                    src={table.qrCodeUrl} 
                    alt={`QR Code for ${table.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2 space-y-2">
                    <QrCode className="w-8 h-8 text-slate-200 mx-auto" />
                    <button
                      onClick={() => handleRegenerateQR(table.id)}
                      className="text-[10px] text-orange-500 font-bold hover:underline flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Generate
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                  title="Delete Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <a 
                    href={`/menu/${table.tableCode}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition flex items-center gap-1 text-[10px] font-semibold"
                    title="Test Customer Menu Scan Redirect"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Live Link
                  </a>
                  <button
                    onClick={() => downloadQR(table)}
                    disabled={!table.qrCodeUrl}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-bold p-1.5 rounded-lg cursor-pointer transition flex items-center gap-1 text-xs"
                    title="Download Table QR Code (PNG)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative z-10 space-y-4"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Add Dining Table</h3>
                <p className="text-slate-400 text-xs font-light">Specify the number for the physical dining table.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddTable} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Table Number
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tableNum}
                    onChange={(e) => setTableNum(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-3 outline-none text-slate-800 transition"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={btnLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl shadow-md shadow-orange-500/10 transition flex items-center gap-1.5"
                  >
                    {btnLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Register"
                    )}
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
