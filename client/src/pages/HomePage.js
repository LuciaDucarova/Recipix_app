import React, { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { getRecipes } from '../services/api';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const navigate = useNavigate();
  

  const refreshRecipes = () => {
    setLoading(true);
    getRecipes().then(data => {
      console.log(data); // <--  tento riadok na pomoc
      setRecipes(data);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching recipes:', error);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshRecipes();
  }, []);

  

  






  // Filtrovanie podľa názvu alebo ingrediencie
const filteredRecipes = recipes.filter(recipe => {
  if (showFavorites && !recipe.favorite) return false;
  if (!showSearch || !searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();

  const titleMatch = recipe.title.toLowerCase().includes(query);

  // Príprava zoznamu ingrediencií pre porovnanie
  const ingredientsList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map(ing =>
        typeof ing === 'string' ? ing : ing.name
      ).join(', ')
    : '';

  const ingredientMatch = ingredientsList.toLowerCase().includes(query);

  const ratingMatch = recipe.rating >= 0;

  return (titleMatch || ingredientMatch) && ratingMatch;
});


  

  // Klik na lupu
  const handleSearchIconClick = () => {
    setShowSearch(true);
    setSearchQuery("");
  };

  // Zrušenie vyhľadávania
  const handleCancelSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleToggleFavorite = async (id, currentFavorite) => {
    try {
      await fetch(`http://localhost:3000/recipes/${id}/favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !currentFavorite }),
      });
      setRecipes(recipes =>
        recipes.map(r =>
          r.id === id ? { ...r, favorite: !currentFavorite } : r
        )
      );
    } catch (error) {
      alert('Nepodarilo sa zmeniť obľúbenosť receptu.');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="container">
          <h1>Dashboard</h1>
          <div className="dashboard-icons">
            <FavoriteBorderIcon
              fontSize="large"
              style={{ cursor: 'pointer', color: showFavorites ? '#e74c3c' : undefined }}
              onClick={() => setShowFavorites(fav => !fav)}
            />
            <SearchIcon fontSize="large" style={{ cursor: 'pointer' }} onClick={handleSearchIconClick} />
            <AddCircleOutlineIcon
              fontSize="large"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/add-recipe')}
            />
          </div>
        </div>
      </div>
      {/* Vyhľadávacie pole */}
      {showSearch && (
        <div style={{ maxWidth: 400, margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            placeholder="Zadaj názov alebo ingredienciu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
            autoFocus
          />
          <button
            onClick={handleCancelSearch}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: '#888'
            }}
            aria-label="Zrušiť vyhľadávanie"
          >
            <CloseIcon />
          </button>
        </div>
      )}
      <div className="container">
        <div className="recipes-list">
          {loading ? (
            <div className="loading">
              <CircularProgress />
              <p>Načítavam recepty...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="loading">
              <p>Žiadne recepty na zobrazenie</p>
            </div>
          ) : (
            filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                image={`http://localhost:3000/${(recipe.imagePath || '').replace(/\\/g, '/')}`}
                rating={recipe.rating || 0}
                isFavorite={recipe.favorite || false}
                onToggleFavorite={() => handleToggleFavorite(recipe.id, recipe.favorite)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;