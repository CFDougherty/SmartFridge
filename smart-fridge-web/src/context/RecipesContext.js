import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const RecipesContext = createContext();

export const RecipesProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

  // Replaced repetitive stuff with function
  const remoteHandler = async (request) => {
    try {
      return await request("http://localhost:5001");
    } catch (err1) {
      console.warn("Localhost failed, trying pidisp...");
      try {
        return await request("http://pidisp:5001");
      } catch (err2) {
        console.error("Failure in remote:", err2);
        throw err2;
      }
    }
  };

  useEffect(() => {
    loadRecipesFromDatabase();
  }, []);

  const loadRecipesFromDatabase = async () => {
    try {
      const res = await remoteHandler((base) => axios.get(`${base}/recipes`));
      setRecipes(res.data);
    } catch (_) {}
  };

  const addRecipe = async ({
    name,
    readyInMinutes,
    ingredients,
    image,
    instructions,
  }) => {
    try {
      const personalID = -Math.abs(Date.now());

      const res = await remoteHandler((base) =>
        axios.post(`${base}/recipes`, {
          id: personalID,
          name,
          readyInMinutes,
          ingredients,
          image,
          instructions,
        })
      );
      setRecipes((prev) => [...prev, res.data]);
    } catch (_) {}
  };

  const updateRecipe = async (
    id,
    { name, readyInMinutes, ingredients, image, instructions }
  ) => {
    try {
      const res = await remoteHandler((base) =>
        axios.put(`${base}/recipes/${id}`, {
          name,
          readyInMinutes,
          ingredients,
          image,
          instructions,
        })
      );
      setRecipes((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (_) {}
  };

  const removeRecipe = async (id) => {
    try {
      await remoteHandler((base) => axios.delete(`${base}/recipes/${id}`));
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (_) {}
  };

  const searchLocalRecipes = (query) => {
    if (!query.trim()) return recipes;
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query.toLowerCase())
    );
  };

const convertImageToDataUrl = async (url) => {
  const proxyUrl = `http://localhost:5001/proxy-image?url=${encodeURIComponent(url)}`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 1);
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error("Image Loading Failed"));
    img.src = proxyUrl;
  });
};
    
  


  const fetchMoreRecipesFromSpoonacular = async (searchTerm = "") => {
    const apiKey = "6dacd1bf57fc4f27be8752284f04b8cd";

    const param = `addRecipeInstructions=true&addRecipeInformation=true&number=10&apiKey=${apiKey}`;

    const url = searchTerm.trim()
      ? `https://api.spoonacular.com/recipes/complexSearch` +
        `?query=${encodeURIComponent(searchTerm)}` +
        `&${param}`
      : `https://api.spoonacular.com/recipes/random?${param}`;

    try {
      const res = await axios.get(url);
      const newRecipes = res.data.results || res.data.recipes || [];

      for (const r of newRecipes) {
        const { id, title, readyInMinutes, image, instructions: rawInstructions, analyzedInstructions } = r;

        let imageDataUrl = image;
        if(image){
          try{
            imageDataUrl = await convertImageToDataUrl(image);
            
          } catch(error){
            console.error("Failed to convert image: ", error);
          }
        }
  
        let ingredientList = [];
        try {
          const widget = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/ingredientWidget.json?apiKey=${apiKey}`
          );
          ingredientList = (widget.data.ingredients || []).map(
            (i) => `${i.amount.metric.value}${i.amount.metric.unit} ${i.name}`
          );
        } catch {
          ingredientList = (r.extendedIngredients || []).map((i) => i.original);
        }

        let instructionsText = rawInstructions?.trim() || "";
        if (!instructionsText) {
          const steps = analyzedInstructions?.[0]?.steps || [];
          instructionsText = steps.map((s) => s.step).join(" ");
        }
  
        await axios.post("http://localhost:5001/recipes", {
          id,
          name: title,
          readyInMinutes,
          ingredients: ingredientList,
          image: imageDataUrl,
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
