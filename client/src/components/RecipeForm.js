import React, { useState } from 'react';
import IngredientModal from './IngredientModal';
import { useNavigate } from 'react-router-dom';

function RecipeForm({ onClose, onRecipeAdded }) {
    console.log("RecipeForm loaded", RecipeForm);

  // Stavy pre jednotlivé polia
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [preparationTime, setPreparationTime] = useState('');
  const [servings, setServings] = useState('');
  const [steps, setSteps] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validácia povinných polí
    if (
        !title.trim() || 
        ingredients.length === 0 || 
        !steps.trim() || 
        !image ||
        !servings ||
        !preparationTime
    ) {
      setError('Prosím, vyplňte všetky povinné polia.');
      return;
    }
    if (
        !Number.isInteger(Number(servings)) ||
        !Number.isInteger(Number(preparationTime))
      ) {
        setError('Počet porcií a čas prípravy musia byť celé čísla.');
        return;
      }

// Validácia dĺžky jedného kroku postupu
const stepsArr = steps.split('\n').map(s => s.trim()).filter(Boolean);
if (stepsArr.some(step => step.length > 120)) {
  setError('Každý krok postupu môže mať maximálne 120 znakov. Rozdeľ dlhé kroky na viac riadkov.');
  return;
}




    const formData = new FormData();
    formData.append('title', title);
    formData.append('steps', steps);
    formData.append('preparationTime', preparationTime ? Number(preparationTime) : '');
    formData.append('servings', servings ? Number(servings) : '');
    if (image) formData.append('image', image);
    formData.append('ingredients', JSON.stringify(ingredients));

    try {
      const res = await fetch('/recipes', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Chyba pri ukladaní');
      } else {
        if (onRecipeAdded) onRecipeAdded();
        navigate('/');
      }
    } catch (err) {
      setError('Chyba pri ukladaní');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
      <form id="recipeForm" onSubmit={handleSubmit} noValidate>
        <h2>Pridať recept</h2>
          {error && <div style={{ color: 'red' }}>{error}</div>}

          <label>
            Názov*:
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Fotka*:
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
              required
            />
          </label>

          <label>
            Ingrediencie*:
            <button type="button" onClick={() => setShowIngredientModal(true)} style={{ marginTop: 8 }}>+</button>
            <ul>
              {ingredients.map((ing, idx) => (
                <li key={idx}>{ing.name} {ing.quantity} {ing.unit}</li>
              ))}
            </ul>
          </label>

          {showIngredientModal && (
            <IngredientModal
            onSave={ing => setIngredients([...ingredients, ing])}
            onClose={() => setShowIngredientModal(false)}
            usedIngredients={ingredients.map(i => i.name)}
            />
          )}

          <label>
            Počet porcií*:
            <input
              type="number"
              value={servings}
              onChange={e => setServings(e.target.value)}
              min="1"
              step="1"
              required
              onWheel={e => e.target.blur()}
            />
          </label>

          <label>
            Čas prípravy (min)*:
            <input
              type="number"
              value={preparationTime}
              onChange={e => setPreparationTime(e.target.value)}
              min="1"
              step="1"
              required
              onWheel={e => e.target.blur()}
            />
          </label>

          <label>
            Postup*:
            <textarea
              value={steps}
              onChange={e => setSteps(e.target.value)}
              required
              placeholder="Každý krok napíš na nový riadok. (Stlač Enter po každom kroku)"
              maxLength={1000}
            />
            <small style={{ color: '#b00', fontWeight: 500 }}>
              Každý krok napíš na nový riadok. Jeden riadok = jeden krok. Dlhé kroky rozdeľ!
            </small>
          </label>
        </form>
        <div className="modal-footer">
        <button type="button" onClick={() => navigate('/')}>Zatvoriť</button>
        <button type="submit" form="recipeForm">Uložiť</button>
        </div>
      </div>
    </div>
  );
}

export default RecipeForm;