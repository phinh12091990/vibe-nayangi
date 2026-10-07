import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage, calculateBMI } from '../hooks/useStorage';
import { translations } from '../utils/i18n';
import FoodMedia from '../components/FoodMedia';
import { 
  ShieldAlert, Activity, AlertTriangle, CheckCircle2, 
  Trash2, Plus, Clock, Utensils, Sparkles, Heart, User, UserPlus
} from 'lucide-react';

const COMMON_ALLERGIES_MAP = [
  { id: 'Bò', vi: 'Bò', en: 'Beef' },
  { id: 'Tôm', vi: 'Tôm', en: 'Shrimp' },
  { id: 'Mực', vi: 'Mực', en: 'Squid' },
  { id: 'Cua', vi: 'Cua', en: 'Crab' },
  { id: 'Đậu phộng', vi: 'Đậu phộng', en: 'Peanuts' },
  { id: 'Trứng', vi: 'Trứng', en: 'Eggs' },
  { id: 'Đậu nành', vi: 'Đậu nành', en: 'Soy' },
  { id: 'Sữa', vi: 'Sữa', en: 'Dairy' }
];

export default function HistoryPage({ onOpenProfile, onOpenCreateAccount, onOpenSwitchAccount }) {
  const navigate = useNavigate();
  const { history, foods, allergies, toggleAllergy, deleteHistoryItem, clearHistory, profile, lang = 'vi' } = useStorage();
  const t = translations[lang] || translations.vi;
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const displayHistory = useMemo(() => [...history].reverse(), [history]);
  const bmiInfo = calculateBMI(Number(profile.weight), Number(profile.height));

  const localizedBmiStatus = useMemo(() => {
    if (lang === 'vi') return bmiInfo.status;
    const v = bmiInfo.bmi;
    if (v < 18.5) return 'Underweight';
    if (v < 23) return 'Optimal / Normal';
    if (v < 25) return 'Pre-overweight';
    return 'Overweight';
  }, [bmiInfo, lang]);

  const localizedGoal = useMemo(() => {
    const g = profile.goal;
    if (lang === 'vi') return g || 'Cân bằng';
    if (g === 'Giảm cân') return 'Fat Loss';
    if (g === 'Tăng cân') return 'Weight Gain';
    if (g === 'Tăng cơ') return 'Muscle Gain';
    if (g === 'Thanh lọc') return 'Detox';
    return 'Balanced';
  }, [profile.goal, lang]);

  // Compute nutritional statistics from recent history (last 7 meals)
  const stats = useMemo(() => {
    const recent = history.slice(-7);
    const total = recent.length;
    
    const counts = {
      'Thịt đỏ': 0,
      'Thịt trắng': 0,
      'Cá': 0,
      'Rau củ': 0,
      'Tinh bột': 0
    };

    recent.forEach(h => {
      const food = foods.find(f => f.id === h.foodId);
      if (food && food.nutrition && counts[food.nutrition] !== undefined) {
        counts[food.nutrition] += 1;
      }
    });

    const missingVeggie = total >= 3 && counts['Rau củ'] === 0;
    const missingFish = total >= 4 && counts['Cá'] === 0;
    const tooMuchRedMeat = total >= 3 && counts['Thịt đỏ'] >= 3;

    // Variety score calculation
    const distinctNutri = Object.values(counts).filter(c => c > 0).length;
    let score = 50;
    if (total > 0) {
      score = Math.min(100, Math.round((distinctNutri / 4) * 60 + (counts['Rau củ'] > 0 ? 20 : 0) + (counts['Cá'] > 0 ? 20 : 0)));
    }

    return {
      total,
      counts,
      missingVeggie,
      missingFish,
      tooMuchRedMeat,
      score
    };
  }, [history, foods]);

  const handleAddCustomAllergy = () => {
    if (!customAllergyInput.trim()) return;
    const val = customAllergyInput.trim();
    if (!allergies.includes(val)) {
      toggleAllergy(val);
    }
    setCustomAllergyInput('');
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

  const getNutritionLabel = (nutrition) => {
    if (lang === 'vi') return nutrition;
    switch (nutrition) {
      case 'Thịt đỏ': return 'Red Meat';
      case 'Thịt trắng': return 'Poultry';
      case 'Cá': return 'Fish & Seafood';
      case 'Rau củ': return 'Vegetables';
      case 'Tinh bột': return 'Carbs';
      default: return nutrition;
    }
  };

  return (
    <div className="page-container">
      
      {/* Top Header */}
      <div className="app-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>
              {lang === 'vi' ? 'Nhật Ký & Thống Kê Dinh Dưỡng' : 'Nutrition Log & Analytics'}
            </h2>
            <span className="brand-badge">
              {lang === 'vi' ? 'TRỢ LÝ BỮA ĂN • AI' : 'AI MEAL ASSISTANT'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            {lang === 'vi' 
              ? 'Theo dõi dinh dưỡng 7 bữa gần nhất & quản lý thể trạng cá nhân' 
              : 'Track nutritional balance over recent meals & manage personal health metrics'}
          </p>
        </div>

        {history.length > 0 && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 14px', fontSize: '0.8rem', color: '#f87171' }}
            onClick={() => {
              const confirmMsg = lang === 'vi' 
                ? "Bạn có chắc chắn muốn xoá toàn bộ lịch sử ăn uống?" 
                : "Are you sure you want to clear your entire meal history?";
              if (window.confirm(confirmMsg)) {
                clearHistory();
              }
            }}
          >
            <Trash2 size={15} /> {lang === 'vi' ? 'Xoá tất cả' : 'Clear all'}
          </button>
        )}
      </div>

      {/* DUAL COLUMN RESPONSIVE GRID (DESKTOP & MOBILE) */}
      <div className="grid-desktop-2col">
        
        {/* ================= LEFT COLUMN: INSIGHTS, PROFILE & ALLERGIES ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* SECTION 1: NUTRITIONAL INSIGHTS & HEALTH ALERTS */}
          <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#ff9100" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {lang === 'vi' ? 'Dinh Dưỡng 7 Bữa Gần Nhất' : 'Recent 7-Meal Nutrition Balance'}
                </h3>
              </div>
              {stats.total > 0 && (
                <span className="glass-pill" style={{ color: stats.score >= 70 ? '#4ade80' : '#ffa000', borderColor: stats.score >= 70 ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 160, 0, 0.4)' }}>
                  <Heart size={14} /> {stats.score}/100 {lang === 'vi' ? 'Điểm' : 'Pts'}
                </span>
              )}
            </div>

            {stats.total === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                {lang === 'vi' ? (
                  <>Chưa có dữ liệu bữa ăn. Hãy bấm <strong>Quay & Chốt món</strong> để hệ thống bắt đầu thống kê!</>
                ) : (
                  <>No meal data logged yet. Head over to <strong>Spin & Confirm</strong> to start tracking nutrition!</>
                )}
              </p>
            ) : (
              <>
                {/* Visual Breakdown Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                    {stats.counts['Thịt đỏ'] > 0 && (
                      <div style={{ width: `${(stats.counts['Thịt đỏ'] / stats.total) * 100}%`, background: 'var(--nutri-red)' }} title={`${getNutritionLabel('Thịt đỏ')}: ${stats.counts['Thịt đỏ']}`} />
                    )}
                    {stats.counts['Thịt trắng'] > 0 && (
                      <div style={{ width: `${(stats.counts['Thịt trắng'] / stats.total) * 100}%`, background: 'var(--nutri-white)' }} title={`${getNutritionLabel('Thịt trắng')}: ${stats.counts['Thịt trắng']}`} />
                    )}
                    {stats.counts['Cá'] > 0 && (
                      <div style={{ width: `${(stats.counts['Cá'] / stats.total) * 100}%`, background: 'var(--nutri-fish)' }} title={`${getNutritionLabel('Cá')}: ${stats.counts['Cá']}`} />
                    )}
                    {stats.counts['Rau củ'] > 0 && (
                      <div style={{ width: `${(stats.counts['Rau củ'] / stats.total) * 100}%`, background: 'var(--nutri-veg)' }} title={`${getNutritionLabel('Rau củ')}: ${stats.counts['Rau củ']}`} />
                    )}
                    {stats.counts['Tinh bột'] > 0 && (
                      <div style={{ width: `${(stats.counts['Tinh bột'] / stats.total) * 100}%`, background: 'var(--nutri-carb)' }} title={`${getNutritionLabel('Tinh bột')}: ${stats.counts['Tinh bột']}`} />
                    )}
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-red)' }}></span> {lang === 'vi' ? 'Thịt đỏ' : 'Red Meat'}: <strong>{stats.counts['Thịt đỏ']}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-white)' }}></span> {lang === 'vi' ? 'Thịt trắng' : 'Poultry'}: <strong>{stats.counts['Thịt trắng']}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-fish)' }}></span> {lang === 'vi' ? 'Cá' : 'Seafood'}: <strong>{stats.counts['Cá']}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-veg)' }}></span> {lang === 'vi' ? 'Rau củ' : 'Veggies'}: <strong>{stats.counts['Rau củ']}</strong>
                    </span>
                  </div>
                </div>

                {/* Smart Alerts list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats.missingVeggie && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.88rem' }}>
                      <AlertTriangle size={18} color="#ef4444" />
                      <span>
                        <strong>{lang === 'vi' ? 'Báo động: ' : 'Alert: '}</strong>
                        {lang === 'vi' 
                          ? 'Bạn chưa ăn món nào chứa nhiều rau củ trong các bữa gần đây!' 
                          : 'You have not eaten enough green vegetables in recent meals!'}
                      </span>
                    </div>
                  )}

                  {stats.missingFish && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 180, 216, 0.12)', border: '1px solid rgba(0, 180, 216, 0.3)', color: '#7dd3fc', fontSize: '0.88rem' }}>
                      <Sparkles size={18} color="#00b4d8" />
                      <span>
                        <strong>{lang === 'vi' ? 'Gợi ý: ' : 'Tip: '}</strong>
                        {lang === 'vi' 
                          ? 'Đã lâu bạn chưa đổi vị với cá hoặc hải sản để nạp Omega-3.' 
                          : "It's been a while since your last seafood or fish meal rich in Omega-3."}
                      </span>
                    </div>
                  )}

                  {stats.tooMuchRedMeat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 145, 0, 0.12)', border: '1px solid rgba(255, 145, 0, 0.3)', color: '#fcd34d', fontSize: '0.88rem' }}>
                      <AlertTriangle size={18} color="#ff9100" />
                      <span>
                        <strong>{lang === 'vi' ? 'Nhắc nhở: ' : 'Reminder: '}</strong>
                        {lang === 'vi' 
                          ? 'Bạn đang ăn nhiều thịt đỏ liên tục, hãy thử đổi sang thịt trắng hoặc món chay!' 
                          : 'You have been consuming high amounts of red meat; consider lean poultry or vegetarian options!'}
                      </span>
                    </div>
                  )}

                  {!stats.missingVeggie && !stats.missingFish && !stats.tooMuchRedMeat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <span>
                        <strong>{lang === 'vi' ? 'Rất tốt: ' : 'Great job: '}</strong>
                        {lang === 'vi' 
                          ? 'Chế độ dinh dưỡng các bữa gần đây của bạn khá đa dạng và cân đối!' 
                          : 'Your recent meals show healthy diversity and well-balanced nutrition!'}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* SECTION 2: USER PROFILE & BMI SUMMARY CARD */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #00e676' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '38px', height: '38px', minWidth: '38px', borderRadius: '10px', background: 'rgba(0, 230, 118, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  {profile.avatar || '🧑‍💻'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                    {lang === 'vi' ? `Hồ Sơ Sức Khỏe (${profile.name})` : `Health Profile (${profile.name})`}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{profile.username || 'danvanphong'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  className="glass-pill" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(255,145,0,0.14)', borderColor: '#ff9100', color: '#ffa726' }}
                  onClick={onOpenCreateAccount}
                  title={lang === 'vi' ? "Tạo tài khoản mới & Khai báo thể trạng" : "Create new account & health profile"}
                >
                  <UserPlus size={12} /> {lang === 'vi' ? 'Tạo TK' : '+ Add Acc'}
                </button>
                <button 
                  className="glass-pill" 
                  style={{ padding: '4px 12px', fontSize: '0.78rem', cursor: 'pointer' }}
                  onClick={onOpenProfile}
                  title={lang === 'vi' ? "Chỉnh sửa thể trạng hiện tại" : "Edit current health profile"}
                >
                  {lang === 'vi' ? 'Chỉnh sửa' : 'Edit Stats'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.88rem' }}>
              <div>{lang === 'vi' ? 'Chiều cao: ' : 'Height: '}<strong>{profile.height} cm</strong></div>
              <div>{lang === 'vi' ? 'Cân nặng: ' : 'Weight: '}<strong>{profile.weight} kg</strong></div>
              <div>
                {lang === 'vi' ? 'Thể trạng: ' : 'Health status: '}
                <strong style={{ color: bmiInfo.color }}>{localizedBmiStatus} (BMI {bmiInfo.bmi})</strong>
              </div>
              <div>
                {lang === 'vi' ? 'Mục tiêu: ' : 'Goal: '}
                <strong style={{ color: '#ffa000' }}>{localizedGoal}</strong>
              </div>
            </div>
          </div>

          {/* SECTION 3: ALLERGIES & PREFERENCES SETTINGS */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={20} color="#ff4757" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {lang === 'vi' ? 'Dị Ứng & Kiêng Cữ' : 'Allergies & Dietary Restrictions'}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {lang === 'vi' ? (
                <>Hệ thống sẽ <strong>loại cứng 100%</strong> các món chứa nguyên liệu bạn chọn bên dưới:</>
              ) : (
                <>The algorithm will <strong>strictly filter 100%</strong> dishes containing ingredients selected below:</>
              )}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {COMMON_ALLERGIES_MAP.map(al => {
                const isSelected = allergies.includes(al.id);
                const label = lang === 'vi' ? al.vi : al.en;
                return (
                  <button 
                    key={al.id} 
                    onClick={() => toggleAllergy(al.id)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: 'var(--radius-full)', 
                      background: isSelected ? 'rgba(255, 122, 24, 0.2)' : 'var(--bg-surface-secondary)',
                      border: `1px solid ${isSelected ? '#ff7a18' : 'var(--border-color)'}`,
                      color: isSelected ? '#ea580c' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSelected ? `✓ ${label}` : label}
                  </button>
                );
              })}

              {allergies.filter(a => !COMMON_ALLERGIES_MAP.some(item => item.id === a)).map(al => (
                <button 
                  key={al} 
                  onClick={() => toggleAllergy(al)}
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: 'var(--radius-full)', 
                    background: 'rgba(255, 82, 56, 0.22)',
                    border: '1px solid #ff5238',
                    color: '#ff7a18',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  ✓ {al} ({lang === 'vi' ? 'tự tạo' : 'custom'})
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                placeholder={lang === 'vi' ? "Thêm dị ứng khác (ví dụ: gluten, mè...)" : "Add custom allergen (e.g. gluten, sesame...)"}
                value={customAllergyInput}
                onChange={e => setCustomAllergyInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAllergy(); } }}
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={handleAddCustomAllergy}
              >
                <Plus size={16} /> {lang === 'vi' ? 'Thêm' : 'Add'}
              </button>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: MEAL HISTORY LIST ================= */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={19} color="#ff9100" />
              {lang === 'vi' ? `Nhật Ký Các Bữa Ăn (${history.length})` : `Meal History Log (${history.length})`}
            </h3>
          </div>

          {history.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '44px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--primary-light)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                🍱
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                  {t.emptyHistory}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                  {lang === 'vi' 
                    ? 'Hãy ra màn hình Quay Món để nhận gợi ý chuẩn dinh dưỡng và chốt món đầu tiên của bạn hôm nay!' 
                    : 'Head over to the Spin screen to receive smart meal suggestions and log your first dish today!'}
                </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-primary" 
                style={{ padding: '10px 22px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Sparkles size={16} /> {lang === 'vi' ? 'Quay chọn món ngay' : 'Spin a meal now'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayHistory.map((h, i) => {
                const food = foods.find(f => f.id === h.foodId);
                if (!food) return null;
                const date = new Date(h.timestamp);
                const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
                const timeString = `${date.toLocaleDateString(locale)} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                const mealLabel = lang === 'vi' 
                  ? `Bữa ${h.mealType}` 
                  : (h.mealType === 'Sáng' ? 'Breakfast' : h.mealType === 'Trưa' ? 'Lunch' : 'Dinner');

                return (
                  <div 
                    key={h.id || h.timestamp || i} 
                    className="glass-panel" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                      <FoodMedia food={food} size="sm" showBadge />

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                            {food.name}
                          </h4>
                          <span className={getNutritionBadgeClass(food.nutrition)}>
                            {getNutritionLabel(food.nutrition)}
                          </span>
                        </div>

                        <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: '#ffb74d', fontWeight: 600 }}>{mealLabel}</span> • {timeString}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteHistoryItem(h.id || h.timestamp)}
                      className="btn-icon" 
                      style={{ width: '34px', height: '34px', marginLeft: '8px' }}
                      title={lang === 'vi' ? "Xoá bản ghi này" : "Delete this record"}
                    >
                      <Trash2 size={16} color="var(--text-dim)" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
