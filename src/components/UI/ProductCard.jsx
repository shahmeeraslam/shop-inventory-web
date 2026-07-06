import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext'; // <-- ADD THIS IMPORT

export default function ProductCard({ item, onDelete }) {
  const { updateItem } = useInventory(); // <-- HOOK IN THE UPDATE HANDLER
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  
  const itemId = item._id || item.id; 
  const isLowStock = item.quantity <= 3;
  const isOutOfStock = item.quantity === 0;

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

  // NEW: Quick-Click Stock Adjuster Handlers
  const adjustStockCount = async (amount) => {
    const targetQuantity = item.quantity + amount;
    if (targetQuantity < 0) return; // Prevent negative stock mappings

    setIsUpdatingStock(true);
    const result = await updateItem(itemId, { quantity: targetQuantity });
    if (result && !result.success) {
      alert(`Failed to update stock count matrix: ${result.error}`);
    }
    setIsUpdatingStock(false);
  };

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all duration-300 gap-4 group ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>
      
      {/* Product Image & Meta Parameters */}
      <div className="flex items-center gap-4.5 w-full sm:w-auto min-w-0">
        {item.image ? (
          <div className="w-18 h-18 bg-slate-950 rounded-xl overflow-hidden border border-slate-100 shadow-inner shrink-0 group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center p-1">
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
          {/* Quick Decrement Button */}
          <button
            onClick={() => adjustStockCount(-1)}
            disabled={isOutOfStock || isUpdatingStock}
            className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
            title="Deduct 1 Item"
          >
            －
          </button>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border tracking-wide font-mono transition-all ${
            isOutOfStock 
              ? 'bg-rose-50 text-rose-600 border-rose-100' 
              : isLowStock 
                ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {isUpdatingStock ? '⏳ Updating...' : isOutOfStock ? 'Out of Stock' : `${item.quantity} Units`}
          </span>

          {/* Quick Increment Button */}
          <button
            onClick={() => adjustStockCount(1)}
            disabled={isUpdatingStock}
            className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 select-none"
            title="Add 1 Item"
          >
            ＋
          </button>
        </div>
        
        {/* Core Erasure Trigger */}
        <button 
          onClick={handleDeleteClick} 
          disabled={isDeleting || isUpdatingStock}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-rose-100 disabled:opacity-50"
          title="Delete item"
        >
          {isDeleting ? '⏳' : '🗑️'} <span className="opacity-80 group-hover:opacity-100 transition-opacity">{isDeleting ? 'Wiping...' : 'Remove'}</span>
        </button>
      </div>
    </div>
  );
}