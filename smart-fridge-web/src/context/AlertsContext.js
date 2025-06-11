import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const HOSTNAME = process.env.REACT_APP_HOSTNAME;
const DBPORT = process.env.REACT_APP_DBPORT;

export const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

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
    remoteHandler((base) => axios.get(`${base}/alerts`))
      .then((res) => setAlerts(res.data))
      .catch(() => {});
  }, []);

  const addAlert = async (alertData) => {
    try {
      const res = await remoteHandler((base) =>
        axios.post(`${base}/alerts`, alertData)
      );
      setAlerts((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding alert:", err);
    }
  };

  const updateAlert = async (id, newData) => {
    try {
      const res = await remoteHandler((base) =>
        axios.put(`${base}/alerts/${id}`, newData)
      );
      setAlerts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (_) {}
  };

  const removeAlert = async (id) => {
    try {
      await remoteHandler((base) => axios.delete(`${base}/alerts/${id}`));
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (_) {}
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await remoteHandler((base) =>
        axios.get(`${base}/alerts`)
      );
      setAlerts(res.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, []);


  return (
    <AlertsContext.Provider
      value={{ alerts, addAlert, updateAlert, removeAlert, fetchAlerts }}
    >
      {children}
    </AlertsContext.Provider>
  );
};
