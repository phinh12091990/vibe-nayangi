import { useState, useMemo, useEffect, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { translations } from '../utils/i18n';
import FoodMedia from '../components/FoodMedia';
import { 
  Plus, Eye, EyeOff, Search, Trash2, Edit3, X, Check, RotateCcw, 
  UtensilsCrossed, LayoutList, LayoutGrid, Rows3, ArrowUp, Image as ImageIcon,
  SlidersHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';

const COMMON_EMOJIS = ['🍜', '🍲', '🍛', '🍚', '🥖', '🥗', '🐟', '🥩', '🍗', '🥘', '🥣', '🍳', '🥟', '🥪', '🌯', '🥞'];
const NUTRITION_GROUPS = ['Thịt đỏ', 'Thịt trắng', 'Cá', 'Rau củ', 'Tinh bột'];
const COMMON_ALLERGENS = ['Bò', 'Tôm', 'Mực', 'Cua', 'Đậu phộng', 'Trứng', 'Đậu nành', 'Sữa'];

const PRESET_FOOD_IMAGES = [
  { label: 'Phở bò', url: 'https://images.unsplash.com/photo-1503764654157-727105533973?auto=format&fit=crop&w=400&q=80', emoji: '🍜' },
  { label: 'Bún bò Huế', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80', emoji: '🍲' },
  { label: 'Cơm tấm', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80', emoji: '🍛' },
  { label: 'Bánh mì', url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=400&q=80', emoji: '🥖' },
  { label: 'Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80', emoji: '🥗' },
  { label: 'Cơm gà', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80', emoji: '🍗' },
  { label: 'Cá hồi', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80', emoji: '🐟' },
  { label: 'Gỏi cuốn', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', emoji: '🌯' },
  { label: 'Bò bít tết', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80', emoji: '🥩' },
  { label: 'Cơm chiên', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80', emoji: '🍚' },
  { label: 'Bánh xèo', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80', emoji: '🥞' },
  { label: 'Lẩu', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80', emoji: '🥘' }
];

export default function MenuPage() {
  const { foods, addFood, updateFood, deleteFood, resetFoods, toggleFoodStatus, lang = 'vi' } = useStorage();
  const t = translations[lang] || translations.vi;

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('ALL');
  const [selectedNutrition, setSelectedNutrition] = useState('ALL');
  const [selectedPriceTier, setSelectedPriceTier] = useState('ALL');
  const [hideInactive, setHideInactive] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // View Mode: 'compact' (siêu gọn ~48px) | 'grid' (lưới 2 cột mini) | 'cards' (thẻ lớn)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('menu_view_mode') || 'compact';
  });

  // Pagination / Display limit to avoid infinite scrolling
  const [visibleLimit, setVisibleLimit] = useState(20);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🍜',
    image: '',
    nutrition: 'Thịt đỏ',
    priceTier: 'standard',
    categories: ['Trưa', 'Tối'],
    allergies: []
  });

  const [customAllergy, setCustomAllergy] = useState('');

  // Persist viewMode
  const handleChangeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('menu_view_mode', mode);
  };

  // Scroll listener for Back to Top FAB
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || (containerRef.current?.scrollTop || 0);
      setShowScrollTop(scrollPos > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const cont = containerRef.current;
    if (cont) cont.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (cont) cont.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset limit when filters change during render
  const filterKey = `${searchTerm}_${selectedMeal}_${selectedNutrition}_${selectedPriceTier}_${hideInactive}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleLimit(20);
  }

  // Counts per meal for quick sub-tabs
  const mealCounts = useMemo(() => ({
    ALL: foods.length,
    Sáng: foods.filter(f => f.categories.includes('Sáng')).length,
    Trưa: foods.filter(f => f.categories.includes('Trưa')).length,
    Tối: foods.filter(f => f.categories.includes('Tối')).length
  }), [foods]);

  // Filter logic
  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      if (hideInactive && food.hidden) return false;
      if (selectedMeal !== 'ALL' && !food.categories.includes(selectedMeal)) return false;
      if (selectedNutrition !== 'ALL' && food.nutrition !== selectedNutrition) return false;
      if (selectedPriceTier !== 'ALL' && food.priceTier !== selectedPriceTier) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(query);
        const matchesNutri = (food.nutrition || '').toLowerCase().includes(query);
        const matchesAllergy = (food.allergies || food.allergens || []).some(a => a.toLowerCase().includes(query));
        if (!matchesName && !matchesNutri && !matchesAllergy) return false;
      }
      return true;
    });
  }, [foods, searchTerm, selectedMeal, selectedNutrition, selectedPriceTier, hideInactive]);

  const activeCount = foods.filter(f => !f.hidden).length;
  const displayedFoods = filteredFoods.slice(0, visibleLimit);

  // Secondary filters (Price, Nutrition, Inactive) that can be tucked into the drawer
  const secondaryFilterCount = (selectedNutrition !== 'ALL' ? 1 : 0) + 
                               (selectedPriceTier !== 'ALL' ? 1 : 0) + 
                               (hideInactive ? 1 : 0);

  const handleClearSecondaryFilters = () => {
    setSelectedNutrition('ALL');
    setSelectedPriceTier('ALL');
    setHideInactive(false);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      emoji: '🍜',
      image: '',
      nutrition: 'Thịt đỏ',
      priceTier: 'standard',
      categories: ['Trưa', 'Tối'],
      allergies: []
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (food) => {
    setEditingId(food.id);
    setFormData({
      name: food.name,
      emoji: food.emoji || '🍜',
      image: food.image || '',
      nutrition: food.nutrition || 'Thịt đỏ',
      priceTier: food.priceTier || 'standard',
      categories: [...food.categories],
      allergies: [...(food.allergies || food.allergens || [])]
    });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên món ăn!");
      return;
    }
    if (formData.categories.length === 0) {
      alert("Vui lòng chọn ít nhất 1 buổi ăn phù hợp!");
      return;
    }

    if (editingId) {
      updateFood(editingId, formData);
    } else {
      addFood(formData);
    }

    setModalOpen(false);
  };

  const handleToggleMealCategory = (meal) => {
    setFormData(prev => {
      const exists = prev.categories.includes(meal);
      return {
        ...prev,
        categories: exists 
          ? prev.categories.filter(m => m !== meal)
          : [...prev.categories, meal]
      };
    });
  };

  const handleToggleAllergyTag = (tag) => {
    setFormData(prev => {
      const exists = prev.allergies.includes(tag);
      return {
        ...prev,
        allergies: exists 
          ? prev.allergies.filter(t => t !== tag)
          : [...prev.allergies, tag]
      };
    });
  };

  const handleAddCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    const tag = customAllergy.trim();
    if (!formData.allergies.includes(tag)) {
      setFormData(prev => ({ ...prev, allergies: [...prev.allergies, tag] }));
    }
    setCustomAllergy('');
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

  return (
    <div className="page-container" ref={containerRef}>
      
      {/* Top Header (Mobile-First Responsive) */}
      <div className="menu-header-bar">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 className="menu-title-heading">{t.menuTitle}</h2>
            <span className="brand-badge" style={{ fontSize: '0.62rem', padding: '2px 7px', whiteSpace: 'nowrap' }}>
              {foods.length} {lang === 'vi' ? 'món' : 'dishes'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lang === 'vi' ? `Kho thực đơn cá nhân hoá • ${activeCount} khả dụng` : `Personalized meal directory • ${activeCount} active`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }} 
            onClick={() => {
              if (window.confirm(lang === 'vi' ? "Khôi phục danh sách món ăn mẫu (48 món tiêu chuẩn)?" : "Reset to default standard meals (48 dishes)?")) {
                resetFoods();
              }
            }}
            title={t.resetDefault}
          >
            <RotateCcw size={13} />
            <span className="menu-action-label">{lang === 'vi' ? 'Mẫu' : 'Reset'}</span>
          </button>

          <button 
            className="btn btn-primary" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }} 
            onClick={handleOpenAdd}
          >
            <Plus size={15} />
            <span>{t.btnAddDish}</span>
          </button>
        </div>
      </div>

      {/* STICKY SEARCH & FILTER CONTROLS (Tối ưu Mobile: 2 Hàng Tinh Gọn + Ngăn Lọc Mở Rộng) */}
      <div className="sticky-menu-controls">
        
        {/* Hàng 1: Tìm kiếm + Nút Mở Ngăn Lọc + Chuyển Chế Độ Xem */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '8px 30px 8px 32px', fontSize: '0.86rem' }}
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Xoá tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Nút Kích Hoạt Ngăn Bộ Lọc */}
          <button
            type="button"
            onClick={() => setShowFilterDrawer(prev => !prev)}
            className={`btn-filter-trigger ${secondaryFilterCount > 0 ? 'active' : ''}`}
            title={lang === 'vi' ? "Lọc nâng cao theo Giá, Nhóm dưỡng chất & Trạng thái" : "Advanced filter by Price, Nutrition & Status"}
          >
            <SlidersHorizontal size={14} />
            <span className="btn-filter-text">{lang === 'vi' ? 'Lọc' : 'Filters'}</span>
            {secondaryFilterCount > 0 && (
              <span className="filter-badge-pill">{secondaryFilterCount}</span>
            )}
            {showFilterDrawer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* Chuyển Đổi Chế Độ Hiển Thị (Compact / Grid / Cards) */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-color)', flexShrink: 0 }}>
            <button
              onClick={() => handleChangeViewMode('compact')}
              style={{
                background: viewMode === 'compact' ? 'var(--primary)' : 'transparent',
                border: 'none',
                color: viewMode === 'compact' ? 'var(--primary-dark)' : 'var(--text-muted)',
                fontWeight: viewMode === 'compact' ? 800 : 600,
                padding: '5px 7px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={lang === 'vi' ? "Danh sách siêu gọn (Tiết kiệm chỗ)" : "Compact list view"}
            >
              <LayoutList size={15} />
            </button>

            <button
              onClick={() => handleChangeViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? 'var(--primary-dark)' : 'var(--text-muted)',
                fontWeight: viewMode === 'grid' ? 800 : 600,
                padding: '5px 7px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={lang === 'vi' ? "Lưới 2 cột mini" : "2-column grid view"}
            >
              <LayoutGrid size={15} />
            </button>

            <button
              onClick={() => handleChangeViewMode('cards')}
              style={{
                background: viewMode === 'cards' ? 'var(--primary)' : 'transparent',
                border: 'none',
                color: viewMode === 'cards' ? 'var(--primary-dark)' : 'var(--text-muted)',
                fontWeight: viewMode === 'cards' ? 800 : 600,
                padding: '5px 7px',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={lang === 'vi' ? "Thẻ chi tiết lớn" : "Detailed cards view"}
            >
              <Rows3 size={15} />
            </button>
          </div>
        </div>

        {/* Hàng 2: Dải Cuộn Bữa Ăn (Sáng/Trưa/Tối) + Thẻ Lọc Đang Kích Hoạt */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', alignItems: 'center', scrollbarWidth: 'none' }}>
          {[
            { id: 'ALL', label: lang === 'vi' ? `Tất cả (${mealCounts.ALL})` : `All (${mealCounts.ALL})` },
            { id: 'Sáng', label: lang === 'vi' ? `🌅 Sáng (${mealCounts.Sáng})` : `🌅 Breakfast (${mealCounts.Sáng})` },
            { id: 'Trưa', label: lang === 'vi' ? `☀️ Trưa (${mealCounts.Trưa})` : `☀️ Lunch (${mealCounts.Trưa})` },
            { id: 'Tối', label: lang === 'vi' ? `🌙 Tối (${mealCounts.Tối})` : `🌙 Dinner (${mealCounts.Tối})` }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMeal(m.id)}
              className="glass-pill"
              style={{
                fontSize: '0.78rem',
                padding: '5px 12px',
                background: selectedMeal === m.id ? 'var(--primary)' : 'var(--bg-card)',
                color: selectedMeal === m.id ? 'var(--primary-dark)' : 'var(--text-secondary)',
                borderColor: selectedMeal === m.id ? 'var(--primary)' : 'var(--border-color)',
                fontWeight: selectedMeal === m.id ? 800 : 600,
                boxShadow: selectedMeal === m.id ? '0 2px 8px var(--primary-glow)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {m.label}
            </button>
          ))}

          {/* Quick Clearable Secondary Filter Chips in Ribbon */}
          {selectedPriceTier !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedPriceTier('ALL')}
              className="active-filter-chip"
              title={lang === 'vi' ? "Bỏ lọc mức giá" : "Clear price filter"}
            >
              <span>{selectedPriceTier === 'budget' ? '💰 <45k' : selectedPriceTier === 'treat' ? '🥩 >75k' : '🍛 45-75k'}</span>
              <X size={12} />
            </button>
          )}

          {selectedNutrition !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedNutrition('ALL')}
              className="active-filter-chip"
              title={lang === 'vi' ? "Bỏ lọc nhóm dưỡng chất" : "Clear nutrition filter"}
            >
              <span>🥗 {selectedNutrition}</span>
              <X size={12} />
            </button>
          )}

          {hideInactive && (
            <button
              type="button"
              onClick={() => setHideInactive(false)}
              className="active-filter-chip"
              title="Bỏ lọc trạng thái"
            >
              <span>✓ Chỉ món bật</span>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Ngăn Bộ Lọc Nâng Cao (Expandable Drawer / Accordion Panel) */}
        {showFilterDrawer && (
          <div className="menu-filter-drawer-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} color="var(--primary-dark)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {lang === 'vi' ? 'Bộ Lọc Nâng Cao' : 'Advanced Filters'}
                </span>
              </div>
              {secondaryFilterCount > 0 && (
                <button 
                  type="button"
                  onClick={handleClearSecondaryFilters}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                >
                  {lang === 'vi' ? `Xoá lọc (${secondaryFilterCount})` : `Clear filters (${secondaryFilterCount})`}
                </button>
              )}
            </div>

            {/* Mức Giá */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                {lang === 'vi' ? 'Mức giá ngân sách:' : 'Budget price tier:'}
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: lang === 'vi' ? 'Tất cả mức giá' : 'All prices' },
                  { id: 'budget', label: lang === 'vi' ? '💰 Bình dân (<45k)' : '💰 Budget (<$2)' },
                  { id: 'standard', label: lang === 'vi' ? '🍛 Tiêu chuẩn (45k-75k)' : '🍛 Standard ($2-$3.5)' },
                  { id: 'treat', label: lang === 'vi' ? '🥩 Thưởng nóng (>75k)' : '🥩 Treat (>$3.5)' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriceTier(p.id)}
                    className="drawer-pill"
                    style={{
                      background: selectedPriceTier === p.id ? 'var(--accent-mint-light)' : 'var(--bg-surface)',
                      color: selectedPriceTier === p.id ? '#059669' : 'var(--text-secondary)',
                      borderColor: selectedPriceTier === p.id ? '#10b981' : 'var(--border-color)',
                      fontWeight: selectedPriceTier === p.id ? 700 : 500
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nhóm Dinh Dưỡng */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                {lang === 'vi' ? 'Nhóm chất chính:' : 'Nutritional group:'}
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {['ALL', ...NUTRITION_GROUPS].map(n => {
                  const label = n === 'ALL' 
                    ? (lang === 'vi' ? 'Tất cả nhóm chất' : 'All groups') 
                    : (lang === 'vi' ? n : (n === 'Thịt đỏ' ? 'Red Meat' : n === 'Thịt trắng' ? 'Poultry' : n === 'Cá' ? 'Seafood' : n === 'Rau củ' ? 'Veggies' : 'Carbs'));
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedNutrition(n)}
                      className="drawer-pill"
                      style={{
                        background: selectedNutrition === n ? 'var(--primary-light)' : 'var(--bg-surface)',
                        color: selectedNutrition === n ? 'var(--text-main)' : 'var(--text-secondary)',
                        borderColor: selectedNutrition === n ? 'var(--primary)' : 'var(--border-color)',
                        fontWeight: selectedNutrition === n ? 700 : 500
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trạng Thái Ẩn/Hiện */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {lang === 'vi' ? 'Ẩn các món tạm tắt khỏi danh sách' : 'Hide inactive dishes from list'}
              </span>
              <button
                type="button"
                onClick={() => setHideInactive(!hideInactive)}
                className="drawer-pill"
                style={{
                  background: hideInactive ? 'var(--accent-mint-light)' : 'var(--bg-surface)',
                  color: hideInactive ? '#059669' : 'var(--text-muted)',
                  borderColor: hideInactive ? '#10b981' : 'var(--border-color)',
                  fontWeight: 700
                }}
              >
                {hideInactive 
                  ? (lang === 'vi' ? '✓ Đang ẩn món tắt' : '✓ Hiding inactive') 
                  : (lang === 'vi' ? '○ Hiển thị tất cả' : '○ Show all')}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RENDER LIST ACCORDING TO VIEW MODE */}
      {filteredFoods.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
          <UtensilsCrossed size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Không tìm thấy món ăn phù hợp</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Hãy thử tìm với từ khoá khác hoặc xoá bộ lọc đang áp dụng.
          </p>
        </div>
      ) : (
        <>
          {/* 1. COMPACT LIST VIEW (~48px height per dish - 65% height reduction on mobile) */}
          {viewMode === 'compact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {displayedFoods.map(food => {
                const allergens = food.allergies || food.allergens || [];
                return (
                  <div 
                    key={food.id}
                    className="compact-food-item"
                    style={{ opacity: food.hidden ? 0.45 : 1 }}
                  >
                    <FoodMedia food={food} size="sm" showBadge />
                    
                    <div className="compact-food-info">
                      <div className="compact-food-name" title={food.name}>
                        {food.name}
                      </div>
                      <div className="compact-food-meta">
                        <span className={getNutritionBadgeClass(food.nutrition)} style={{ fontSize: '0.68rem', padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {food.nutrition}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: food.priceTier === 'budget' ? '#10b981' : food.priceTier === 'treat' ? '#ec4899' : '#38bdf8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {food.priceTier === 'budget' ? '💰 <45k' : food.priceTier === 'treat' ? '🥩 >75k' : '🍛 45-75k'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          • {food.categories.join('/')}
                        </span>
                        {allergens.length > 0 && (
                          <span style={{ color: '#f87171', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={allergens.join(', ')}>
                            • ⚠️ {allergens.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <button 
                        onClick={() => toggleFoodStatus(food.id)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title={food.hidden ? "Hiện món" : "Ẩn món"}
                      >
                        {food.hidden ? <EyeOff size={15} color="var(--text-dim)" /> : <Eye size={15} color="#00e676" />}
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(food)}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title="Sửa món"
                      >
                        <Edit3 size={14} color="var(--text-secondary)" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Xoá món "${food.name}"?`)) deleteFood(food.id);
                        }}
                        className="btn-icon"
                        style={{ width: '30px', height: '30px' }}
                        title="Xoá món"
                      >
                        <Trash2 size={14} color="#f87171" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. 2-COLUMN GRID VIEW (50% height reduction on mobile) */}
          {viewMode === 'grid' && (
            <div className="mobile-grid-2col">
              {displayedFoods.map(food => {
                const allergens = food.allergies || food.allergens || [];
                return (
                  <div 
                    key={food.id}
                    className="grid-card-item"
                    style={{ opacity: food.hidden ? 0.45 : 1 }}
                  >
                    <div className="grid-card-top">
                      <FoodMedia food={food} size="md" showBadge />
                      <button 
                        onClick={() => toggleFoodStatus(food.id)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title={food.hidden ? "Hiện món" : "Ẩn món"}
                      >
                        {food.hidden ? <EyeOff size={14} color="var(--text-dim)" /> : <Eye size={14} color="#00e676" />}
                      </button>
                    </div>

                    <div className="grid-card-name">{food.name}</div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <span className={getNutritionBadgeClass(food.nutrition)} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {food.nutrition}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {food.categories.join('/')}
                      </span>
                    </div>

                    {allergens.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#f87171', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        ⚠️ {allergens.join(', ')}
                      </div>
                    )}

                    <div className="grid-card-footer">
                      <button 
                        onClick={() => handleOpenEdit(food)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Sửa món"
                      >
                        <Edit3 size={13} color="var(--text-secondary)" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Xoá món "${food.name}"?`)) deleteFood(food.id);
                        }}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Xoá món"
                      >
                        <Trash2 size={13} color="#f87171" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. DEFAULT FULL CARD VIEW */}
          {viewMode === 'cards' && (
            <div className="grid-menu-cards">
              {displayedFoods.map(food => {
                const allergens = food.allergies || food.allergens || [];
                return (
                  <div 
                    key={food.id} 
                    className="glass-panel" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '14px 18px', 
                      opacity: food.hidden ? 0.45 : 1,
                      background: food.hidden ? 'rgba(15, 18, 30, 0.4)' : 'var(--bg-card)',
                      transition: 'all 0.2s ease',
                      gap: '14px'
                    }}
                  >
                    <FoodMedia food={food} size="lg" showBadge />

                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {food.name}
                        </h3>
                        <span className={getNutritionBadgeClass(food.nutrition)}>
                          {food.nutrition}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Buổi: {food.categories.join(', ')}</span>
                        {allergens.length > 0 && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#f87171' }}>Dị ứng: {allergens.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button 
                        onClick={() => toggleFoodStatus(food.id)}
                        className="btn-icon"
                        style={{ width: '36px', height: '36px' }}
                        title={food.hidden ? "Hiện món" : "Ẩn món"}
                      >
                        {food.hidden ? <EyeOff size={18} color="var(--text-dim)" /> : <Eye size={18} color="#00e676" />}
                      </button>

                      <button 
                        onClick={() => handleOpenEdit(food)}
                        className="btn-icon"
                        style={{ width: '36px', height: '36px' }}
                        title="Chỉnh sửa món"
                      >
                        <Edit3 size={17} color="var(--text-secondary)" />
                      </button>

                      <button 
                        onClick={() => {
                          if (window.confirm(`Xoá món "${food.name}" khỏi thực đơn?`)) {
                            deleteFood(food.id);
                          }
                        }}
                        className="btn-icon"
                        style={{ width: '36px', height: '36px' }}
                        title="Xoá món"
                      >
                        <Trash2 size={17} color="#f87171" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination / Load More Button */}
          {filteredFoods.length > visibleLimit && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '18px', paddingBottom: '32px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', maxWidth: '320px', padding: '12px 20px', fontSize: '0.92rem' }}
                onClick={() => setVisibleLimit(prev => prev + 20)}
              >
                {lang === 'vi' 
                  ? `Xem thêm 20 món (còn ${filteredFoods.length - visibleLimit})` 
                  : `Load 20 more dishes (${filteredFoods.length - visibleLimit} left)`}
              </button>
              <button
                className="glass-pill"
                style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={() => setVisibleLimit(filteredFoods.length)}
              >
                {lang === 'vi' 
                  ? `Hiển thị tất cả (${filteredFoods.length} món)` 
                  : `Show all (${filteredFoods.length} dishes)`}
              </button>
            </div>
          )}

        </>
      )}

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-top-fab"
          onClick={scrollToTop}
          title={lang === 'vi' ? "Cuộn lên đầu trang" : "Scroll to top"}
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Add / Edit Dish Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {editingId 
                  ? (lang === 'vi' ? 'Chỉnh Sửa Món Ăn' : 'Edit Meal') 
                  : (lang === 'vi' ? 'Thêm Món Mới' : 'Add New Meal')}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              
              {/* Food Media Preview & Custom Image / Preset */}
              <div className="form-group" style={{ background: 'var(--bg-surface-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                  <FoodMedia food={formData} size="lg" showBadge />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label className="form-label" style={{ margin: '0 0 4px 0', fontSize: '0.82rem' }}>
                      {lang === 'vi' ? 'Hình ảnh món ăn (URL hoặc chọn sẵn)' : 'Meal Image (URL or preset)'}
                    </label>
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder={lang === 'vi' ? "Dán link ảnh online (https://...)..." : "Paste image URL (https://...)..."}
                      value={formData.image || ''}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    />
                    {formData.image && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, image: '' })}
                        style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', padding: 0, marginTop: '3px' }}
                      >
                        {lang === 'vi' ? '✕ Xoá ảnh, dùng icon emoji' : '✕ Remove image, use emoji'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Presets */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {lang === 'vi' ? 'Gợi ý ảnh chụp món ăn chuẩn đẹp:' : 'Photography presets:'}
                </div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                  {PRESET_FOOD_IMAGES.map(pre => (
                    <button
                      key={pre.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: pre.url, emoji: pre.emoji })}
                      className="glass-pill"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.73rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        background: formData.image === pre.url ? 'var(--primary)' : 'var(--bg-card)',
                        color: formData.image === pre.url ? 'var(--primary-dark)' : 'var(--text-secondary)',
                        borderColor: formData.image === pre.url ? 'var(--primary)' : 'var(--border-color)',
                        fontWeight: formData.image === pre.url ? 800 : 600
                      }}
                    >
                      <span>{pre.emoji}</span> {pre.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji Picker fallback */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  {lang === 'vi' ? 'Biểu tượng Emoji phụ trợ' : 'Fallback Emoji icon'}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COMMON_EMOJIS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji: em })}
                      style={{
                        fontSize: '1.2rem',
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: formData.emoji === em ? '2px solid #ff7a18' : '1px solid var(--border-color)',
                        background: formData.emoji === em ? 'rgba(255,122,24,0.2)' : 'var(--bg-surface-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dish Name */}
              <div className="form-group">
                <label className="form-label">{lang === 'vi' ? 'Tên món ăn (*)' : 'Meal Name (*)'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={lang === 'vi' ? "Ví dụ: Bún chả giò, Bánh mì xíu mại..." : "E.g. Grilled beef salad, Pho noodle..."}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Price Tier & Nutrition in 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'vi' ? 'Phân khúc giá' : 'Price tier'}</label>
                  <select 
                    className="form-select"
                    value={formData.priceTier || 'standard'}
                    onChange={e => setFormData({ ...formData, priceTier: e.target.value })}
                  >
                    <option value="budget" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                      {lang === 'vi' ? '💰 Bình dân (<45k)' : '💰 Budget (<$2)'}
                    </option>
                    <option value="standard" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                      {lang === 'vi' ? '🍛 Tiêu chuẩn (45k-75k)' : '🍛 Standard ($2-$3.5)'}
                    </option>
                    <option value="treat" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                      {lang === 'vi' ? '🥩 Thưởng nóng (>75k)' : '🥩 Treat (>$3.5)'}
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'vi' ? 'Nhóm chất chính' : 'Nutrient group'}</label>
                  <select 
                    className="form-select"
                    value={formData.nutrition}
                    onChange={e => setFormData({ ...formData, nutrition: e.target.value })}
                  >
                    {NUTRITION_GROUPS.map(n => {
                      const label = lang === 'vi' ? n : (n === 'Thịt đỏ' ? 'Red Meat' : n === 'Thịt trắng' ? 'Poultry' : n === 'Cá' ? 'Seafood' : n === 'Rau củ' ? 'Vegetables' : 'Carbs');
                      return (
                        <option key={n} value={n} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Meal Types Selection */}
              <div className="form-group">
                <label className="form-label">{lang === 'vi' ? 'Bữa ăn phù hợp' : 'Suitable Meal Times'}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'Sáng', vi: '🌅 Sáng', en: '🌅 Breakfast' },
                    { id: 'Trưa', vi: '☀️ Trưa', en: '☀️ Lunch' },
                    { id: 'Tối', vi: '🌙 Tối', en: '🌙 Dinner' }
                  ].map(m => {
                    const checked = formData.categories.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMealCategory(m.id)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          border: checked ? '1px solid #ff7a18' : '1px solid rgba(255,255,255,0.12)',
                          background: checked ? 'rgba(255,122,24,0.2)' : 'rgba(255,255,255,0.04)',
                          color: checked ? '#ffb74d' : 'var(--text-muted)',
                          fontWeight: checked ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {lang === 'vi' ? m.vi : m.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergens Selection */}
              <div className="form-group">
                <label className="form-label">{lang === 'vi' ? 'Nguyên liệu đặc thù / Có thể gây dị ứng' : 'Allergens & Ingredients'}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {[
                    { id: 'Bò', vi: 'Bò', en: 'Beef' },
                    { id: 'Tôm', vi: 'Tôm', en: 'Shrimp' },
                    { id: 'Mực', vi: 'Mực', en: 'Squid' },
                    { id: 'Cua', vi: 'Cua', en: 'Crab' },
                    { id: 'Đậu phộng', vi: 'Đậu phộng', en: 'Peanuts' },
                    { id: 'Trứng', vi: 'Trứng', en: 'Eggs' },
                    { id: 'Đậu nành', vi: 'Đậu nành', en: 'Soy' },
                    { id: 'Sữa', vi: 'Sữa', en: 'Dairy' }
                  ].map(al => {
                    const selected = formData.allergies.includes(al.id);
                    return (
                      <button
                        key={al.id}
                        type="button"
                        onClick={() => handleToggleAllergyTag(al.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          border: selected ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                          background: selected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.04)',
                          color: selected ? '#fca5a5' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {lang === 'vi' ? al.vi : al.en}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Allergen input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder={lang === 'vi' ? "Gõ dị ứng khác..." : "Type custom allergen..."}
                    value={customAllergy}
                    onChange={e => setCustomAllergy(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAllergy(); } }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                    onClick={handleAddCustomAllergy}
                  >
                    + {lang === 'vi' ? 'Thêm' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => setModalOpen(false)}
                >
                  {lang === 'vi' ? 'Huỷ' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                >
                  <Check size={18} /> {lang === 'vi' ? 'Lưu Món' : 'Save Dish'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
