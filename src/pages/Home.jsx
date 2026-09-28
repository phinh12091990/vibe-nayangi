import { useState, useEffect, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { spin } from '../utils/logicEngine';
import { soundFx } from '../utils/audio';
import { Dna, RefreshCw, Check, Sparkles, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

const ITEM_HEIGHT = 90;
const VIEWPORT_HEIGHT = 210;
const TARGET_INDEX = 24;

// Helper to center item at index i in the 210px viewport
const getTranslateForIndex = (index) => {
  const centerOffset = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2; // 60px
  return -(index * ITEM_HEIGHT - centerOffset);
};

export default function HomePage() {
  const { foods, history, allergies, addHistory } = useStorage();
  const [mealType, setMealType] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 10) return 'Sáng';
    if (hour < 15) return 'Trưa';
    return 'Tối';
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('🎲 Bấm nút bên dưới để bắt đầu quay món');

  // Reel states
  const [reelItems, setReelItems] = useState(() => (foods.length > 0 ? foods.slice(0, 5) : []));
  const [offsetY, setOffsetY] = useState(() => getTranslateForIndex(1));
  const [transitionStyle, setTransitionStyle] = useState('none');

  const timerRefs = useRef([]);

  // Clear any scheduled timeouts on unmount
  const clearAllTimers = () => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Sync mute state
  useEffect(() => {
    soundFx.setMuted(muted);
  }, [muted]);

  const handleSpin = () => {
    if (isSpinning) return;
    clearAllTimers();
    setAccepted(false);

    // 1. Run the recommendation logic
    let picked;
    try {
      picked = spin(foods, history, allergies, mealType);
    } catch (err) {
      console.error("Spin calculation error:", err);
      setResult({ food: null, reason: "Đã xảy ra lỗi tính toán dữ liệu. Hãy kiểm tra lại sổ món!" });
      return;
    }

    if (!picked || !picked.food) {
      setResult({ 
        food: null, 
        reason: picked?.reason || "Không tìm thấy món ăn phù hợp với bữa ăn và dị ứng hiện tại." 
      });
      return;
    }

    const { food, reason } = picked;
    setResult(null);
    setIsSpinning(true);
    setStatusMessage('🔍 Đang quét toàn bộ món ăn trong thực đơn...');

    // 2. Build the running reel sequence
    // Pool of candidate foods matching the current meal type
    const availablePool = foods.filter(f => !f.hidden && f.categories.includes(mealType));
    const pool = availablePool.length > 2 ? availablePool : foods;

    const newReel = [];
    let lastId = null;

    // Fill 24 random cycling items before the winner
    for (let i = 0; i < TARGET_INDEX; i++) {
      const candidates = pool.filter(p => p.id !== lastId);
      const pick = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
      newReel.push(pick);
      lastId = pick.id;
    }

    // Target item at TARGET_INDEX
    newReel.push(food);

    // Add 2 buffer items below
    for (let i = 0; i < 2; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      newReel.push(pick);
    }

    setReelItems(newReel);

    // Step A: Snap to top immediately without transition
    setTransitionStyle('none');
    setOffsetY(getTranslateForIndex(0));

    // Step B: Start rolling with smooth deceleration
    const startTimeout = setTimeout(() => {
      setTransitionStyle('transform 2.5s cubic-bezier(0.12, 0.85, 0.25, 1)');
      setOffsetY(getTranslateForIndex(TARGET_INDEX));
    }, 40);
    timerRefs.current.push(startTimeout);

    // Dynamic AI status updates during spin
    const statusTimers = [
      setTimeout(() => setStatusMessage('⚡ Đang loại món dị ứng & món gây ngán...'), 700),
      setTimeout(() => setStatusMessage('🥗 Đang tính toán cân bằng dinh dưỡng...'), 1500),
      setTimeout(() => setStatusMessage('🎯 Đang chốt món phù hợp nhất...'), 2100)
    ];
    timerRefs.current.push(...statusTimers);

    // Audio & Haptic tick sequence
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

    // Landing sequence at 2.5s
    const endTimeout = setTimeout(() => {
      setIsSpinning(false);
      setResult({ food, reason });
      setStatusMessage('✨ ĐÃ TÌM THẤY MÓN CHÂN ÁI!');
      soundFx.playWin();
      try { if (navigator.vibrate) navigator.vibrate([80, 40, 120]); } catch {}
    }, 2550);
    timerRefs.current.push(endTimeout);
  };

  const handleAccept = () => {
    if (result && result.food) {
      addHistory(result.food.id, mealType);
      setAccepted(true);
      try { if (navigator.vibrate) navigator.vibrate(50); } catch {}
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Header bar */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Nay Ăn Gì</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trợ lý bữa ăn thông minh</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setMuted(!muted)}
            style={{ 
              background: 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '50%', 
              width: '36px', 
              height: '36px', 
              color: muted ? 'var(--text-muted)' : 'var(--secondary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <div className="glass-panel" style={{ padding: '6px 12px', borderRadius: '20px' }}>
            <select 
              value={mealType} 
              onChange={e => {
                setMealType(e.target.value);
                setResult(null);
                setAccepted(false);
              }}
              disabled={isSpinning}
              style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              <option style={{ color: 'black' }} value="Sáng">🌅 Sáng</option>
              <option style={{ color: 'black' }} value="Trưa">☀️ Trưa</option>
              <option style={{ color: 'black' }} value="Tối">🌙 Tối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Roulette / Running Food Reel */}
      <div className="reel-wrapper">
        <div className={`reel-box ${result && result.food && !isSpinning ? 'winner-glow' : ''}`}>
          
          {/* Center target indicator frame */}
          <div className="reel-selector-frame">
            <span className="reel-marker">▶</span>
            <span className="reel-marker">◀</span>
          </div>

          {/* Top & bottom gradient fading mask */}
          <div className="reel-gradient-mask" />

          {/* The moving reel track */}
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
                  filter: isSpinning ? 'blur(0.4px)' : 'none'
                }}
              >
                <div className="reel-item-emoji">{item.emoji}</div>
                <div className="reel-item-info">
                  <div className="reel-item-name">{item.name}</div>
                  <div className="reel-item-meta">
                    {item.nutrition} • {item.categories.join('/')}
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

      {/* Result details with the killer Reason */}
      {result && !isSpinning && (
        <div className="pop-in" style={{ width: '100%', maxWidth: '420px' }}>
          {result.food ? (
            <>
              {/* Reasoning Card */}
              <div className="reason-card">
                <div className="reason-card-badge">
                  <Sparkles size={14} /> Lý do chọn món này
                </div>
                <div className="reason-card-text">
                  {result.reason}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {accepted ? (
                  <div 
                    className="glass-panel" 
                    style={{ 
                      padding: '14px', 
                      textAlign: 'center', 
                      color: '#81c784', 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Check size={20} /> Đã lưu vào lịch sử hôm nay!
                  </div>
                ) : (
                  <button className="btn" onClick={handleAccept} style={{ width: '100%' }}>
                    <Check size={20} /> CHỐT MÓN NÀY
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
            <div className="glass-panel" style={{ textAlign: 'center', padding: '24px', marginTop: '16px' }}>
              <AlertTriangle size={40} color="#ff9800" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', color: '#ffb74d', marginBottom: '16px' }}>
                {result.reason}
              </p>
              <button className="btn btn-secondary" onClick={handleSpin} style={{ width: '100%' }}>
                <RefreshCw size={18} /> Thử lại
              </button>
            </div>
          )}
        </div>
      )}

      {/* Spin trigger button when no result is active */}
      {!result && (
        <div style={{ width: '100%', maxWidth: '420px', marginTop: '20px' }}>
          <button 
            className="btn" 
            onClick={handleSpin}
            disabled={isSpinning}
            style={{ 
              width: '100%', 
              padding: '18px', 
              fontSize: '1.15rem',
              opacity: isSpinning ? 0.7 : 1,
              cursor: isSpinning ? 'not-allowed' : 'pointer'
            }}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="spin-anim" size={22} /> Đang quay món...
              </>
            ) : (
              <>
                <Dna size={22} /> QUAY MÓN & TÌM LÝ DO
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
