import React from "react";
import './styles/ShoppingListPage.css';

const ShoppingListPage = () => {
  return (
    <div className="shopping-list-container">
      <h1 className="shopping-list-header">Shopping List</h1>
      <div className="shopping-list-section">
        {/* Placeholder for shopping list items */}
        <p>Your shopping list items will appear here.</p>
      </div>
      <button className="add-shopping-item-button">+ Add Item</button>
    </div>
  );
};

export default ShoppingListPage;
