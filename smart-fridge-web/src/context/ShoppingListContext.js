import React, { createContext, useState, useEffect, useCallback} from "react";
import axios from "axios";

const HOSTNAME = process.env.REACT_APP_HOSTNAME;
const DBPORT = process.env.REACT_APP_DBPORT;

export const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
  const [shoppingListItems, setShoppingListItems] = useState([]);

  // Replaced repetitive stuff with function
  const remoteHandler = async (request) => {
    try {
      return await request("http://localhost:5001");
    } catch (err1) {
      console.warn("Localhost failed, trying pidisp...");
      try {
        return await request(`${HOSTNAME}:${DBPORT}`);
      } catch (err2) {
        console.error("Failure in remote:", err2);
        throw err2;
      }
    }
  };

  useEffect(() => {
    remoteHandler((base) => axios.get(`${base}/shopping-list`))
      .then((res) => setShoppingListItems(res.data))
      .catch(() => {});
  }, []);

  const fetchShoppingListItems = useCallback(async () => {
    try {
      const res = await remoteHandler((base) =>
        axios.get(`${base}/shopping-list`)
      );
      setShoppingListItems(res.data);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
    }
  }, []);

  const addItem = async (item) => {
    try {
      const res = await remoteHandler((base) =>
        axios.post(`${base}/shopping-list`, item)
      );
      setShoppingListItems((prev) => [...prev, res.data]);
    } catch (_) {}
  };

  const updateItem = async (id, newData) => {
    try {
      const res = await remoteHandler((base) =>
        axios.put(`${base}/shopping-list/${id}`, newData)
      );
      setShoppingListItems((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
    } catch (_) {}
  };

  const removeItem = async (id) => {
    try {
      await remoteHandler((base) =>
        axios.delete(`${base}/shopping-list/${id}`)
      );
      setShoppingListItems((prev) => prev.filter((item) => item.id !== id));
    } catch (_) {}
  };

  return (
    <ShoppingListContext.Provider
      value={{
        shoppingListItems,
        addItem,
        updateItem,
        removeItem,
        fetchShoppingListItems,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};
