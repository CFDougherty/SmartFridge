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
      const personalID = -Math.abs(Date.now());
      
      const res = await axios.post("http://localhost:5001/recipes", {
        id : personalID,
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

    const param = `addRecipeInstructions=true&addRecipeInformation=true&number=10&apiKey=${apiKey}`;
    
    const url = searchTerm.trim()
      ?
        `https://api.spoonacular.com/recipes/complexSearch` +
        `?query=${encodeURIComponent(searchTerm)}` +
        `&${param}`
      :
        `https://api.spoonacular.com/recipes/random?${param}`;
  
    try {
      const res = await axios.get(url);
      const newRecipes = res.data.results || res.data.recipes || [];
  
      for (const r of newRecipes) {
        const { id, title, readyInMinutes, image, instructions: rawInstructions, analyzedInstructions } = r;
  
        let ingredientList = [];
        try {
          const widget = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/ingredientWidget.json?apiKey=${apiKey}`
          );
          ingredientList = (widget.data.ingredients || [])
            .map(i => `${i.amount.metric.value}${i.amount.metric.unit} ${i.name}`);
        } catch {
          ingredientList = (r.extendedIngredients || []).map(i => i.original);
        }
  
        let instructionsText = rawInstructions?.trim() || "";
        if (!instructionsText) {
          const steps = analyzedInstructions?.[0]?.steps || [];
          instructionsText = steps.map(s => s.step).join(" ");
        }
  
        await axios.post("http://localhost:5001/recipes", {
          id,
          name: title,
          readyInMinutes,
          ingredients: ingredientList,
          image: image || "",
          instructions: instructionsText || ""
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
