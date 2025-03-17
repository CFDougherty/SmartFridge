import React, { useState, useContext, useEffect } from "react";
import { ItemsContext } from "../context/ItemsContext";
import { useNavigate } from "react-router-dom";
import "./styles/ItemsPage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { scanFridge } from "../components/scanFridge";

const ItemsPage = () => {
  const { items, fetchItems, addItem, updateItem, removeItem } = useContext(ItemsContext);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    quantity: "",
    unit: "",
    expiry: "",
  });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openModal = (item = null) => {
    setFormData(item ? item : { id: null, name: "", quantity: "", unit: "", expiry: "" });
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

  const handleDateSelect = (date) => {
    setFormData((prev) => ({ ...prev, expiry: date.toISOString().split("T")[0] }));
  };

  const addOrUpdateItem = async () => {
    if (!formData.name.trim()) return;
    if (formData.id) {
      await updateItem(formData.id, { ...formData });
    } else {
      await addItem({ ...formData });
      await fetchItems();
    }
    closeModal();
  };

  const navigate = useNavigate();

  const scanFridgeAndUpdate = async () => {
      document.getElementById("scan-status").innerText = "Scanning...";

      const data = await scanFridge();

      if (data.error) {
          document.getElementById("scan-status").innerText = "Error: " + data.error;
      } else {
          document.getElementById("scan-status").innerText = "Scan Complete!";
          console.log("Scanned Items:", data);

          if (data.inventory) {
              data.inventory.forEach((item) => {
                  addItem({ name: item.name, quantity: item.count, unit: item.unit });
              });
          }
      }
  };


  return (
    <div className="items-page">
      <h1 className="items-title">Items in Fridge</h1>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item">
            <span onClick={() => openModal(item)} className="clickable">
              {item.name} ({item.quantity} {item.unit}){item.expiry ? ` - Exp: ${item.expiry}` : ""}
            </span>
            <button className="delete-button" onClick={() => removeItem(item.id)}>
              x
            </button>
          </li>
        ))}
      </ul>

      <div className="button-group">
        <button className="add-item-button" onClick={() => openModal()}>
          + Add Item
        </button>
        <button className="add-item-button" onClick={() => navigate("/scan-barcode")}>
          + Add via Barcode
        </button>
        <button className="scan-fridge-button" onClick={scanFridgeAndUpdate}>
          Scan Fridge
        </button>
<p id="scan-status"></p>

      </div>

      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              Quantity & Unit:
              <div className="input-group">
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="">Unit</option>
                  <option value="lb.">Pounds (lb.)</option>
                  <option value="oz.">Ounces (oz.)</option>
                  <option value="C.">Cups (C.)</option>
                  <option value="L.">Liters (L.)</option>
                  <option value="cnt.">Count (cnt.)</option>
                </select>
              </div>
            </label>

            <label>
              Expiration Date:
              <DatePicker
                selected={formData.expiry ? new Date(formData.expiry) : null}
                onChange={handleDateSelect}
                dateFormat="yyyy-MM-dd"
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

export default ItemsPage;
