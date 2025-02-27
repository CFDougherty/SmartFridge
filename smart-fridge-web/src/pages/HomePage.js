import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/HomePage.css";

const HomePage = () => {
  const [items, setItems] = useState([]);
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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/fridge");
      setItems(res.data);
    } catch (error) {
      console.error("Error fetching fridge items:", error);
    }
  };

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

  const addOrUpdateItem = async () => {
    if (!formData.name.trim()) return;

    if (formData.id) {
      try {
        const res = await axios.put(
          `http://localhost:5000/fridge/${formData.id}`,
          formData
        );
        setItems((prev) =>
          prev.map((i) => (i.id === formData.id ? res.data : i))
        );
      } catch (error) {
        console.error("Error updating item:", error);
      }
    } else {
      try {
        const res = await axios.post("http://localhost:5000/fridge", formData);
        setItems((prev) => [...prev, res.data]);
      } catch (error) {
        console.error("Error adding item:", error);
      }
    }
    closeModal();
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/fridge/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome!</h1>
      <h2 className="home-subtitle">Items in Fridge</h2>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item">
            <span onClick={() => openModal(item)} style={{ marginRight: 10, cursor: "pointer" }}>
              {item.name}
            </span>
            <span onClick={() => openModal(item)} style={{ marginRight: 10, cursor: "pointer" }}>
              ({item.quantity} {item.unit})
            </span>
            <span onClick={() => openModal(item)} style={{ cursor: "pointer" }}>
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
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  style={{ flex: 2 }}
                />
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  style={{ flex: 1 }}
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
