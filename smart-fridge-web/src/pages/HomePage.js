import React, { useContext } from "react"
import { ShoppingListContext } from "../context/ShoppingListContext"
import { AlertsContext } from "../context/AlertsContext"
import { RecipesContext } from "../context/RecipesContext"
import { ItemsContext } from "../context/ItemsContext"
import "./styles/HomePage.css"
import { useNavigate } from "react-router-dom"
import backgroundImg from "../assets/background.jpg"

const HomePage = () => {
  const { items } = useContext(ItemsContext)
  const { shoppingListItems } = useContext(ShoppingListContext)
  const { alerts } = useContext(AlertsContext)
  const { recipes } = useContext(RecipesContext)

  const firstRecipe = recipes[0] || { name: "No recipes yet", readyInMinutes: 0, ingredients: [] }
  const upcomingAlerts = alerts.slice(0, 3)
  const navigate = useNavigate()

  const today = new Date()
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" })
  const month   = today.toLocaleDateString("en-US", { month:   "short" })
  const day     = today.getDate()
  const formattedDate = `${weekday}, ${month} ${day}`

  return (
    <div className="home-container" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <h1 className="home-header">{formattedDate}</h1>
      <div className="grid-container">
        <div className="card" onClick={() => navigate("/items")}>
          <h2>Items in Fridge</h2>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                {item.name} ({item.quantity}
                {item.unit && ` ${item.unit}`}) - Exp: {item.expiry}
              </li>
            ))}
          </ul>
        </div>
        <div className="card" onClick={() => navigate("/shopping-list")}>
          <h2>Shopping List</h2>
          <ul>
            {shoppingListItems.map(item => (
              <li key={item.id}>
                {item.checked ? <del>{item.name}</del> : item.name}
                {item.quantity && ` (${item.quantity})`}
              </li>
            ))}
          </ul>
        </div>
        <div className="card" onClick={() => navigate("/recipes")}>
          <h2>Recipes</h2>
          <p>Name: {firstRecipe.name}</p>
          <p>Ready in: {firstRecipe.readyInMinutes} minutes</p>
        </div>
        <div className="card" onClick={() => navigate("/alerts")}>
          <h2>Alerts</h2>
          <ul>
            {upcomingAlerts.map(alert => (
              <li key={alert.id}>
                {alert.checked ? <del>{alert.title}</del> : alert.title} ({alert.time})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HomePage
