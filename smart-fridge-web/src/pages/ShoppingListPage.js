import React, { useState, useContext, useRef } from "react";
import { ShoppingListContext } from "../context/ShoppingListContext";
import "./styles/ShoppingListPage.css";
import backgroundImg from "../assets/background.jpg";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";

const ShoppingListPage = () => {
  const { shoppingListItems, addItem, updateItem, removeItem } = useContext(ShoppingListContext);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", quantity: "" });
  const [autoAdd, setAutoAdd] = useState(false);

  const openModal = (item = null) => {
    setFormData(item ? item : { id: null, name: "", quantity: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ id: null, name: "", quantity: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addOrUpdateItem = async () => {
    if (!formData.name.trim()) return;
  
    if (formData.id) {
      await updateItem(formData.id, { ...formData });
    } else {
      const newItem = { ...formData, checked: false };
      await addItem(newItem);
    }
  
    closeModal();
  };
  



  const toggleItemChecked = (id) => {
    const item = shoppingListItems.find((item) => item.id === id);
    if (item) {
      updateItem(id, { ...item, checked: !item.checked });
    }
  };

  const toggleAutoAdd = () => {
    setAutoAdd((prev) => !prev);
  };

  const deleteCheckedItem = () =>{
    shoppingListItems.forEach(element => {
      if(element.checked){
        removeItem(element.id);
      }
      
    });
  }

  

  const placeOrder = () => {
    alert("Order placed!");
  };

  //additions for scrolling
    const scrollRef = useRef();
    const modalScrollRef = useRef();
    const [{ y }, set] = useSpring(() => ({ y: 0 }));
  
    const bind = useGesture(
        {
          onDrag: ({ offset: [, my] }) => {
            set({ y: my });
          },
        },
        { drag: { axis: "y", rubberband: false } }
    );


  return (
    <div className="shopping-list-page" style={{ backgroundImage: `url(${backgroundImg})` }}>


      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{formData.id ? "Edit Item" : "Add Item"}</h2>
            <label>
              Item Name:
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
            </label>
            <label>
              Quantity:
              <input type="text" name="quantity" value={formData.quantity} onChange={handleInputChange} />
            </label>
            <div className="modal-buttons">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={addOrUpdateItem}>{formData.id ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}


      <animated.div ref={scrollRef} className="recipes-scrollable" {...bind()} style={{ transform: y.to((val) => `translateY(${val}px)`) }}>
      <h1 className="shopping-list-title">Shopping List</h1>
      <ul className="shopping-list">
        {shoppingListItems.map((item) => (
          <li key={item.id} className="shopping-list-item">
            <input type="checkbox" checked={item.checked || false} onChange={() => toggleItemChecked(item.id)} />
            <span className="shopping-list-name" onClick={() => openModal(item)} style={{ cursor: "pointer" }}>
              {item.name}
            </span>
            <span className="shopping-list-quantity">({item.quantity})</span>
            <button className="delete-button" onClick={() => removeItem(item.id)}>x</button>
          </li>
        ))}
      </ul>

      <button className="add-item-button" onClick={() => openModal()}>+ Add Item</button>
      <button className="add-item-button" onClick={() => deleteCheckedItem()}>Delete Checked</button>
      
      </animated.div>

      <button className="auto-add-button" onClick={toggleAutoAdd}>{autoAdd ? "Auto-Add Enabled" : "Auto-Add Disabled"}</button>
    </div>
  );
};

export default ShoppingListPage;
