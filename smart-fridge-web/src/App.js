import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import ItemsPage from "./pages/ItemsPage";
import AlertsPage from './pages/AlertsPage';
import ShoppingListPage from './pages/ShoppingListPage';
import RecipesPage from './pages/RecipesPage';
import SettingsPage from './pages/SettingsPage';
import NavigationBar from './components/NavigationBar';

import { ShoppingListProvider } from './context/ShoppingListContext';
import { AlertsProvider } from './context/AlertsContext';
import { RecipesProvider } from './context/RecipesContext';
import { ItemsProvider } from "./context/ItemsContext";

function App() {
  return (
    <ShoppingListProvider>
      <AlertsProvider>
        <RecipesProvider>
          <ItemsProvider>
            <Router>
              {/* Navigation bar at the top */}
              <NavigationBar />

              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/shopping-list" element={<ShoppingListPage />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Router>
          </ItemsProvider>
        </RecipesProvider>
      </AlertsProvider>
    </ShoppingListProvider>
  );
}

export default App;
