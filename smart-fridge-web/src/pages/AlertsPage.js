import React, { useState, useContext, useRef } from "react";
import { AlertsContext } from "../context/AlertsContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "./styles/AlertsPage.css";
import backgroundImg from "../assets/background.jpg";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


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
    setFormData({
      ...alert,
      date: new Date(alert.date),
    });
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
      const updatedAlert = {
        ...formData,
        date: formData.date.toDateString(),
      };
      updateAlert(formData.id, updatedAlert);
    } else {
      addAlert({
        ...formData,
        date: formData.date.toDateString(),
      });
    }
    setShowModal(false);
  };

  const filteredAlerts = alerts.filter(
    (alert) => alert.date === currentDate.toDateString()
  );

  const formatTimeTo12Hour = (time) => {
    if (!time) return "";
    let [hours, minutes] = time.split(":").map(Number);
    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${amPm}`;
  };

  const scrollRef = useRef();
  const modalScrollRef = useRef();
  const [{ y }, set] = useSpring(() => ({ y: 0 }));
  
  const bind = useGesture(
      {
        onDrag: ({ offset: [, my] }) => {
          set({ y: my });
        },
      },
      { drag: { axis: "y", rubberband: false } }
  );

  return (
    <div className="alerts-page" style={{ backgroundImage: `url(${backgroundImg})` }}>


      {showModal && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

      <animated.div ref={scrollRef} className="recipes-scrollable" {...bind()} style={{ transform: y.to((val) => `translateY(${val}px)`) }}>
      <h1 className="alerts-title">Alerts</h1>
      <div className="date-navigation">
        <button onClick={() => handleDateChange(-1)}>&lt;</button>
        <p>{currentDate.toDateString()}</p>
        <button onClick={() => handleDateChange(1)}>&gt;</button>
      </div>


      <div className="calendar-wrapper">
        <Calendar
          value={currentDate}
          onChange={(date) => setCurrentDate(date)}
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const dayHasAlert = alerts.some(
                (a) => new Date(a.date).toDateString() === date.toDateString()
              );
              return dayHasAlert ? <div className="alert-dot" /> : null;
            }
          }}
          tileClassName={({ date, view }) =>
            view === 'month' &&
            alerts.some((a) => new Date(a.date).toDateString() === date.toDateString())
              ? 'has-alert'
              : null
          }
        />
      </div>


      <ul className="alerts-list">
        {filteredAlerts.map((alert) => (
          <li
            key={alert.id}
            className="alert-item"
            onClick={() => openModalForEdit(alert)}
          >
            <span className="alert-name">
              {alert.title} ({formatTimeTo12Hour(alert.time)})
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

      </animated.div>
    </div>
  );
};

export default AlertsPage;
