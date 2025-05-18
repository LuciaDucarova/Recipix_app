import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const UNITS = ["g", "ml", "ks", "PL", "ČL"];

function IngredientModal({ onSave, onClose, usedIngredients = [] }) {
  const [allIngredients, setAllIngredients] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/ingredients')
      .then(res => res.json())
      .then(data => setAllIngredients(data));
  }, []);

  const handleSave = () => {
    if (!name) {
      setError('Vyber ingredienciu!');
      return;
    }
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setError('Zadaj množstvo väčšie ako 0!');
      return;
    }
    setError('');
    onSave({ name, quantity: parseFloat(quantity), unit });
    onClose();
  };


  const ingredientOptions = allIngredients.map(ing => ({
    value: ing.name,
    label: ing.name,
    isDisabled: usedIngredients.includes(ing.name)
  }));










  return (
    <div className="modal">
      <div className="ingredient-modal-content">
        <h3>Pridať ingredienciu</h3>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <label>
          Ingrediencia:
          <Select
    options={ingredientOptions}
    value={ingredientOptions.find(opt => opt.value === name) || null}
    onChange={option => setName(option ? option.value : '')}
    placeholder="Vyber ingredienciu..."
    isSearchable
    styles={{
      container: base => ({ ...base, width: '100%' }),
      menu: base => ({ ...base, width: '100%' }),
    }}
  />
        </label>
        <label>
          Množstvo (povinné):
          <input
            type="number"
            placeholder="Množstvo (povinné)"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min="0.01"
            step="any"
            style={{
              MozAppearance: 'textfield',
              appearance: 'textfield'
            }}
          />
        </label>
        <label>
          Jednotka:
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
        <div className="ingredient-modal-buttons">
          <button type="button" onClick={handleSave}>Pridať</button>
          <button type="button" onClick={onClose}>Zrušiť</button>
        </div>
      </div>
    </div>
  );
}

export default IngredientModal;