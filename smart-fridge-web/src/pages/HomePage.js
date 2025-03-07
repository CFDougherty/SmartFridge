import React, { useContext } from "react";
import { ShoppingListContext } from "../context/ShoppingListContext";
import { AlertsContext } from "../context/AlertsContext";
import { RecipesContext } from "../context/RecipesContext";
import { ItemsContext } from "../context/ItemsContext";
import "./styles/HomePage.css";

const HomePage = () => {
  const { shoppingListItems } = useContext(ShoppingListContext);
  const { alerts } = useContext(AlertsContext);
  const { recipes } = useContext(RecipesContext);
  const { items } = useContext(ItemsContext);

  const firstRecipe = recipes[0] || { name: "No recipes yet", cookTime: "", ingredients: [] };
  const upcomingAlerts = alerts.slice(0, 3);

  return (
    <div className="home-container">
      <h1 className="home-header">Friday, Nov. 1</h1>

      <div className="grid-container">
        <div className="card">
          <h2>Items in Fridge</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.name} ({item.quantity}
                {item.unit && ` ${item.unit}`}) - Exp: {item.expiry}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
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

        <div className="card">
          <h2>Recipes</h2>
          <p>Sample: {firstRecipe.name}</p>
          <p>Cook Time: {firstRecipe.cookTime}</p>
          <p>Ingredients:</p>
          <ul>
            {Array.isArray(firstRecipe.ingredients) &&
              firstRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </div>

        <div className="card">
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
