
import React from "react";
import "./styles/SettingsPage.css";
import backgroundImg from "../assets/background.jpg";

const SettingsPage = () => {
  const settingsOptions = [
    "Language",
    "Notifications",
    "Font Size",
    "Brightness",
    "Screen Timeout",
    "Diet Restrictions",
    "Payment Preference",
  ];

  return (
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
      <button className="connect-button">
        <span>Connect to Mobile App</span>
        <span className="qr-icon">📱</span>
      </button>
    </div>
  );
};

export default SettingsPage;
