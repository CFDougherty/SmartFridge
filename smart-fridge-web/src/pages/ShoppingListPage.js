
import React, { useState, useContext } from "react";
import { ShoppingListContext } from "../context/ShoppingListContext";
import "./styles/ShoppingListPage.css";

const ShoppingListPage = () => {
  const { shoppingListItems, addItem, updateItem, removeItem } =
    useContext(ShoppingListContext);

  const [showModal, setShowModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null); // track if editing
  const [formData, setFormData] = useState({ name: "", quantity: "" });

  const toggleChecked = (item) => {
    const updated = { ...item, checked: !item.checked };
    updateItem(item.id, updated);
  };

  const handleAddNewClick = () => {
    setEditingItemId(null);
    setFormData({ name: "", quantity: "" });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setFormData({ name: item.name, quantity: item.quantity });
    setShowModal(true);
  };
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return; 
    }
    if (editingItemId) {
      updateItem(editingItemId, {
        ...formData,
        checked: false, 
      });
    } else {
      // add new item
      addItem({ ...formData });
    }
    setShowModal(false);
  };

  return (
    <div className="shopping-list-container">
      <h1 className="shopping-list-header">Shopping List</h1>

      <table className="shopping-list-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Checked</th>
            <th>Edit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {shoppingListItems.map((item) => (
            <tr key={item.id}>
              <td className="item-name-cell">{item.name}</td>
              <td className="item-quantity-cell">{item.quantity}</td>
              <td>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecked(item)}
                />
              </td>
              <td>
                <button
                  onClick={() => handleEditClick(item)}
                  className="edit-button"
                >
                  Edit
                </button>
              </td>
              <td className="item-delete-cell">
                <button
                  className="delete-button"
                  onClick={() => removeItem(item.id)}
                >
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-item-button" onClick={handleAddNewClick}>
        + Add Item
      </button>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingItemId ? "Edit Item" : "Add New Item"}</h2>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </label>
            <label>
              Quantity:
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </label>

            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSubmit}>
                {editingItemId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListPage;
