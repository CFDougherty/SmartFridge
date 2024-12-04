import React from "react";
import './styles/RecipesPage.css';

const RecipesPage = () => {
  return (
    <div className="recipes-container">
      <h1 className="recipes-header">Recipes</h1>
      <div className="recipes-section">
        {/* Placeholder for recipes content */}
        <p>Your saved recipes or suggestions will appear here.</p>
      </div>
      <button className="add-recipe-button">+ Add Recipe</button>
    </div>
  );
};

export default RecipesPage;
