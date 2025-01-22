import React, { useState } from "react";
import "./styles/HomePage.css";

const HomePage = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Milk", quantity: "1", unit: "L.", expiry: "2 days" },
    { id: 2, name: "Eggs", quantity: "12", unit: "cnt.", expiry: "5 days" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    quantity: "",
    unit: "",
    expiry: "",
  });

  const unitOptions = [
    { label: "Unit", value: "" },
    { label: "Pounds (lb.)", value: "lb." },
    { label: "Ounces (oz.)", value: "oz." },
    { label: "Cups (C.)", value: "C." },
    { label: "Pints (pt.)", value: "pt." },
    { label: "Quarts (qt.)", value: "qt." },
    { label: "Gallons (gal.)", value: "gal." },
    { label: "Liters (L.)", value: "L." },
    { label: "Grams (g.)", value: "g." },
    { label: "Count (cnt.)", value: "cnt." },
  ];

  const openModal = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ id: null, name: "", quantity: "", unit: "", expiry: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ id: null, name: "", quantity: "", unit: "", expiry: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateItem = () => {
    if (formData.id) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === formData.id ? { ...item, ...formData } : item
        )
      );
    } else {
      setItems((prevItems) => [
        ...prevItems,
        { ...formData, id: Date.now() },
      ]);
    }
    closeModal();
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome!</h1>
      <h2 className="home-subtitle">Items in Fridge</h2>
      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item">
            <span
              onClick={() => openModal(item)}
              style={{ cursor: "pointer", marginRight: "10px" }}
            >
              {item.name}
            </span>
            <span
              onClick={() => openModal(item)}
              style={{ cursor: "pointer", marginRight: "10px" }}
            >
              ({item.quantity} {item.unit})
            </span>
            <span
              onClick={() => openModal(item)}
              style={{ cursor: "pointer" }}
            >
              - Exp: {item.expiry}
            </span>
            <button onClick={() => removeItem(item.id)}>x</button>
          </li>
        ))}
      </ul>
      <button className="add-item-button" onClick={() => openModal()}>
        + Add Item
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{formData.id ? "Edit Item" : "Add Item"}</h2>
            <label>
              Item Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Quantity:
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  style={{ flex: "2" }}
                />
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  style={{ flex: "1" }}
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label>
              Expiration:
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleInputChange}
              />
            </label>
            <div className="modal-buttons">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={addOrUpdateItem}>
                {formData.id ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
