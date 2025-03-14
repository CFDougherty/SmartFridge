import React, { useState } from "react";
import { useContext } from "react";
import { ShoppingListContext } from "../context/ShoppingListContext";
import { AlertsContext } from "../context/AlertsContext";
import { RecipesContext } from "../context/RecipesContext";
import "./styles/HomePage.css";
import { ItemsContext } from "../context/ItemsContext";
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  
  /*
  const [items] = useState([
    { name: "Milk", quantity: "1L", expiry: "2 days" },
    { name: "Eggs", quantity: "12", expiry: "5 days" },
  ]);
  */

  const { items } = useContext(ItemsContext);

  const { shoppingListItems } = useContext(ShoppingListContext);

  const { alerts } = useContext(AlertsContext);

  const { recipes } = useContext(RecipesContext);

  const firstRecipe = recipes[0] || {
    name: "No recipes yet",
    cookTime: "",
    ingredients: [],
  };
  const upcomingAlerts = alerts.slice(0, 3);

  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-header">Friday, Nov. 1</h1>

      <div className="grid-container">
        {/* Items in Fridge Section */}
        <div className="card" onClick={() => navigate("/items")}>
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
        <div className="card" onClick={() => navigate("/shopping-list")}>
          <h2>Shopping List</h2>
          <ul>
            {shoppingListItems.map((item) => (
              <li key={item.id}>
                {item.checked ? <del>{item.name}</del> : item.name}
                {item.quantity && ` (${item.quantity})`}
              </li>
            ))}
          </ul>
        </div>

        {/* Recipes Section */}
        <div className="card" onClick={() => navigate("/recipes")}>
          <h2>Recipes</h2>
          <p>Sample: {firstRecipe.name}</p>
          <p>Cook Time: {firstRecipe.cookTime}</p>
          <p>Ingredients:</p>
          <ul>
            {Array.isArray(firstRecipe.ingredients)
              ? firstRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
              : null}
          </ul>
        </div>

        {/* Alerts Section */}
        <div className="card" onClick={() => navigate("/alerts")}>
          <h2>Alerts</h2>
          <ul>
            {upcomingAlerts.map((alert) => (
              <li key={alert.id}>
                {alert.checked ? <del>{alert.title}</del> : alert.title} ({alert.time})
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
