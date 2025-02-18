
import React, { useState, useContext } from "react";
import { RecipesContext } from "../context/RecipesContext";
import "./styles/RecipesPage.css";

const RecipesPage = () => {
  const { recipes, addRecipe, updateRecipe, removeRecipe } = useContext(RecipesContext);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cookTime: "",
    ingredients: "",
  });

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData({ name: "", cookTime: "", ingredients: "" });
    setShowModal(true);
  };

  const handleEditClick = (recipe) => {
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      cookTime: recipe.cookTime,
      ingredients:
        typeof recipe.ingredients === "string"
          ? recipe.ingredients
          : recipe.ingredients.join(", "),
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const ingArray = formData.ingredients
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);

    if (editingId) {
      // update
      updateRecipe(editingId, {
        name: formData.name,
        cookTime: formData.cookTime,
        ingredients: ingArray,
      });
    } else {
      // add
      addRecipe({
        name: formData.name,
        cookTime: formData.cookTime,
        ingredients: ingArray,
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    removeRecipe(id);
  };

  return (
    <div className="recipes-container">
      <h1 className="recipes-header">Recipes</h1>

      {/* Controls */}
      <div className="recipes-controls">
        <input
          type="text"
          className="search-bar"
          placeholder="Search recipes..."
        />
        <button className="add-recipe-button" onClick={handleAddNewClick}>
          + Add Recipe
        </button>
      </div>

      <h2 className="recipes-subheader">Available</h2>
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>Cook Time: {recipe.cookTime}</p>
            <p>Ingredients: {recipe.ingredients}</p>
            <div className="card-buttons">
              <button onClick={() => handleEditClick(recipe)}>Edit</button>
              <button onClick={() => handleDelete(recipe.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingId ? "Edit Recipe" : "Add Recipe"}</h2>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Cook Time:
              <input
                type="text"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleInputChange}
                placeholder="e.g., 30 mins"
              />
            </label>
            <label>
              Ingredients (comma separated):
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                placeholder="e.g., Chicken, Spices"
              />
            </label>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSubmit}>
                {editingId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
