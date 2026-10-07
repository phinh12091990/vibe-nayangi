import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage, calculateBMI, calculateTDEE } from '../hooks/useStorage';
import { translations } from '../utils/i18n';
import { spin } from '../utils/logicEngine';
import { soundFx } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import GroupModal from '../components/GroupModal';
import FoodMedia from '../components/FoodMedia';
import { 
  RefreshCw, Check, Sparkles, Volume2, VolumeX, AlertTriangle, 
  Flame, ShieldAlert, Award, Activity, Clock, 
  Users, ExternalLink, Share2, MapPin,
  Smartphone, Keyboard, ChevronRight, ChevronLeft, UserPlus,
  PieChart
} from 'lucide-react';

const formatRecentTime = (timestamp, lang = 'vi') => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return lang === 'vi' ? `Hôm nay, ${timeStr}` : `Today, ${timeStr}`;
  if (isYesterday) return lang === 'vi' ? `Hôm qua, ${timeStr}` : `Yesterday, ${timeStr}`;
  return `${date.getDate()}/${date.getMonth() + 1}, ${timeStr}`;
};

const getMacroBreakdown = (tdee, goal) => {
  let proteinRatio = 0.25;
  let carbRatio = 0.50;
  let fatRatio = 0.25;

  if (goal === 'Giảm cân') {
    proteinRatio = 0.35;
    carbRatio = 0.40;
    fatRatio = 0.25;
  } else if (goal === 'Tăng cân' || goal === 'Tăng cơ') {
    proteinRatio = 0.30;
    carbRatio = 0.50;
    fatRatio = 0.20;
  }

  const proteinGrams = Math.round((tdee * proteinRatio) / 4);
  const carbGrams = Math.round((tdee * carbRatio) / 4);
  const fatGrams = Math.round((tdee * fatRatio) / 9);

  return {
    protein: { percent: Math.round(proteinRatio * 100), grams: proteinGrams },
    carbs: { percent: Math.round(carbRatio * 100), grams: carbGrams },
    fat: { percent: Math.round(fatRatio * 100), grams: fatGrams },
  };
};

const getAiMealTip = (currentMeal, goal, bmi, lang = 'vi') => {
  if (lang === 'en') {
    if (currentMeal === 'Sáng') return 'Breakfast should focus on lean protein and complex carbs for sustained metabolic energy.';
    if (currentMeal === 'Trưa') {
      if (bmi >= 23) return 'Lunch provides ~40% daily calories. Prioritize green veggies and light soups to manage body fat.';
      return 'Lunch is your primary energy engine (~40% TDEE). Hydrate well with fresh veggie soups!';
    }
    if (currentMeal === 'Tối') return 'Dinner should be lighter (~35% calories), reducing fast carbs to let digestion rest for deep sleep.';
    return 'Enjoy diverse meals to ensure complete daily micronutrient balance.';
  }
  if (currentMeal === 'Sáng') {
    return 'Bữa sáng nên tập trung đạm sạch và tinh bột tiêu hóa chậm để kích hoạt trao đổi chất & duy trì năng lượng bền bỉ.';
  }
  if (currentMeal === 'Trưa') {
    if (bmi >= 23) {
      return 'Bữa trưa chiếm 40% calo ngày. Nên ưu tiên rau xanh, canh thanh nhiệt và hạn chế đồ chiên rán để kiểm soát mỡ thừa.';
    }
    return 'Bữa trưa là nguồn năng lượng chính (khoảng 40% TDEE). Đừng quên bổ sung đủ nước canh & rau xanh tươi!';
  }
  if (currentMeal === 'Tối') {
    return 'Bữa tối nên nhẹ nhàng (khoảng 35% calo), giảm bớt tinh bột nhanh để hệ tiêu hóa thư giãn và ngủ sâu hơn.';
  }
  return 'Lựa chọn món ăn đa dạng để đảm bảo cân bằng vi chất dinh dưỡng mỗi ngày.';
};

const getDimensions = () => {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640;
  
  if (isDesktop) {
    return {
      itemHeight: 106,
      viewportHeight: 290
    };
  }
  if (isTablet) {
    return {
      itemHeight: 98,
      viewportHeight: 250
    };
  }
  return {
    itemHeight: 84,
    viewportHeight: 184
  };
};

const TARGET_INDEX = 24;

const getTranslateForIndex = (index) => {
  const { itemHeight, viewportHeight } = getDimensions();
  const centerOffset = (viewportHeight - itemHeight) / 2;
  return -(index * itemHeight - centerOffset);
};

export default function HomePage({ onOpenProfile, onOpenCreateAccount, onOpenSwitchAccount }) {
  const navigate = useNavigate();
  const { 
    foods, history, allergies, addHistory, profile, isAdmin,
    groupMembers, toggleGroupMember, addGroupMember, removeGroupMember,
    lang = 'vi'
  } = useStorage();

  const t = translations[lang] || translations.vi;

  const [mealType, setMealType] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Sáng';
    if (hour >= 11 && hour < 16) return 'Trưa';
    return 'Tối';
  });

  // Feature 1: Budget Mode ('ALL', 'budget', 'standard', 'treat')
  const [budgetTier, setBudgetTier] = useState('ALL');

  // Feature 2: Weather & Mood ('normal', 'rain', 'hot', 'quick')
  const [weatherMood, setWeatherMood] = useState('normal');

  // Feature 4: Group Dining Modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('🎲 Bấm nút bên dưới để chọn món ngẫu nhiên thông minh');

  // Reel states
  const [reelItems, setReelItems] = useState(() => (foods.length > 0 ? foods.slice(0, 5) : []));
  const [offsetY, setOffsetY] = useState(() => getTranslateForIndex(1));
  const [transitionStyle, setTransitionStyle] = useState('none');

  const timerRefs = useRef([]);

  const clearAllTimers = () => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  useEffect(() => {
    soundFx.setMuted(muted);
  }, [muted]);

  const bmiInfo = calculateBMI(Number(profile.weight), Number(profile.height));
  const tdeeVal = calculateTDEE(
    Number(profile.weight),
    Number(profile.height),
    Number(profile.age),
    profile.gender,
    profile.activity
  );
  const macro = getMacroBreakdown(tdeeVal, profile.goal);

  // Active Group Members & Allergies
  const activeMembers = groupMembers.filter(m => m.active);
  const isGroupActive = activeMembers.length > 1;
  const groupAllergies = Array.from(new Set(activeMembers.flatMap(m => m.allergies || [])));

  // Quick stats for recommendations
  const recentHistory = history.slice(-5);
  const missingVeggie = !recentHistory.some(h => {
    const f = foods.find(food => food.id === h.foodId);
    return f && f.nutrition === 'Rau củ';
  });
  const missingFish = !recentHistory.some(h => {
    const f = foods.find(food => food.id === h.foodId);
    return f && f.nutrition === 'Cá';
  });

  const handleSpin = () => {
    if (isSpinning) return;
    clearAllTimers();
    setAccepted(false);

    let picked;
    try {
      picked = spin(foods, history, allergies, mealType, profile, {
        budgetTier,
        weatherMood,
        groupAllergies: isGroupActive ? groupAllergies : []
      });
    } catch (err) {
      console.error("Spin calculation error:", err);
      setResult({ food: null, reason: "Đã xảy ra lỗi tính toán. Hãy kiểm tra lại sổ món!" });
      return;
    }

    if (!picked || !picked.food) {
      setResult({ 
        food: null, 
        reason: picked?.reason || "Không tìm thấy món ăn phù hợp với bữa ăn và các bộ lọc hiện tại." 
      });
      return;
    }

    const { food, reason } = picked;
    setResult(null);
    setIsSpinning(true);
    setStatusMessage('🔍 Đang lọc món theo thể trạng & bộ lọc đã chọn...');

    const availablePool = foods.filter(f => !f.hidden && f.categories.includes(mealType));
    const pool = availablePool.length > 2 ? availablePool : foods;

    const newReel = [];
    let lastId = null;

    for (let i = 0; i < TARGET_INDEX; i++) {
      const candidates = pool.filter(p => p.id !== lastId);
      const pick = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
      newReel.push(pick);
      lastId = pick.id;
    }

    newReel.push(food);

    for (let i = 0; i < 2; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      newReel.push(pick);
    }

    setReelItems(newReel);

    // Reset reel position
    setTransitionStyle('none');
    setOffsetY(getTranslateForIndex(0));

    // Animate reel
    const startTimeout = setTimeout(() => {
      setTransitionStyle('transform 2.5s cubic-bezier(0.12, 0.85, 0.25, 1)');
      setOffsetY(getTranslateForIndex(TARGET_INDEX));
    }, 40);
    timerRefs.current.push(startTimeout);

    // AI Status progression
    const statusTimers = [
      setTimeout(() => {
        if (weatherMood === 'rain') setStatusMessage('🌧️ Đang chọn các món nước ấm nóng hổi...');
        else if (weatherMood === 'hot') setStatusMessage('☀️ Đang ưu tiên món thanh mát hạ nhiệt...');
        else if (weatherMood === 'quick') setStatusMessage('⚡ Đang tìm món ăn nhanh gọn < 15 phút...');
        else if (budgetTier === 'budget') setStatusMessage('💰 Đang tìm món ngon bổ rẻ cứu cánh ví tiền...');
        else setStatusMessage(`⚡ Áp dụng mục tiêu [${profile.goal || 'Cân bằng'}] & vóc dáng...`);
      }, 700),
      setTimeout(() => setStatusMessage('🥗 Cân bằng dinh dưỡng 5 bữa gần nhất...'), 1500),
      setTimeout(() => setStatusMessage('🎯 Đang chốt món tối ưu nhất cho bạn...'), 2100)
    ];
    timerRefs.current.push(...statusTimers);

    // Audio ticks
    const tickDelays = [
      60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 670, 740, 810, 890,
      980, 1080, 1190, 1310, 1440, 1580, 1730, 1900, 2100, 2320
    ];

    tickDelays.forEach(delay => {
      const t = setTimeout(() => {
        soundFx.playTick();
        try { if (navigator.vibrate) navigator.vibrate(8); } catch {}
      }, delay);
      timerRefs.current.push(t);
    });

    // Complete spin
    const endTimeout = setTimeout(() => {
      setIsSpinning(false);
      setResult({ food, reason });
      setStatusMessage('✨ ĐÃ TÌM THẤY MÓN PHÙ HỢP!');
      soundFx.playWin();
      try { if (navigator.vibrate) navigator.vibrate([80, 40, 120]); } catch {}
    }, 2550);
    timerRefs.current.push(endTimeout);
  };

  const handleAccept = (e) => {
    if (result && result.food) {
      addHistory(result.food.id, mealType);
      setAccepted(true);
      const rect = e?.currentTarget?.getBoundingClientRect?.();
      const origin = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
      triggerConfetti(origin);
      try { if (navigator.vibrate) navigator.vibrate(60); } catch {}
    }
  };

  // Keep latest refs for events
  const spinRef = useRef(handleSpin);
  const acceptRef = useRef(handleAccept);
  const isSpinningRef = useRef(isSpinning);
  const resultRef = useRef(result);
  const acceptedRef = useRef(accepted);

  useEffect(() => {
    spinRef.current = handleSpin;
    acceptRef.current = handleAccept;
    isSpinningRef.current = isSpinning;
    resultRef.current = result;
    acceptedRef.current = accepted;
  });

  // 1. KEYBOARD SHORTCUTS: Space to Spin / Enter to Accept
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpinningRef.current) {
          spinRef.current();
        }
      } else if (e.code === 'Enter') {
        if (resultRef.current && resultRef.current.food && !acceptedRef.current) {
          e.preventDefault();
          acceptRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    const handleResize = () => {
      if (!isSpinningRef.current) {
        setOffsetY(getTranslateForIndex(resultRef.current && resultRef.current.food ? TARGET_INDEX : 1));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 2. LUCKY SHAKE: Shake phone to Spin
  const [shakePermissionGranted, setShakePermissionGranted] = useState(() => {
    if (typeof window === 'undefined') return false;
    // On Android / desktop or older iOS, requestPermission does not exist and motion is enabled by default
    return typeof DeviceMotionEvent === 'undefined' || typeof DeviceMotionEvent.requestPermission !== 'function';
  });

  const requestShakePermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setShakePermissionGranted(true);
          try { if (navigator.vibrate) navigator.vibrate(50); } catch {}
          return true;
        }
      } catch (err) {
        console.warn('DeviceMotionEvent permission denied/failed:', err);
      }
      return false;
    } else {
      setShakePermissionGranted(true);
      return true;
    }
  };

  useEffect(() => {
    let lastX = null;
    let lastY = null;
    let lastZ = null;
    let lastShakeTime = 0;
    // Lower threshold so regular natural hand shakes trigger easily
    const SHAKE_THRESHOLD = 12;

    const handleDeviceMotion = (event) => {
      const current = event.accelerationIncludingGravity || event.acceleration;
      if (!current) return;

      const now = Date.now();
      if ((now - lastShakeTime) < 1800) return; // Cooldown 1.8s

      if (lastX !== null && lastY !== null && lastZ !== null) {
        const deltaX = Math.abs((current.x || 0) - lastX);
        const deltaY = Math.abs((current.y || 0) - lastY);
        const deltaZ = Math.abs((current.z || 0) - lastZ);

        if ((deltaX + deltaY + deltaZ) > SHAKE_THRESHOLD) {
          lastShakeTime = now;
          if (!isSpinningRef.current) {
            spinRef.current();
          }
        }
      }

      lastX = current.x || 0;
      lastY = current.y || 0;
      lastZ = current.z || 0;
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, []);

  // Feature 3: 1-Click Order Link Generators
  const getShopeeFoodLink = (foodName) => {
    // ShopeeFood web requires address selection and does not load results via query string directly on root.
    // Foody.vn (ShopeeFood's listing partner) directly renders all restaurants in TP.HCM serving the dish:
    return `https://www.foody.vn/ho-chi-minh/dia-diem?q=${encodeURIComponent(foodName)}`;
  };

  const getGrabFoodLink = (foodName) => {
    return `https://food.grab.com/vn/vi/restaurants?search=${encodeURIComponent(foodName)}`;
  };

  const getGoogleMapsLink = (foodName) => {
    return `https://www.google.com/maps/search/quán+${encodeURIComponent(foodName)}+gần+đây`;
  };

  const handleShareStory = (food) => {
    const text = `Hôm nay vũ trụ bảo mình ăn "${food.emoji} ${food.name}" qua app Nay Ăn Gì! Dinh dưỡng chuẩn vóc dáng, không còn phải đau đầu chọn món nữa.`;
    if (navigator.share) {
      navigator.share({
        title: 'Nay Ăn Gì Hôm Nay?',
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Đã copy nội dung chia sẻ vào clipboard! Bạn có thể dán vào Zalo/Messenger.');
    }
  };

  const getNutritionBadgeClass = (nutrition) => {
    switch (nutrition) {
      case 'Thịt đỏ': return 'badge-nutrition badge-red-meat';
      case 'Thịt trắng': return 'badge-nutrition badge-white-meat';
      case 'Cá': return 'badge-nutrition badge-fish';
      case 'Rau củ': return 'badge-nutrition badge-veg';
      case 'Tinh bột': return 'badge-nutrition badge-carb';
      default: return 'badge-nutrition badge-white-meat';
    }
  };

  const getPriceTierLabel = (tier) => {
    switch (tier) {
      case 'budget': return { label: 'Bình dân < 45k', color: '#10b981' };
      case 'treat': return { label: 'Thưởng nóng > 75k', color: '#ec4899' };
      default: return { label: 'Tiêu chuẩn 45k - 75k', color: '#38bdf8' };
    }
  };

  const getNutritionTheme = (nutrition) => {
    switch (nutrition) {
      case 'Thịt đỏ':
        return {
          bg: 'linear-gradient(135deg, rgba(255, 71, 87, 0.25), rgba(255, 71, 87, 0.08))',
          border: 'rgba(255, 71, 87, 0.45)',
          glow: 'rgba(255, 71, 87, 0.25)',
          color: '#ff6b81'
        };
      case 'Cá':
        return {
          bg: 'linear-gradient(135deg, rgba(0, 180, 216, 0.25), rgba(0, 180, 216, 0.08))',
          border: 'rgba(0, 180, 216, 0.45)',
          glow: 'rgba(0, 180, 216, 0.25)',
          color: '#00b4d8'
        };
      case 'Rau củ':
        return {
          bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.08))',
          border: 'rgba(16, 185, 129, 0.45)',
          glow: 'rgba(16, 185, 129, 0.25)',
          color: '#10b981'
        };
      case 'Thịt trắng':
        return {
          bg: 'linear-gradient(135deg, rgba(255, 165, 2, 0.25), rgba(255, 165, 2, 0.08))',
          border: 'rgba(255, 165, 2, 0.45)',
          glow: 'rgba(255, 165, 2, 0.25)',
          color: '#ffa502'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.08))',
          border: 'rgba(234, 179, 8, 0.45)',
          glow: 'rgba(234, 179, 8, 0.25)',
          color: '#eab308'
        };
    }
  };

  return (
    <div className="page-container">
      
      {/* Top Header Bar */}
      <div className="app-header" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 4.5vw, 1.7rem)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Quay Chọn Món</h2>
            <span className="brand-badge">TRỢ LÝ BỮA ĂN • AI</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })} • Gợi ý {mealType}
            </span>
          </div>
          <p className="app-header-desc" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0', lineHeight: 1.3 }}>
            Gợi ý thực đơn thông minh chuẩn dinh dưỡng, TDEE & vóc dáng cá nhân
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button 
            className="btn-icon"
            onClick={() => setMuted(!muted)}
            title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {muted ? <VolumeX size={19} color="var(--text-muted)" /> : <Volume2 size={19} color="#ea580c" />}
          </button>
        </div>
      </div>

      {/* Nutrigo Quick Stat Widgets Strip (Image 1 & 2) */}
      <div className="nutrigo-metrics-strip">
        <div className="nutrigo-stat-card">
          <div className="nutrigo-stat-icon-wrap" style={{ background: 'var(--primary-light)', border: '1px solid var(--border-color)' }}>
            ⚖️
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cân Nặng</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {profile.weight || 60} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>kg</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Mục tiêu: {profile.goal || 'Cân bằng'}
            </div>
          </div>
        </div>

        <div className="nutrigo-stat-card">
          <div className="nutrigo-stat-icon-wrap" style={{ background: 'var(--accent-orange-light)', border: '1px solid var(--border-color)' }}>
            ⚡
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {lang === 'vi' ? 'Nhu Cầu Calo' : 'Calorie Needs'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {tdeeVal} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
              {lang === 'vi' ? 'TDEE ước tính/ngày' : 'Est. Daily TDEE'}
            </div>
          </div>
        </div>

        <div className="nutrigo-stat-card">
          <div className="nutrigo-stat-icon-wrap" style={{ background: 'var(--accent-blue-light)', border: '1px solid var(--border-color)' }}>
            💧
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {lang === 'vi' ? 'Nước & Vận Động' : 'Water & Fitness'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              2.0 <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{lang === 'vi' ? 'lít' : 'liters'}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.activity ? (lang === 'vi' ? profile.activity.split('(')[0] : 'Office') : 'Office'}
            </div>
          </div>
        </div>

        <div className="nutrigo-stat-card">
          <div className="nutrigo-stat-icon-wrap" style={{ background: 'var(--accent-mint-light)', border: '1px solid var(--border-color)' }}>
            🎯
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {lang === 'vi' ? 'Chỉ Số Thể Trạng' : 'Health Status'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: bmiInfo.color, lineHeight: 1.1 }}>
              BMI {bmiInfo.bmi}
            </div>
            <div style={{ fontSize: '0.7rem', color: bmiInfo.color, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {bmiInfo.status}
            </div>
          </div>
        </div>
      </div>

      {/* DUAL COLUMN RESPONSIVE GRID (DESKTOP & MOBILE) */}
      <div className="grid-desktop-2col">
        
        {/* ================= LEFT COLUMN: SLOT REEL & CONTROLS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
          
          {/* Meal Selector Tabs */}
          <div style={{ width: '100%', maxWidth: '650px', marginBottom: '8px', boxSizing: 'border-box', minWidth: 0 }}>
            <div className="meal-selector">
              {[
                { key: 'Sáng', label: lang === 'vi' ? '🌅 Sáng' : '🌅 Breakfast' },
                { key: 'Trưa', label: lang === 'vi' ? '☀️ Trưa' : '☀️ Lunch' },
                { key: 'Tối', label: lang === 'vi' ? '🌙 Tối' : '🌙 Dinner' }
              ].map(m => (
                <button
                  key={m.key}
                  className={`meal-pill ${mealType === m.key ? 'active' : ''}`}
                  onClick={() => {
                    if (!isSpinning) {
                      setMealType(m.key);
                      setResult(null);
                      setAccepted(false);
                    }
                  }}
                  disabled={isSpinning}
                >
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Context Filter Pills: Weather/Mood & Budget & Group Dining */}
          <div style={{ width: '100%', maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px', boxSizing: 'border-box', minWidth: 0 }}>
            
            {/* Weather & Mood Selector (Grid 4 cột hiển thị trọn vẹn 100% không bị tràn) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
              {[
                { id: 'normal', label: '🌤️ Chuẩn', fullLabel: '🌤️ Bình thường' },
                { id: 'rain', label: '🌧️ Mưa lạnh', fullLabel: '🌧️ Mưa / Lạnh' },
                { id: 'hot', label: '☀️ Nắng nóng', fullLabel: '☀️ Nắng nóng' },
                { id: 'quick', label: '⚡ Ăn vội', fullLabel: '⚡ Ăn vội <15p' }
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeatherMood(w.id)}
                  className={`glass-pill ${weatherMood === w.id ? 'active' : ''}`}
                  title={w.fullLabel}
                  style={{
                    padding: '5px 2px',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    justifyContent: 'center',
                    width: '100%',
                    textAlign: 'center',
                    background: weatherMood === w.id ? 'rgba(255, 145, 0, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: weatherMood === w.id ? '#ff9100' : 'rgba(255, 255, 255, 0.08)',
                    color: weatherMood === w.id ? '#ffa726' : 'var(--text-muted)',
                    boxShadow: weatherMood === w.id ? '0 2px 8px rgba(255, 145, 0, 0.25)' : 'none'
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Budget & Group Buttons Row (Scrollable or fluid wrap) */}
            <div className="scroll-row" style={{ alignItems: 'center', gap: '6px' }}>
              
              {/* Budget Tier Pills */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {[
                  { id: 'ALL', label: 'Mọi giá' },
                  { id: 'budget', label: '💰 Ví mỏng (<45k)' },
                  { id: 'treat', label: '🥩 Xoã (>75k)' }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBudgetTier(b.id)}
                    className={`glass-pill ${budgetTier === b.id ? 'active' : ''}`}
                    style={{
                      padding: '5px 8px',
                      fontSize: '0.74rem',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: budgetTier === b.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: budgetTier === b.id ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                      color: budgetTier === b.id ? '#34d399' : 'var(--text-muted)'
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Group Dining Trigger */}
              <button
                onClick={() => setGroupModalOpen(true)}
                className={`glass-pill ${isGroupActive ? 'active' : ''}`}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  background: isGroupActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isGroupActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                  color: isGroupActive ? '#38bdf8' : 'var(--text-secondary)'
                }}
                title="Chọn đồng nghiệp cùng đi ăn"
              >
                <Users size={13} />
                <span>{isGroupActive ? `Nhóm (${activeMembers.length})` : 'Đi cùng ai?'}</span>
              </button>
            </div>

          </div>

          {/* Quick Notice Pill for Mobile */}
          <div style={{ width: '100%', maxWidth: '650px', marginBottom: '8px', boxSizing: 'border-box', minWidth: 0 }}>
            {(allergies.length > 0 || (isGroupActive && groupAllergies.length > 0)) && (
              <div className="glass-panel" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#ffb74d' }}>
                <ShieldAlert size={16} />
                <span>
                  Đang né dị ứng: <strong>{Array.from(new Set([...allergies, ...(isGroupActive ? groupAllergies : [])])).join(', ')}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Slot Machine Reel */}
          <div className="reel-wrapper">
            {/* Top Crown Header of the Reel */}
            <div className="reel-crown-header">
              <div className="reel-crown-title">
                <Sparkles size={14} color="#ff9100" />
                <span>AI ROULETTE • QUAY MÓN THÔNG MINH</span>
              </div>
              <div className={`reel-live-tag ${isSpinning ? 'reel-tag-pulse' : ''}`}>
                {isSpinning ? '🔴 ĐANG QUÉT MÓN...' : (result && result.food ? '🟢 ĐÃ CHỌN ĐƯỢC' : '✨ SẴN SÀNG')}
              </div>
            </div>

            <div className={`reel-box ${result && result.food && !isSpinning ? 'winner-glow' : ''}`}>
              {/* Highlight selector frame with Cyber HUD viewfinder */}
              <div className="reel-selector-frame">
                <div className="reel-hud-tag">
                  {isSpinning ? 'ĐANG QUÉT MÓN...' : (result && result.food ? 'MÓN ĐƯỢC CHỌN' : 'TÂM NGẮM LỰA CHỌN')}
                </div>
              </div>

              <div className="reel-gradient-mask" />

              <div 
                className="reel-track"
                style={{
                  transform: `translateY(${offsetY}px)`,
                  transition: transitionStyle
                }}
              >
                {reelItems.map((item, idx) => {
                  const nutriTheme = getNutritionTheme(item.nutrition);
                  const priceInfo = getPriceTierLabel(item.priceTier);
                  const allergens = item.allergies || item.allergens || [];
                  return (
                    <div 
                      key={`${item.id}-${idx}`} 
                      className="reel-item"
                      style={{
                        filter: isSpinning ? 'blur(0.35px)' : 'none'
                      }}
                    >
                      <FoodMedia food={item} size="md" showBadge style={{ width: 'clamp(54px, 6.5vw, 70px)', height: 'clamp(54px, 6.5vw, 70px)', minWidth: 'clamp(54px, 6.5vw, 70px)' }} />
                      <div className="reel-item-info">
                        <div className="reel-item-name">{item.name}</div>
                        <div className="reel-item-meta">
                          <span className={getNutritionBadgeClass(item.nutrition)}>
                            {item.nutrition}
                          </span>
                          <span className="price-tag-badge" style={{ color: priceInfo.color, borderColor: `${priceInfo.color}50`, background: `${priceInfo.color}15` }}>
                            {priceInfo.label}
                          </span>
                          {allergens.length > 0 && (
                            <span className="allergen-tag-badge">
                              ⚠️ {allergens.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Live Status indicator */}
            <div className="reel-status-ticker">
              <span className={isSpinning ? "pulse" : ""} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', maxWidth: '100%' }}>
                {isSpinning && <Sparkles size={14} className="spin-anim" color="#ff9100" />}
                {statusMessage}
              </span>
            </div>
          </div>

          {/* Result Card with Reason Hook & 1-Click Order Links */}
          {result && !isSpinning && (
            <div className="pop-in" style={{ width: '100%', maxWidth: '650px' }}>
              {result.food ? (
                <>
                  <div className="reason-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div className="reason-card-badge">
                        <Sparkles size={14} /> LỰA CHỌN TỐI ƯU CỦA AI
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                        ✓ Khớp 100% Tiêu Chí
                      </span>
                    </div>
                    
                    <div className="reason-card-title">
                      <FoodMedia food={result.food} size="lg" showBadge />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="reason-card-foodname">{result.food.name}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          <span className={getNutritionBadgeClass(result.food.nutrition)}>
                            {result.food.nutrition}
                          </span>
                          <span className="glass-pill" style={{ padding: '2px 8px', fontSize: '0.75rem', color: getPriceTierLabel(result.food.priceTier).color }}>
                            {getPriceTierLabel(result.food.priceTier).label}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShareStory(result.food)}
                        className="btn-icon"
                        title="Chia sẻ tấm thẻ món ăn này"
                        style={{ padding: '8px' }}
                      >
                        <Share2 size={18} color="#38bdf8" />
                      </button>
                    </div>

                    {/* AI Factor Breakdown Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0 10px 0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#ffb74d', background: 'rgba(255, 145, 0, 0.12)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255, 145, 0, 0.25)', fontWeight: 600 }}>
                        🎯 Bữa {mealType}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)', fontWeight: 600 }}>
                        ⚖️ BMI {bmiInfo.bmi} ({bmiInfo.status})
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.12)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(74, 222, 128, 0.25)', fontWeight: 600 }}>
                        💡 Mục tiêu: {profile.goal || 'Cân bằng'}
                      </span>
                    </div>

                    <div className="reason-card-text">
                      {result.reason}
                    </div>

                    {/* 🛵 FEATURE 3: CẦU NỐI ĐẶT ĐỒ ĂN 1-CLICK */}
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          🛵 ĐẶT MÓN & TÌM QUÁN ĂN NGAY:
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Tự động tìm kiếm</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <a 
                          href={getShopeeFoodLink(result.food.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Tìm quán bán món này trên hệ thống ShopeeFood / Foody"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'rgba(238, 77, 45, 0.15)',
                            border: '1px solid rgba(238, 77, 45, 0.4)',
                            color: '#ff643d',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>ShopeeFood</span>
                          <ExternalLink size={13} />
                        </a>

                        <a 
                          href={getGrabFoodLink(result.food.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Tìm quán trên GrabFood"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'rgba(0, 177, 79, 0.15)',
                            border: '1px solid rgba(0, 177, 79, 0.4)',
                            color: '#00b14f',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>GrabFood</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>

                      {/* Google Maps direct search */}
                      <a 
                        href={getGoogleMapsLink(result.food.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'rgba(66, 133, 244, 0.12)',
                          border: '1px solid rgba(66, 133, 244, 0.35)',
                          color: '#60a5fa',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <MapPin size={14} color="#60a5fa" />
                        <span>Xem Quán Gần Tôi (Google Maps)</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', width: '100%' }}>
                    {accepted ? (
                      <div 
                        className="glass-panel" 
                        style={{ 
                          flex: 1,
                          padding: '12px', 
                          textAlign: 'center', 
                          color: '#4ade80', 
                          fontWeight: 800, 
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          borderColor: 'rgba(34, 197, 94, 0.4)'
                        }}
                      >
                        <Award size={20} /> Đã chốt & lưu vào Nhật ký!
                      </div>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        onClick={handleAccept} 
                        style={{ 
                          flex: 1.2, 
                          fontSize: '0.95rem', 
                          padding: '12px 14px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px' 
                        }}
                      >
                        <Check size={18} /> 
                        <span>CHỐT MÓN</span>
                        <span style={{ fontSize: '0.68rem', opacity: 0.8, padding: '2px 6px', background: 'rgba(0,0,0,0.25)', borderRadius: '4px' }}>
                          [Enter]
                        </span>
                      </button>
                    )}

                    <button 
                      className="btn btn-secondary" 
                      onClick={handleSpin}
                      style={{ flex: 1, padding: '12px 10px', fontSize: '0.9rem' }}
                    >
                      <RefreshCw size={16} /> Quay lại
                    </button>
                  </div>
                </>
              ) : (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '28px', marginTop: '16px' }}>
                  <AlertTriangle size={44} color="#ff9100" style={{ marginBottom: '14px' }} />
                  <p style={{ fontSize: '1rem', color: '#ffb74d', marginBottom: '18px', lineHeight: 1.6 }}>
                    {result.reason}
                  </p>
                  <button className="btn btn-secondary" onClick={handleSpin} style={{ width: '100%' }}>
                    <RefreshCw size={18} /> Thử lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Spin trigger button */}
          {!result && (
            <div style={{ width: '100%', maxWidth: '650px', marginTop: '10px', boxSizing: 'border-box', minWidth: 0 }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (!shakePermissionGranted && typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    requestShakePermission();
                  }
                  handleSpin();
                }}
                disabled={isSpinning}
                style={{ 
                  width: '100%', 
                  padding: '13px 20px', 
                  fontSize: '1.05rem',
                  opacity: isSpinning ? 0.75 : 1,
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="spin-anim" size={18} /> {t.btnSpinning}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flame size={19} /> {t.btnSpin}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', opacity: 0.9, fontWeight: 500 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Keyboard size={12} /> {lang === 'vi' ? 'Phím' : 'Key'} <strong>Space</strong>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Smartphone size={12} /> {lang === 'vi' ? 'Lắc điện thoại' : 'Shake phone'}
                      </span>
                    </div>
                  </div>
                )}
              </button>

              {/* iOS Permission Banner if not granted yet */}
              {typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function' && !shakePermissionGranted && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  <button
                    onClick={requestShakePermission}
                    className="glass-pill"
                    style={{
                      fontSize: '0.72rem',
                      padding: '4px 10px',
                      color: '#ff9100',
                      borderColor: 'rgba(255, 145, 0, 0.3)',
                      background: 'rgba(255, 145, 0, 0.12)',
                      cursor: 'pointer',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      lineHeight: 1.35
                    }}
                  >
                    <Smartphone size={13} style={{ flexShrink: 0 }} /> Nhấn vào đây để bật cảm biến Lắc trên iPhone (iOS)
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ================= RIGHT COLUMN: HEALTH & INSIGHTS WIDGET (Expands on Desktop) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
          
          {/* ================= WIDGET 1: PHÂN BỔ CALO & MACRO AI (Replaces redundant profile) ================= */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary-color)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PieChart size={16} color="var(--primary-color)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  PHÂN BỔ CALO & MACRO AI
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 800, 
                  color: 'var(--primary-color)', 
                  background: 'rgba(187, 242, 70, 0.12)', 
                  border: '1px solid rgba(187, 242, 70, 0.3)', 
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-full)' 
                }}>
                  TDEE: {tdeeVal} kcal
                </span>
                <button 
                  className="glass-pill" 
                  style={{ cursor: 'pointer', padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={onOpenProfile}
                  title="Chỉnh sửa chiều cao, cân nặng, mục tiêu calo của tôi"
                >
                  Sửa chỉ số
                </button>
              </div>
            </div>

            {/* 3 Meals Distribution Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[
                { type: 'Sáng', ratio: 0.25, icon: '🌅', label: '25% TDEE' },
                { type: 'Trưa', ratio: 0.40, icon: '☀️', label: '40% TDEE' },
                { type: 'Tối', ratio: 0.35, icon: '🌙', label: '35% TDEE' },
              ].map(meal => {
                const isCurrent = mealType === meal.type;
                const mealCalo = Math.round(tdeeVal * meal.ratio);
                return (
                  <div 
                    key={meal.type}
                    style={{
                      background: isCurrent ? 'rgba(187, 242, 70, 0.12)' : 'var(--bg-surface-secondary)',
                      border: isCurrent ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 6px',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: isCurrent ? '0 0 12px rgba(187, 242, 70, 0.18)' : 'none'
                    }}
                  >
                    {isCurrent && (
                      <span style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--primary-color)',
                        color: '#111827',
                        fontSize: '0.58rem',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-full)',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap'
                      }}>
                        ĐANG CHỌN
                      </span>
                    )}
                    <div style={{ fontSize: '0.73rem', color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <span>{meal.icon}</span> Bữa {meal.type}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isCurrent ? 'var(--primary-color)' : 'var(--text-main)', marginTop: '2px' }}>
                      ~{mealCalo}
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '2px' }}>kcal</span>
                    </div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', marginTop: '1px' }}>
                      {meal.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Macro Ratio Stacked Bar */}
            <div style={{ marginBottom: '12px', background: 'var(--bg-surface-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Tỷ Lệ Macro Tiêu Chuẩn ({profile.goal || 'Cân bằng'})
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  Đạm / Carbs / Fat
                </span>
              </div>

              {/* Multi-segment progress bar */}
              <div style={{ height: '8px', width: '100%', borderRadius: '4px', overflow: 'hidden', display: 'flex', background: 'var(--bg-surface)' }}>
                <div style={{ width: `${macro.protein.percent}%`, background: '#38bdf8', transition: 'width 0.3s ease' }} title={`Đạm (Protein): ${macro.protein.percent}%`} />
                <div style={{ width: `${macro.carbs.percent}%`, background: '#fbbf24', transition: 'width 0.3s ease' }} title={`Tinh bột (Carbs): ${macro.carbs.percent}%`} />
                <div style={{ width: `${macro.fat.percent}%`, background: '#f43f5e', transition: 'width 0.3s ease' }} title={`Chất béo (Fat): ${macro.fat.percent}%`} />
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#38bdf8' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Đạm:</span>
                  <strong style={{ color: '#38bdf8' }}>{macro.protein.grams}g ({macro.protein.percent}%)</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#fbbf24' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Carbs:</span>
                  <strong style={{ color: '#fbbf24' }}>{macro.carbs.grams}g ({macro.carbs.percent}%)</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f43f5e' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Fat:</span>
                  <strong style={{ color: '#f43f5e' }}>{macro.fat.grams}g ({macro.fat.percent}%)</strong>
                </div>
              </div>
            </div>

            {/* AI Meal Tip Alert */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              background: 'rgba(187, 242, 70, 0.08)', 
              border: '1px solid rgba(187, 242, 70, 0.25)', 
              padding: '9px 12px', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              color: 'var(--text-secondary)'
            }}>
              <Sparkles size={15} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-main)', marginRight: '4px' }}>Gợi ý AI Bữa {mealType}:</strong>
                {getAiMealTip(mealType, profile.goal, bmiInfo.bmi)}
              </div>
            </div>
          </div>

          {/* Group Dining Summary Widget (Desktop Only Widget) */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <Users size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Chế Độ Ăn Nhóm</h4>
              </div>
              <button 
                onClick={() => setGroupModalOpen(true)}
                className="glass-pill"
                style={{ padding: '3px 10px', fontSize: '0.74rem', cursor: 'pointer', flexShrink: 0 }}
              >
                Cài đặt nhóm
              </button>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {isGroupActive 
                ? `Đang bật chế độ nhóm cùng ${activeMembers.length} người. Thuật toán tự động né các món gây dị ứng cho bất kỳ thành viên nào.`
                : 'Bạn đang chọn món cho cá nhân. Bấm "Cài đặt nhóm" nếu hôm nay đi ăn cùng đồng nghiệp phòng ban!'}
            </p>
          </div>

          {/* Nutrition Balancing Status */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={18} color="#00e676" style={{ flexShrink: 0 }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Trạng Thái Cân Bằng 5 Bữa Gần Nhất</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bổ sung rau xanh:</span>
                <span style={{ color: missingVeggie ? '#ef4444' : '#10b981', fontWeight: 700, textAlign: 'right' }}>
                  {missingVeggie ? '⚠️ Đang thiếu rau củ' : '✓ Đã đủ rau củ'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bổ sung cá / hải sản:</span>
                <span style={{ color: missingFish ? '#00b4d8' : '#10b981', fontWeight: 700, textAlign: 'right' }}>
                  {missingFish ? '⚡ Đang ưu tiên nạp cá' : '✓ Đã nạp hải sản'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dị ứng đang lọc cứng:</span>
                <span style={{ color: (allergies.length > 0 || (isGroupActive && groupAllergies.length > 0)) ? '#ff7a18' : 'var(--text-dim)', fontWeight: 600, textAlign: 'right' }}>
                  {Array.from(new Set([...allergies, ...(isGroupActive ? groupAllergies : [])])).length > 0 
                    ? `${Array.from(new Set([...allergies, ...(isGroupActive ? groupAllergies : [])])).join(', ')}` 
                    : 'Không có'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= WIDGET: 3 BỮA ĐÃ ĂN GẦN NHẤT ================= */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Clock size={16} color="#10b981" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-main)' }}>
                  3 Bữa Đã Ăn Gần Nhất
                </h4>
              </div>
              <button 
                onClick={() => navigate('/history')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '2px 4px'
                }}
                title="Xem toàn bộ sổ nhật ký và thống kê dinh dưỡng"
              >
                <span>Xem tất cả</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {history.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '16px 12px', 
                background: 'var(--bg-surface-secondary)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border-color)',
                fontSize: '0.8rem', 
                color: 'var(--text-muted)' 
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🍱</div>
                Chưa có bữa ăn nào được ghi lại.
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Sau khi quay món, bấm <strong>"Chốt món này"</strong> để tự động lưu!
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.slice(-3).reverse().map((h, idx) => {
                  const food = foods.find(f => f.id === h.foodId);
                  if (!food) return null;
                  return (
                    <div 
                      key={h.id || h.timestamp || idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        background: 'var(--bg-surface-secondary)', 
                        border: '1px solid var(--border-color)', 
                        padding: '8px 10px', 
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <FoodMedia food={food} size="xs" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                            {food.name}
                          </div>
                          <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {formatRecentTime(h.timestamp)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            padding: '1px 6px', 
                            borderRadius: '4px', 
                            background: h.mealType === 'Sáng' ? 'rgba(245, 158, 11, 0.15)' : h.mealType === 'Trưa' ? 'rgba(187, 242, 70, 0.18)' : 'rgba(99, 102, 241, 0.18)',
                            color: h.mealType === 'Sáng' ? '#f59e0b' : h.mealType === 'Trưa' ? 'var(--primary-color)' : '#818cf8',
                            fontWeight: 700 
                          }}>
                            {h.mealType}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            • {food.nutrition} • {food.calories} kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Group Dining Modal */}
      <GroupModal 
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        groupMembers={groupMembers}
        toggleGroupMember={toggleGroupMember}
        addGroupMember={addGroupMember}
        removeGroupMember={removeGroupMember}
      />

    </div>
  );
}
