import { useState, useMemo } from 'react';
import { useStorage } from '../hooks/useStorage';
import { 
  Plus, Eye, EyeOff, Search, Trash2, Edit3, X, Check, RotateCcw, 
  UtensilsCrossed
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
    <div className="page-container">
      
      {/* Top Header */}
      <div className="app-header">
        <div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Sổ Món Ăn</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Quản lý thực đơn • {foods.length} món ({activeCount} món khả dụng)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '10px 14px', fontSize: '0.85rem' }} 
            onClick={() => {
              if (window.confirm("Khôi phục danh sách món ăn mẫu (48 món tiêu chuẩn)?")) {
                resetFoods();
              }
            }}
            title="Khôi phục dữ liệu gốc"
          >
            <RotateCcw size={16} /> Mẫu
          </button>

          <button 
            className="btn btn-primary" 
            style={{ padding: '10px 16px', fontSize: '0.9rem' }} 
            onClick={handleOpenAdd}
          >
            <Plus size={18} /> Thêm Món
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        
        {/* Search input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '42px', paddingRight: '36px' }}
            placeholder="Tìm theo tên món, nguyên liệu, nhóm chất..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Meal Category Filters */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'ALL', label: 'Tất cả bữa' },
            { id: 'Sáng', label: '🌅 Sáng' },
            { id: 'Trưa', label: '☀️ Trưa' },
            { id: 'Tối', label: '🌙 Tối' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMeal(m.id)}
              className="glass-pill"
              style={{
                background: selectedMeal === m.id ? 'linear-gradient(135deg, #ff5238, #ff9100)' : 'rgba(255,255,255,0.06)',
                color: selectedMeal === m.id ? '#ffffff' : 'var(--text-muted)',
                borderColor: selectedMeal === m.id ? 'transparent' : 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Nutrition Category Filters & Status Filter */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
          {['ALL', ...NUTRITION_GROUPS].map(n => (
            <button
              key={n}
              onClick={() => setSelectedNutrition(n)}
              className="glass-pill"
              style={{
                fontSize: '0.8rem',
                padding: '4px 12px',
                background: selectedNutrition === n ? 'rgba(255, 145, 0, 0.25)' : 'rgba(255,255,255,0.04)',
                color: selectedNutrition === n ? '#ffa000' : 'var(--text-muted)',
                border: selectedNutrition === n ? '1px solid rgba(255, 145, 0, 0.5)' : '1px solid rgba(255,255,255,0.06)',
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
              fontSize: '0.8rem',
              padding: '4px 12px',
              background: hideInactive ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255,255,255,0.04)',
              color: hideInactive ? '#00e676' : 'var(--text-muted)',
              border: hideInactive ? '1px solid rgba(0, 230, 118, 0.5)' : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginLeft: 'auto'
            }}
          >
            {hideInactive ? '✓ Chỉ món đang bật' : 'Tất cả trạng thái'}
          </button>
        </div>

      </div>

      {/* Food Cards List */}
      {filteredFoods.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
          <UtensilsCrossed size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Không tìm thấy món ăn phù hợp</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Hãy thử tìm với từ khoá khác hoặc xoá bộ lọc đang áp dụng.
          </p>
        </div>
      ) : (
        <div className="grid-menu-cards">
          {filteredFoods.map(food => {
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
                {/* Emoji Avatar */}
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

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
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

                {/* Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button 
                    onClick={() => toggleFoodStatus(food.id)}
                    className="btn-icon"
                    style={{ width: '36px', height: '36px' }}
                    title={food.hidden ? "Hiện món này trong vòng quay" : "Ẩn món này khỏi vòng quay"}
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
