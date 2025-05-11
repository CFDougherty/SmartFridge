import React, { useState, useEffect, useContext, useRef } from "react";
import { RecipesContext } from "../context/RecipesContext";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import "./styles/RecipesPage.css";
import backgroundImg from "../assets/background.jpg";

const RecipesPage = () => {
  const {
    recipes,
    addRecipe,
    updateRecipe,
    removeRecipe,
    fetchAndStoreSpoonacularRecipes,
    fetchLocalRecipes
  } = useContext(RecipesContext);

  const [query, setQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    readyInMinutes: "",
    ingredients: "",
    image: "",
    instructions: ""
  });

  const scrollRef = useRef();
  const modalScrollRef = useRef();
  const [{ y }, setYSpring] = useSpring(() => ({ y: 0 }));
  const [{ my }, setModalScroll] = useSpring(() => ({ my: 0 }));

  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const searchTerms = query.toLowerCase().split(",").map(term => term.trim()).filter(term => term);
    if (searchTerms.length > 0) {
        const locallyFiltered = recipes.filter(recipe => {
            return searchTerms.every(term => 
                (recipe.name && recipe.name.toLowerCase().includes(term)) ||
                (Array.isArray(recipe.ingredients) && recipe.ingredients.join(", ").toLowerCase().includes(term)) ||
                (typeof recipe.ingredients === 'string' && recipe.ingredients.toLowerCase().includes(term))
            );
        });
        setFilteredRecipes(locallyFiltered);
        setNoResults(locallyFiltered.length === 0 && recipes.length > 0 && query.trim() !== "");
    } else {
        setFilteredRecipes(recipes);
        setNoResults(recipes.length === 0 && !query.trim());
    }
  }, [recipes, query]);

  const handleLocalSearch = async () => {
    if (!query.trim()) {
      setFilteredRecipes(recipes);
      setNoResults(recipes.length === 0);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5001/recipes?search=${encodeURIComponent(query)}`
      );
      if (!res.ok) {
        throw new Error(`Local search request failed: ${res.status}`);
      }
      const data = await res.json();
      setFilteredRecipes(data);
      setNoResults(data.length === 0);
    } catch (error) {
      console.error("Local search failed:", error);
      setFilteredRecipes([]);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMoreAndStoreSpoonacular = async () => {
    setLoading(true);
    try {
      if (query.trim() !== "") {
        await fetchAndStoreSpoonacularRecipes(query);
        await handleLocalSearch(); 
      } else {
        await fetchAndStoreSpoonacularRecipes(null); 
      }
    } catch (err) {
      console.error("Error loading and storing recipes from Spoonacular:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const showRecipeDetails = (recipe) => setSelectedRecipe(recipe);
  const closeRecipeDetails = () => setSelectedRecipe(null);

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData({ name: "", readyInMinutes: "", ingredients: "", image: "", instructions: "" });
    setShowModal(true);
  };

  const handleEditClick = (recipe) => {
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      readyInMinutes: recipe.readyInMinutes || "",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : (recipe.ingredients || ""),
      image: recipe.image || "",
      instructions: recipe.instructions || ""
    });
    setShowModal(true);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

   const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Recipe name cannot be empty.");
      return;
    }
    const ingArray = formData.ingredients.split(",").map(i => i.trim()).filter(i => i);
    
    let recipeData = {
      name: formData.name,
      readyInMinutes: Number(formData.readyInMinutes) || 0,
      ingredients: ingArray,
      image: formData.image,
      instructions: formData.instructions
    };

    setLoading(true);
    try {
      if (!editingId) {
        const newManualRecipeId = -Math.floor(Date.now() / 1000); 
        await addRecipe({ ...recipeData, id: newManualRecipeId });
      } else { 
        await updateRecipe(editingId, recipeData); 
      }
      setShowModal(false);
      if(query.trim()){
        await handleLocalSearch(); 
      } else {
        await fetchLocalRecipes(); 
      }
    } catch (error) {
        console.error("Error submitting recipe:", error);
        alert("Failed to save recipe. See console for details.");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (idToDelete, recipeName) => {
    if (window.confirm(`Are you sure you want to delete "${recipeName}"?`)) {
        setLoading(true);
        try {
            await removeRecipe(idToDelete);
            if (query.trim()) {
                await handleLocalSearch();
            } else {
              await fetchLocalRecipes();
            }
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Failed to delete recipe.");
        } finally {
            setLoading(false);
        }
    }
  };

  const bind = useGesture(
    { onDrag: ({ offset: [, myOffset] }) => setYSpring({ y: myOffset }) },
    { drag: { axis: "y", rubberband: false } }
  );

  const modalBind = useGesture(
    { onDrag: ({ offset: [, myOffset] }) => setModalScroll({ my: myOffset }) },
    { drag: { axis: "y", rubberband: false } }
  );

  return (
    <div className="recipes-container" style={{ backgroundImage: `url(${backgroundImg})` }}>
      {selectedRecipe && (
        <div className="modal" onClick={closeRecipeDetails}>
          <animated.div 
            ref={modalScrollRef} 
            className="modal-content" 
            {...modalBind()} 
            style={{transform: my.to(val => `translateY(${val}px)`)}}
            onClick={e => e.stopPropagation()}
          >
            <h2>{selectedRecipe.name}</h2>
            {selectedRecipe.image && <img className="recipe-image-large" src={selectedRecipe.image} alt={selectedRecipe.name} />}
            <p><strong>Ingredients:</strong></p>
            <ul>
              {Array.isArray(selectedRecipe.ingredients) && selectedRecipe.ingredients.length > 0
                ? selectedRecipe.ingredients.map((i, idx) => <li key={idx}>{i}</li>)
                : <li>No ingredients listed.</li>}
            </ul>
            {selectedRecipe.readyInMinutes > 0 && (
              <p><strong>Ready in:</strong> {selectedRecipe.readyInMinutes} minutes</p>
            )}
            <p><strong>Instructions:</strong></p>
            {selectedRecipe.instructions
              ? <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions.replace(/\n/g, '<br />') }} /> 
              : <p>No instructions provided.</p>}
            <button onClick={closeRecipeDetails}>Close</button>
          </animated.div>
        </div>
      )}

      <animated.div ref={scrollRef} className="recipes-scrollable" {...bind()} style={{ transform: y.to(val => `translateY(${val}px)`) }}>
        <h1 className="recipes-header">My Recipes</h1>

        <div className="search-form">
          <input type="text" placeholder="Search recipes..." value={query} onChange={e => setQuery(e.target.value)} />
          <div className="search-buttons">
            <button onClick={handleLocalSearch} disabled={loading}>Search Local</button>
            <button className="add-recipe-button" onClick={handleAddNewClick} disabled={loading}>+ Add Manually</button>
          </div>
        </div>

        <div className="load-more-container">
            <button 
                className="load-more-button" 
                onClick={handleLoadMoreAndStoreSpoonacular} 
                disabled={loading}
                title="Fetch & Store recipes from Spoonacular (uses search term if provided, else random)"
            >
                {loading ? "Loading Recipes..." : "Load More Recipes"}
            </button>
        </div>
        
        {loading && !showModal && <div className="loading-text">Loading...</div>}
        <h2 className="recipes-subheader">Recipe Results</h2>
        <div className="recipes-section">
          {filteredRecipes.length === 0 && !loading && !query.trim() && (
            <p className="no-results-message"></p>
          )}
          {filteredRecipes.length === 0 && !loading && query.trim() && (
            <p className="no-results-message"></p>
          )}
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              {recipe.image && <img src={recipe.image} alt={recipe.name} draggable="false"/>}
              <h3>{recipe.name}</h3>
              {recipe.readyInMinutes > 0 && <p>Ready in: {recipe.readyInMinutes} mins</p>}
              <button onClick={() => showRecipeDetails(recipe)} disabled={loading}>View</button>
              <button onClick={() => handleEditClick(recipe)} disabled={loading}>Edit</button>
              <button  onClick={() => handleDelete(recipe.id, recipe.name)} disabled={loading}>Delete</button>
            </div>
          ))}
        </div>
      </animated.div>

      {showModal && (
        <div className="modal" onClick={() => !loading && setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? "Edit Recipe" : "Add New Recipe Manually"}</h2>
            <label>Name: <input type="text" name="name" value={formData.name} onChange={handleInputChange} /></label>
            <label>Ready in Minutes: <input type="number" name="readyInMinutes" value={formData.readyInMinutes} onChange={handleInputChange} /></label>
            <label>Ingredients (comma-separated): <textarea name="ingredients" value={formData.ingredients} onChange={handleInputChange} /></label>
            <label>Image URL: <input type="text" name="image" value={formData.image} onChange={handleInputChange} /></label>
            <label>Instructions (use new lines for steps): <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} /></label>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
              <button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : (editingId ? "Save Changes" : "Add Recipe")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
