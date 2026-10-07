import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage, calculateBMI } from '../hooks/useStorage';
import FoodMedia from '../components/FoodMedia';
import { 
  ShieldAlert, Activity, AlertTriangle, CheckCircle2, 
  Trash2, Plus, Clock, Utensils, Sparkles, Heart, User, UserPlus
} from 'lucide-react';

const COMMON_ALLERGIES = ['Bò', 'Tôm', 'Mực', 'Cua', 'Đậu phộng', 'Trứng', 'Đậu nành', 'Sữa'];

export default function HistoryPage({ onOpenProfile, onOpenCreateAccount, onOpenSwitchAccount }) {
  const navigate = useNavigate();
  const { history, foods, allergies, toggleAllergy, deleteHistoryItem, clearHistory, profile } = useStorage();
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const displayHistory = useMemo(() => [...history].reverse(), [history]);
  const bmiInfo = calculateBMI(Number(profile.weight), Number(profile.height));

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

  return (
    <div className="page-container">
      
      {/* Top Header */}
      <div className="app-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: 0 }}>Nhật Ký & Thống Kê Dinh Dưỡng</h2>
            <span className="brand-badge">TRỢ LÝ BỮA ĂN • AI</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Theo dõi dinh dưỡng 7 bữa gần nhất & quản lý thể trạng cá nhân
          </p>
        </div>

        {history.length > 0 && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 14px', fontSize: '0.8rem', color: '#f87171' }}
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn xoá toàn bộ lịch sử ăn uống?")) {
                clearHistory();
              }
            }}
          >
            <Trash2 size={15} /> Xoá tất cả
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dinh Dưỡng 7 Bữa Gần Nhất</h3>
              </div>
              {stats.total > 0 && (
                <span className="glass-pill" style={{ color: stats.score >= 70 ? '#4ade80' : '#ffa000', borderColor: stats.score >= 70 ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 160, 0, 0.4)' }}>
                  <Heart size={14} /> {stats.score}/100 Điểm
                </span>
              )}
            </div>

            {stats.total === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                Chưa có dữ liệu bữa ăn. Hãy bấm <strong>Quay & Chốt món</strong> để hệ thống bắt đầu thống kê!
              </p>
            ) : (
              <>
                {/* Visual Breakdown Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                    {stats.counts['Thịt đỏ'] > 0 && (
                      <div style={{ width: `${(stats.counts['Thịt đỏ'] / stats.total) * 100}%`, background: 'var(--nutri-red)' }} title={`Thịt đỏ: ${stats.counts['Thịt đỏ']}`} />
                    )}
                    {stats.counts['Thịt trắng'] > 0 && (
                      <div style={{ width: `${(stats.counts['Thịt trắng'] / stats.total) * 100}%`, background: 'var(--nutri-white)' }} title={`Thịt trắng: ${stats.counts['Thịt trắng']}`} />
                    )}
                    {stats.counts['Cá'] > 0 && (
                      <div style={{ width: `${(stats.counts['Cá'] / stats.total) * 100}%`, background: 'var(--nutri-fish)' }} title={`Cá/Hải sản: ${stats.counts['Cá']}`} />
                    )}
                    {stats.counts['Rau củ'] > 0 && (
                      <div style={{ width: `${(stats.counts['Rau củ'] / stats.total) * 100}%`, background: 'var(--nutri-veg)' }} title={`Rau củ: ${stats.counts['Rau củ']}`} />
                    )}
                    {stats.counts['Tinh bột'] > 0 && (
                      <div style={{ width: `${(stats.counts['Tinh bột'] / stats.total) * 100}%`, background: 'var(--nutri-carb)' }} title={`Tinh bột: ${stats.counts['Tinh bột']}`} />
                    )}
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-red)' }}></span> Thịt đỏ: <strong>{stats.counts['Thịt đỏ']}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-white)' }}></span> Thịt trắng: <strong>{stats.counts['Thịt trắng']}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-fish)' }}></span> Cá: <strong>{stats.counts['Cá']}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--nutri-veg)' }}></span> Rau củ: <strong>{stats.counts['Rau củ']}</strong>
                    </span>
                  </div>
                </div>

                {/* Smart Alerts list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats.missingVeggie && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.88rem' }}>
                      <AlertTriangle size={18} color="#ef4444" />
                      <span><strong>Báo động:</strong> Bạn chưa ăn món nào chứa nhiều rau củ trong các bữa gần đây!</span>
                    </div>
                  )}

                  {stats.missingFish && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 180, 216, 0.12)', border: '1px solid rgba(0, 180, 216, 0.3)', color: '#7dd3fc', fontSize: '0.88rem' }}>
                      <Sparkles size={18} color="#00b4d8" />
                      <span><strong>Gợi ý:</strong> Đã lâu bạn chưa đổi vị với cá hoặc hải sản để nạp Omega-3.</span>
                    </div>
                  )}

                  {stats.tooMuchRedMeat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 145, 0, 0.12)', border: '1px solid rgba(255, 145, 0, 0.3)', color: '#fcd34d', fontSize: '0.88rem' }}>
                      <AlertTriangle size={18} color="#ff9100" />
                      <span><strong>Nhắc nhở:</strong> Bạn đang ăn nhiều thịt đỏ liên tục, hãy thử đổi sang thịt trắng hoặc món chay!</span>
                    </div>
                  )}

                  {!stats.missingVeggie && !stats.missingFish && !stats.tooMuchRedMeat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <span><strong>Rất tốt:</strong> Chế độ dinh dưỡng các bữa gần đây của bạn khá đa dạng và cân đối!</span>
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Hồ Sơ Sức Khỏe ({profile.name})</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{profile.username || 'danvanphong'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  className="glass-pill" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(255,145,0,0.14)', borderColor: '#ff9100', color: '#ffa726' }}
                  onClick={onOpenCreateAccount}
                  title="Tạo tài khoản mới & Khai báo thể trạng"
                >
                  <UserPlus size={12} /> Tạo TK
                </button>
                <button 
                  className="glass-pill" 
                  style={{ padding: '4px 12px', fontSize: '0.78rem', cursor: 'pointer' }}
                  onClick={onOpenProfile}
                  title="Chỉnh sửa thể trạng hiện tại"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.88rem' }}>
              <div>Chiều cao: <strong>{profile.height} cm</strong></div>
              <div>Cân nặng: <strong>{profile.weight} kg</strong></div>
              <div>Thể trạng: <strong style={{ color: bmiInfo.color }}>{bmiInfo.status} (BMI {bmiInfo.bmi})</strong></div>
              <div>Mục tiêu: <strong style={{ color: '#ffa000' }}>{profile.goal}</strong></div>
            </div>
          </div>

          {/* SECTION 3: ALLERGIES & PREFERENCES SETTINGS */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={20} color="#ff4757" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dị Ứng & Kiêng Cữ</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Hệ thống sẽ <strong>loại cứng 100%</strong> các món chứa nguyên liệu bạn chọn bên dưới:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {COMMON_ALLERGIES.map(al => {
                const isSelected = allergies.includes(al);
                return (
                  <button 
                    key={al} 
                    onClick={() => toggleAllergy(al)}
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
                    {isSelected ? `✓ ${al}` : al}
                  </button>
                );
              })}

              {allergies.filter(a => !COMMON_ALLERGIES.includes(a)).map(al => (
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
                  ✓ {al} (tự tạo)
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                placeholder="Thêm dị ứng khác (ví dụ: gluten, mè...)"
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
                <Plus size={16} /> Thêm
              </button>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: MEAL HISTORY LIST ================= */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={19} color="#ff9100" />
              Nhật Ký Các Bữa Ăn ({history.length})
            </h3>
          </div>

          {history.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '44px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--primary-light)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                🍱
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                  Chưa có bữa ăn nào được ghi lại
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                  Hãy ra màn hình <strong>Quay Món</strong> để nhận gợi ý chuẩn dinh dưỡng và chốt món đầu tiên của bạn hôm nay!
                </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-primary" 
                style={{ padding: '10px 22px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Sparkles size={16} /> Quay chọn món ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayHistory.map((h, i) => {
                const food = foods.find(f => f.id === h.foodId);
                if (!food) return null;
                const date = new Date(h.timestamp);
                const timeString = `${date.toLocaleDateString('vi-VN')} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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
                            {food.nutrition}
                          </span>
                        </div>

                        <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: '#ffb74d', fontWeight: 600 }}>Bữa {h.mealType}</span> • {timeString}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteHistoryItem(h.id || h.timestamp)}
                      className="btn-icon"
                      style={{ width: '34px', height: '34px', marginLeft: '8px' }}
                      title="Xoá bản ghi này"
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
