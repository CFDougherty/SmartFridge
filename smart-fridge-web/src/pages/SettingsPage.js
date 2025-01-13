import React from "react";
import './styles/SettingsPage.css';

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
    <div className="settings-container">
      <h1 className="settings-header">Settings</h1>
      <div className="settings-options">
        {settingsOptions.map((option, index) => (
          <div key={index} className="settings-option">
            <span>{option}</span>
            <span className="arrow">›</span> {/* Arrow icon */}
          </div>
        ))}
      </div>
      <button className="connect-button">
        <span>Connect to Mobile App</span>
        <span className="qr-icon">📱</span> {/* QR Code Icon Placeholder */}
      </button>
    </div>
  );
};

export default SettingsPage;
