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

const DEFAULT_GROUP = [
  { id: 'g1', name: 'Tôi', allergies: [], active: true },
  { id: 'g2', name: 'Linh (Né tôm/mực)', allergies: ['Tôm', 'Mực'], active: false },
  { id: 'g3', name: 'Huy (Ăn thanh đạm/né bò)', allergies: ['Bò'], active: false }
];

export function useStorage() {
  const [foods, setFoods] = useState(() => {
    const safeFoods = getSafeItem('foods', seedData);
    const arr = Array.isArray(safeFoods) ? safeFoods : seedData;
    return arr.map(f => {
      // Find default seed for priceTier & mood if missing in saved storage
      const matchSeed = seedData.find(s => s.id === f.id || s.name === f.name);
      return {
        ...f,
        priceTier: f.priceTier || (matchSeed ? matchSeed.priceTier : 'standard'),
        mood: Array.isArray(f.mood) ? f.mood : (matchSeed ? matchSeed.mood : ['hot']),
        allergies: Array.isArray(f.allergies) ? f.allergies : (Array.isArray(f.allergens) ? f.allergens : []),
        allergens: Array.isArray(f.allergens) ? f.allergens : (Array.isArray(f.allergies) ? f.allergies : [])
      };
    });
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

  const [groupMembers, setGroupMembers] = useState(() => {
    const safe = getSafeItem('group_members', DEFAULT_GROUP);
    return Array.isArray(safe) ? safe : DEFAULT_GROUP;
  });

  useEffect(() => localStorage.setItem('foods', JSON.stringify(foods)), [foods]);
  useEffect(() => localStorage.setItem('history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('allergies', JSON.stringify(allergies)), [allergies]);
  useEffect(() => localStorage.setItem('user_profile', JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem('group_members', JSON.stringify(groupMembers)), [groupMembers]);

  const addFood = (food) => {
    const newFood = {
      ...food,
      id: Date.now().toString(),
      hidden: false,
      priceTier: food.priceTier || 'standard',
      mood: food.mood || ['hot'],
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

  const toggleGroupMember = (id) => {
    setGroupMembers(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const addGroupMember = (name, memberAllergies = []) => {
    const newMember = {
      id: Date.now().toString(),
      name,
      allergies: memberAllergies,
      active: true
    };
    setGroupMembers(prev => [...prev, newMember]);
  };

  const removeGroupMember = (id) => {
    setGroupMembers(prev => prev.filter(m => m.id !== id));
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
    updateProfile,
    groupMembers,
    setGroupMembers,
    toggleGroupMember,
    addGroupMember,
    removeGroupMember
  };
}
