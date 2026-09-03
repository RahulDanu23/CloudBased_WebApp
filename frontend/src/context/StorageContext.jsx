import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const StorageContext = createContext();

export const useStorage = () => useContext(StorageContext);

export const StorageProvider = ({ children }) => {
  const [usedStorage, setUsedStorage] = useState(0);
  const TOTAL_STORAGE = 15 * 1024 * 1024 * 1024; // 15 GB in bytes

  useEffect(() => {
    // Attempt to fetch total storage used from backend if an endpoint exists, 
    // otherwise fallback to a local estimation or 0.
    const fetchStorage = async () => {
      try {
        // If your backend has a specific endpoint for storage stats, use it here.
        // For example: const res = await api.get('/users/storage');
        // setUsedStorage(res.data.usedStorage);
        
        // As a fallback since we don't know the exact API, we can initialize from local storage
        // to maintain state across reloads.
        const stored = localStorage.getItem('usedStorage');
        if (stored) {
          setUsedStorage(Number(stored));
        }
      } catch (err) {
        console.error("Failed to fetch storage", err);
      }
    };
    fetchStorage();
  }, []);

  const addStorage = (bytes) => {
    setUsedStorage(prev => {
      const newVal = prev + bytes;
      localStorage.setItem('usedStorage', newVal);
      return newVal;
    });
  };

  const removeStorage = (bytes) => {
    setUsedStorage(prev => {
      const newVal = Math.max(0, prev - bytes);
      localStorage.setItem('usedStorage', newVal);
      return newVal;
    });
  };

  return (
    <StorageContext.Provider value={{ usedStorage, TOTAL_STORAGE, addStorage, removeStorage }}>
      {children}
    </StorageContext.Provider>
  );
};
