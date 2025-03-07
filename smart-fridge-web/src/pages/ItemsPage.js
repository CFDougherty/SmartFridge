import React, { useState, useContext, useEffect } from "react";
import { ItemsContext } from "../context/ItemsContext";
import "./styles/ItemsPage.css";

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

  const addOrUpdateItem = async () => {
    if (!formData.name.trim()) return;

    if (formData.id) {
      await updateItem(formData.id, { ...formData });
    } else {
      await addItem({ ...formData });
    }

    closeModal();
  };

  return (
    <div className="items-page">
      <h1 className="items-title">Items in Fridge</h1>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item">
            <span onClick={() => openModal(item)} className="clickable">
              {item.name} ({item.quantity} {item.unit}) - Exp: {item.expiry}
            </span>
            <button className="delete-button" onClick={() => removeItem(item.id)}>x</button>
          </li>
        ))}
      </ul>

      <button className="add-item-button" onClick={() => openModal()}>+ Add Item</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{formData.id ? "Edit Item" : "Add Item"}</h2>

            <label>
              Item Name:
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
            </label>

            <label>
              Quantity & Unit:
              <div className="input-group">
                <input type="text" name="quantity" value={formData.quantity} onChange={handleInputChange} />
                <select name="unit" value={formData.unit} onChange={handleInputChange}>
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
              Expiration:
              <input type="text" name="expiry" value={formData.expiry} onChange={handleInputChange} />
            </label>

            <div className="modal-buttons">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={addOrUpdateItem}>{formData.id ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
