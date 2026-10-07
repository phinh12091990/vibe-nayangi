import { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle2, ShieldCheck, Sun, Moon, Sparkles, Trophy } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

const FOOD_ITEMS = [
  { id: 'pho', nameVi: 'Phở bò tái nạm', nameEn: 'Beef Pho', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80', border: '#f97316' },
  { id: 'sushi', nameVi: 'Sushi cá hồi', nameEn: 'Salmon Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80', border: '#ec4899' },
  { id: 'pizza', nameVi: 'Pizza nướng phô mai', nameEn: 'Cheese Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80', border: '#eab308' },
  { id: 'burger', nameVi: 'Burger bò phô mai', nameEn: 'Cheeseburger', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80', border: '#84cc16' },
  { id: 'steak', nameVi: 'Bò bít tết áp chảo', nameEn: 'Beef Steak', image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80', border: '#f43f5e' },
  { id: 'salad', nameVi: 'Salad rau củ tươi', nameEn: 'Fresh Salad', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=400&q=80', border: '#10b981' },
  { id: 'banhmi', nameVi: 'Bánh mì giòn', nameEn: 'Crispy Baguette', image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=400&q=80', border: '#ea580c' },
  { id: 'pasta', nameVi: 'Mì Ý sốt cà chua', nameEn: 'Pasta Spaghetti', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80', border: '#6366f1' },
];

const TOTAL_PAIRS = 8; // Bắt buộc ghép đúng đủ tất cả 8/8 cặp mới mở khoá!

function generateCaptchaTiles() {
  // 8 pairs = 16 tiles
  const deck = [];
  FOOD_ITEMS.forEach((food) => {
    deck.push({ ...food, uniqueId: `${food.id}_1` });
    deck.push({ ...food, uniqueId: `${food.id}_2` });
  });
  // Shuffle array thoroughly
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function FoodCaptcha({ onSuccess, onClose, theme, toggleTheme, lang: parentLang = 'vi', onLangChange }) {
  const [tiles, setTiles] = useState(generateCaptchaTiles);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [wrongTiles, setWrongTiles] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lang, setLang] = useState(parentLang);

  useEffect(() => {
    if (parentLang) setLang(parentLang);
  }, [parentLang]);

  const handleLangToggle = (newLang) => {
    setLang(newLang);
    if (onLangChange) onLangChange(newLang);
  };

  const handleReset = () => {
    setTiles(generateCaptchaTiles());
    setSelectedTiles([]);
    setMatchedIds(new Set());
    setWrongTiles([]);
    setMatchedCount(0);
    setIsCompleted(false);
  };

  const handleTileClick = (tile) => {
    if (isCompleted) return;
    if (matchedIds.has(tile.id)) return;
    if (selectedTiles.some(t => t.uniqueId === tile.uniqueId)) return;
    if (selectedTiles.length >= 2) return;

    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.id === second.id) {
        // MATCH!
        setTimeout(() => {
          setMatchedIds(prev => new Set([...prev, first.id]));
          setSelectedTiles([]);
          const nextCount = matchedCount + 1;
          setMatchedCount(nextCount);

          if (nextCount >= TOTAL_PAIRS) {
            setIsCompleted(true);
            triggerConfetti();
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 900);
          }
        }, 220);
      } else {
        // WRONG MATCH -> rung lắc báo lỗi rồi reset
        setTimeout(() => {
          setWrongTiles([first.uniqueId, second.uniqueId]);
          setTimeout(() => {
            setSelectedTiles([]);
            setWrongTiles([]);
          }, 450);
        }, 320);
      }
    }
  };

  const texts = {
    vi: {
      instruction: `Chọn hai món ăn giống nhau - ${matchedCount}/${TOTAL_PAIRS} cặp`,
      title: 'Xác thực bảo vệ tài khoản',
      success: '🎉 Đã ghép đủ 8/8 cặp! Mở khoá thành công...',
      refresh: 'Đổi đề mới',
      themeLight: 'Sáng',
      themeDark: 'Tối',
      tip: `Ghép đúng tất cả ${TOTAL_PAIRS} cặp món ăn để xác thực người dùng thật`,
      allDone: 'ĐÃ HOÀN TẤT!'
    },
    en: {
      instruction: `Match identical foods - ${matchedCount}/${TOTAL_PAIRS} pairs`,
      title: 'Human Verification Security',
      success: '🎉 All 8/8 pairs matched! Unlocked successfully...',
      refresh: 'Refresh',
      themeLight: 'Light',
      themeDark: 'Dark',
      tip: `Match all ${TOTAL_PAIRS} pairs to unlock access`,
      allDone: 'ALL MATCHED!'
    }
  };

  const t = texts[lang] || texts.vi;
  const progressPercent = Math.round((matchedCount / TOTAL_PAIRS) * 100);

  return (
    <div className="food-captcha-overlay" onClick={onClose}>
      <div className="food-captcha-modal cute-border" onClick={e => e.stopPropagation()}>
        
        {/* Top Control Bar (Pills & Theme Switcher like Image 4 & 5) */}
        <div className="captcha-top-bar">
          <div className="captcha-lang-switch">
            <button 
              type="button" 
              className={`captcha-lang-btn ${lang === 'vi' ? 'active' : ''}`}
              onClick={() => handleLangToggle('vi')}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button 
              type="button" 
              className={`captcha-lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => handleLangToggle('en')}
            >
              🇬🇧 English
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {toggleTheme && (
              <button
                type="button"
                onClick={toggleTheme}
                className="captcha-theme-btn"
                title={lang === 'vi' ? 'Đổi giao diện Sáng / Tối' : 'Toggle Light / Dark mode'}
              >
                {theme === 'light' ? <Sun size={14} color="#ea580c" /> : <Moon size={14} color="#bbf246" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="captcha-icon-btn"
              title={t.refresh}
            >
              <RefreshCw size={14} />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="captcha-icon-btn"
                title={lang === 'vi' ? 'Đóng' : 'Close'}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Title / Instruction Header with Progress Bar */}
        <div className="captcha-instruction-bar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#059669" />
              <span>{t.instruction}</span>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: matchedCount === TOTAL_PAIRS ? '#10b981' : 'var(--text-muted)' }}>
              {progressPercent}%
            </span>
          </div>
          {/* Progress bar line */}
          <div className="captcha-progress-track">
            <div 
              className="captcha-progress-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4x4 Grid of Cute Food Tiles */}
        <div className="captcha-grid-container">
          {tiles.map((tile) => {
            const isSelected = selectedTiles.some(t => t.uniqueId === tile.uniqueId);
            const isMatched = matchedIds.has(tile.id);
            const isWrong = wrongTiles.includes(tile.uniqueId);
            const foodName = lang === 'vi' ? tile.nameVi : tile.nameEn;

            return (
              <button
                key={tile.uniqueId}
                type="button"
                className={`captcha-tile photo-tile ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${isWrong ? 'wrong' : ''}`}
                style={{ 
                  borderColor: isSelected ? '#f59e0b' : isMatched ? '#10b981' : 'rgba(255, 255, 255, 0.14)',
                  boxShadow: isSelected 
                    ? '0 0 20px rgba(245, 158, 11, 0.75)' 
                    : isMatched 
                      ? '0 0 16px rgba(16, 185, 129, 0.5)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}
                onClick={() => handleTileClick(tile)}
                disabled={isMatched || isCompleted}
                title={foodName}
              >
                <img 
                  src={tile.image} 
                  alt="" 
                  className="captcha-tile-img" 
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
                <div 
                  className="captcha-fallback-icon"
                  style={{ 
                    display: 'none', 
                    width: '100%', 
                    height: '100%', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    background: 'var(--bg-surface-secondary)'
                  }}
                >
                  🍲
                </div>
                {isMatched && (
                  <span className="captcha-tile-check">
                    <CheckCircle2 size={18} color="#059669" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status / Helper Tip */}
        <div className="captcha-footer-status">
          {isCompleted ? (
            <div className="captcha-success-banner">
              <Trophy size={16} color="#10b981" />
              <span>{t.success}</span>
            </div>
          ) : (
            <span className="captcha-tip-text">
              ✨ {t.tip}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
