import React, { useState, useEffect, useLayoutEffect, useContext, useRef } from "react";
import { RecipesContext } from "../context/RecipesContext";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import "./styles/RecipesPage.css";
import backgroundImg from "../assets/background.jpg";


const apiKey = "6dacd1bf57fc4f27be8752284f04b8cd";
//const apiKey = "c08f534cb986424b9ff1a361957362f2";

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

  const [modalTop, setModalTop] = useState("50%");

  //useEffect(() => {fetchRandomRecipes();}, []);

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
      const transformedRecipes = (data.recipes || []).map((recipe) => ({
        id : recipe.id,
        name: recipe.title,
        cookTime: recipe.readyInMinutes? `${recipe.readyInMinutes} minutes` : "",
        ingredients: recipe.extendedIngredients
          ?recipe.extendedIngredients.map((ing) => ing.original)
          :[],
          image: recipe.image || "",
          instructions: recipe.instructions || ""
      }));
      setApiRecipes(transformedRecipes);
      return transformedRecipes;
    } catch (error) {
      console.error("Error fetching random recipes:", error);
    }
  };
  const handleShowMoreAndStore = async() => {
    const recipes = await fetchRandomRecipes();
    for (const recipe of recipes){
      await addRecipe(recipe);
    }
  }


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

  const searchLocalRecipes = async () => {
    if(!query.trim()) return;
    try{
      const res = await fetch(
        `http://localhost:5001/recipes?search=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setApiRecipes(data);
    }catch(err){
      console.error("Error searching local recipes:", err);
    }
  
  }



  

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


  const viewSavedRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  


  const closeRecipeDetails = () => {
    setSelectedRecipe(null);
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData({ name: "", cookTime: "", ingredients: "", image: "", instructions: "" });
    setShowModal(true);
  };



  const handleEditClick = (recipe) => {
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      cookTime: recipe.cookTime,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients,
      image: recipe.image || "",
      instructions: recipe.instructions || ""
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
    <div className="recipes-container" style={{ backgroundImage: `url(${backgroundImg})` }}>

      {selectedRecipe && (
          <div className="modal" onClick={closeRecipeDetails}>
              <animated.div 
                  ref={modalScrollRef} 
                  className="modal-content" 
                  {...modalBind()} 
                  onClick={(e) => e.stopPropagation()} 
              >
                  <h2>{selectedRecipe.title}</h2>
                  <img className="recipe-image-large" src={selectedRecipe.image} alt={selectedRecipe.title} draggable="false"/>
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
      
      <animated.div ref={scrollRef} className="recipes-scrollable" {...bind()} style={{ transform: y.to((val) => `translateY(${val}px)`) }}>
      <h1 className="recipes-header">Recipes</h1>

      <div className="search-form">
        <input type="text" placeholder="Search for recipes..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={searchRecipes}>Search</button>
        <button className="show-more-button" onClick={handleShowMoreAndStore}>Show More Recipe</button>
        <button className="add-recipe-button" onClick={handleAddNewClick}>+ Add Recipe</button>
        <button onClick={searchLocalRecipes}>Search Local</button>
      </div>

      <div className="recipes-section">
          {apiRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} draggable="false"/>
              <h3>{recipe.name || recipe.title}</h3>
              <button onClick={() => showRecipeDetails(recipe.id)}>View Recipe</button>
            </div>
          ))}
      </div>



      <h2 className="recipes-subheader">My Saved Recipes</h2>
      <div className="recipes-section">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card small-card">
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.name} draggable="false"/>
              ): (
                <div className="placeholder-iamge">No Image</div>
              )}
              <h3>{recipe.name}</h3>
              <button onClick={() => viewSavedRecipe(recipe)}>View Recipe</button>
            </div>
          ))}
      </div>

      


      </animated.div>
    </div>
  );
};

export default RecipesPage;

