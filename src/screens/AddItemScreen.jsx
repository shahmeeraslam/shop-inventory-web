import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

export default function AddItemScreen({ onNavigateBack }) {
  const { addItem } = useInventory();
  const [itemName, setItemName] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // 🔥 Image States: image holds raw file object, imagePreview holds local Blob URL for rendering
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Pipeline saving execution lock state
  const [isSaving, setIsSaving] = useState(false);

  // Validation boundary states updated for both pricing mechanisms
  const [errors, setErrors] = useState({ name: false, retailPrice: false, wholesalePrice: false });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // 🔥 Keep raw file object structure for Multi-part form streaming
      setImagePreview(URL.createObjectURL(file)); // Create an instant visual tracking link for display tags
    }
  };

  const handleSave = async () => {
    const hasNameError = !itemName.trim();
    const hasRetailError = !retailPrice.trim() || parseFloat(retailPrice) < 0;
    const hasWholesaleError = !wholesalePrice.trim() || parseFloat(wholesalePrice) < 0;

    if (hasNameError || hasRetailError || hasWholesaleError) {
      setErrors({ 
        name: hasNameError, 
        retailPrice: hasRetailError, 
        wholesalePrice: hasWholesaleError 
      });
      return;
    }
    
    setIsSaving(true);

    // 🔥 Pack fields into a multipart FormData container to send raw files down the network
    const formData = new FormData();
    formData.append('name', itemName.trim());
    formData.append('retailPrice', parseFloat(retailPrice));
    formData.append('wholesalePrice', parseFloat(wholesalePrice));
    formData.append('quantity', parseInt(quantity, 10));
    formData.append('category', category.trim() || 'General');
    formData.append('description', description.trim() || 'Premium entry catalog assignment categorized under active live collections.');
    
    if (image) {
      formData.append('image', image); // Attaches the file directly to your backend upload middleware key name
    }

    const response = await addItem(formData); // Passing Form Data instead of JSON payload

    if (response && response.success) {
      if (imagePreview) URL.revokeObjectURL(imagePreview); // Clean memory buffer pointer leaks from browser cache
      onNavigateBack(); 
    } else {
      alert(`Database rejected sync write block: ${response.error || 'Unknown Error'}`);
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full bg-white animate-fadeIn max-w-4xl mx-auto ${isSaving ? 'opacity-60 pointer-events-none' : ''}`}>
      
      {/* HEADER SECTION: Fixed Breadcrumb Action Row */}
      <div className="flex justify-between items-center pb-5 border-b border-slate-100/80 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateBack} 
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-all border border-slate-100 cursor-pointer text-xs font-bold flex items-center disabled:opacity-40"
            title="Go Back"
          >
            ←
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Create Stock Entry</h2>
            <p className="text-xs text-slate-400 hidden sm:block">Add a new unique product identifier with retail and wholesale pricing matrices.</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:bg-slate-700 disabled:cursor-not-allowed select-none font-mono"
        >
          <span>{isSaving ? '⏳' : '✨'}</span> 
          {isSaving ? 'Syncing Base...' : 'Save Item'}
        </button>
      </div>

      {/* FORM BODY: Dual-Column Responsive Grid Architecture */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto pb-8 pr-1">
        
        {/* LEFT PANEL: Media Content Workspace (Spans 5 Columns) */}
        <div className="md:col-span-5 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Product Visual Media</span>
          
          <label className="w-full aspect-square md:aspect-auto md:h-[380px] bg-slate-50/70 hover:bg-slate-50 border-2 border-dashed border-slate-200/80 hover:border-slate-400 rounded-2xl flex flex-col justify-center items-center cursor-pointer overflow-hidden relative group transition-all duration-300 shadow-inner">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isSaving} />
            
            {imagePreview ? (
              <>
                <div className="w-full h-full p-4 flex items-center justify-center bg-slate-950">
                  <img src={imagePreview} alt="Preview framework asset" className="max-w-full max-h-full object-contain group-hover:scale-102 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-white gap-1 transition-all duration-300">
                  <span className="text-xl">📸</span>
                  <span className="text-xs font-bold tracking-wide">Replace Asset Photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center gap-2 p-6 group-hover:translate-y-[-2px] transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  🖼️
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-extrabold text-slate-700">Upload high-res photo</span>
                  <span className="text-[11px] text-slate-400 max-w-[180px] leading-normal">Supports JPEG, PNG, or WebP base assets</span>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* RIGHT PANEL: Metadata Form Matrix Fields (Spans 7 Columns) */}
        <div className="md:col-span-7 flex flex-col gap-5 justify-start">
          
          {/* Metadata Field 1: Core Name Element */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Item / Identification Name</label>
            <input 
              type="text" 
              placeholder="e.g., Premium Vintage Hoodie" 
              value={itemName} 
              disabled={isSaving}
              onChange={(e) => {
                setItemName(e.target.value);
                if(errors.name) setErrors(prev => ({...prev, name: false}));
              }} 
              className={`w-full p-3.5 bg-slate-50 border rounded-xl text-sm font-medium outline-hidden focus:bg-white focus:ring-4 transition-all box-border text-slate-800 placeholder-slate-400 ${
                errors.name 
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-50 shadow-xs' 
                  : 'border-slate-200/80 focus:border-slate-400 focus:ring-slate-100'
              }`}
            />
            {errors.name && <span className="text-[11px] font-bold text-rose-500 tracking-wide">⚠️ Item identification name is strictly required.</span>}
          </div>

          {/* Combined Form Grid Row: Separate Pricing Models */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Metadata Field 2: Retail Pricing Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Retail Price ($ / Single Piece)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                step="0.01"
                value={retailPrice} 
                disabled={isSaving}
                onChange={(e) => {
                  setRetailPrice(e.target.value);
                  if(errors.retailPrice) setErrors(prev => ({...prev, retailPrice: false}));
                }} 
                className={`w-full p-3.5 bg-slate-50 border rounded-xl text-sm font-medium outline-hidden focus:bg-white focus:ring-4 transition-all box-border text-slate-800 placeholder-slate-400 ${
                  errors.retailPrice 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-50 shadow-xs' 
                    : 'border-slate-200/80 focus:border-slate-400 focus:ring-slate-100'
                }`}
              />
              {errors.retailPrice && <span className="text-[11px] font-bold text-rose-500 tracking-wide">⚠️ Provide a valid retail base price value.</span>}
            </div>

            {/* Metadata Field 3: Wholesale Pricing Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Wholesale Price ($ / Bulk Buy)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                step="0.01"
                value={wholesalePrice} 
                disabled={isSaving}
                onChange={(e) => {
                  setWholesalePrice(e.target.value);
                  if(errors.wholesalePrice) setErrors(prev => ({...prev, wholesalePrice: false}));
                }} 
                className={`w-full p-3.5 bg-slate-50 border rounded-xl text-sm font-medium outline-hidden focus:bg-white focus:ring-4 transition-all box-border text-slate-800 placeholder-slate-400 ${
                  errors.wholesalePrice 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-50 shadow-xs' 
                    : 'border-slate-200/80 focus:border-slate-400 focus:ring-slate-100'
                }`}
              />
              {errors.wholesalePrice && <span className="text-[11px] font-bold text-rose-500 tracking-wide">⚠️ Provide a valid wholesale base price value.</span>}
            </div>

          </div>

          {/* Combined Form Grid Row: Category and Stock Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Metadata Field 4: Custom Category Placement Taxonomy Tag */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Stock Category Placement</label>
              <input 
                type="text" 
                placeholder="e.g., Luxury Apparel, Outerwear" 
                value={category} 
                disabled={isSaving}
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-medium outline-hidden focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100/80 transition-all box-border text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Metadata Field 5: Granular Segmented Units Counter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Initial Warehouse Units</label>
              <div className="flex justify-between items-center border border-slate-200/80 rounded-xl h-[49px] overflow-hidden bg-slate-50 p-1 box-border">
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={() => setQuantity(q => q > 0 ? q - 1 : 0)} 
                  className="w-10 h-full rounded-lg text-sm font-extrabold text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xs active:bg-slate-50 transition-all cursor-pointer flex items-center justify-center select-none disabled:opacity-30"
                >
                  —
                </button>
                <span className="text-sm font-black text-slate-800 font-mono tracking-tight px-4">{quantity}</span>
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={() => setQuantity(q => q + 1)} 
                  className="w-10 h-full rounded-lg text-sm font-extrabold text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xs active:bg-slate-50 transition-all cursor-pointer flex items-center justify-center select-none disabled:opacity-30"
                >
                  ＋
                </button>
              </div>
            </div>

          </div>

          {/* Metadata Field 6: Premium Menu Description Subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Menu / Showcase Subtitle Description</label>
            <textarea 
              rows="3"
              placeholder="Enter a captivating story or feature snippet for the poster menu display layout..." 
              value={description} 
              disabled={isSaving}
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-medium outline-hidden focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100/80 transition-all box-border text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>

        </div>
      </div>
    </div>
  );
}