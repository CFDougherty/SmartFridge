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
    fetchMoreRecipesFromSpoonacular,
    //loadRecipesFromDatabase
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
  const [{ y }, set] = useSpring(() => ({ y: 0 }));
  const [{ my }, setModalScroll] = useSpring(() => ({ my: 0 }));

  useEffect(() => {
    setFilteredRecipes(recipes);
  }, [recipes]);

  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);


  const handleSearch = async () => {
    if (!query.trim()) {
      setFilteredRecipes(recipes);
      setNoResults(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/recipes?search=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setFilteredRecipes(data);
      // <-- new:
      setNoResults(data.length === 0);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };


  const handleShowMoreAndStore = async () => {
    setLoading(true);
    try {
      await fetchMoreRecipesFromSpoonacular(query);
      await handleSearch();
    } catch (err) {
      console.error("Error loading more recipes:", err);
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
      readyInMinutes: recipe.readyInMinutes,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients,
      image: recipe.image || "",
      instructions: recipe.instructions || ""
    });
    setShowModal(true);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Recipe name cannot be empty.");
      return;
    }

    const ingArray = formData.ingredients.split(",").map(i => i.trim()).filter(i => i);
    const payload = {
      name: formData.name,
      readyInMinutes: Number(formData.readyInMinutes) || 0,
      ingredients: ingArray,
      image: formData.image,
      instructions: formData.instructions
    };

    if (!editingId) {
      addRecipe(payload);
    } else {
      updateRecipe(editingId, payload);
    }
    setShowModal(false);
  };

  const handleDelete = id => removeRecipe(id);

  const bind = useGesture(
    { onDrag: ({ offset: [, myOffset] }) => set({ y: myOffset }) },
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
          <animated.div ref={modalScrollRef} className="modal-content" {...modalBind()} onClick={e => e.stopPropagation()}>
            <h2>{selectedRecipe.name}</h2>
            {selectedRecipe.image && <img className="recipe-image-large" src={selectedRecipe.image} alt={selectedRecipe.name} />}
            <p><strong>Ingredients:</strong></p>
            <ul>
              {Array.isArray(selectedRecipe.ingredients)
                ? selectedRecipe.ingredients.map((i, idx) => <li key={idx}>{i}</li>)
                : <li>{selectedRecipe.ingredients}</li>}
            </ul>
            {selectedRecipe.readyInMinutes > 0 && (
              <p><strong>Ready in:</strong> {selectedRecipe.readyInMinutes} minutes</p>
            )}
            <p><strong>Instructions:</strong></p>
            {selectedRecipe.instructions
              ? <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
              : <p>No instructions provided.</p>}
            <button onClick={closeRecipeDetails}>Close</button>
          </animated.div>
        </div>
      )}

      <animated.div ref={scrollRef} className="recipes-scrollable" {...bind()} style={{ transform: y.to(val => `translateY(${val}px)`) }}>
        <h1 className="recipes-header">Recipes</h1>

        <div className="search-form">
          <input type="text" placeholder="Search recipes..." value={query} onChange={e => setQuery(e.target.value)} />
          <div className="search-buttons">
            <button onClick={handleSearch}>Search</button>
            <button className="add-recipe-button" onClick={handleAddNewClick}>+ Add Recipe</button>
          </div>
        </div>

        <div className="load-more-container">
          {loading ? (
            <div className="loading-text">Loading...</div>
          ) : (
            <button className="load-more-button" onClick={handleShowMoreAndStore} disabled={loading}>
              Load More Recipes
            </button>
          )}
        </div>


        <h2 className="recipes-subheader">Search Results</h2>
        <div className="recipes-section">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              {recipe.image && <img src={recipe.image} alt={recipe.name} draggable="false"/>}
              <h3>{recipe.name}</h3>
              {recipe.readyInMinutes > 0 && <p>Ready in: {recipe.readyInMinutes} mins</p>}
              <button onClick={() => showRecipeDetails(recipe)}>View</button>
              <button onClick={() => handleEditClick(recipe)}>Edit</button>
              <button classname="delete-button" onClick={() => {
                if(window.confirm(`Are you sure you want to delete "${recipe.name}"?`)){
                  handleDelete(recipe.id);
                }
              }}>Delete</button>
            </div>
          ))}
        </div>
      </animated.div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? "Edit Recipe" : "Add Recipe"}</h2>
            <label>Name: <input type="text" name="name" value={formData.name} onChange={handleInputChange} /></label>
            <label>Ready in Minutes: <input type="number" name="readyInMinutes" value={formData.readyInMinutes} onChange={handleInputChange} /></label>
            <label>Ingredients (comma-separated): <textarea name="ingredients" value={formData.ingredients} onChange={handleInputChange} /></label>
            <label>Image URL: <input type="text" name="image" value={formData.image} onChange={handleInputChange} /></label>
            <label>Instructions: <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} /></label>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSubmit}>{editingId ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
