// src/pages/BarcodeScannerPage.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import QuaggaScanner from "../components/QuaggaScanner";

import { BarcodesContext } from "../context/BarcodesContext";
import { ItemsContext } from "../context/ItemsContext";

import "./styles/BarcodeScannerPage.css";

const BarcodeScannerPage = () => {
  const navigate = useNavigate();
  const { lookupBarcode } = useContext(BarcodesContext);
  const { addItem } = useContext(ItemsContext);

  const [scanning, setScanning] = useState(true);
  const [barcodeData, setBarcodeData] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [productName, setProductName] = useState("");

  const handleDetected = async (code) => {
    setScanning(false);
    setBarcodeData(code);
    console.log("Detected barcode:", code);

    const { found, productName: externalName } = await lookupBarcode(code);

    if (found) {
      await addItem({
        name: externalName,
        quantity: "",
        unit: "",
        expiry: "",
      });
      navigate("/items");
    } else {
      setNotFound(true);
    }
  };

  const handleConfirm = async () => {
    const finalName = productName.trim() || `Unknown Barcode: ${barcodeData}`;
    await addItem({
      name: finalName,
      quantity: "",
      unit: "",
      expiry: "",
    });
    navigate("/items");
  };

  return (
    <div className="barcode-scanner-page">
      <h2>Scan a Barcode (Quagga)</h2>

      {scanning ? (
        <div className="scanner-wrapper">
          <QuaggaScanner onDetected={handleDetected} />
          <p>Point your camera at the barcode...</p>
        </div>
      ) : (
        <p>Detected barcode: {barcodeData}</p>
      )}

      {notFound && (
        <div className="not-found-section">
          <p>
            No product found for <strong>{barcodeData}</strong>.
            Please enter a product name:
          </p>
          <input
            type="text"
            placeholder="e.g. Doritos Chips"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      )}

      <button onClick={() => navigate("/items")}>Cancel</button>
    </div>
  );
};

export default BarcodeScannerPage;
