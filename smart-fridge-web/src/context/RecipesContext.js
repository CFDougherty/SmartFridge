
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const RecipesContext = createContext();

export const RecipesProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/recipes")
      .then((res) => setRecipes(res.data))
      .catch((err) => console.error("Error fetching recipes:", err));
  }, []);

  const addRecipe = async ({ name, readyInMinutes, ingredients, image = "", instructions = "" }) => { // <-- changed
    try {
      const res = await axios.post("http://localhost:5001/recipes", {
        name,
        readyInMinutes,                                                                  // <-- changed
        ingredients,
        image,
        instructions,
      });
      setRecipes((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding recipe:", err);
    }
  };



  const updateRecipe = async (id, { name, readyInMinutes, ingredients, image = "", instructions = "" }) => { // <-- changed
    try {
      const res = await axios.put(`http://localhost:5001/recipes/${id}`, {
        name,
        readyInMinutes,                                                                // <-- changed
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

  return (
    <RecipesContext.Provider
      value={{ recipes, addRecipe, updateRecipe, removeRecipe }}
    >
      {children}
    </RecipesContext.Provider>
  );
};
