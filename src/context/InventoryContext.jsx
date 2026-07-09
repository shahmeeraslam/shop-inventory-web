import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// =========================================================================
// IMPORT CENTRALIZED ROUTING ROUTE PATHWAY
// =========================================================================
import { API_BASE_URL } from '../api'; 

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([]);
  const [invoiceHistory, setInvoiceHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false); 
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // ==========================================
  // OPERATION 1: FETCH (Sync View Matrix with Atlas)
  // ==========================================
  const fetchInventoryManifest = useCallback(async (currentToken = token) => {
    if (!currentToken) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download user warehouse manifest.');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Fetch operation error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // ==========================================
  // OPERATION 2: BILLING HISTORY PULL MATRIX
  // ==========================================
  const fetchBillingHistory = useCallback(async (currentToken = token) => {
    if (!currentToken) {
      setInvoiceHistory([]);
      return;
    }

    setIsHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/billing/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to sync history ledger from database.');
      const resData = await response.json();
      if (resData.success) {
        setInvoiceHistory(resData.data);
      }
    } catch (err) {
      console.error('Billing history fetch failure:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [token]);

  // Auto-synchronize both state matrices concurrently upon credentials modify
  useEffect(() => {
    if (token) {
      fetchInventoryManifest(token);
      fetchBillingHistory(token);
    } else {
      setItems([]);
      setInvoiceHistory([]);
      setIsLoading(false);
    }
  }, [token, fetchInventoryManifest, fetchBillingHistory]);

  // ==========================================
  // OPERATION 3: POST (Write New Variant Line Supporting Images)
  // ==========================================
  const addItem = async (newItemData) => {
    try {
      // 🔥 DYNAMIC PAYLOAD PARSING: Check if the frontend passed FormData or standard JSON object
      let bodyData = newItemData;
      const headers = { 'Authorization': `Bearer ${token}` };

      if (!(newItemData instanceof FormData)) {
        // If it's a plain object, pack it into FormData so Multer can capture it smoothly
        bodyData = new FormData();
        Object.keys(newItemData).forEach(key => bodyData.append(key, newItemData[key]));
      }
      // CRITICAL: CRITICAL: Do NOT declare 'Content-Type' headers manually when dispatching FormData!

      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: headers,
        body: bodyData,
      });

      if (!response.ok) throw new Error('Database refused payload writing synchronization.');
      
      const savedItem = await response.json();
      setItems((prevItems) => [savedItem, ...prevItems]);
      await fetchInventoryManifest(token);
      return { success: true };
    } catch (err) {
      console.error('Create error:', err);
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // OPERATION 4: PUT (Update Item Details or Stock Level Supporting Images)
  // ==========================================
  const updateItem = async (id, updatedFields) => {
    try {
      // 1. Convert standard object variables safely to local representation map keys for instant UI updates
      const flatFields = updatedFields instanceof FormData 
        ? Object.fromEntries(updatedFields.entries()) 
        : updatedFields;

      // Optimistically update local frontend state layout instantly
      setItems((prevItems) =>
        prevItems.map((item) =>
          (item._id || item.id) === id ? { ...item, ...flatFields } : item
        )
      );

      // 2. Build multi-part FormData wrapper for the backend
      let bodyData = updatedFields;
      if (!(updatedFields instanceof FormData)) {
        bodyData = new FormData();
        Object.keys(updatedFields).forEach(key => bodyData.append(key, updatedFields[key]));
      }

      // Persist modification down to your MongoDB Atlas cluster via backend PUT endpoint
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }, // Left content type out deliberately
        body: bodyData,
      });

      if (!response.ok) throw new Error('Server rejected structural document correction handshake.');
      
      // Sync state with exact database layout returned by server
      const updatedDataFromServer = await response.json();
      setItems((prevItems) =>
        prevItems.map((item) =>
          (item._id || item.id) === id ? updatedDataFromServer : item
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Stock adjustment synchronization failure:', err);
      // Fallback recovery: Re-sync with database if connection dropped mid-transaction
      await fetchInventoryManifest(token);
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // OPERATION 5: DELETE (Wipe Line and Drop Index)
  // ==========================================
  const deleteItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Database refused document deletion handshake.');

      setItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== id));
      return { success: true };
    } catch (err) {
      console.error('Delete error:', err);
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // OPERATION 6: CHECKOUT RECORD INTERNET PIPELINE
  // ==========================================
  const createInvoiceRecord = async (invoiceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(invoiceData)
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchInventoryManifest(token); 
        await fetchBillingHistory(token);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Checkout verification breakdown:', error);
      return { success: false, error: error.message };
    }
  };

  // ==========================================
  // OPERATION 7: DOCUMENT FILE STREAM INGESTION ENGINE
  // ==========================================
  const importInventoryManifest = async (fileObject) => {
    if (!token) return { success: false, error: "Session authentication credentials timed out." };
    
    const formData = new FormData();
    formData.append('file', fileObject);

    try {
      const response = await fetch(`${API_BASE_URL}/inventory/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData 
      });

      const result = await response.json();
      if (result.success) {
        await fetchInventoryManifest(token); 
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Document extraction workflow exception:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      items, 
      invoiceHistory,
      isLoading, 
      isHistoryLoading,
      error, 
      addItem, 
      updateItem, 
      deleteItem, 
      createInvoiceRecord,
      importInventoryManifest, 
      refreshBillingHistory: () => fetchBillingHistory(token),
      refreshData: () => fetchInventoryManifest(token)
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be utilized within an active InventoryProvider container.');
  }
  return context;
}