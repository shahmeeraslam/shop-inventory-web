import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext'; // <-- ADDED: Read from global context matrix state

export default function BillingHistoryScreen({ onNavigateBack }) {
  const { invoiceHistory, isHistoryLoading } = useInventory(); // <-- CHANGED: Destructure context states
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoiceHistory.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isHistoryLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 gap-3 text-slate-500 font-mono text-xs select-none">
        <span className="text-3xl animate-spin mb-1">⏳</span>
        <span className="font-bold tracking-widest text-slate-400">LOADING HISTORICAL INVOICES...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-7xl mx-auto p-2">
      {/* Header element interface */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <button 
          onClick={onNavigateBack} 
          className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-all border border-slate-200 cursor-pointer text-xs font-bold"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Invoice Billing Ledger</h2>
          <p className="text-xs text-slate-400">Audit chronological commercial sales operations records below.</p>
        </div>
      </div>

      {/* Filtering System Controller Row */}
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 text-sm">🔍</span>
        <input 
          type="text" 
          placeholder="Filter invoice entries by number or client name account..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all box-border text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Structured Ledger Matrix Grid */}
      {filteredInvoices.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-slate-600">
              <thead>
                <tr className="bg-slate-950 text-white font-mono text-[10px] tracking-wider uppercase border-b border-slate-900">
                  <th className="p-4 font-bold text-center w-16">Index</th>
                  <th className="p-4 font-bold">Invoice Ref</th>
                  <th className="p-4 font-bold">Client / Account Name</th>
                  <th className="p-4 font-bold text-center">Items Count</th>
                  <th className="p-4 font-bold text-right">Settled Amount</th>
                  <th className="p-4 font-bold text-center">Execution Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.map((inv, index) => {
                  const totalUnits = inv.items?.reduce((a, c) => a + c.quantity, 0) || 0;
                  return (
                    <tr key={inv._id || inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono text-slate-400 text-center">#{String(index + 1).padStart(2, '0')}</td>
                      <td className="p-4 font-black font-mono text-slate-900 tracking-wide uppercase">{inv.invoiceNumber}</td>
                      <td className="p-4 font-bold text-slate-700 uppercase tracking-tight">{inv.customerName}</td>
                      <td className="p-4 text-center font-mono font-medium text-slate-500">{totalUnits} units</td>
                      <td className="p-4 text-right font-black font-mono text-slate-900">${parseFloat(inv.totalAmount).toFixed(2)}</td>
                      <td className="p-4 text-center text-slate-400 font-medium font-mono">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 max-w-md mx-auto w-full px-6 flex flex-col items-center">
          <span className="text-3xl mb-2">📑</span>
          <p className="text-sm font-bold text-slate-700">No Billing Records Match</p>
          <p className="text-xs text-slate-400 mt-1 leading-normal">No entries found matching your target search string parameter variants.</p>
        </div>
      )}
    </div>
  );
}