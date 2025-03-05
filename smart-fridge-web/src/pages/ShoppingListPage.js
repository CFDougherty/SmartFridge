import React, { useState, useContext } from "react";
import { ShoppingListContext } from "../context/ShoppingListContext";
import "./styles/ShoppingListPage.css";

const ShoppingListPage = () => {
  const { shoppingListItems, addItem, updateItem, removeItem } = useContext(ShoppingListContext);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", quantity: "" });
  const [autoAdd, setAutoAdd] = useState(false);

  const openModal = (item = null) => {
    setFormData(item ? item : { id: null, name: "", quantity: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ id: null, name: "", quantity: "" });
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
      const newItem = { ...formData, checked: false };
      await addItem(newItem);
    }
  
    closeModal();
  };
  



  const toggleItemChecked = (id) => {
    const item = shoppingListItems.find((item) => item.id === id);
    if (item) {
      updateItem(id, { ...item, checked: !item.checked });
    }
  };

  const toggleAutoAdd = () => {
    setAutoAdd((prev) => !prev);
  };

  const placeOrder = () => {
    alert("Order placed!");
  };

  return (
    <div className="shopping-list-page">
      <h1 className="shopping-list-title">Shopping List</h1>
      <ul className="shopping-list">
        {shoppingListItems.map((item) => (
          <li key={item.id} className="shopping-list-item">
            <input type="checkbox" checked={item.checked || false} onChange={() => toggleItemChecked(item.id)} />
            <span className="shopping-list-name" onClick={() => openModal(item)} style={{ cursor: "pointer" }}>
              {item.name}
            </span>
            <span className="shopping-list-quantity">({item.quantity})</span>
            <button className="delete-button" onClick={() => removeItem(item.id)}>x</button>
          </li>
        ))}
      </ul>

      <button className="add-item-button" onClick={() => openModal()}>+ Add Item</button>
      <button className="place-order-button" onClick={placeOrder}>Place Order</button>
      <button className="auto-add-button" onClick={toggleAutoAdd}>{autoAdd ? "Auto-Add Enabled" : "Auto-Add Disabled"}</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{formData.id ? "Edit Item" : "Add Item"}</h2>
            <label>
              Item Name:
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
            </label>
            <label>
              Quantity:
              <input type="text" name="quantity" value={formData.quantity} onChange={handleInputChange} />
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

export default ShoppingListPage;
