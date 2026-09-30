import { useState, useEffect, useRef } from 'react';
import { useStorage, calculateBMI } from '../hooks/useStorage';
import { spin } from '../utils/logicEngine';
import { soundFx } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import GroupModal from '../components/GroupModal';
import { 
  RefreshCw, Check, Sparkles, Volume2, VolumeX, AlertTriangle, 
  Flame, ShieldAlert, Award, Activity, Clock, 
  CloudRain, Sun, Zap, Users, ExternalLink, Share2
} from 'lucide-react';

const ITEM_HEIGHT = 90;
const VIEWPORT_HEIGHT = 220;
const TARGET_INDEX = 24;

const getTranslateForIndex = (index) => {
  const centerOffset = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2; // 65px
  return -(index * ITEM_HEIGHT - centerOffset);
};

export default function HomePage({ onOpenProfile }) {
  const { 
    foods, history, allergies, addHistory, profile, 
    groupMembers, toggleGroupMember, addGroupMember, removeGroupMember 
  } = useStorage();

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

  const handleAccept = () => {
    if (result && result.food) {
      addHistory(result.food.id, mealType);
      setAccepted(true);
      triggerConfetti();
      try { if (navigator.vibrate) navigator.vibrate(60); } catch {}
    }
  };

  // Feature 3: 1-Click Order Link Generators
  const getShopeeFoodLink = (foodName) => {
    return `https://shopeefood.vn/tim-kiem?q=${encodeURIComponent(foodName)}`;
  };

  const getGrabFoodLink = (foodName) => {
    return `https://food.grab.com/vn/vi/restaurants?search=${encodeURIComponent(foodName)}`;
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

  return (
    <div className="page-container">
      
      {/* Top Header Bar */}
      <div className="app-header" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Quay Chọn Món</h2>
            <span className="brand-badge">AI LOGIC</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Gợi ý thông minh dựa theo lịch sử, BMI, hầu bao & thời tiết hôm nay
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-icon"
            onClick={() => setMuted(!muted)}
            title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {muted ? <VolumeX size={19} color="var(--text-muted)" /> : <Volume2 size={19} color="#ff9100" />}
          </button>
        </div>
      </div>

      {/* DUAL COLUMN RESPONSIVE GRID (DESKTOP & MOBILE) */}
      <div className="grid-desktop-2col">
        
        {/* ================= LEFT COLUMN: SLOT REEL & CONTROLS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          {/* Meal Selector Tabs */}
          <div style={{ width: '100%', maxWidth: '480px', marginBottom: '12px' }}>
            <div className="meal-selector">
              {[
                { key: 'Sáng', label: '🌅 Bữa Sáng' },
                { key: 'Trưa', label: '☀️ Bữa Trưa' },
                { key: 'Tối', label: '🌙 Bữa Tối' }
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
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Context Filter Pills: Weather/Mood & Budget & Group Dining */}
          <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            
            {/* Weather & Mood Selector */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
              {[
                { id: 'normal', label: '🌤️ Bình thường', icon: null },
                { id: 'rain', label: '🌧️ Mưa / Lạnh', icon: CloudRain },
                { id: 'hot', label: '☀️ Nắng nóng', icon: Sun },
                { id: 'quick', label: '⚡ Ăn vội <15p', icon: Zap }
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeatherMood(w.id)}
                  className={`glass-pill ${weatherMood === w.id ? 'active' : ''}`}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.76rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: weatherMood === w.id ? 'rgba(255, 145, 0, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: weatherMood === w.id ? '#ff9100' : 'rgba(255, 255, 255, 0.08)',
                    color: weatherMood === w.id ? '#ffa726' : 'var(--text-muted)'
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Budget & Group Buttons Row */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              
              {/* Budget Tier Pill */}
              <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
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
                      flex: 1,
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
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  background: isGroupActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isGroupActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                  color: isGroupActive ? '#38bdf8' : 'var(--text-secondary)'
                }}
                title="Chọn đồng nghiệp cùng đi ăn"
              >
                <Users size={14} />
                <span>{isGroupActive ? `Nhóm (${activeMembers.length})` : 'Đi cùng ai?'}</span>
              </button>
            </div>

          </div>

          {/* Quick Notice Pill for Mobile */}
          <div style={{ width: '100%', maxWidth: '480px', marginBottom: '14px' }}>
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
            <div className={`reel-box ${result && result.food && !isSpinning ? 'winner-glow' : ''}`}>
              
              <div className="reel-selector-frame">
                <span className="reel-marker">▶</span>
                <span className="reel-marker">◀</span>
              </div>

              <div className="reel-gradient-mask" />

              <div 
                className="reel-track"
                style={{
                  transform: `translateY(${offsetY}px)`,
                  transition: transitionStyle
                }}
              >
                {reelItems.map((item, idx) => (
                  <div 
                    key={`${item.id}-${idx}`} 
                    className="reel-item"
                    style={{
                      filter: isSpinning ? 'blur(0.3px)' : 'none'
                    }}
                  >
                    <div className="reel-item-emoji">{item.emoji}</div>
                    <div className="reel-item-info">
                      <div className="reel-item-name">{item.name}</div>
                      <div className="reel-item-meta">
                        <span className={getNutritionBadgeClass(item.nutrition)}>
                          {item.nutrition}
                        </span>
                        <span>•</span>
                        <span>{getPriceTierLabel(item.priceTier).label}</span>
                        {((item.allergies || item.allergens || []).length > 0) && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#f87171' }}>⚠️ {(item.allergies || item.allergens).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Live Status indicator */}
            <div className="reel-status-ticker">
              <span className={isSpinning ? "pulse" : ""}>{statusMessage}</span>
            </div>
          </div>

          {/* Result Card with Reason Hook & 1-Click Order Links */}
          {result && !isSpinning && (
            <div className="pop-in" style={{ width: '100%', maxWidth: '480px' }}>
              {result.food ? (
                <>
                  <div className="reason-card">
                    <div className="reason-card-badge">
                      <Sparkles size={14} /> Lý Do AI Chọn Món Này
                    </div>
                    
                    <div className="reason-card-title">
                      <span className="reason-card-emoji">{result.food.emoji}</span>
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

                    <div className="reason-card-text">
                      {result.reason}
                    </div>

                    {/* 🛵 FEATURE 3: CẦU NỐI ĐẶT ĐỒ ĂN 1-CLICK */}
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                        🛵 ĐẶT MÓN NHANH TRÊN APP GIAO HÀNG:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <a 
                          href={getShopeeFoodLink(result.food.name)}
                          target="_blank"
                          rel="noopener noreferrer"
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
                    </div>

                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    {accepted ? (
                      <div 
                        className="glass-panel" 
                        style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          color: '#4ade80', 
                          fontWeight: 800, 
                          fontSize: '1.05rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          borderColor: 'rgba(34, 197, 94, 0.4)'
                        }}
                      >
                        <Award size={22} /> Đã chốt & lưu vào Nhật ký hôm nay!
                      </div>
                    ) : (
                      <button className="btn btn-primary" onClick={handleAccept} style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}>
                        <Check size={22} /> CHỐT MÓN NÀY
                      </button>
                    )}

                    <button 
                      className="btn btn-secondary" 
                      onClick={handleSpin}
                      style={{ width: '100%' }}
                    >
                      <RefreshCw size={18} /> Đổi món khác (Quay tiếp)
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
            <div style={{ width: '100%', maxWidth: '480px', marginTop: '20px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleSpin}
                disabled={isSpinning}
                style={{ 
                  width: '100%', 
                  padding: '18px 24px', 
                  fontSize: '1.2rem',
                  opacity: isSpinning ? 0.75 : 1,
                  cursor: isSpinning ? 'not-allowed' : 'pointer'
                }}
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="spin-anim" size={24} /> Đang tính toán món ngon...
                  </>
                ) : (
                  <>
                    <Flame size={24} /> QUAY MÓN NGAY
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* ================= RIGHT COLUMN: HEALTH & INSIGHTS WIDGET (Expands on Desktop) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          
          {/* User Body Profile Widget */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #ff7a18' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff9100', letterSpacing: '0.04em' }}>
                  Hồ Sơ Cá Nhân Hóa
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                  {profile.name || 'Bạn'} • {profile.gender}
                </h3>
              </div>
              <button 
                className="glass-pill" 
                style={{ cursor: 'pointer', padding: '5px 12px', fontSize: '0.78rem' }}
                onClick={onOpenProfile}
              >
                Sửa thể trạng
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chỉ số BMI</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: bmiInfo.color }}>
                  {bmiInfo.bmi} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>({bmiInfo.status})</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mục tiêu dinh dưỡng</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffa000', marginTop: '3px' }}>
                  {profile.goal || 'Cân bằng'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              💡 <em>Thuật toán quay số đang ưu tiên món ăn hỗ trợ vóc dáng & năng lượng dựa trên cân nặng {profile.weight}kg, chiều cao {profile.height}cm của bạn.</em>
            </p>
          </div>

          {/* Group Dining Summary Widget (Desktop Only Widget) */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#38bdf8" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Chế Độ Ăn Nhóm</h4>
              </div>
              <button 
                onClick={() => setGroupModalOpen(true)}
                className="glass-pill"
                style={{ padding: '3px 10px', fontSize: '0.74rem', cursor: 'pointer' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Activity size={18} color="#00e676" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Trạng Thái Cân Bằng 5 Bữa Gần Nhất</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bổ sung rau xanh:</span>
                <span style={{ color: missingVeggie ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                  {missingVeggie ? '⚠️ Đang thiếu rau củ' : '✓ Đã đủ rau củ'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bổ sung cá / hải sản:</span>
                <span style={{ color: missingFish ? '#00b4d8' : '#10b981', fontWeight: 700 }}>
                  {missingFish ? '⚡ Đang ưu tiên nạp cá' : '✓ Đã nạp hải sản'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dị ứng đang lọc cứng:</span>
                <span style={{ color: (allergies.length > 0 || (isGroupActive && groupAllergies.length > 0)) ? '#ff7a18' : 'var(--text-dim)', fontWeight: 600 }}>
                  {Array.from(new Set([...allergies, ...(isGroupActive ? groupAllergies : [])])).length > 0 
                    ? `${Array.from(new Set([...allergies, ...(isGroupActive ? groupAllergies : [])])).join(', ')}` 
                    : 'Không có'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent History Feed Snapshot */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#ff9100" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Bữa Ăn Gần Đây</h4>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{history.length} bữa</span>
            </div>

            {history.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Chưa có lịch sử. Khi bạn bấm "Chốt món này", kết quả sẽ tự động lưu vào đây.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.slice(-3).reverse().map((h, idx) => {
                  const food = foods.find(f => f.id === h.foodId);
                  if (!food) return null;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{food.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {food.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Bữa {h.mealType} • {food.nutrition}
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
