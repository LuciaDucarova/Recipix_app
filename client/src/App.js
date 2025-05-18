import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RecipeDetail from './components/RecipeDetail'; // pridaj tento import
import RecipeForm from './components/RecipeForm'; // už máš
import './App.css'; // <-- tento riadok je dôležitý!

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-recipe" element={<RecipeForm />} /> {/* NOVÁ ROUTA */}
        <Route path="/recipe/:id" element={<RecipeDetail />} /> {/* pridaj túto routu */}
        <Route path="*" element={<div>404 - Not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;