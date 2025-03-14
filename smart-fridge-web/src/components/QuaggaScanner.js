// src/components/QuaggaScanner.js
import React, { useEffect, useRef } from "react";
import Quagga from "quagga";

const QuaggaScanner = ({ onDetected }) => {
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: document.querySelector("#interactive"),
          constraints: { facingMode: "environment" },
        },
        locator: {
            patchSize: "large", // or "x-large"
            halfSample: false,  // try disabling half-sampling
          },

        decoder: {
            readers: [
              "upc_reader",
              "upc_e_reader",
              "ean_reader",
              "code_128_reader",
            ],
          },
      },
      (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((result) => {
      if (!hasDetectedRef.current && result?.codeResult?.code) {
        hasDetectedRef.current = true;
        onDetected(result.codeResult.code);
      }
    });

    return () => {
      Quagga.offDetected(() => {});
      Quagga.stop();
    };
  }, [onDetected]);

  return (
    <div
      id="interactive"
      style={{ position: "relative", width: 300, height: 300 }}
    />
  );
};

export default QuaggaScanner;
