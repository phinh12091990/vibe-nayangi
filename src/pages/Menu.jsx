import { useState, useMemo, useEffect, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { 
  Plus, Eye, EyeOff, Search, Trash2, Edit3, X, Check, RotateCcw, 
  UtensilsCrossed, LayoutList, LayoutGrid, Rows3, ArrowUp
} from 'lucide-react';

const COMMON_EMOJIS = ['🍜', '🍲', '🍛', '🍚', '🥖', '🥗', '🐟', '🥩', '🍗', '🥘', '🥣', '🍳', '🥟', '🥪', '🌯', '🥞'];
const NUTRITION_GROUPS = ['Thịt đỏ', 'Thịt trắng', 'Cá', 'Rau củ', 'Tinh bột'];
const COMMON_ALLERGENS = ['Bò', 'Tôm', 'Mực', 'Cua', 'Đậu phộng', 'Trứng', 'Đậu nành', 'Sữa'];

export default function MenuPage() {
  const { foods, addFood, updateFood, deleteFood, resetFoods, toggleFoodStatus } = useStorage();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('ALL');
  const [selectedNutrition, setSelectedNutrition] = useState('ALL');
  const [hideInactive, setHideInactive] = useState(false);

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
    nutrition: 'Thịt đỏ',
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
  const filterKey = `${searchTerm}_${selectedMeal}_${selectedNutrition}_${hideInactive}`;
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
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(query);
        const matchesNutri = (food.nutrition || '').toLowerCase().includes(query);
        const matchesAllergy = (food.allergies || food.allergens || []).some(a => a.toLowerCase().includes(query));
        if (!matchesName && !matchesNutri && !matchesAllergy) return false;
      }
      return true;
    });
  }, [foods, searchTerm, selectedMeal, selectedNutrition, hideInactive]);

  const activeCount = foods.filter(f => !f.hidden).length;
  const displayedFoods = filteredFoods.slice(0, visibleLimit);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      emoji: '🍜',
      nutrition: 'Thịt đỏ',
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
      nutrition: food.nutrition || 'Thịt đỏ',
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
      
      {/* Top Header */}
      <div className="app-header">
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Sổ Món Ăn</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Quản lý thực đơn • {foods.length} món ({activeCount} khả dụng)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px', fontSize: '0.82rem' }} 
            onClick={() => {
              if (window.confirm("Khôi phục danh sách món ăn mẫu (48 món tiêu chuẩn)?")) {
                resetFoods();
              }
            }}
            title="Khôi phục dữ liệu gốc"
          >
            <RotateCcw size={15} /> Mẫu
          </button>

          <button 
            className="btn btn-primary" 
            style={{ padding: '8px 14px', fontSize: '0.85rem' }} 
            onClick={handleOpenAdd}
          >
            <Plus size={16} /> Thêm Món
          </button>
        </div>
      </div>

      {/* STICKY SEARCH & FILTER CONTROLS (Dính cố định khi cuộn) */}
      <div className="sticky-menu-controls">
        
        {/* Search bar & View Mode Toggles */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '9px 36px 9px 38px', fontSize: '0.9rem' }}
              placeholder="Tìm món, nguyên liệu, thịt/rau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* View Mode Switcher Pills */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => handleChangeViewMode('compact')}
              style={{
                background: viewMode === 'compact' ? 'rgba(255, 145, 0, 0.25)' : 'transparent',
                border: 'none',
                color: viewMode === 'compact' ? '#ffa000' : 'var(--text-muted)',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Chế độ danh sách gọn (Tiết kiệm chỗ)"
            >
              <LayoutList size={16} />
            </button>

            <button
              onClick={() => handleChangeViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'rgba(255, 145, 0, 0.25)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#ffa000' : 'var(--text-muted)',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Chế độ lưới 2 cột"
            >
              <LayoutGrid size={16} />
            </button>

            <button
              onClick={() => handleChangeViewMode('cards')}
              style={{
                background: viewMode === 'cards' ? 'rgba(255, 145, 0, 0.25)' : 'transparent',
                border: 'none',
                color: viewMode === 'cards' ? '#ffa000' : 'var(--text-muted)',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Chế độ thẻ chi tiết"
            >
              <Rows3 size={16} />
            </button>
          </div>
        </div>

        {/* Meal Category Filters with Counts */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {[
            { id: 'ALL', label: `Tất cả (${mealCounts.ALL})` },
            { id: 'Sáng', label: `🌅 Sáng (${mealCounts.Sáng})` },
            { id: 'Trưa', label: `☀️ Trưa (${mealCounts.Trưa})` },
            { id: 'Tối', label: `🌙 Tối (${mealCounts.Tối})` }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMeal(m.id)}
              className="glass-pill"
              style={{
                fontSize: '0.82rem',
                padding: '5px 12px',
                background: selectedMeal === m.id ? 'linear-gradient(135deg, #ff5238, #ff9100)' : 'rgba(255,255,255,0.06)',
                color: selectedMeal === m.id ? '#ffffff' : 'var(--text-muted)',
                borderColor: selectedMeal === m.id ? 'transparent' : 'rgba(255,255,255,0.08)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Nutrition Category Filters & Status Toggle */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', alignItems: 'center', scrollbarWidth: 'none' }}>
          {['ALL', ...NUTRITION_GROUPS].map(n => (
            <button
              key={n}
              onClick={() => setSelectedNutrition(n)}
              className="glass-pill"
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                background: selectedNutrition === n ? 'rgba(255, 145, 0, 0.22)' : 'rgba(255,255,255,0.03)',
                color: selectedNutrition === n ? '#ffa000' : 'var(--text-muted)',
                border: selectedNutrition === n ? '1px solid rgba(255, 145, 0, 0.45)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {n === 'ALL' ? 'Tất cả nhóm chất' : n}
            </button>
          ))}

          <button
            onClick={() => setHideInactive(!hideInactive)}
            className="glass-pill"
            style={{
              fontSize: '0.78rem',
              padding: '4px 10px',
              background: hideInactive ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255,255,255,0.03)',
              color: hideInactive ? '#00e676' : 'var(--text-muted)',
              border: hideInactive ? '1px solid rgba(0, 230, 118, 0.5)' : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginLeft: 'auto'
            }}
          >
            {hideInactive ? '✓ Đang bật' : 'Tất cả'}
          </button>
        </div>

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
                    <div className="compact-food-emoji">{food.emoji}</div>
                    
                    <div className="compact-food-info">
                      <div className="compact-food-name" title={food.name}>
                        {food.name}
                      </div>
                      <div className="compact-food-meta">
                        <span className={getNutritionBadgeClass(food.nutrition)} style={{ fontSize: '0.68rem', padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {food.nutrition}
                        </span>
                        <span>{food.categories.join('/')}</span>
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
                      <span style={{ fontSize: '1.9rem' }}>{food.emoji}</span>
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
                      background: food.hidden ? 'rgba(15, 18, 30, 0.4)' : 'var(--glass-card)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div 
                      style={{ 
                        fontSize: '2.2rem', 
                        minWidth: '56px', 
                        height: '56px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        marginRight: '14px'
                      }}
                    >
                      {food.emoji}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 700, color: '#ffffff' }}>
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
                Xem thêm 20 món (còn {filteredFoods.length - visibleLimit})
              </button>
              <button
                className="glass-pill"
                style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={() => setVisibleLimit(filteredFoods.length)}
              >
                Hiển thị tất cả ({filteredFoods.length} món)
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
          title="Cuộn lên đầu trang"
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
                {editingId ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              
              {/* Emoji Picker */}
              <div className="form-group">
                <label className="form-label">Chọn biểu tượng Emoji</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '2rem', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                    {formData.emoji}
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem' }}
                    value={formData.emoji}
                    maxLength={4}
                    onChange={e => setFormData({ ...formData, emoji: e.target.value || '🍲' })}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>hoặc bấm chọn bên dưới:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COMMON_EMOJIS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji: em })}
                      style={{
                        fontSize: '1.3rem',
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: formData.emoji === em ? '2px solid #ff7a18' : '1px solid rgba(255,255,255,0.1)',
                        background: formData.emoji === em ? 'rgba(255,122,24,0.2)' : 'rgba(255,255,255,0.04)',
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
                <label className="form-label">Tên món ăn (*)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ví dụ: Bún chả giò, Bánh mì xíu mại..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Nutrition Group */}
              <div className="form-group">
                <label className="form-label">Nhóm chất dinh dưỡng chính</label>
                <select 
                  className="form-select"
                  value={formData.nutrition}
                  onChange={e => setFormData({ ...formData, nutrition: e.target.value })}
                >
                  {NUTRITION_GROUPS.map(n => (
                    <option key={n} value={n} style={{ background: '#1b1f33', color: '#ffffff' }}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meal Types Selection */}
              <div className="form-group">
                <label className="form-label">Bữa ăn phù hợp</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Sáng', 'Trưa', 'Tối'].map(m => {
                    const checked = formData.categories.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleToggleMealCategory(m)}
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
                        {m === 'Sáng' ? '🌅 Sáng' : m === 'Trưa' ? '☀️ Trưa' : '🌙 Tối'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergens Selection */}
              <div className="form-group">
                <label className="form-label">Nguyên liệu đặc thù / Có thể gây dị ứng</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {COMMON_ALLERGENS.map(al => {
                    const selected = formData.allergies.includes(al);
                    return (
                      <button
                        key={al}
                        type="button"
                        onClick={() => handleToggleAllergyTag(al)}
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
                        {al}
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
                    placeholder="Gõ dị ứng khác..."
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
                    + Thêm
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
                  Huỷ
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                >
                  <Check size={18} /> Lưu Món
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
