import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx'; 
import StatCard from '../components/UI/StatCard';
import ProductCard from '../components/UI/ProductCard';

export default function DashboardScreen({ onNavigateToAdd, onNavigateToBilling }) {
  const { items, deleteItem, isLoading } = useInventory();
  const { authLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // =========================================================================
  // ENHANCED LIFECYCLE GATE: Stops dashboard calculations if array isn't populated
  // =========================================================================
  if (isLoading || authLoading || !items) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 gap-3 text-slate-500 font-mono text-xs select-none">
        <span className="text-3xl animate-spin mb-1">⏳</span>
        <span className="font-bold tracking-widest text-slate-400">SYNCHRONIZING USER MANIFEST LEDGER...</span>
        <span className="text-[10px] text-slate-300">// SECURITY HANDSHAKE ACTIVE WITH ATLAS CLUSTER</span>
      </div>
    );
  }

  // =========================================================================
  // BULLETPROOF METRIC REDUCERS (Defensively defaults inputs against undefined)
  // =========================================================================
  const totalItems = items?.length || 0;
  
  const totalStockUnits = items ? items.reduce((acc, curr) => {
    const qty = parseInt(curr?.quantity, 10);
    return acc + (isNaN(qty) ? 0 : qty);
  }, 0) : 0;

  const totalRetailValue = items ? items.reduce((acc, curr) => {
    const price = parseFloat(curr?.retailPrice);
    const qty = parseInt(curr?.quantity, 10);
    return acc + ((isNaN(price) ? 0 : price) * (isNaN(qty) ? 0 : qty));
  }, 0) : 0;

  const totalWholesaleValue = items ? items.reduce((acc, curr) => {
    const price = parseFloat(curr?.wholesalePrice);
    const qty = parseInt(curr?.quantity, 10);
    return acc + ((isNaN(price) ? 0 : price) * (isNaN(qty) ? 0 : qty));
  }, 0) : 0;

  // Added absolute optional chain protection to item parameters inside string lookup mechanisms
  const filteredItems = items ? items.filter(item => {
    const itemName = item?.name || '';
    const currentSearch = searchTerm || '';
    return itemName.toLowerCase().includes(currentSearch.toLowerCase());
  }) : [];

  // Core Data Extraction System - SYNCHRONIZED FIELD MATRIX
  const handleExportExcel = () => {
    if (!items || items.length === 0) {
      alert("Cannot generate an Excel report for an empty inventory ledger.");
      return;
    }

    const excelRows = items.map((item, index) => ({
      'S.No': index + 1,
      'Product Name': (item?.name || 'UNNAMED PRODUCT').toUpperCase(),
      'Category': (item?.category || 'GENERAL').toUpperCase(),
      'Retail Price ($)': parseFloat(item?.retailPrice || 0),
      'Wholesale Price ($)': parseFloat(item?.wholesalePrice || 0),
      'Stock Quantity': item?.quantity || 0,
      'Total Value ($)': parseFloat(item?.retailPrice || 0) * (item?.quantity || 0),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    const columnWidths = Object.keys(excelRows[0]).map(key => ({
      wch: Math.max(key.length + 3, ...excelRows.map(row => row[key]?.toString().length || 0))
    }));
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Manifest');
    
    const dateString = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Archive_Manifest_${dateString}.xlsx`);
  };

  // Core Document Compile PDF System - SYNCHRONIZED FIELD MATRIX
  const handleExportPDF = () => {
    if (!items || items.length === 0) {
      alert("Cannot generate a report for an empty inventory ledger.");
      return;
    }

    setIsGeneratingPdf(true);

    const element = document.createElement('div');
    const tableRowsHtml = items.map((item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-size: 11px; color: #334155; font-family: monospace;">#${index + 1}</td>
        <td style="padding: 12px 8px; font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase;">${item?.name || 'UNNAMED PRODUCT'}</td>
        <td style="padding: 12px 8px; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase;">${item?.category || 'GENERAL'}</td>
        <td style="padding: 12px 8px; font-size: 12px; color: #334155; text-align: right; font-family: monospace;">$${parseFloat(item?.retailPrice || 0).toFixed(2)}</td>
        <td style="padding: 12px 8px; font-size: 12px; color: #0d9488; text-align: right; font-family: monospace;">$${parseFloat(item?.wholesalePrice || 0).toFixed(2)}</td>
        <td style="padding: 12px 8px; font-size: 12px; font-weight: 600; color: #334155; text-align: center; font-family: monospace;">${item?.quantity || 0}</td>
        <td style="padding: 12px 8px; font-size: 12px; font-weight: 800; color: #0f172a; text-align: right; font-family: monospace;">$${(parseFloat(item?.retailPrice || 0) * (item?.quantity || 0)).toFixed(2)}</td>
      </tr>
    `).join('');

    element.innerHTML = `
      <div style="padding: 45px; font-family: system-ui, -apple-system, sans-serif; color: #1e293b; background-color: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px;">
          <div>
            <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px; text-transform: uppercase;">THE ARCHIVE</h1>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0; font-weight: 500; tracking: 1px; text-transform: uppercase;">Inventory Stock Manifest Ledger</p>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0;"><strong>Operative:</strong> ${user?.name || 'System Operator'}</p>
            <p style="margin: 0;"><strong>Audit Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div style="display: flex; gap: 15px; background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
          <div style="flex: 1;">
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Registered SKUs</span>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">${totalItems} Items</div>
          </div>
          <div style="flex: 1; border-left: 1px solid #e2e8f0; padding-left: 15px;">
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Gross Unit Count</span>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">${totalStockUnits.toLocaleString()} Units</div>
          </div>
          <div style="flex: 1; border-left: 1px solid #e2e8f0; padding-left: 15px;">
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Gross Retail Value</span>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">$${totalRetailValue.toFixed(2)}</div>
          </div>
          <div style="flex: 1; border-left: 1px solid #e2e8f0; padding-left: 15px;">
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Wholesale Value</span>
            <div style="font-size: 16px; font-weight: 800; color: #0d9488; margin-top: 2px;">$${totalWholesaleValue.toFixed(2)}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff;">
              <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-top-left-radius: 6px; border-bottom-left-radius: 6px; width: 40px; text-align: center;">Index</th>
              <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Product Name</th>
              <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Category</th>
              <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: right;">Retail ea</th>
              <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: right;">Wholesale ea</th>
              <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: center;">Qty</th>
              <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: right; border-top-right-radius: 6px; border-bottom-right-radius: 6px;">Net Retail Value</th>
            </tr>
          </thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>

        <div style="margin-top: 60px; border-top: 1px dashed #cbd5e1; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">This document is an automatically generated system extract bounded to unique owner token allocations.</p>
        </div>
      </div>
    `;

    const configOptions = {
      margin: [10, 10, 10, 10],
      filename: `Archive_Manifest_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(configOptions).from(element).save()
      .then(() => setIsGeneratingPdf(false))
      .catch(() => setIsGeneratingPdf(false));
  };

  return (
    <div className="flex flex-col gap-8 h-full w-full animate-fadeIn max-w-7xl mx-auto">
      
      {/* SECTION 1: High-Fidelity Analytic Metric Grid */}
      <div className="flex flex-wrap gap-5 w-full">
        <StatCard 
          title="Unique SKUs" 
          value={`${totalItems} Products`} 
          subtext="Your unique variants registered"
          icon="📦" 
          gradientBg="from-blue-50 to-blue-100/50"
          iconTextColor="text-blue-600"
        />
        <StatCard 
          title="Gross Inventory Units" 
          value={`${totalStockUnits.toLocaleString()} Units`} 
          subtext="Your personal physical warehouse count"
          icon="🗂️"
          gradientBg="from-amber-50 to-amber-100/50"
          iconTextColor="text-amber-600"
        />
        <StatCard 
          title="Live Retail Valuation" 
          value={`$${totalRetailValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          subtext="Retail single price stock sum"
          icon="💰" 
          gradientBg="from-emerald-50 to-emerald-100/50"
          iconTextColor="text-emerald-600"
        />
        <StatCard 
          title="Live Wholesale Valuation" 
          value={`$${totalWholesaleValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          subtext="Bulk discount investment asset sum"
          icon="🏢" 
          gradientBg="from-teal-50 to-teal-100/50"
          iconTextColor="text-teal-600"
        />
      </div>

      {/* SECTION 2: Action Control Header Interface */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-slate-50/70 p-4 rounded-2xl border border-slate-100 backdrop-blur-xs">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Filter current inventory stock by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white text-sm font-medium outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all box-border placeholder-slate-400 text-slate-800"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 sm:w-auto w-full">
          <button 
            onClick={handleExportExcel}
            className="flex-1 sm:flex-initial border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 active:scale-[0.98] text-sm font-bold px-5 py-3 rounded-xl shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none font-mono"
          >
            <span>📊</span> Export Excel
          </button>

          <button 
            onClick={handleExportPDF}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-initial border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98] text-sm font-bold px-5 py-3 rounded-xl shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none font-mono"
          >
            <span>{isGeneratingPdf ? '⏳' : '📥'}</span> 
            {isGeneratingPdf ? 'Compiling...' : 'Export PDF'}
          </button>

          <button 
            onClick={onNavigateToBilling}
            className="flex-1 sm:flex-initial border border-transparent bg-teal-600 hover:bg-teal-700 text-white active:scale-[0.98] text-sm font-bold px-5 py-3 rounded-xl shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            💳 Create Bill / Invoice
          </button>

          <button 
            onClick={onNavigateToAdd}
            className="flex-1 sm:flex-initial bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group shrink-0 select-none"
          >
            <span className="text-base group-hover:scale-110 transition-transform">＋</span> New Stock Entry
          </button>
        </div>
      </div>

      {/* SECTION 3: Inventory List Sheet */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-slate-100/80 pb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            Active Catalog Ledger ({filteredItems.length})
          </h3>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <ProductCard key={item._id || item.id} item={item} onDelete={deleteItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 max-w-md mx-auto w-full px-6">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-1">🔍</div>
            <p className="text-sm font-bold text-slate-700">No Inventory Items Matched</p>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              We couldn't find anything matching your exact input keywords. Try correcting typing mistakes or insert a new product element into your ledger.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}