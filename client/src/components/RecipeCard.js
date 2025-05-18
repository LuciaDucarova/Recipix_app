import React from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

function RecipeCard({ id, title, image, rating, isFavorite, onToggleFavorite }) {
  const navigate = useNavigate();

  return (
    <div
      className="recipe-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/recipe/${id}`)}
    >
      <div className="recipe-image-container">
        <img 
          src={image} 
          alt={title} 
          className="recipe-image"
          loading="lazy"
        />
      </div>
      <h2 className="recipe-title">{title}</h2>
      <div className="recipe-info">
        <span className="rating">
          {rating > 0 ? (
            <StarIcon style={{ color: '#f1c40f' }} />
          ) : (
            <StarBorderIcon />
          )}
          {rating || 'Bez hodnotenia'}
        </span>
        <span 
          className="favorite"
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          {isFavorite ? (
            <FavoriteIcon style={{ color: '#e74c3c' }} />
          ) : (
            <FavoriteBorderIcon />
          )}
        </span>
      </div>
    </div>
  );
}

export default RecipeCard;