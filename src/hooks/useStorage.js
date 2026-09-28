import { useState, useEffect } from 'react';
import { seedData } from '../data/seedData';

function getSafeArray(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
}

export function useStorage() {
  const [foods, setFoods] = useState(() => {
    const safeFoods = getSafeArray('foods', seedData);
    return safeFoods.map(f => ({
      ...f,
      allergies: Array.isArray(f.allergies) ? f.allergies : (Array.isArray(f.allergens) ? f.allergens : []),
      allergens: Array.isArray(f.allergens) ? f.allergens : (Array.isArray(f.allergies) ? f.allergies : [])
    }));
  });
  const [history, setHistory] = useState(() => getSafeArray('history', []));
  const [allergies, setAllergies] = useState(() => getSafeArray('allergies', []));

  useEffect(() => localStorage.setItem('foods', JSON.stringify(foods)), [foods]);
  useEffect(() => localStorage.setItem('history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('allergies', JSON.stringify(allergies)), [allergies]);

  const addFood = (food) => setFoods([...foods, { ...food, id: Date.now().toString() }]);
  const toggleFoodStatus = (id) => setFoods(foods.map(f => f.id === id ? { ...f, hidden: !f.hidden } : f));
  
  const addHistory = (foodId, mealType) => {
    setHistory([...history, { foodId, timestamp: Date.now(), mealType }]);
  };

  const toggleAllergy = (allergy) => {
    setAllergies(prev => prev.includes(allergy) 
      ? prev.filter(a => a !== allergy) 
      : [...prev, allergy]);
  };

  return { foods, setFoods, addFood, toggleFoodStatus, history, addHistory, allergies, toggleAllergy };
}
