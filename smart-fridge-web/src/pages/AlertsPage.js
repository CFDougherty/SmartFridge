import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import './styles/AlertsPage.css';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "12:00",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date

  // Load alerts from local storage on mount
  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem("alerts")) || [];
    setAlerts(savedAlerts);
  }, []);

  // Save alerts to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("alerts", JSON.stringify(alerts));
  }, [alerts]);

  const toggleChecked = (id) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, checked: !alert.checked } : alert
    );
    setAlerts(updatedAlerts);
  };

  const handleDateChange = (days) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + days);
      return newDate;
    });
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isDateInThePast = currentDate.getTime() < today.getTime();

  const openModal = () => {
    setFormData((prev) => ({ ...prev, date: currentDate }));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ title: "", description: "", date: new Date(), time: "12:00" });
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

  const addOrUpdateAlert = () => {
    if (formData.id) {
      updateAlert(); // Edit existing alert
    } else {
      addAlert(); // Add new alert
    }
  };

  const addAlert = () => {
    const newAlert = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        date: formData.date.toDateString(),
        time: formData.time,
        checked: false,
    };
    setAlerts([...alerts, newAlert]);
    closeModal();
  };

  const openModalWithData = (alert) => {
    setFormData({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        date: new Date(alert.date),
        time: alert.time,
    });
    setShowModal(true);
  };
  
  const updateAlert = () => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === formData.id
        ? {
            ...alert,
            title: formData.title,
            description: formData.description,
            date: formData.date.toDateString(),
            time: formData.time,
          }
        : alert
    );
    setAlerts(updatedAlerts);
    closeModal();
  };
  

  return (
    <div className="alerts-page">
      <h1 className="alerts-title">Alerts</h1>
      <div className="date-navigation">
        <button onClick={() => handleDateChange(-1)}>&lt;</button>
        <p>{formattedDate}</p>
        <button onClick={() => handleDateChange(1)}>&gt;</button>
      </div>
      <ul className="alerts-list">
        {alerts
          .filter((alert) => alert.date === currentDate.toDateString())
          .map((alert) => (
            <li key={alert.id} className="alert-item" onClick={() => openModalWithData(alert)}>
              <input
                type="checkbox"
                checked={alert.checked}
                onChange={() => toggleChecked(alert.id)}
              />
              <span className="alert-name">
                {alert.title} ({alert.time})
              </span>
              <button
                className="delete-button"
                onClick={(e) => {
                    e.stopPropagation(); 
                    setAlerts(alerts.filter((a) => a.id !== alert.id));
                  }}>
                x
              </button>
            </li>
          ))}
      </ul>
      {!isDateInThePast && (
        <button className="add-button" onClick={openModal}>
          + Schedule Alert
        </button>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Schedule an Alert</h2>
            <label>
              Title:
              <input
                type="text"
                name="title"
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
                <DatePicker
                    selected={formData.date}
                    onChange={handleDateSelect}
                /> 
            </label>
            <label>
              Time:
                <TimePicker
                    className="custom-time-picker"
                    value={formData.time}
                    onChange={handleTimeSelect}
                    format="h:mm a"
                    clearIcon={null}
                    clockIcon={null}
                /> 


            </label>
            <div className="modal-buttons">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={addOrUpdateAlert}>{formData.id ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
