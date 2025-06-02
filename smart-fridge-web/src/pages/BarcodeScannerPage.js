// src/pages/BarcodeScannerPage.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Quagga from "quagga";
import { BarcodesContext } from "../context/BarcodesContext";
import { ItemsContext } from "../context/ItemsContext";
import "./styles/BarcodeScannerPage.css";

const BarcodeScannerPage = () => {
  const navigate = useNavigate();
  const { lookupBarcode } = useContext(BarcodesContext);
  const { addItem } = useContext(ItemsContext);

  const [barcodeData, setBarcodeData] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [productName, setProductName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [originalImage, setOriginalImage] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");

  const preprocessImage = (imageData, options = {}) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        if (options.grayscale) {
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i+1] + data[i+2]) / 3;
            data[i] = data[i+1] = data[i+2] = avg;
          }
        }
        
        if (options.contrast) {
          const factor = options.contrastFactor || 1.5;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = clamp((data[i] - 128) * factor + 128);       // Red
            data[i+1] = clamp((data[i+1] - 128) * factor + 128);   // Green
            data[i+2] = clamp((data[i+2] - 128) * factor + 128);   // Blue
          }
        }
        
        if (options.sharpen) {
          const w = canvas.width;
          const h = canvas.height;
          const temp = new Uint8ClampedArray(data);
          
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              for (let c = 0; c < 3; c++) {
                const idx = (y * w + x) * 4 + c;
                const current = temp[idx];
                const top = temp[((y-1) * w + x) * 4 + c];
                const bottom = temp[((y+1) * w + x) * 4 + c];
                const left = temp[(y * w + (x-1)) * 4 + c];
                const right = temp[(y * w + (x+1)) * 4 + c];
                
                data[idx] = clamp(5 * current - top - bottom - left - right);
              }
            }
          }
        }
        
        if (options.threshold) {
          const threshold = options.thresholdValue || 128;
          for (let i = 0; i < data.length; i += 4) {
            const value = data[i] < threshold ? 0 : 255;
            data[i] = data[i+1] = data[i+2] = value;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = imageData;
    });
  };

  const clamp = (value) => {
    return Math.max(0, Math.min(255, Math.floor(value)));
  };

  const processBarcodeFromImage = async (imageData) => {
    setDebugInfo("Starting barcode detection...");
    
    const processingApproaches = [
      { name: "Original image", process: () => imageData },
      { name: "Contrast enhanced", process: () => preprocessImage(imageData, { contrast: true, contrastFactor: 1.8 }) },
      { name: "Grayscale", process: () => preprocessImage(imageData, { grayscale: true }) },
      { name: "Sharpened", process: () => preprocessImage(imageData, { sharpen: true }) },
      { name: "Grayscale + Contrast", process: () => preprocessImage(imageData, { grayscale: true, contrast: true, contrastFactor: 2.0 }) },
      { name: "Binary threshold", process: () => preprocessImage(imageData, { grayscale: true, threshold: true, thresholdValue: 128 }) },
      { name: "High contrast binary", process: () => preprocessImage(imageData, { grayscale: true, contrast: true, contrastFactor: 2.5, threshold: true }) }
    ];
    
    const quaggaConfigs = [
      {
        name: "Standard config",
        config: {
          decoder: {
            readers: [
              "upc_reader",
              "upc_e_reader",
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
              "i2of5_reader"
            ],
            multiple: false
          },
          locate: true,
          src: null 
        }
      },
      {
        name: "Enhanced precision",
        config: {
          decoder: {
            readers: [
              "upc_reader",
              "upc_e_reader",
              "ean_reader",
              "ean_8_reader"
            ],
            multiple: false
          },
          locator: {
            patchSize: "medium",
            halfSample: false
          },
          locate: true,
          src: null 
        }
      },
      {
        name: "High sensitivity",
        config: {
          decoder: {
            readers: [
              "upc_reader",
              "upc_e_reader",
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
              "i2of5_reader",
              "2of5_reader",
              "codabar_reader"
            ],
            multiple: true 
          },
          locator: {
            patchSize: "large",
            halfSample: true
          },
          locate: true,
          src: null 
        }
      }
    ];
    
    for (const approach of processingApproaches) {
      setDebugInfo(`Trying ${approach.name}...`);
      const processedImage = await approach.process();
      
      for (const configOption of quaggaConfigs) {
        setDebugInfo(`${approach.name} with ${configOption.name}...`);
        
        const config = {...configOption.config, src: processedImage};
        
        try {
          const result = await new Promise((resolve) => {
            Quagga.decodeSingle(config, (result) => {
              resolve(result);
            });
          });
          
          if (result && result.codeResult) {
            setDebugInfo(`Success! Found barcode: ${result.codeResult.code} with ${approach.name} and ${configOption.name}`);
            handleDetected(result.codeResult.code);
            return; 
          }
        } catch (err) {
          console.error("Quagga error:", err);
        }
      }
    }
    
    setProcessing(false);
    setErrorMessage("No barcode detected after multiple attempts. Try another image or enter the code manually.");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    
    if(file) {
      // Reset states
      setBarcodeData("");
      setNotFound(false);
      setErrorMessage("");
      setProcessing(true);
      setDebugInfo("");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const image = reader.result;
        setImagePreview(image);
        setOriginalImage(image);
        processBarcodeFromImage(image);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleDetected = async (code) => {
    setBarcodeData(code);
    setProcessing(false);

    try {
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
    } catch (error) {
      console.error("Error looking up barcode:", error);
      setErrorMessage("Error looking up barcode. Please try again.");
    }
  };

  const handleConfirm = async () => {
    const finalName = productName.trim() || `Unknown Barcode: ${barcodeData || manualBarcode}`;
    await addItem({
      name: finalName,
      quantity: "",
      unit: "",
      expiry: "",
    });
    navigate("/items");
  };

  const handleManualSubmit = async () => {
    if (manualBarcode.trim()) {
      setBarcodeData(manualBarcode);
      
      try {
        const { found, productName: externalName } = await lookupBarcode(manualBarcode);
  
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
      } catch (error) {
        console.error("Error looking up barcode:", error);
        setErrorMessage("Error looking up barcode. Please try again.");
      }
    } else {
      setErrorMessage("Please enter a valid barcode");
    }
  };

  return (
    <div className="barcode-scanner-page">
      <h2>Upload a Barcode Image</h2>

      {!barcodeData && !notFound && (
        <div className="scanner-wrapper">
          <div className="image-upload-wrapper">
            <div className="file-input-container">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="file-input"
              />
            </div>
            
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Barcode preview" />
              </div>
            )}
          </div>
          <p>Upload an image of the barcode</p>
          
          {processing && <p className="processing-message">Processing image... <br/>{debugInfo}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          
          {/* Manual entry option */}
          <div className="manual-entry">
            <h3>Or Enter Barcode Manually</h3>
            <div className="manual-input-container">
              <input 
                type="text"
                placeholder="Enter barcode number..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
              />
              <button onClick={handleManualSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
      
      {barcodeData && !notFound && (
        <div>
          <p>Detected barcode: {barcodeData}</p>
          <p>Looking up product...</p>
        </div>
      )}

      {notFound && (
        <div className="not-found-section">
          <p>
            No product found for <strong>{barcodeData || manualBarcode}</strong>.
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

      <button 
        onClick={() => navigate("/items")}
        style={{
          display: "block",
          margin: "20px auto",
          padding: "10px 20px",
          backgroundColor: "#ccc",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px"
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default BarcodeScannerPage;