import { useState, useEffect, createContext, useContext, createElement } from 'react';
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

const DEFAULT_ACCOUNTS = [
  {
    id: 'acc_default',
    name: 'Dân Văn Phòng',
    username: 'danvanphong',
    email: 'vanphong@nayangi.vn',
    password: '',
    avatar: '🧑‍💻',
    age: 26,
    gender: 'Nam',
    height: 168,
    weight: 62,
    activity: 'Văn phòng (Ít vận động)',
    goal: 'Cân bằng', // 'Giảm cân' | 'Tăng cơ' | 'Cân bằng' | 'Thanh lọc'
    allergies: [],
    createdAt: 1710000000000
  }
];

export function calculateBMI(weight, height) {
  const hM = Number(height) / 100;
  const w = Number(weight);
  if (!hM || hM <= 0 || !w || w <= 0) return { bmi: 22, status: 'Chuẩn cân đối', color: '#10b981' };
  const val = Number((w / (hM * hM)).toFixed(1));
  if (val < 18.5) return { bmi: val, status: 'Hơi gầy', color: '#38bdf8' };
  if (val < 23) return { bmi: val, status: 'Chuẩn cân đối', color: '#10b981' };
  if (val < 25) return { bmi: val, status: 'Tiền thừa cân', color: '#f59e0b' };
  return { bmi: val, status: 'Thừa cân / Cần kiểm soát', color: '#ef4444' };
}

export function calculateTDEE(weight, height, age = 26, gender = 'Nam', activity = 'Văn phòng (Ít vận động)') {
  const w = Number(weight) || 60;
  const h = Number(height) || 165;
  const a = Number(age) || 26;
  const isMale = gender === 'Nam';
  // Mifflin-St Jeor formula
  const bmr = 10 * w + 6.25 * h - 5 * a + (isMale ? 5 : -161);
  let multiplier = 1.2;
  if (typeof activity === 'string') {
    if (activity.includes('nhiều') || activity.includes('Gym')) multiplier = 1.725;
    else if (activity.includes('vừa') || activity.includes('thao')) multiplier = 1.55;
    else if (activity.includes('nhẹ') || activity.includes('bộ')) multiplier = 1.375;
    else multiplier = 1.2;
  }
  return Math.round(bmr * multiplier);
}

const DEFAULT_GROUP = [
  { id: 'g1', name: 'Tôi', allergies: [], active: true },
  { id: 'g2', name: 'Linh (Né tôm/mực)', allergies: ['Tôm', 'Mực'], active: false },
  { id: 'g3', name: 'Huy (Ăn thanh đạm/né bò)', allergies: ['Bò'], active: false }
];

const ADMIN_ACCOUNT = {
  id: 'acc_admin',
  name: 'Quản Trị Viên',
  username: 'admin',
  email: 'admin@nayangi.vn',
  password: 'admin',
  role: 'admin',
  avatar: '👑',
  age: 30,
  gender: 'Nam',
  height: 172,
  weight: 68,
  activity: 'Văn phòng (Ít vận động)',
  goal: 'Cân bằng',
  allergies: [],
  createdAt: 1710000000000
};

function useStorageManager() {
  // 1. ACCOUNTS & USER PROFILE (Enforce registration before entering the app)
  const [accounts, setAccounts] = useState(() => {
    const saved = getSafeItem('nayangi_accounts', null);
    let userAccounts = [];
    if (Array.isArray(saved)) {
      // Filter out stale mock acc_default
      userAccounts = saved.filter(a => a && a.id && a.id !== 'acc_default');
    }
    // Always guarantee admin account exists with username: 'admin' and password: 'admin'
    const hasAdmin = userAccounts.some(a => a.id === 'acc_admin' || a.username === 'admin');
    if (!hasAdmin) {
      userAccounts = [ADMIN_ACCOUNT, ...userAccounts];
    } else {
      userAccounts = userAccounts.map(a => 
        (a.id === 'acc_admin' || a.username === 'admin') 
          ? { ...a, id: 'acc_admin', name: a.name || 'Quản Trị Viên', username: 'admin', password: 'admin', role: 'admin', avatar: a.avatar || '👑' } 
          : a
      );
    }
    return userAccounts;
  });

  const [currentAccountId, setCurrentAccountId] = useState(() => {
    const savedId = getSafeItem('nayangi_current_account_id', null);
    if (savedId === 'acc_default') return null;
    return savedId || null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nayangi_theme') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('nayangi_theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Language State: 'vi' | 'en'
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('nayangi_lang') || 'vi';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('nayangi_lang', newLang);
  };

  const toggleLang = () => {
    setLangState(prev => {
      const next = prev === 'vi' ? 'en' : 'vi';
      localStorage.setItem('nayangi_lang', next);
      return next;
    });
  };

  const currentAccount = accounts.find(a => a.id === currentAccountId) || null;
  const isLoggedIn = Boolean(currentAccount);
  const isAdmin = Boolean(currentAccount && (currentAccount.role === 'admin' || currentAccount.username === 'admin'));

  const profile = currentAccount ? {
    id: currentAccount.id,
    name: currentAccount.name || 'Người Dùng',
    username: currentAccount.username || 'user',
    email: currentAccount.email || '',
    password: currentAccount.password || '',
    role: isAdmin ? 'admin' : (currentAccount.role || 'user'),
    avatar: currentAccount.avatar || (isAdmin ? '👑' : '🧑‍💻'),
    age: currentAccount.age || 26,
    gender: currentAccount.gender || 'Nam',
    height: Number(currentAccount.height) || 168,
    weight: Number(currentAccount.weight) || 62,
    activity: currentAccount.activity || 'Văn phòng (Ít vận động)',
    goal: currentAccount.goal || 'Cân bằng',
    allergies: Array.isArray(currentAccount.allergies) ? currentAccount.allergies : []
  } : {
    id: '',
    name: 'Khách',
    username: 'guest',
    avatar: '👤',
    role: 'user',
    age: 25,
    gender: 'Nam',
    height: 168,
    weight: 60,
    activity: 'Văn phòng (Ít vận động)',
    goal: 'Cân bằng',
    allergies: []
  };

  const [foods, setFoods] = useState(() => {
    const safeFoods = getSafeItem('foods', seedData);
    const arr = Array.isArray(safeFoods) ? safeFoods : seedData;
    return arr.map(f => {
      const matchSeed = seedData.find(s => s.id === f.id || s.name === f.name);
      return {
        ...f,
        image: f.image || (matchSeed ? matchSeed.image : null),
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
    if (currentAccount && Array.isArray(currentAccount.allergies) && currentAccount.allergies.length > 0) {
      return currentAccount.allergies;
    }
    const safe = getSafeItem('allergies', []);
    return Array.isArray(safe) ? safe : [];
  });

  const [groupMembers, setGroupMembers] = useState(() => {
    const safe = getSafeItem('group_members', DEFAULT_GROUP);
    return Array.isArray(safe) ? safe : DEFAULT_GROUP;
  });

  useEffect(() => localStorage.setItem('nayangi_accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('nayangi_current_account_id', JSON.stringify(currentAccountId)), [currentAccountId]);
  useEffect(() => localStorage.setItem('user_profile', JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem('foods', JSON.stringify(foods)), [foods]);
  useEffect(() => localStorage.setItem('history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('allergies', JSON.stringify(allergies)), [allergies]);
  useEffect(() => localStorage.setItem('group_members', JSON.stringify(groupMembers)), [groupMembers]);

  const addFood = (food) => {
    const newFood = {
      ...food,
      id: Date.now().toString(),
      hidden: false,
      image: food.image || null,
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
    setAllergies(prev => {
      const next = prev.includes(allergy) 
        ? prev.filter(a => a !== allergy) 
        : [...prev, allergy];
      // Sync into current account
      setAccounts(curr => curr.map(a => a.id === currentAccountId ? { ...a, allergies: next } : a));
      return next;
    });
  };

  const updateAccount = (accountId, updatedData) => {
    setAccounts(prev => prev.map(a => {
      if (a.id !== accountId) return a;
      return {
        ...a,
        ...updatedData,
        height: updatedData.height !== undefined ? Number(updatedData.height) : a.height,
        weight: updatedData.weight !== undefined ? Number(updatedData.weight) : a.weight,
        age: updatedData.age !== undefined ? Number(updatedData.age) : a.age
      };
    }));
  };

  const updateProfile = (data) => {
    updateAccount(currentAccountId, data);
  };

  const createAccount = (accountData) => {
    const rawUsername = (accountData.username || '').trim().toLowerCase().replace(/\s+/g, '_');
    const username = rawUsername || `user_${Date.now().toString().slice(-4)}`;

    if (username === 'admin') {
      throw new Error("Tên đăng nhập 'admin' là tài khoản Quản trị viên mặc định.");
    }
    const isExisted = accounts.some(a => (a.username || '').toLowerCase() === username);
    if (isExisted) {
      throw new Error(`Tên đăng nhập "${username}" đã có người sử dụng. Vui lòng chọn tên khác.`);
    }

    const pwd = (accountData.password || '').trim();
    if (!pwd || pwd.length < 4) {
      throw new Error('Mật khẩu bảo mật phải có ít nhất 4 ký tự.');
    }

    const newId = 'acc_' + Date.now();
    const newAccount = {
      id: newId,
      name: accountData.name ? accountData.name.trim() : 'Người Dùng Mới',
      username: username,
      email: accountData.email ? accountData.email.trim() : '',
      password: pwd,
      role: 'user', // New registrations are always standard users
      avatar: accountData.avatar || (accountData.gender === 'Nữ' ? '👩‍💻' : '🧑‍💻'),
      age: Number(accountData.age) || 26,
      gender: accountData.gender || 'Nam',
      height: Number(accountData.height) || 168,
      weight: Number(accountData.weight) || 60,
      activity: accountData.activity || 'Văn phòng (Ít vận động)',
      goal: accountData.goal || 'Cân bằng',
      allergies: Array.isArray(accountData.allergies) ? accountData.allergies : [],
      createdAt: Date.now()
    };

    setAccounts(prev => [...prev, newAccount]);
    setCurrentAccountId(newId);
    setAllergies(newAccount.allergies);
    return newAccount;
  };

  const switchAccount = (accountId) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      setCurrentAccountId(accountId);
      setAllergies(Array.isArray(acc.allergies) ? acc.allergies : []);
    }
  };

  const deleteAccount = (accountId) => {
    if (accounts.length <= 1) return false;
    // Don't allow deleting master admin account
    if (accountId === 'acc_admin') return false;
    const remaining = accounts.filter(a => a.id !== accountId);
    setAccounts(remaining);
    if (currentAccountId === accountId) {
      const nextAcc = remaining[0];
      setCurrentAccountId(nextAcc.id);
      setAllergies(Array.isArray(nextAcc.allergies) ? nextAcc.allergies : []);
    }
    return true;
  };

  const login = (accountId) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      setCurrentAccountId(acc.id);
      setAllergies(Array.isArray(acc.allergies) ? acc.allergies : []);
      return true;
    }
    return false;
  };

  const loginWithCredentials = (usernameOrEmail, password = '') => {
    const term = (usernameOrEmail || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    if (!term) {
      return { success: false, message: 'Vui lòng nhập Tên đăng nhập (Username).' };
    }
    if (!pwd) {
      return { success: false, message: 'Vui lòng nhập Mật khẩu bảo mật để đăng nhập.' };
    }

    const found = accounts.find(a => 
      (a.username || '').toLowerCase() === term || 
      (a.name || '').toLowerCase() === term ||
      (a.email || '').toLowerCase() === term
    );

    if (!found) {
      return { success: false, message: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại Tên đăng nhập hoặc đăng ký tài khoản mới.' };
    }

    // Strict password verification (admin: admin, users: their registered password)
    const expectedPassword = (found.username === 'admin' || found.role === 'admin') ? 'admin' : (found.password || '');
    if (expectedPassword !== pwd) {
      return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.' };
    }

    setCurrentAccountId(found.id);
    setAllergies(Array.isArray(found.allergies) ? found.allergies : []);
    return { success: true, account: found };
  };

  const logout = () => {
    setCurrentAccountId(null);
    localStorage.removeItem('nayangi_current_account_id');
  };

  const createDemoAccount = () => {
    return createAccount({
      name: 'Dân Văn Phòng',
      username: 'danvanphong',
      email: 'vanphong@nayangi.vn',
      password: 'demo_password',
      avatar: '🧑‍💻',
      age: 26,
      gender: 'Nam',
      height: 168,
      weight: 62,
      activity: 'Văn phòng (Ít vận động)',
      goal: 'Cân bằng',
      allergies: []
    });
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
    accounts,
    currentAccountId,
    currentAccount,
    isLoggedIn,
    isAdmin,
    login,
    loginWithCredentials,
    logout,
    createAccount,
    createDemoAccount,
    switchAccount,
    updateAccount,
    deleteAccount,
    groupMembers,
    setGroupMembers,
    toggleGroupMember,
    addGroupMember,
    removeGroupMember,
    theme,
    setTheme,
    toggleTheme,
    lang,
    setLang,
    toggleLang
  };
}

const StorageContext = createContext(null);

export function StorageProvider({ children }) {
  const storage = useStorageManager();
  return createElement(StorageContext.Provider, { value: storage }, children);
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}

