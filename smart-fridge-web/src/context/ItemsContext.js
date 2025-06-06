import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Replaced repetitive stuff with function
  const remoteHandler = async (request) => {
    try {
      return await request("http://localhost:5001");
    } catch (err1) {
      console.warn("Localhost failed, trying pidisp...");
      try {
        return await request("http://pidisp:5001");
      } catch (err2) {
        console.error("Failure in remote:", err2);
        throw err2;
      }
    }
  };

  const fetchItems = useCallback(async () => {
    try {
      const res = await remoteHandler((base) => axios.get(`${base}/fridge`));
      setItems(res.data);
    } catch (_) {
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item) => {
    try {
      const res = await remoteHandler((base) => axios.post(`${base}/fridge`, item));
      setItems((prevItems) => [...prevItems, res.data]);
      return res.data;
    } catch (_) {
      return null;
    }
  };

  const updateItem = async (id, newData) => {
    try {
      await remoteHandler((base) => axios.put(`${base}/fridge/${id}`, newData));
      const res = await remoteHandler((base) => axios.get(`${base}/fridge`));
      setItems(res.data);
    } catch (_) {
    }
  };

  const removeItem = async (id) => {
    try {
      await remoteHandler((base) => axios.delete(`${base}/fridge/${id}`));
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (_) {
    }
  };

  return (
        <ItemsContext.Provider value={{ items, fetchItems, addItem, updateItem, removeItem }}>
            {children}
        </ItemsContext.Provider>
    );
};
