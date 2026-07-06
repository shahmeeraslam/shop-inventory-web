import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext'; 
// =========================================================================
// IMPORT CENTRALIZED ROUTING ROUTE PATHWAY
// =========================================================================
import { API_BASE_URL } from '../api'; // Adjust the relative pathway here matching your folder depth layout
import html2pdf from 'html2pdf.js';

export default function BillingScreen({ onNavigateBack }) {
  const { items, updateItem, refreshBillingHistory } = useInventory();
  const { token } = useAuth(); 
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  const WHOLESALE_THRESHOLD = 10;

  const addToCart = (product) => {
    const productId = product._id || product.id;
    const existing = cart.find(item => (item._id || item.id) === productId);
    
    if (existing) {
      if (existing.quantity >= product.quantity) {
        alert("Cannot add more units than currently held in storage warehouse.");
        return;
      }
      setCart(cart.map(item => ((item._id || item.id) === productId) ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQty = (id, val) => {
    const inventoryItem = items.find(i => (i._id || i.id) === id);
    if (!inventoryItem) return;

    if (val > inventoryItem.quantity) {
      alert(`Insufficient product storage warehouse count. Maximum available is ${inventoryItem.quantity}.`);
      return;
    }
    if (val <= 0) {
      setCart(cart.filter(item => (item._id || item.id) !== id));
    } else {
      setCart(cart.map(item => (item._id || item.id) === id ? { ...item, quantity: val } : item));
    }
  };

  const calculateItemPrice = (item) => {
    const useWholesale = item.quantity >= WHOLESALE_THRESHOLD;
    return useWholesale ? parseFloat(item.wholesalePrice) : parseFloat(item.retailPrice);
  };

  const totalBillAmount = cart.reduce((acc, item) => acc + (calculateItemPrice(item) * item.quantity), 0);

  const handleCheckoutInvoice = async () => {
    if (cart.length === 0) return;
    setIsPrinting(true);

    const invoiceNumber = `ARC-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. SAVE TO DATABASE MANIFEST RECORD (Dynamically switches environment routing bounds)
      const response = await fetch(`${API_BASE_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          invoiceNumber,
          customerName: customerName.trim() || 'Walk-in Retail Client',
          cartItems: cart,
          totalAmount: totalBillAmount
        })
      });

      const dbResult = await response.json();
      if (!dbResult.success) {
        throw new Error(dbResult.error || "Failed logging invoice into database ledger.");
      }

      // 2. SUBTRACT STOCK VOLUMES LOCALLY
      if (typeof updateItem === 'function') {
        const checkoutPromises = cart.map(item => {
          const itemId = item._id || item.id;
          const inventoryItem = items.find(i => (i._id || i.id) === itemId);
          if (inventoryItem) {
            const targetQuantity = inventoryItem.quantity - item.quantity;
            return updateItem(itemId, { quantity: Math.max(0, targetQuantity) });
          }
          return Promise.resolve();
        });
        await Promise.all(checkoutPromises);
      }

      // Re-trigger global context history pull to ensure ledger tables update
      if (typeof refreshBillingHistory === 'function') {
        await refreshBillingHistory();
      }

      // 3. GENERATE RENDER DOCUMENT Blueprints
      const element = document.createElement('div');
      const invoiceRowsHtml = cart.map((item, index) => {
        const rateUsed = calculateItemPrice(item);
        const isWholesale = item.quantity >= WHOLESALE_THRESHOLD;
        return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 14px 10px; font-size: 11px; color: #94a3b8; font-family: monospace; text-align: center;">${String(index + 1).padStart(2, '0')}</td>
            <td style="padding: 14px 10px; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
              ${item.name}
              ${isWholesale ? '<span style="font-size: 8px; color: #0d9488; background: #ccfbf1; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 800; font-family: monospace;">WHL</span>' : '<span style="font-size: 8px; color: #475569; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 800; font-family: monospace;">RTL</span>'}
            </td>
            <td style="padding: 14px 10px; font-size: 13px; font-weight: 700; text-align: center; color: #0f172a; font-family: monospace;">${item.quantity}</td>
            <td style="padding: 14px 10px; font-size: 13px; text-align: right; color: #475569; font-family: monospace;">$${rateUsed.toFixed(2)}</td>
            <td style="padding: 14px 10px; font-size: 13px; font-weight: 800; text-align: right; color: #0f172a; font-family: monospace;">$${(rateUsed * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      }).join('');

      element.innerHTML = `
        <div style="padding: 50px; font-family: system-ui, -apple-system, sans-serif; background-color: #ffffff; color: #1e293b;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 25px; margin-bottom: 35px;">
            <div>
              <h1 style="font-size: 32px; font-weight: 950; color: #0f172a; margin: 0; letter-spacing: -1px; text-transform: uppercase;">THE ARCHIVE</h1>
              <p style="font-size: 10px; color: #0d9488; margin: 6px 0 0 0; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Commercial Sales Invoice Receipt</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #475569; line-height: 1.6;">
              <p style="margin: 0; font-family: monospace;"><strong>INVOICE:</strong> #${invoiceNumber}</p>
              <p style="margin: 0; font-family: monospace;"><strong>DATE:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div style="margin-bottom: 35px; font-size: 13px; background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 6px 0; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; font-family: monospace;">Billed Account Client</p>
            <strong style="font-size: 16px; color: #0f172a; text-transform: uppercase;">${customerName.trim() || 'Walk-in Retail Client'}</strong>
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 40px;">
            <thead>
              <tr style="background-color: #0f172a; color: #ffffff;">
                <th style="padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-top-left-radius: 8px; border-bottom-left-radius: 8px; text-align: center; width: 50px;">#</th>
                <th style="padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Item Specification</th>
                <th style="padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; width: 70px;">Qty</th>
                <th style="padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; width: 110px;">Rate</th>
                <th style="padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border-top-right-radius: 8px; border-bottom-right-radius: 8px; width: 130px;">Amount</th>
              </tr>
            </thead>
            <tbody>${invoiceRowsHtml}</tbody>
          </table>

          <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
            <div style="width: 280px; background-color: #0f172a; padding: 22px; border-radius: 14px; color: #ffffff; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: #94a3b8; letter-spacing: 1px;">TOTAL SETTLEMENT</span>
                <span style="font-size: 22px; font-weight: 900; font-family: monospace; color: #ffffff;">$${totalBillAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 100px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 24px;">
            <p style="margin: 0; font-weight: 500;">Thank you for conducting business with The Archive Studio. Verified Settlement Draft.</p>
          </div>
        </div>
      `;

      const configOptions = {
        margin: [10, 10, 10, 10],
        filename: `Invoice_${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(configOptions).from(element).save();
      
      setCart([]);
      setCustomerName('');
      onNavigateBack();
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className={`flex flex-col lg:grid lg:grid-cols-12 gap-6 h-full w-full max-w-7xl mx-auto p-1 box-border ${isPrinting ? 'opacity-60 pointer-events-none' : ''}`}>
      
      {/* LEFT COLUMN: Interactive Catalog Workspace */}
      <div className="lg:col-span-7 flex flex-col gap-5 min-h-0">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <button 
            onClick={onNavigateBack} 
            className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-all border border-slate-100 cursor-pointer text-xs font-bold"
          >
            ←
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Items to Receipt</h2>
            <p className="text-xs text-slate-400">Select product variants from the live warehouse allocation matrix below.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto flex-1 pr-1 max-h-[calc(100vh-180px)]">
          {items.map(product => {
            const productId = product._id || product.id;
            return (
              <div 
                key={productId}
                className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl flex gap-3 items-center justify-between group transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/40 relative"
              >
                <div className="w-12 h-12 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 bg-cover bg-center" style={product.image ? { backgroundImage: `url(${product.image})` } : {}}>
                  {!product.image && <span className="text-lg">👕</span>}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-800 truncate uppercase text-xs tracking-wide">{product.name}</h4>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-bold font-mono text-slate-500">RTL: ${parseFloat(product.retailPrice).toFixed(2)}</span>
                    <span className="text-[10px] font-bold font-mono text-teal-600 bg-teal-50 px-1 rounded-sm">WHL: ${parseFloat(product.wholesalePrice).toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Avail: {product.quantity} units</p>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                  className="bg-white hover:bg-slate-950 hover:text-white border border-slate-200 hover:border-slate-950 text-[11px] font-extrabold px-3 py-2 rounded-xl transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-40 disabled:bg-slate-100 disabled:border-slate-100 disabled:cursor-not-allowed select-none shadow-2xs font-mono"
                >
                  {product.quantity <= 0 ? 'Out' : '＋ ADD'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Bill Calculation Sidebar Panel */}
      <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/60 rounded-3xl p-5 flex flex-col justify-between max-h-[calc(100vh-120px)] shadow-xs">
        <div className="flex flex-col min-h-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Active Bill Summary</span>
          
          <input 
            type="text" 
            placeholder="Enter Customer / Business Name..." 
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)} 
            className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium mb-4 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100/60 transition-all text-slate-800 shadow-2xs placeholder-slate-400" 
          />
          
          <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1 border-b border-dashed border-slate-200/80 pb-4">
            {cart.length > 0 ? cart.map(item => {
              const itemId = item._id || item.id;
              const currentRate = calculateItemPrice(item);
              const isWholesale = item.quantity >= WHOLESALE_THRESHOLD;
              return (
                <div key={itemId} className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center shadow-2xs group animate-fadeIn">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-extrabold text-slate-800 uppercase truncate flex items-center gap-1.5 tracking-wide">
                      {item.name}
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-black ${isWholesale ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                        {isWholesale ? 'WHL' : 'RTL'}
                      </span>
                    </h5>
                    <span className="text-xs font-bold font-mono text-slate-900 mt-1 block">${currentRate.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">/unit</span></span>
                  </div>
                  
                  <div className="flex items-center border border-slate-200/60 rounded-xl h-[36px] overflow-hidden bg-slate-50 p-0.5 box-border shrink-0 ml-2">
                    <button 
                      onClick={() => updateCartQty(itemId, item.quantity - 1)}
                      className="w-7 h-full rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-center select-none"
                    >
                      —
                    </button>
                    <span className="text-xs font-black text-slate-800 font-mono tracking-tight px-3.5 min-w-[16px] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQty(itemId, item.quantity + 1)}
                      className="w-7 h-full rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-center select-none"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-2">
                <span className="text-2xl opacity-60">📥</span>
                <p className="text-xs text-slate-400 font-medium max-w-[200px] leading-normal">Checkout list is empty. Add assets from the catalog segment matrix.</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-2">
          <div className="flex justify-between items-baseline mb-4 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Invoice Value:</span>
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">${totalBillAmount.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckoutInvoice} 
            disabled={cart.length === 0 || isPrinting} 
            className="w-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-4 rounded-xl transition-all shadow-xs hover:shadow-md active:scale-[0.99] disabled:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 select-none font-mono tracking-wide uppercase"
          >
            <span>{isPrinting ? '⏳' : '💳'}</span> 
            {isPrinting ? 'Settling Ledger Accounts...' : 'Complete & Print Invoice'}
          </button>
        </div>
      </div>

    </div>
  );
}