import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';

export default function ProductCard({ item, onDelete }) {
  const { updateItem } = useInventory(); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);

  // Form State Inputs Matrix
  const [editName, setEditName] = useState(item.name || '');
  const [editCategory, setEditCategory] = useState(item.category || 'General');
  const [editRetail, setEditRetail] = useState(item.retailPrice || 0);
  const [editWholesale, setEditWholesale] = useState(item.wholesalePrice || 0);
  
  // Binary states tracking
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(item.image || '');
  
  const itemId = item._id || item.id; 
  const isLowStock = item.quantity <= 3;
  const isOutOfStock = item.quantity === 0;

  // 🔥 Sync internal states if the global context item document changes externally
  useEffect(() => {
    setEditName(item.name || '');
    setEditCategory(item.category || 'General');
    setEditRetail(item.retailPrice || 0);
    setEditWholesale(item.wholesalePrice || 0);
    setEditPreview(item.image || '');
    setEditFile(null);
  }, [item]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // If a previous unsubmitted local object URL exists, revoke it to prevent browser memory leaks
      if (editPreview && editPreview.startsWith('blob:')) {
        URL.revokeObjectURL(editPreview);
      }
      setEditFile(file); 
      setEditPreview(URL.createObjectURL(file)); 
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to completely erase "${item.name}" from the database layout?`)) {
      setIsDeleting(true);
      const result = await onDelete(itemId);
      if (result && !result.success) {
        alert(`Error executing erasure sequence: ${result.error}`);
        setIsDeleting(false);
      }
    }
  };

  const adjustStockCount = async (amount) => {
    const targetQuantity = (item.quantity || 0) + amount;
    if (targetQuantity < 0) return; 

    setIsUpdating(true);
    // Direct state modifier block
    const result = await updateItem(itemId, { quantity: targetQuantity });
    if (result && !result.success) {
      alert(`Failed to update stock count matrix: ${result.error}`);
    }
    setIsUpdating(false);
  };

  const handleFormUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return alert("Product Name cannot be left completely empty.");

    setIsUpdating(true);
    
    // Encapsulate values directly within multi-part boundary fields
    const formData = new FormData();
    formData.append('name', editName.trim());
    formData.append('category', editCategory.trim());
    formData.append('retailPrice', parseFloat(editRetail) || 0);
    formData.append('wholesalePrice', parseFloat(editWholesale) || 0);
    
    if (editFile) {
      formData.append('image', editFile); 
    }

    const result = await updateItem(itemId, formData);

    if (result && result.success) {
      if (editFile && editPreview.startsWith('blob:')) URL.revokeObjectURL(editPreview);
      setIsEditingForm(false);
      setEditFile(null);
    } else {
      alert(`Failed to update ledger values: ${result?.error || 'Unknown network deviation.'}`);
    }
    setIsUpdating(false);
  };

  const handleCancel = () => {
    // 🔥 Explicitly revoke object URLs on cancel loop to keep memory foot-print optimized
    if (editPreview && editPreview.startsWith('blob:')) {
      URL.revokeObjectURL(editPreview);
    }
    setEditName(item.name || '');
    setEditCategory(item.category || 'General');
    setEditRetail(item.retailPrice || 0);
    setEditWholesale(item.wholesalePrice || 0);
    setEditPreview(item.image || '');
    setEditFile(null);
    setIsEditingForm(false);
  };

  return (
    <div className={`flex flex-col p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all duration-300 gap-4 group ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>
      
      {!isEditingForm ? (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          {/* Product Image & Meta Parameters */}
          <div className="flex items-center gap-4.5 w-full sm:w-auto min-w-0">
            {item.image ? (
              <div className="w-18 h-18 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-inner shrink-0 group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center p-1">
                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-18 h-18 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl text-slate-400 shrink-0 shadow-inner group-hover:bg-slate-100 transition-colors">
                📦
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0 w-full">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 py-0.5 bg-slate-100 rounded-md w-fit font-mono">
                {item.category || 'General'}
              </span>
              <h4 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-slate-900 transition-colors truncate">
                {item.name}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 text-xs font-mono text-slate-500 mt-0.5">
                <div>Rtl: <span className="font-black text-slate-900">${parseFloat(item.retailPrice || 0).toFixed(2)}</span></div>
                <div className="text-slate-300">|</div>
                <div>Whl: <span className="font-black text-teal-600">${parseFloat(item.wholesalePrice || 0).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          
          {/* Stock Quantities & Rapid Increment Controls */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3.5 sm:pt-0 border-slate-100/70 gap-3.5 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustStockCount(-1)}
                disabled={isOutOfStock || isUpdating}
                className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
              >
                －
              </button>

              <span className={`text-xs font-bold px-3 py-1 rounded-full border tracking-wide font-mono transition-all ${
                isOutOfStock ? 'bg-rose-50 text-rose-600 border-rose-100' : isLowStock ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                {isUpdating ? '⏳ Syncing...' : isOutOfStock ? 'Out of Stock' : `${item.quantity} Units`}
              </span>

              <button
                onClick={() => adjustStockCount(1)}
                disabled={isUpdating}
                className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 select-none"
              >
                ＋
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditingForm(true)}
                disabled={isUpdating}
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 px-2.5 py-1.5 rounded-xl transition-all text-xs font-bold flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={handleDeleteClick} 
                disabled={isDeleting || isUpdating}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-rose-100"
              >
                {isDeleting ? '⏳' : '🗑️'} Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* UPGRADED EDIT PANEL MODE WORKSPACE LAYOUT */
        <form onSubmit={handleFormUpdateSubmit} className="w-full flex flex-col md:flex-row gap-5 bg-slate-50/80 p-5 rounded-xl border border-slate-200/60 animate-fadeIn">
          
          {/* Edit Column Left: Interactive Mini Image Manager */}
          <div className="flex flex-col items-center gap-2 shrink-0 justify-start">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono self-start">Photo Edit</label>
            <label className="w-24 h-24 bg-white rounded-xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-slate-400 flex items-center justify-center relative cursor-pointer group shadow-inner">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUpdating} />
              {editPreview ? (
                <>
                  <img src={editPreview} alt="Update item thumbnail" className="max-w-full max-h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">Swap</div>
                </>
              ) : (
                <span className="text-xl">📸</span>
              )}
            </label>
          </div>

          {/* Edit Column Right: Structural Inputs Block Layout */}
          <div className="flex-1 flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Product Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Category Group</label>
                <input 
                  type="text" 
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Retail Value ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editRetail}
                  onChange={(e) => setEditRetail(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Wholesale Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editWholesale}
                  onChange={(e) => setEditWholesale(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono text-teal-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 items-center border-t border-slate-200/50 pt-3 mt-1">
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-white active:scale-98 font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-1.5 rounded-lg bg-slate-950 text-white text-xs hover:bg-slate-800 active:scale-98 font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                {isUpdating ? '⏳ Saving...' : '💾 Update Ledger'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}