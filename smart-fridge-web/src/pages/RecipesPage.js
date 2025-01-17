import React, { useState } from "react";
import './styles/RecipesPage.css';

const RecipesPage = () => {
  const [availableRecipes, setAvailableRecipes] = useState([
    { name: "Recipe 1", cookTime: "30 mins", ingredients: "Chicken, Spices" },
    { name: "Recipe 2", cookTime: "20 mins", ingredients: "Pasta, Tomato Sauce" },
    { name: "Recipe 3", cookTime: "40 mins", ingredients: "Beef, Potatoes" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: "", cookTime: "", ingredients: "" });

  // Handle input changes in modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe((prev) => ({ ...prev, [name]: value }));
  };

  // Add recipe to availableRecipes
  const addRecipe = () => {
    if (newRecipe.name && newRecipe.cookTime && newRecipe.ingredients) {
      setAvailableRecipes([...availableRecipes, newRecipe]);
      setNewRecipe({ name: "", cookTime: "", ingredients: "" });
      setShowModal(false);
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
              <input
                type="text"
                name="name"
                value={newRecipe.name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Cook Time:
              <input
                type="text"
                name="cookTime"
                value={newRecipe.cookTime}
                onChange={handleInputChange}
                placeholder="e.g., 30 mins"
              />
            </label>
            <label>
              Ingredients:
              <textarea
                name="ingredients"
                value={newRecipe.ingredients}
                onChange={handleInputChange}
                placeholder="e.g., Chicken, Spices"
              />
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
