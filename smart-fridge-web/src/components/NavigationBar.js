import React from 'react';
import './NavigationBar.css'; 
import homeIcon from '../assets/home.png';
import alertIcon from '../assets/alert.png';
import listIcon from '../assets/list.png';
import recipeIcon from '../assets/recipe.png';
import settingsIcon from '../assets/settings.png';
import { useNavigate } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <div className="navigation-bar">
      <button onClick={() => navigate('/')} className="nav-button">
        <img src={homeIcon} alt="Home" className="nav-icon" /> 
      </button>
        <button onClick={() => navigate('/alerts')} className="nav-button">
        <img src={alertIcon} alt="Alert" className="nav-icon" />  
      </button>
      <button onClick={() => navigate('/shopping-list')} className="nav-button">
        <img src={listIcon} alt="List" className="nav-icon" />
      </button>
      <button onClick={() => navigate('/recipes')} className="nav-button">
      <img src={recipeIcon} alt="Recipe" className="nav-icon" /> 
      </button>
      <button onClick={() => navigate('/settings')} className="nav-button">
      <img src={settingsIcon} alt="Settings" className="nav-icon" />
      </button>
    </div>
  );
};

export default NavigationBar;
