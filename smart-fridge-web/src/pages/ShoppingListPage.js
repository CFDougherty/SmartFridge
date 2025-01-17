import React, { useState } from "react";
import './styles/ShoppingListPage.css';

const ShoppingListPage = () => {
  const [items, setItems] = useState([
    { name: "Milk", quantity: "", checked: false },
    { name: "Eggs", quantity: "", checked: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "" });

  // Handle checkbox toggle
  const toggleChecked = (index) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, quantity: value } : item
    );
    setItems(updatedItems);
  };

  // Handle new item input change
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  // Add new item
  const addItem = () => {
    if (newItem.name.trim()) {
      setItems([...items, { ...newItem, checked: false }]);
      setNewItem({ name: "", quantity: "" });
      setShowModal(false);
    }
  };

  // Remove an item
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="shopping-list-container">
      <h1 className="shopping-list-header">Shopping List</h1>
      <table className="shopping-list-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="item-name-cell">
                <input
                  type="checkbox"
                  className="item-checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecked(index)}
                />
                {item.name}
              </td>
              <td className="item-quantity-cell">
                <input
                  type="text"
                  className="item-quantity-input"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  placeholder="Enter quantity"
                />
              </td>
              <td className="item-delete-cell">
                <button className="delete-button" onClick={() => removeItem(index)}>x</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-item-button" onClick={() => setShowModal(true)}>+ Add Item</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Item</h2>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleNewItemChange}
              />
            </label>
            <label>
              Quantity:
              <input
                type="text"
                name="quantity"
                value={newItem.quantity}
                onChange={handleNewItemChange}
                placeholder="Optional"
              />
            </label>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={addItem}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListPage;
