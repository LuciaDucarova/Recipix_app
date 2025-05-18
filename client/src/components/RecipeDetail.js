import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editNote, setEditNote] = useState('');
  const [editRating, setEditRating] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/recipes/${id}`)
      .then(res => res.json())
      .then(data => {
        setRecipe(data);
        setEditNote(data.notes || '');
        setEditRating(data.rating === null ? null : Number(data.rating));        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: editNote,
        rating: editRating
      })
    });
    // Po uložení načítaj znova detail
    const res = await fetch(`/recipes/${id}`);
    const data = await res.json();
    setRecipe(data);
    setSaving(false);
  };

  if (loading) return <div>Načítavam...</div>;
  if (!recipe) return <div>Recept nebol nájdený.</div>;




  const ratingOptions = [
    { value: null, label: 'Bez hodnotenia' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
  ];





  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 24 }}>
      <span
        onClick={() => navigate(-1)}
        style={{
          cursor: 'pointer',
          fontSize: '3.5rem',
          marginBottom: 16,
          display: 'inline-block',
          userSelect: 'none',
          lineHeight: 1,
          marginLeft: '8px'
        }}
        title="Späť"
      >
        ←
      </span>
      <h1>{recipe.title}</h1>
      <img src={`http://localhost:3000/${(recipe.imagePath || '').replace(/\\/g, '/')}`} alt={recipe.title} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} />
      <h3>Ingrediencie:</h3>
      <ul>
        {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
          <li key={idx}>{ing.name} {ing.quantity} {ing.unit}</li>
        ))}
      </ul>
      <h3>Postup:</h3>
      <p className="recipe-steps" style={{ whiteSpace: 'pre-line' }}>{recipe.steps}</p>
      <h3>Hodnotenie:</h3>
      <Select
  options={ratingOptions}
  value={ratingOptions.find(opt => opt.value === editRating) || ratingOptions[0]}
  onChange={option => setEditRating(option ? option.value : null)}
  placeholder="Vyber hodnotenie..."
  isClearable
  styles={{
    container: base => ({ ...base, width: '100%' }),
    menu: base => ({ ...base, width: '100%' }),
  }}
/>

      <h3>Poznámka:</h3>
      <textarea
        value={editNote}
        onChange={e => setEditNote(e.target.value)}
        rows={3}
        style={{ width: '100%' }}
        placeholder="Sem napíš poznámku..."
      />
      <button onClick={handleSave} disabled={saving} style={{ marginTop: 16 }}>
        {saving ? 'Ukladám...' : 'Uložiť'}
      </button>
    </div>
  );
}

export default RecipeDetail;
