import React, { useState, useLayoutEffect, useContext, useRef } from "react"
import { RecipesContext } from "../context/RecipesContext"
import { useSpring, animated } from "@react-spring/web"
import { useGesture } from "@use-gesture/react"
import "./styles/RecipesPage.css"
import backgroundImg from "../assets/background.jpg"

const apiKey = "6dacd1bf57fc4f27be8752284f04b8cd"

const RecipesPage = () => {
  const { recipes, addRecipe, updateRecipe, removeRecipe } = useContext(RecipesContext)
  const [query, setQuery] = useState("")
  const [apiRecipes, setApiRecipes] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    readyInMinutes: "",
    ingredients: "",
    image: "",
    instructions: ""
  })

  const scrollRef = useRef()
  const modalScrollRef = useRef()
  const [{ y }, set] = useSpring(() => ({ y: 0 }))
  const [{ my }, setModalScroll] = useSpring(() => ({ my: 0 }))

  useLayoutEffect(() => {
    if (selectedRecipe) {
      const scrollY = window.scrollY || window.pageYOffset
      modalScrollRef.current.style.top = `${scrollY + window.innerHeight / 2}px`
    }
  }, [selectedRecipe])

  const fetchRandomRecipes = async () => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=10`
      )
      const data = await response.json()
      const transformedRecipes = (data.recipes || []).map(recipe => ({
        id: recipe.id,
        name: recipe.title,
        readyInMinutes: recipe.readyInMinutes || 0,
        ingredients: recipe.extendedIngredients ? recipe.extendedIngredients.map(i => i.original) : [],
        image: recipe.image || "",
        instructions: recipe.instructions || ""
      }))
      setApiRecipes(transformedRecipes)
      return transformedRecipes
    } catch {
      return []
    }
  }

  const handleShowMoreAndStore = async () => {
    const newRecipes = await fetchRandomRecipes()
    for (const recipe of newRecipes) await addRecipe(recipe)
  }

  const searchRecipes = async () => {
    if (!query.trim()) return
    try {
      const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}&addRecipeInformation=true`
      const response = await fetch(url)
      const data = await response.json()
      const transformed = (data.results || []).map(r => ({
        id: r.id,
        name: r.title,
        readyInMinutes: r.readyInMinutes || 0,
        ingredients: r.extendedIngredients ? r.extendedIngredients.map(i => i.original) : [],
        image: r.image || "",
        instructions: r.instructions || ""
      }))
      setApiRecipes(transformed)
    } catch {}
  }

  const searchLocalRecipes = async () => {
    if (!query.trim()) return
    try {
      const res = await fetch(`http://localhost:5001/recipes?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setApiRecipes(data)
    } catch {}
  }

  const showRecipeDetails = async id => {
    try {
      const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()
      setSelectedRecipe(data)
    } catch {}
  }

  const viewSavedRecipe = recipe => setSelectedRecipe(recipe)
  const closeRecipeDetails = () => setSelectedRecipe(null)

  const handleAddNewClick = () => {
    setEditingId(null)
    setFormData({
      name: "",
      readyInMinutes: "",
      ingredients: "",
      image: "",
      instructions: ""
    })
    setShowModal(true)
  }

  const handleEditClick = recipe => {
    setEditingId(recipe.id)
    setFormData({
      name: recipe.name,
      readyInMinutes: recipe.readyInMinutes,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients,
      image: recipe.image || "",
      instructions: recipe.instructions || ""
    })
    setShowModal(true)
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Recipe name cannot be empty.")
      return;

    }
    const ingArray = formData.ingredients.split(",").map(i => i.trim()).filter(i => i)
    const payload = {
      name: formData.name,
      readyInMinutes: Number(formData.readyInMinutes) || 0,
      ingredients: ingArray,
      image: formData.image,
      instructions: formData.instructions
    };
    if(!editingId){
      addRecipe(payload);
    }else{
      updateRecipe(editingId, payload);
    }
    setShowModal(false)
  }



  const handleClearSearch = () => {
    setApiRecipes([]);
    setQuery("");
  }

  

  const handleDelete = id => removeRecipe(id)

  const bind = useGesture(
    {
      onDrag: ({ offset: [, myOffset] }) => set({ y: myOffset })
    },
    { drag: { axis: "y", rubberband: false } }
  )

  const modalBind = useGesture(
    {
      onDrag: ({ offset: [, myOffset] }) => setModalScroll({ my: myOffset })
    },
    { drag: { axis: "y", rubberband: false } }
  )

  return (
    <div className="recipes-container" style={{ backgroundImage: `url(${backgroundImg})` }}>
      {selectedRecipe && (
        <div className="modal" onClick={closeRecipeDetails}>
          <animated.div
            ref={modalScrollRef}
            className="modal-content"
            {...modalBind()}
            onClick={e => e.stopPropagation()}
          >
            <h2>{selectedRecipe.title || selectedRecipe.name}</h2>
            {selectedRecipe.image && (
              <img className="recipe-image-large" src={selectedRecipe.image} alt={selectedRecipe.title || selectedRecipe.name} draggable="false" />
            )}
            <p><strong>Ingredients:</strong></p>
            <ul>
              {Array.isArray(selectedRecipe.extendedIngredients)
                ? selectedRecipe.extendedIngredients.map((i, idx) => <li key={idx}>{i.original}</li>)
                : Array.isArray(selectedRecipe.ingredients) && selectedRecipe.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
            {selectedRecipe.readyInMinutes && (
              <p className="cook-time"><strong>Ready in:</strong> {selectedRecipe.readyInMinutes} minutes</p>
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
          <input type="text" placeholder="Search for recipes..." value={query} onChange={e => setQuery(e.target.value)} />
          <div className="search-buttons">
          <button onClick={searchRecipes}>Search Remote</button>
          <button onClick={searchLocalRecipes}>Search Local</button>
          <button onClick={handleClearSearch}>Clear Results</button> 
          <button className="show-more-button" onClick={handleShowMoreAndStore}>Discover New Recipes</button>
          <button className="add-recipe-button" onClick={handleAddNewClick}>+ Add Recipe</button>
          </div>
        </div>

        

        <div className="recipes-section">
          {apiRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              {recipe.image && <img src={recipe.image} alt={recipe.name || recipe.title} draggable="false" />}
              <h3>{recipe.name || recipe.title}</h3>
              {recipe.readyInMinutes > 0 && (
                <p className="cook-time"><strong>Ready in:</strong> {recipe.readyInMinutes} minutes</p>
              )}
              <button onClick={() => showRecipeDetails(recipe.id)}>View Recipe</button>
            </div>
          ))}
        </div>

        <h2 className="recipes-subheader">All Recipes</h2>
        <div className="recipes-section">
          {recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card small-card">
              {recipe.image ? <img src={recipe.image} alt={recipe.name} draggable="false" /> : <div className="placeholder-iamge">No Image</div>}
              <h3>{recipe.name}</h3>
              {recipe.readyInMinutes > 0 && (
                <p className="cook-time"><strong>Ready in:</strong> {recipe.readyInMinutes} minutes</p>
              )}
              <button onClick={() => viewSavedRecipe(recipe)}>View Recipe</button>
            </div>
          ))}
        </div>
      </animated.div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? "Edit Recipe" : "Add Recipe"}</h2>
            <label>
              Name:
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
            </label>
            <label>
              Ready in Minutes:
              <input type="number" name="readyInMinutes" value={formData.readyInMinutes} onChange={handleInputChange} />
            </label>
            <label>
              Ingredients (comma-separated):
              <textarea name="ingredients" value={formData.ingredients} onChange={handleInputChange} />
            </label>
            <label>
              Image URL:
              <input type="text" name="image" value={formData.image} onChange={handleInputChange} />
            </label>
            <label>
              Instructions:
              <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} />
            </label>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSubmit}>{editingId ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipesPage
