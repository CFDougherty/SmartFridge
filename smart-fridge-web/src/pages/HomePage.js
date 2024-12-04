import React, { useState } from "react";
import './styles/HomePage.css';


const HomePage = () => {
  const [items, setItems] = useState([
    { name: "Milk", quantity: "1L", expiry: "2 days" },
    { name: "Eggs", quantity: "12", expiry: "5 days" },
  ]);

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const newItem = { name: "New Item", quantity: "1", expiry: "3 days" };
    setItems([...items, newItem]);
  };

  return (
    <div>
      <h1>Welcome!</h1>
      <h2>Items in Fridge</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.name} ({item.quantity}) - Exp: {item.expiry}{" "}
            <button onClick={() => removeItem(index)} style={{ color: "red" }}>
              x
            </button>
          </li>
        ))}
      </ul>
      <button onClick={addItem}>+ Add Item</button>
    </div>
  );
};

export default HomePage;
