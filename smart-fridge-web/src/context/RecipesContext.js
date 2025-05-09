import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const RecipesContext = createContext();

export const RecipesProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    loadRecipesFromDatabase();
  }, []);

  const loadRecipesFromDatabase = async () => {
    try {
      const res = await axios.get("http://localhost:5001/recipes");
      setRecipes(res.data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  };

  const addRecipe = async ({ name, readyInMinutes, ingredients, image, instructions }) => {
    try {
      const res = await axios.post("http://localhost:5001/recipes", {
        name,
        readyInMinutes,
        ingredients,
        image,
        instructions,
      });
      setRecipes((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding recipe:", err);
    }
  };
  

  const updateRecipe = async (id, { name, readyInMinutes, ingredients, image, instructions }) => {
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
      console.error("Error updating recipe:", err);
    }
  };

  const removeRecipe = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  };

  const searchLocalRecipes = (query) => {
    if (!query.trim()) return recipes;
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query.toLowerCase())
    );
  };


  const fetchMoreRecipesFromSpoonacular = async (searchTerm = "") => {
    const apiKey = "6dacd1bf57fc4f27be8752284f04b8cd";
 
    const url = searchTerm.trim()
      ? `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
          searchTerm
        )}&addRecipeInformation=true&number=10&apiKey=${apiKey}`
      : `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=10`;

    try {
      const res = await axios.get(url);
      const newRecipes = res.data.results || res.data.recipes || [];

      for (let recipe of newRecipes) {
        const ingredients = (recipe.extendedIngredients || []).map(
          (ing) => ing.original
        );
        await axios.post("http://localhost:5001/recipes", {
          name: recipe.title,
          readyInMinutes: recipe.readyInMinutes,
          ingredients,
          image: recipe.image || "",
          instructions: recipe.instructions || "",
        });
      }

      await loadRecipesFromDatabase();
    } catch (err) {
      console.error("Error fetching from Spoonacular:", err);
    }
  };

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        removeRecipe,
        fetchMoreRecipesFromSpoonacular,
        loadRecipesFromDatabase,
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
};
