
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/alerts")
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error("Error fetching alerts:", err));
  }, []);

  const addAlert = async (alertData) => {
    try {
      const res = await axios.post("http://localhost:5000/alerts", alertData);
      setAlerts((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding alert:", err);
    }
  };

  const updateAlert = async (id, newData) => {
    try {
      const res = await axios.put(`http://localhost:5000/alerts/${id}`, newData);
      setAlerts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (err) {
      console.error("Error updating alert:", err);
    }
  };

  const removeAlert = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error removing alert:", err);
    }
  };

  return (
    <AlertsContext.Provider value={{ alerts, addAlert, updateAlert, removeAlert }}>
      {children}
    </AlertsContext.Provider>
  );
};
