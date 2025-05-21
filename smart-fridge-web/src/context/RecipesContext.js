import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const RecipesContext = createContext();
const SPOONACULAR_API_KEY = "6dacd1bf57fc4f27be8752284f04b8cd";

export const RecipesProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

  const fetchLocalRecipes = () => {
    axios
      .get("http://localhost:5001/recipes")
      .then((res) => {
        setRecipes(res.data);
      })
      .catch((err) => console.error("Error fetching local recipes:", err.code, err.message));
  };

  useEffect(() => {
    fetchLocalRecipes();
  }, []);

  const addRecipe = async ({ id, name, readyInMinutes, ingredients, image = "", instructions = "" }) => {
    try {
      const personalID = -Math.abs(Date.now());
      
      const res = await axios.post("http://localhost:5001/recipes", {
        id : personalID,
        name,
        readyInMinutes,
        ingredients,
        image,
        instructions,
      });
      setRecipes((prevRecipes) => {
        const existingIndex = prevRecipes.findIndex(r => r.id === res.data.id);
        if (existingIndex !== -1) {
          const updatedRecipes = [...prevRecipes];
          updatedRecipes[existingIndex] = res.data;
          return updatedRecipes;
        } else {
          return [...prevRecipes, res.data];
        }
      });
      return res.data;
    } catch (err) {
      console.error("Error adding recipe:", err.code, err.message);
      throw err;
    }
  };

  const fetchAndStoreSpoonacularRecipes = async (searchQuery = null, count = 5) => {
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === "YOUR_SPOONACULAR_API_KEY") {
      console.error("Spoonacular API key is not configured.");
      alert("Spoonacular API key is not configured. Please set it in RecipesContext.js");
      return [];
    }

    let spoonacularEndpoint = `https://api.spoonacular.com/recipes/`;
    const params = {
      apiKey: SPOONACULAR_API_KEY,
      number: count,
      addRecipeInformation: true, 
      fillIngredients: true, 
    };

    if (searchQuery && searchQuery.trim() !== "") {
      spoonacularEndpoint += `complexSearch`;
      params.query = searchQuery;
    } else {
      spoonacularEndpoint += `random`;
    }

    try {
      const response = await axios.get(spoonacularEndpoint, { params });
      
      let spoonacularRecipesData = [];
      if (searchQuery && searchQuery.trim() !== "") {
        spoonacularRecipesData = response.data.results; 
      } else {
        spoonacularRecipesData = response.data.recipes; 
      }
      
      if (!spoonacularRecipesData || spoonacularRecipesData.length === 0) {
        console.log(`No new recipes found from Spoonacular ${searchQuery ? `for query: ${searchQuery}` : 'randomly'}.`);
        if (searchQuery) alert(`No recipes found for "${searchQuery}" on Spoonacular.`);
        return [];
      }

      let newRecipesAdded = [];
      for (const spRecipe of spoonacularRecipesData) {
        const recipeData = {
          id: spRecipe.id,
          name: spRecipe.title,
          readyInMinutes: spRecipe.readyInMinutes,
          ingredients: spRecipe.extendedIngredients ? spRecipe.extendedIngredients.map(ing => ing.original) : (spRecipe.missedIngredients ? spRecipe.missedIngredients.map(ing => ing.original) : []),
          image: spRecipe.image,
          instructions: spRecipe.instructions || (spRecipe.analyzedInstructions && spRecipe.analyzedInstructions.length > 0
            ? spRecipe.analyzedInstructions.map(instr => instr.steps.map(step => step.step).join("\n")).join("\n\n")
            : "No instructions provided."),
        };
        const added = await addRecipe(recipeData);
        if (added) newRecipesAdded.push(added);
      }
      console.log(`${newRecipesAdded.length} recipes from Spoonacular processed and stored/updated.`);
      return newRecipesAdded;
    } catch (err) {
      console.error(`Error fetching recipes from Spoonacular ${searchQuery ? `for query: ${searchQuery}` : 'randomly'}:`, err.response ? err.response.data : err.message, err.code);
      if (err.response) {
        if (err.response.status === 401) {
          alert("Failed to fetch recipes from Spoonacular: Invalid API key or authentication issue.");
        } else if (err.response.status === 402) {
          alert("Failed to fetch recipes from Spoonacular: API quota likely exceeded.");
        } else {
          alert(`Failed to fetch recipes from Spoonacular ${searchQuery ? `for query: ${searchQuery}` : ''}. See console for details.`);
        }
      } else if (err.code === 'ERR_NETWORK') {
        alert("Failed to fetch recipes from Spoonacular: Network error. Could not connect to Spoonacular API.");
      } else {
        alert(`Failed to fetch recipes from Spoonacular ${searchQuery ? `for query: ${searchQuery}` : ''}. See console for details.`);
      }
      throw err;
    }
  };

  const updateRecipe = async (id, { name, readyInMinutes, ingredients, image = "", instructions = "" }) => {
    try {
      const res = await axios.put(`http://localhost:5001/recipes/${id}`, {
        name,
        readyInMinutes,
        ingredients,
        image,
        instructions,
      });
      setRecipes((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (err) {
      console.error("Error updating recipe:", err.code, err.message);
      throw err;
    }
  };

  const removeRecipe = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting recipe:", err.code, err.message);
      throw err;
    }
  };

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        removeRecipe,
        fetchAndStoreSpoonacularRecipes, 
        fetchLocalRecipes
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
};
