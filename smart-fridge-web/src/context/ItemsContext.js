import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const BASE_URL = "http://localhost:5001/fridge";

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL);
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (itemData) => {
    try {
      const res = await axios.post(BASE_URL, itemData);
      setItems((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error adding item:", err);
      return null;
    }
  };

  const updateItem = async (id, newData) => {
    try {
      const res = await axios.put(`${BASE_URL}/${id}`, newData);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? res.data : item))
      );
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        fetchItems,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};
