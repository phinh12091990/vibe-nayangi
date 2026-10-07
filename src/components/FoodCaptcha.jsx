import { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

const FOOD_ITEMS = [
  { id: 'pho', emoji: '🍜', name: 'Phở bò', color: '#fed7aa' },
  { id: 'sushi', emoji: '🍣', name: 'Sushi cá hồi', color: '#fbcfe8' },
  { id: 'bento', emoji: '🍱', name: 'Cơm Bento', color: '#bbf7d0' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza phô mai', color: '#fef08a' },
  { id: 'steak', emoji: '🥩', name: 'Bò bít tết', color: '#fecdd3' },
  { id: 'salad', emoji: '🥗', name: 'Salad xanh', color: '#c7d2fe' },
  { id: 'avocado', emoji: '🥑', name: 'Trái bơ', color: '#d9f99d' },
  { id: 'banhmi', emoji: '🥖', name: 'Bánh mì', color: '#fed7aa' },
];

function generateCaptchaTiles() {
  // 8 pairs = 16 tiles
  const deck = [];
  FOOD_ITEMS.forEach((food) => {
    deck.push({ ...food, uniqueId: `${food.id}_1` });
    deck.push({ ...food, uniqueId: `${food.id}_2` });
  });
  // Shuffle array
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

  const targetPairs = 1; // 1 pair for quick & delightful user verification!

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

          if (nextCount >= targetPairs) {
            setIsCompleted(true);
            triggerConfetti();
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 800);
          }
        }, 300);
      } else {
        // WRONG MATCH
        setTimeout(() => {
          setWrongTiles([first.uniqueId, second.uniqueId]);
          setTimeout(() => {
            setSelectedTiles([]);
            setWrongTiles([]);
          }, 600);
        }, 400);
      }
    }
  };

  const texts = {
    vi: {
      instruction: `Chọn hai món ăn giống nhau - ${matchedCount}/${targetPairs} cặp`,
      title: 'Xác thực bảo vệ tài khoản',
      success: 'Xác thực thành công!',
      refresh: 'Đổi đề mới',
      themeLight: 'Sáng',
      themeDark: 'Tối',
      tip: 'Nhấn vào 2 ô có cùng món ăn để hoàn tất xác thực'
    },
    en: {
      instruction: `Select two matching foods - ${matchedCount}/${targetPairs} pair`,
      title: 'Human Verification Security',
      success: 'Verified successfully!',
      refresh: 'Refresh',
      themeLight: 'Light',
      themeDark: 'Dark',
      tip: 'Tap 2 tiles with the same food to verify'
    }
  };

  const t = texts[lang] || texts.vi;

  return (
    <div className="food-captcha-overlay" onClick={onClose}>
      <div className="food-captcha-modal" onClick={e => e.stopPropagation()}>
        
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

        {/* Title / Instruction Header */}
        <div className="captcha-instruction-bar">
          <ShieldCheck size={16} color="var(--primary-dark)" />
          <span>{t.instruction}</span>
        </div>

        {/* 4x4 Grid of Cute Food Tiles (Matching Image 5 layout) */}
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
                style={{ backgroundColor: isMatched ? 'rgba(16, 185, 129, 0.2)' : tile.color }}
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
              <CheckCircle2 size={16} color="#10b981" />
              <span>{t.success}</span>
            </div>
          ) : (
            <span className="captcha-tip-text">
              💡 {t.tip}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
