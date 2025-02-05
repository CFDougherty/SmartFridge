import React, { useState } from "react";
import './styles/HomePage.css';

const HomePage = () => {
  const [items, setItems] = useState([
    { name: "Milk", quantity: "1L", expiry: "2 days" },
    { name: "Eggs", quantity: "12", expiry: "5 days" },
  ]);

  const [shoppingList] = useState(["Milk", "Eggs", "Carrots", "Pickles", "Bacon", "Hot Sauce", "Cheese"]);
  const [alerts] = useState(["Milk is low (1L)", "Milk is expiring (2 days)", "Eggs are expiring (5 days)", "Parent-Teacher Conference", "Soccer Practice"]);
  const recipes = { suggestion: "Cake", cookTime: "45 mins", ingredients: ["Milk", "Eggs", "Butter", "Flour", "Sugar"] };

  return (
    <div className="home-container">
      <h1 className="home-header">Friday, Nov. 1</h1>

      <div className="grid-container">
        {/* Items in Fridge Section */}
        <div className="card">
          <h2>Items in Fridge</h2>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.name} ({item.quantity}) - Exp: {item.expiry}
              </li>
            ))}
          </ul>
        </div>

        {/* Shopping List Section */}
        <div className="card">
          <h2>Shopping List</h2>
          <ul>
            {shoppingList.map((item, index) => (
              <li key={index}>
                <input type="checkbox" /> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recipes Section */}
        <div className="card">
          <h2>Recipes</h2>
          <p>Suggestion: {recipes.suggestion}</p>
          <p>Cook Time: {recipes.cookTime}</p>
          <p>Ingredients:</p>
          <ul>
            {recipes.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        {/* Alerts Section */}
        <div className="card">
          <h2>Alerts</h2>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>
                <input type="checkbox" /> {alert}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="progress-container">
        <p>60% Full</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "60%" }}></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;