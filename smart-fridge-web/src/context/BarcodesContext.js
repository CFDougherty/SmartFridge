// src/context/BarcodesContext.js
import React, { createContext } from "react";
import axios from "axios";

export const BarcodesContext = createContext();

// Might be over engineered using a function call for this... But keeps it consistent
export const BarcodesProvider = ({ children }) => {
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

  const lookupBarcode = async (code) => {
    try {
      const res = await remoteHandler((base) =>
        axios.get(`${base}/barcodes/lookup/${code}`)
      );
      // Expect: { found: boolean, productName: string }
      return res.data;
    } catch (_) {
      return { found: false, productName: "" };
    }
  };

  return (
    <BarcodesContext.Provider value={{ lookupBarcode }}>
      {children}
    </BarcodesContext.Provider>
  );
};
