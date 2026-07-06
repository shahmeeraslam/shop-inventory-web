import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

export default function ImportScreen({ onNavigateBack }) {
  const { importInventoryManifest } = useInventory();
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [logStatus, setLogStatus] = useState({ type: '', msg: '' });

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLogStatus({ type: '', msg: '' });
    }
  };

  const handleExecuteImport = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    setLogStatus({ type: 'info', msg: 'Analyzing target sheet configuration frameworks...' });

    const result = await importInventoryManifest(selectedFile);
    if (result.success) {
      setLogStatus({ type: 'success', msg: result.message });
      setSelectedFile(null);
    } else {
      setLogStatus({ type: 'error', msg: `Import Interrupted: ${result.error}` });
    }
    setProcessing(false);
  };

  // Helper macro generating an absolute matching template framework layout automatically
  const downloadSampleCSV = () => {
    const headers = "Name,RetailPrice,WholesalePrice,Quantity,Category,Description\n";
    const sampleData = "Classic Polo Navy,45.00,22.00,150,Apparel,Premium classic fit shirt\nShadowStep Sneakers,85.00,40.00,80,Footwear,Navy athletic running shoe\n";
    
    const blob = new Blob([headers + sampleData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", "archive_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-2xl mx-auto p-2">
      {/* Header Block Frame */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <button onClick={onNavigateBack} className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold transition-all cursor-pointer">
          ← Back
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Batch Stream Document Scanner</h2>
          <p className="text-xs text-slate-400">Upload structured Excel sheets or CSV index logs to load asset matrix units.</p>
        </div>
      </div>

      {/* Structural Schema Mapping Info Card */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Required Schema Format</span>
          <p className="text-[11px] text-slate-500 leading-normal">
            Columns must strictly contain the exact tracking case headers:<br />
            <code className="text-slate-800 font-bold font-mono text-[10px] bg-slate-200/60 px-1 py-0.5 rounded mt-1 inline-block">
              Name, RetailPrice, WholesalePrice, Quantity, Category, Description
            </code>
          </p>
        </div>
        <button 
          onClick={downloadSampleCSV}
          className="text-[11px] font-mono font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-3.5 py-2 rounded-xl border border-teal-200/40 transition-all cursor-pointer text-center whitespace-nowrap"
        >
          📥 Get Sample Template
        </button>
      </div>

      {/* Interactive Dropzone Element */}
      <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center text-center justify-center transition-all bg-slate-50/40 ${selectedFile ? 'border-teal-400 bg-teal-50/10' : 'border-slate-200 hover:border-slate-300'}`}>
        <span className="text-4xl mb-3">{selectedFile ? '📊' : '📁'}</span>
        {selectedFile ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-slate-800 font-mono truncate max-w-sm">{selectedFile.name}</p>
            <p className="text-[11px] font-mono text-slate-400">Size Volume: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-[10px] font-mono font-bold text-rose-500 hover:underline mt-2 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <span className="bg-slate-950 text-white font-mono text-xs px-4 py-2.5 rounded-xl font-bold shadow-xs hover:bg-slate-900 transition-all select-none">
              Choose Document Variant
            </span>
            {/* CHANGED: Restricted file options exclusively to Excel matrix types and raw CSV streams */}
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileSelection} className="hidden" />
            <p className="text-[11px] text-slate-400 mt-3 leading-normal">Supports standard Excel (.xlsx, .xls) or comma-separated CSV spreadsheets.</p>
          </label>
        )}
      </div>

      {/* Logging System Alerts */}
      {logStatus.msg && (
        <div className={`p-4 rounded-xl text-xs font-mono font-bold border ${
          logStatus.type === 'success' ? 'bg-teal-50 text-teal-700 border-teal-200' : 
          logStatus.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {logStatus.type === 'success' ? '⚡ ' : logStatus.type === 'error' ? '❌ ' : '⏳ '}{logStatus.msg}
        </div>
      )}

      {/* Commit Transmission Button */}
      <button
        onClick={handleExecuteImport}
        disabled={!selectedFile || processing}
        className="w-full bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs py-4 rounded-xl font-bold transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed select-none tracking-wide uppercase shadow-xs"
      >
        {processing ? 'Processing Document Assets...' : 'Execute Ledger Pipeline Import'}
      </button>
    </div>
  );
}