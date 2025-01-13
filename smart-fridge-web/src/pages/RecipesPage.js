import React from "react";
import './styles/RecipesPage.css';

const RecipesPage = () => {
  const availableRecipes = [
    { name: "Recipe 1", cookTime: "30 mins", ingredients: "Chicken, Spices" },
    { name: "Recipe 2", cookTime: "20 mins", ingredients: "Pasta, Tomato Sauce" },
    { name: "Recipe 3", cookTime: "40 mins", ingredients: "Beef, Potatoes" },
  ];

  const expiresSoonRecipes = [
    { name: "Recipe 1", cookTime: "25 mins", ingredients: "Fish, Lemon" },
    { name: "Recipe 2", cookTime: "15 mins", ingredients: "Rice, Beans" },
    { name: "Recipe 3", cookTime: "35 mins", ingredients: "Pork, Broccoli" },
  ];

  const savedForLaterRecipes = [
    { name: "Recipe 1", cookTime: "10 mins", ingredients: "Bread, Cheese" },
    { name: "Recipe 2", cookTime: "50 mins", ingredients: "Turkey, Vegetables" },
    { name: "Recipe 3", cookTime: "45 mins", ingredients: "Soup, Noodles" },
  ];

  return (
    <div className="recipes-container">
      <h1 className="recipes-header">Recipes</h1>

      {/* Search Bar and Add Button */}
      <div className="recipes-controls">
        <input type="text" className="search-bar" placeholder="Search recipes..." />
        <button className="add-recipe-button">+ Add Recipe</button>
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

      {/* Expires Soon Recipes */}
      <h2 className="recipes-subheader">Expires Soon</h2>
      <div className="recipes-grid">
        {expiresSoonRecipes.map((recipe, index) => (
          <div key={index} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>Cook Time: {recipe.cookTime}</p>
            <p>Ingredients: {recipe.ingredients}</p>
          </div>
        ))}
      </div>

      {/* Saved for Later Recipes */}
      <h2 className="recipes-subheader">Saved for Later</h2>
      <div className="recipes-grid">
        {savedForLaterRecipes.map((recipe, index) => (
          <div key={index} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>Cook Time: {recipe.cookTime}</p>
            <p>Ingredients: {recipe.ingredients}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipesPage;
