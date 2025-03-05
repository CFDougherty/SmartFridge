
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
  const [shoppingListItems, setShoppingListItems] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/shopping-list")
      .then((res) => setShoppingListItems(res.data))
      .catch((err) => console.error("Error fetching shopping list:", err));
  }, []);

  const addItem = async (item) => {
    try {
      const res = await axios.post("http://localhost:5001/shopping-list", item);
      setShoppingListItems((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };
  const updateItem = async (id, newData) => {
    try {
      const res = await axios.put(`http://localhost:5001/shopping-list/${id}`, newData);
      setShoppingListItems((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/shopping-list/${id}`);
      setShoppingListItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  return (
    <ShoppingListContext.Provider
      value={{ shoppingListItems, addItem, updateItem, removeItem }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};
