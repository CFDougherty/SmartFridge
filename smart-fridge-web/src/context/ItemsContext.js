import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  
    const [items, setItems] = useState([]);

    const fetchItems = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:5001/fridge");
            setItems(res.data);
        } catch (err) {
            console.error("Error fetching items:", err);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = async (item) => {
        try {
            const res = await axios.post("http://localhost:5001/fridge", item);
            setItems((prevItems) => [...prevItems, res.data]);
            return res.data;
        } catch (err) {
            console.error("Error adding item:", err);
            return null;
        }
    };

    const updateItem = async (id, newData) => {
        try {
            await axios.put(`http://localhost:5001/fridge/${id}`, newData);
    
            const res = await axios.get("http://localhost:5001/fridge"); 
            setItems(res.data);
    
        } catch (err) {
            console.error("Error updating item:", err);
        }
    };
    

    const removeItem = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/fridge/${id}`);
            setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Error removing item:", err);
        }
    };

    return (
        <ItemsContext.Provider value={{ items, fetchItems, addItem, updateItem, removeItem }}>
            {children}
        </ItemsContext.Provider>
    );
};
