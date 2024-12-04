import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AlertsPage from "./pages/AlertsPage";
import NavigationBar from "./components/NavigationBar";
import ShoppingListPage from "./pages/ShoppingListPage";
import RecipesPage from "./pages/RecipesPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/shopping-list" element={<ShoppingListPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <NavigationBar />
    </div>
  </Router>
  );
}

export default App;
