// src/components/QuaggaScanner.js
import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

const QuaggaScanner = ({ onDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Start the camera with better resolution
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            aspectRatio: { ideal: 1.33333 } 
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreaming(true);
          console.log("Camera started successfully");
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setDebugInfo(`Camera error: ${err.message}`);
      }
    };
    
    startCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (!streaming) {
      setDebugInfo("Video not streaming yet");
      return;
    }
    
    setDebugInfo("Capturing image...");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 1.0); // Use highest quality
    setDebugInfo(`Image captured: ${canvas.width}x${canvas.height}`);
    processImageWithQuagga(imageData);
  };
  
  const processImageWithQuagga = (imageUrl) => {
    setDebugInfo("Processing with Quagga...");
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      
      Quagga.decodeSingle({
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
            "code_128_reader",
            "code_39_reader"
          ],
          multiple: false
        },
        locate: true,
        src: canvas.toDataURL('image/jpeg', 1.0)
      }, function(result) {
        if (result && result.codeResult) {
          setDebugInfo(`Success! Code: ${result.codeResult.code}`);
          onDetected(result.codeResult.code);
        } else {
          setDebugInfo("No barcode detected. Please try again with better lighting and positioning.");
          alert("No barcode detected. Please try again with better lighting and ensure the barcode is clearly visible.");
        }
      });
    };
  };

  return (
    <div id="scanner-container" style={{ position: "relative" }}>
      <div style={{ 
        position: "relative", 
        width: "100%", 
        maxWidth: "400px",
        margin: "0 auto" 
      }}>
        <video 
          ref={videoRef} 
          id="interactive"
          style={{ 
            width: "100%", 
            display: "block",
            border: "1px solid #ccc",
            borderRadius: "8px"
          }}
        />
        
        {/* Targeting guide overlay */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "25%",
          border: "2px dashed rgba(255, 255, 255, 0.8)",
          boxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.3)",
          borderRadius: "8px",
          pointerEvents: "none"
        }}></div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {streaming && (
        <>
          <p style={{ 
            textAlign: "center", 
            margin: "10px 0", 
            fontSize: "14px",
            color: "#666"
          }}>
            Position barcode within the guide and hold steady
          </p>
          
          <button 
            onClick={captureImage}
            style={{
              display: "block",
              margin: "15px auto",
              padding: "12px 25px",
              fontSize: "16px",
              backgroundColor: "#3b016a",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Take Photo
          </button>
          
          {debugInfo && (
            <p style={{ 
              textAlign: "center", 
              margin: "10px 0", 
              fontSize: "12px",
              color: "#888" 
            }}>
              {debugInfo}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default QuaggaScanner;