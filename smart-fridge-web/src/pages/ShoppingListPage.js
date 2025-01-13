import React, { useState } from "react";
import './styles/ShoppingListPage.css';

const ShoppingListPage = () => {
  const [items, setItems] = useState([
    { name: "Milk", quantity: "", checked: false },
    { name: "Eggs", quantity: "", checked: false },
  ]);
  const [newItem, setNewItem] = useState("");
  const [autoAdd, setAutoAdd] = useState(false);

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
    setNewItem(e.target.value);
  };

  // Add new item
  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { name: newItem, quantity: "", checked: false }]);
      setNewItem("");
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
              <td>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecked(index)}
                />
                {item.name}
              </td>
              <td>
                <input
                  type="text"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  placeholder="Enter quantity"
                />
              </td>
              <td>
                <button className="delete-button" onClick={() => removeItem(index)}>x</button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="3">
              <input
                type="text"
                value={newItem}
                onChange={handleNewItemChange}
                placeholder="New item name"
              />
              <button className="add-item-button" onClick={addItem}>+ Add Item</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="bottom-controls">
        <label className="auto-add-toggle">
          Auto-Add
          <input
            type="checkbox"
            checked={autoAdd}
            onChange={() => setAutoAdd(!autoAdd)}
          />
          <span className="slider"></span>
        </label>
        <button className="place-order-button">Place Order</button>
      </div>
    </div>
  );
};

export default ShoppingListPage;
