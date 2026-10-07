import { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle2, ShieldCheck, Sun, Moon, Sparkles, Trophy } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

const FOOD_ITEMS = [
  { id: 'pho', emoji: '🍜', name: 'Phở bò', color: '#fed7aa', border: '#fb923c' },
  { id: 'sushi', emoji: '🍣', name: 'Sushi cá hồi', color: '#fbcfe8', border: '#f472b6' },
  { id: 'bento', emoji: '🍱', name: 'Cơm Bento', color: '#bbf7d0', border: '#4ade80' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza phô mai', color: '#fef08a', border: '#facc15' },
  { id: 'steak', emoji: '🥩', name: 'Bò bít tết', color: '#fecdd3', border: '#fb7185' },
  { id: 'salad', emoji: '🥗', name: 'Salad xanh', color: '#c7d2fe', border: '#818cf8' },
  { id: 'avocado', emoji: '🥑', name: 'Trái bơ', color: '#d9f99d', border: '#a3e635' },
  { id: 'banhmi', emoji: '🥖', name: 'Bánh mì', color: '#fed7aa', border: '#f97316' },
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

export default function FoodCaptcha({ onSuccess, onClose, theme, toggleTheme }) {
  const [tiles, setTiles] = useState(generateCaptchaTiles);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [wrongTiles, setWrongTiles] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lang, setLang] = useState('vi'); // 'vi' | 'en'

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
              onClick={() => setLang('vi')}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button 
              type="button"
              className={`captcha-lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
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
                title="Đổi giao diện Sáng / Tối"
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
                title="Đóng"
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

        {/* 4x4 Grid of Cute Food Tiles (Matching Image 5 layout: pastel colors & cute frame) */}
        <div className="captcha-grid-container">
          {tiles.map((tile) => {
            const isSelected = selectedTiles.some(t => t.uniqueId === tile.uniqueId);
            const isMatched = matchedIds.has(tile.id);
            const isWrong = wrongTiles.includes(tile.uniqueId);

            return (
              <button
                key={tile.uniqueId}
                type="button"
                className={`captcha-tile ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${isWrong ? 'wrong' : ''}`}
                style={{ 
                  backgroundColor: isMatched ? 'rgba(16, 185, 129, 0.18)' : tile.color,
                  borderColor: isSelected ? '#f59e0b' : isMatched ? '#10b981' : tile.border 
                }}
                onClick={() => handleTileClick(tile)}
                disabled={isMatched || isCompleted}
                title={tile.name}
              >
                <span className="captcha-tile-emoji">{tile.emoji}</span>
                {isMatched && (
                  <span className="captcha-tile-check">
                    <CheckCircle2 size={16} color="#059669" />
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
