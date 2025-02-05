import React, { useState, useEffect } from "react";
import axios from "axios";
import './styles/RecipesPage.css';

const RecipesPage = () => {
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: "", cookTime: "", ingredients: "" });

  // Fetch recipes from the backend
  useEffect(() => {
    axios.get("http://localhost:5000/recipes")
      .then((response) => setAvailableRecipes(response.data))
      .catch((error) => console.error("Error fetching recipes:", error));
  }, []);

  // Handle input changes in modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe((prev) => ({ ...prev, [name]: value }));
  };

  // Add new recipe
  const addRecipe = () => {
    if (newRecipe.name && newRecipe.cookTime && newRecipe.ingredients) {
      axios.post("http://localhost:5000/recipes", {
        name: newRecipe.name,
        cookTime: newRecipe.cookTime,
        ingredients: newRecipe.ingredients.split(",") // Convert string to array
      })
      .then((response) => {
        setAvailableRecipes([...availableRecipes, response.data]);
        setNewRecipe({ name: "", cookTime: "", ingredients: "" });
        setShowModal(false);
      })
      .catch((error) => console.error("Error adding recipe:", error));
    }
  };

  return (
    <div className="recipes-container">
      <h1 className="recipes-header">Recipes</h1>

      {/* Search Bar and Add Button */}
      <div className="recipes-controls">
        <input type="text" className="search-bar" placeholder="Search recipes..." />
        <button className="add-recipe-button" onClick={() => setShowModal(true)}>+ Add Recipe</button>
      </div>

      {/* Available Recipes */}
      <h2 className="recipes-subheader">Available</h2>
      <div className="recipes-grid">
        {availableRecipes.map((recipe, index) => (
          <div key={index} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>Cook Time: {recipe.cookTime}</p>
            <p>Ingredients: {recipe.ingredients}</p>
          </div>
        ))}
      </div>

      {/* Modal for Adding Recipe */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Recipe</h2>
            <label>
              Name:
              <input type="text" name="name" value={newRecipe.name} onChange={handleInputChange} />
            </label>
            <label>
              Cook Time:
              <input type="text" name="cookTime" value={newRecipe.cookTime} onChange={handleInputChange} placeholder="e.g., 30 mins" />
            </label>
            <label>
              Ingredients (comma separated):
              <textarea name="ingredients" value={newRecipe.ingredients} onChange={handleInputChange} placeholder="e.g., Chicken, Spices" />
            </label>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={addRecipe}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
