import React, { useState, useEffect } from "react";
import "./styles/RecipesPage.css";

const apiKey = "6dacd1bf57fc4f27be8752284f04b8cd"; // Replace with placeholder before pushing

const RecipesPage = () => {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Function to fetch random recipes
  const fetchRandomRecipes = async () => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=10`
      );
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
    }
  };

  // Function to search for recipes
  const searchRecipes = async () => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}`
      );
      const data = await response.json();
      setRecipes(data.results || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  // Fetch recipe details
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

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  return (
    <div className="recipes-container">
      <h1 className="recipes-header">Recipe Suggestions</h1>

      <div className="search-form">
        <input
          type="text"
          placeholder="Search for recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchRecipes}>Search</button>
      </div>

      <div className="recipes-section">
         {recipes.length === 0 ? (
            <p>No recipes found. Try searching for something else.</p>
         ) : (
           recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <h3>{recipe.title}</h3>
              <button onClick={() => showRecipeDetails(recipe.id)}>View Recipe</button>
           </div>
           ))
         )}
      </div>


      {selectedRecipe && (
        <div className="recipe-details">
          <div className="status-bar">
            <span onClick={closeRecipeDetails} className="close-button">&times;</span>
          </div>
          <div className="recipe-content">
            <h2>{selectedRecipe.title}</h2>
            <img src={selectedRecipe.image} alt={selectedRecipe.title} />
            <p>
              <strong>Ingredients:</strong>
              <ul>
                {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                  <li key={index}>{ingredient.original}</li>
                ))}
              </ul>
            </p>
            <p>
              <strong>Instructions:</strong>
              <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
