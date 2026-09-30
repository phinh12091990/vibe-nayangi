import { useState, useEffect } from 'react';
import { seedData } from '../data/seedData';

function getSafeItem(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null ? parsed : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
}

const DEFAULT_PROFILE = {
  name: 'Dân Văn Phòng',
  height: 168,
  weight: 62,
  gender: 'Nam',
  goal: 'Cân bằng', // 'Giảm cân' | 'Tăng cơ' | 'Cân bằng' | 'Thanh lọc'
  activity: 'Văn phòng (Ít vận động)'
};

export function calculateBMI(weight, height) {
  const hM = height / 100;
  if (!hM || hM <= 0) return { bmi: 22, status: 'Chuẩn cân đối', color: '#10b981' };
  const val = Number((weight / (hM * hM)).toFixed(1));
  if (val < 18.5) return { bmi: val, status: 'Hơi gầy', color: '#38bdf8' };
  if (val < 23) return { bmi: val, status: 'Chuẩn cân đối', color: '#10b981' };
  if (val < 25) return { bmi: val, status: 'Tiền thừa cân', color: '#f59e0b' };
  return { bmi: val, status: 'Thừa cân / Cần kiểm soát', color: '#ef4444' };
}

export function useStorage() {
  const [foods, setFoods] = useState(() => {
    const safeFoods = getSafeItem('foods', seedData);
    const arr = Array.isArray(safeFoods) ? safeFoods : seedData;
    return arr.map(f => ({
      ...f,
      allergies: Array.isArray(f.allergies) ? f.allergies : (Array.isArray(f.allergens) ? f.allergens : []),
      allergens: Array.isArray(f.allergens) ? f.allergens : (Array.isArray(f.allergies) ? f.allergies : [])
    }));
  });

  const [history, setHistory] = useState(() => {
    const safe = getSafeItem('history', []);
    return Array.isArray(safe) ? safe : [];
  });

  const [allergies, setAllergies] = useState(() => {
    const safe = getSafeItem('allergies', []);
    return Array.isArray(safe) ? safe : [];
  });

  const [profile, setProfile] = useState(() => {
    const safe = getSafeItem('user_profile', DEFAULT_PROFILE);
    return { ...DEFAULT_PROFILE, ...safe };
  });

  useEffect(() => localStorage.setItem('foods', JSON.stringify(foods)), [foods]);
  useEffect(() => localStorage.setItem('history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('allergies', JSON.stringify(allergies)), [allergies]);
  useEffect(() => localStorage.setItem('user_profile', JSON.stringify(profile)), [profile]);

  const addFood = (food) => {
    const newFood = {
      ...food,
      id: Date.now().toString(),
      hidden: false,
      allergies: food.allergies || [],
      allergens: food.allergies || [],
      categories: food.categories || ['Trưa', 'Tối'],
      nutrition: food.nutrition || 'Thịt đỏ',
      emoji: food.emoji || '🍲'
    };
    setFoods(prev => [newFood, ...prev]);
  };

  const updateFood = (id, updatedData) => {
    setFoods(prev => prev.map(f => {
      if (f.id !== id) return f;
      const combined = { ...f, ...updatedData };
      combined.allergens = combined.allergies;
      return combined;
    }));
  };

  const deleteFood = (id) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  const resetFoods = () => {
    setFoods(seedData);
  };

  const toggleFoodStatus = (id) => {
    setFoods(prev => prev.map(f => f.id === id ? { ...f, hidden: !f.hidden } : f));
  };
  
  const addHistory = (foodId, mealType) => {
    setHistory(prev => [...prev, { id: Date.now().toString(), foodId, timestamp: Date.now(), mealType }]);
  };

  const deleteHistoryItem = (timestampOrId) => {
    setHistory(prev => prev.filter(h => (h.id ? h.id !== timestampOrId : h.timestamp !== timestampOrId)));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleAllergy = (allergy) => {
    setAllergies(prev => prev.includes(allergy) 
      ? prev.filter(a => a !== allergy) 
      : [...prev, allergy]);
  };

  const updateProfile = (data) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  return { 
    foods, 
    setFoods, 
    addFood, 
    updateFood,
    deleteFood,
    resetFoods,
    toggleFoodStatus, 
    history, 
    addHistory, 
    deleteHistoryItem,
    clearHistory,
    allergies, 
    toggleAllergy,
    profile,
    updateProfile
  };
}
