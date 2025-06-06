import React, { useState } from "react";
import "./styles/SettingsPage.css";
import backgroundImg from "../assets/background.jpg";
import {QRCodeSVG} from "qrcode.react";

const SettingsPage = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const settingsOptions = [
    "Language",
    "Notifications",
    "Font Size",
    "Brightness",
    "Screen Timeout",
    "Diet Restrictions",
  ];

  return (
    <>
      <div className="settings-container" style={{ backgroundImage: `url(${backgroundImg})` }}>
        <h1 className="settings-header">Settings</h1>
        <div className="settings-options">
          {settingsOptions.map((option, index) => (
            <div key={index} className="settings-option">
              <span>{option}</span>
              <span className="arrow">›</span>
            </div>
          ))}
        </div>
        <button className="connect-button" onClick={() => setShowQRModal(true)}>
          <span>Connect to Mobile App</span>
          <span className="qr-icon">📱</span>
        </button>
      </div>

      {showQRModal && (
        <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Connect to Mobile App</h2>
            <div className="qr-container">
              <QRCodeSVG 
                value="http://pidisp:3000/"  
                size={250}
                bgColor="#ffffff" 
                fgColor="#000000" 
                level="L"
              />
            </div>
            <button onClick={() => setShowQRModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;