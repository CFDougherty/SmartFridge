import React, { useState, useEffect, useLayoutEffect, useContext, useRef } from "react";
import { RecipesContext } from "../context/RecipesContext";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import "./styles/RecipesPage.css";

const apiKey = "c08f534cb986424b9ff1a361957362f2";

const RecipesPage = () => {
  const { recipes, addRecipe, updateRecipe, removeRecipe } = useContext(RecipesContext);
  const [query, setQuery] = useState("");
  const [apiRecipes, setApiRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", cookTime: "", ingredients: "" });

  const scrollRef = useRef();
  const modalScrollRef = useRef(); // Reference for modal scrolling
  const [{ y }, set] = useSpring(() => ({ y: 0 }));

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  useLayoutEffect(() => {
    if (selectedRecipe) {
      const scrollY = window.scrollY || window.pageYOffset;
      setModalTop(`${scrollY + window.innerHeight / 2}px`);
    }
  }, [selectedRecipe]);
  

  const fetchRandomRecipes = async () => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=10`
      );
      const data = await response.json();
      setApiRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
    }
  };

  const searchRecipes = async () => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}`
      );
      const data = await response.json();
      setApiRecipes(data.results || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const [modalTop, setModalTop] = useState("50%");

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

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData({ name: "", cookTime: "", ingredients: "" });
    setShowModal(true);
  };

  const handleEditClick = (recipe) => {
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      cookTime: recipe.cookTime,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients,
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    const ingArray = formData.ingredients.split(",").map((i) => i.trim()).filter((i) => i);

    if (editingId) {
      updateRecipe(editingId, { name: formData.name, cookTime: formData.cookTime, ingredients: ingArray });
    } else {
      addRecipe({ name: formData.name, cookTime: formData.cookTime, ingredients: ingArray });
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    removeRecipe(id);
  };

  const bind = useGesture(
    {
      onDrag: ({ offset: [, my] }) => {
        set({ y: my });
      },
    },
    { drag: { axis: "y", rubberband: false } }
  );

  // Modal Scrolling
  const [{ my }, setModalScroll] = useSpring(() => ({ my: 0 }));

  const modalBind = useGesture(
    {
      onDrag: ({ offset: [, my] }) => {
        setModalScroll({ my });
      },
    },
    { drag: { axis: "y", rubberband: false } }
  );

  return (
    <div className="recipes-container">
      <animated.div ref={scrollRef} className="recipes-scrollable" {...bind()} style={{ transform: y.to((val) => `translateY(${val}px)`) }}>
      <h1 className="recipes-header">Recipes</h1>

      <div className="search-form">
        <input type="text" placeholder="Search for recipes..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={searchRecipes}>Search</button>
        <button className="add-recipe-button" onClick={handleAddNewClick}>+ Add Recipe</button>
      </div>

      
      <div className="recipes-section">
          {apiRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} draggable="false"/>
              <h3>{recipe.title}</h3>
              <button onClick={() => showRecipeDetails(recipe.id)}>View Recipe</button>
            </div>
          ))}
      </div>

      <h2 className="recipes-subheader">My Saved Recipes</h2>
      <div className="recipes-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <h3>{recipe.name}</h3>
              <p>Cook Time: {recipe.cookTime}</p>
              <p>Ingredients: {Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients}</p>
              <div className="card-buttons">
                <button onClick={() => handleEditClick(recipe)}>Edit</button>
                <button onClick={() => handleDelete(recipe.id)}>Delete</button>
              </div>
            </div>
          ))}
      </div>
      

      {selectedRecipe && (
          <div className="modal" onClick={closeRecipeDetails}>
              <animated.div 
                  ref={modalScrollRef} 
                  className="modal-content" 
                  {...modalBind()} 
                  onClick={(e) => e.stopPropagation()} 
              >
                  <h2>{selectedRecipe.title}</h2>
                  <img className="recipe-image-large" src={selectedRecipe.image} alt={selectedRecipe.title} />
                  <p><strong>Ingredients:</strong></p>
                  <ul>
                      {selectedRecipe.extendedIngredients?.map((ingredient, index) => (
                          <li key={index}>{ingredient.original}</li>
                      ))}
                  </ul>
                  <p><strong>Instructions:</strong></p>
                  <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
                  <button onClick={closeRecipeDetails}>Close</button>
              </animated.div>
          </div>
      )}


      </animated.div>
    </div>
  );
};

export default RecipesPage;

