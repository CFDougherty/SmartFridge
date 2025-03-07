// AlertsPage.js
import React, { useState, useContext } from "react";
import { AlertsContext } from "../context/AlertsContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "./styles/AlertsPage.css";

const AlertsPage = () => {
  const { alerts, addAlert, updateAlert, removeAlert } =
    useContext(AlertsContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    date: new Date(),
    time: "12:00",
    checked: false,
  });

  const toggleChecked = (alert) => {
    updateAlert(alert.id, { ...alert, checked: !alert.checked });
  };

  // Move currentDate backward or forward by 'days' days
  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Open modal to create a new alert
  const openModalForNew = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      date: new Date(),
      time: "12:00",
      checked: false,
    });
    setShowModal(true);
  };

  // Open modal to edit an existing alert
  const openModalForEdit = (alert) => {
    // parse date string back into a Date
    setFormData({
      ...alert,
      date: new Date(alert.date),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle text or textarea changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change from DatePicker
  const handleDateSelect = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  // Handle time change from TimePicker
  const handleTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, time }));
  };

  // Save or update alert
  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (formData.id) {
      // Update existing alert
      const updatedAlert = {
        ...formData,
        date: formData.date.toDateString(), // store as string
      };
      updateAlert(formData.id, updatedAlert);
    } else {
      // Add new alert
      addAlert({
        ...formData,
        date: formData.date.toDateString(), // store as string
      });
    }
    setShowModal(false);
  };

  // Filter alerts to only those on the selected date
  const filteredAlerts = alerts.filter(
    (alert) => alert.date === currentDate.toDateString()
  );

  // Convert "HH:mm" to 12-hour format
  const formatTimeTo12Hour = (time) => {
    if (!time) return "";
    let [hours, minutes] = time.split(":").map(Number);
    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${amPm}`;
  };

  return (
    <div className="alerts-page">
      <h1 className="alerts-title">Alerts</h1>

      <div className="date-navigation">
        <button onClick={() => handleDateChange(-1)}>&lt;</button>
        <p>{currentDate.toDateString()}</p>
        <button onClick={() => handleDateChange(1)}>&gt;</button>
      </div>

      <ul className="alerts-list">
        {filteredAlerts.map((alert) => (
          <li
            key={alert.id}
            className="alert-item"
            onClick={() => openModalForEdit(alert)}
          >
            <input
              type="checkbox"
              checked={alert.checked}
              onChange={(e) => {
                e.stopPropagation(); // prevent opening modal on checkbox click
                toggleChecked(alert);
              }}
            />
            <span className="alert-name">
              {alert.title} ({formatTimeTo12Hour(alert.time)})
            </span>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation(); // prevent opening modal on delete click
                removeAlert(alert.id);
              }}
            >
              x
            </button>
          </li>
        ))}
      </ul>

      <button className="add-button" onClick={openModalForNew}>
        + Schedule Alert
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{formData.id ? "Edit Alert" : "New Alert"}</h2>

            <label>
              Title:
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Description:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Date:
              <DatePicker selected={formData.date} onChange={handleDateSelect} />
            </label>

            <label>
              Time:
              <TimePicker
                className="custom-time-picker"
                value={formData.time}
                onChange={handleTimeSelect}
                format="h:mm a"
                clearIcon={null}
                disableClock
              />
            </label>

            <div className="modal-buttons">
              <button onClick={handleCloseModal}>Cancel</button>
              <button onClick={handleSave}>
                {formData.id ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
