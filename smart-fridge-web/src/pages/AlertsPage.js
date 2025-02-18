
import React, { useState, useContext } from "react";
import { AlertsContext } from "../context/AlertsContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "./styles/AlertsPage.css";

const AlertsPage = () => {
  const { alerts, addAlert, updateAlert, removeAlert } = useContext(AlertsContext);

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

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

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

  const openModalForEdit = (alert) => {
    setFormData({ ...alert, date: new Date(alert.date) });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handleTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, time }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    if (formData.id) {
      const updated = {
        ...formData,
        date: formData.date.toDateString(),
      };
      updateAlert(formData.id, updated);
    } else {
      addAlert({
        title: formData.title,
        description: formData.description,
        date: formData.date.toDateString(),
        time: formData.time,
      });
    }
    setShowModal(false);
  };

  const filteredAlerts = alerts.filter(
    (alert) => alert.date === currentDate.toDateString()
  );

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
                e.stopPropagation();
                toggleChecked(alert);
              }}
            />
            <span className="alert-name">
              {alert.title} ({alert.time})
            </span>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
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
                value={formData.time}
                onChange={handleTimeSelect}
                format="h:mm a"
                clearIcon={null}
                clockIcon={null}
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
