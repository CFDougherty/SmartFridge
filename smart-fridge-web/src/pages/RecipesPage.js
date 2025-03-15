import React, { useState, useEffect, useContext } from "react";
import { RecipesContext } from "../context/RecipesContext";
import "./styles/RecipesPage.css";

const apiKey = "6dacd1bf57fc4f27be8752284f04b8cd";

const RecipesPage = () => {
  const { recipes, addRecipe, updateRecipe, removeRecipe } = useContext(RecipesContext);

  const [query, setQuery] = useState("");
  const [apiRecipes, setApiRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cookTime: "",
    ingredients: "",
  });

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const fetchRandomRecipes = async () => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=10`
      );
      const data = await response.json();
      setApiRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
    }
  };

  const searchRecipes = async () => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}`
      );
      const data = await response.json();
      setApiRecipes(data.results || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const showRecipeDetails = async (recipeId) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
      );
      const data = await response.json();
      setSelectedRecipe(data);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  const closeRecipeDetails = () => {
    setSelectedRecipe(null);
  };

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
      updateRecipe(editingId, {
        name: formData.name,
        cookTime: formData.cookTime,
        ingredients: ingArray,
      });
    } else {
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

      <div className="search-form">
        <input
          type="text"
          placeholder="Search for recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchRecipes}>Search</button>
        <button className="add-recipe-button" onClick={handleAddNewClick}>
          + Add Recipe
        </button>
      </div>

      <div className="recipes-section">
        {apiRecipes.length === 0 ? (
          <p>No recipes found. Try searching for something else.</p>
        ) : (
          apiRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <h3>{recipe.title}</h3>
              <button onClick={() => showRecipeDetails(recipe.id)}>View Recipe</button>
            </div>
          ))
        )}
      </div>

      {selectedRecipe && (
        <div className="recipe-overlay" onClick={closeRecipeDetails}>
          <div className="recipe-details" onClick={(e) => e.stopPropagation()}>
            <div className="status-bar">
              <span onClick={closeRecipeDetails} className="close-button">
                &times;
              </span>
            </div>

            <h2>{selectedRecipe.title}</h2>
            <img src={selectedRecipe.image} alt={selectedRecipe.title} />
            <p>
              <strong>Ingredients:</strong>
            </p>
            <ul>
              {selectedRecipe.extendedIngredients?.map((ingredient, index) => (
                <li key={index}>{ingredient.original}</li>
              ))}
            </ul>
            <p>
              <strong>Instructions:</strong>
            </p>
            <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
          </div>
        </div>
      )}


      <h2 className="recipes-subheader">My Saved Recipes</h2>
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>Cook Time: {recipe.cookTime}</p>
            <p>
              Ingredients:{" "}
              {Array.isArray(recipe.ingredients)
                ? recipe.ingredients.join(", ")
                : recipe.ingredients}
            </p>
            <div className="card-buttons">
              <button onClick={() => handleEditClick(recipe)}>Edit</button>
              <button onClick={() => handleDelete(recipe.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

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
