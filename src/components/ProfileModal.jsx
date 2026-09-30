import { useState } from 'react';
import { useStorage, calculateBMI } from '../hooks/useStorage';
import { X, Check, User, Activity, Target } from 'lucide-react';

const GOALS = [
  { id: 'Cân bằng', label: 'Cân bằng lành mạnh', desc: 'Đa dạng 5 nhóm chất, ngừa bệnh văn phòng', icon: '🧘', color: '#10b981' },
  { id: 'Giảm cân', label: 'Giảm mỡ & Kiểm soát calo', desc: 'Ưu tiên rau củ, ức gà, giảm tinh bột', icon: '🥗', color: '#ff7a18' },
  { id: 'Tăng cơ', label: 'Tăng cơ & Bổ sung protein', desc: 'Tối ưu thịt nạc, cá, trứng giàu đạm', icon: '🥩', color: '#f43f5e' },
  { id: 'Thanh lọc', label: 'Thanh lọc & Nhẹ bụng', desc: 'Món nước, thanh đạm, dễ tiêu hoá', icon: '🍃', color: '#06b6d4' }
];

export default function ProfileModal({ isOpen, onClose }) {
  const { profile, updateProfile } = useStorage();

  const [formData, setFormData] = useState({
    name: profile.name || 'Dân Văn Phòng',
    height: profile.height || 168,
    weight: profile.weight || 62,
    gender: profile.gender || 'Nam',
    goal: profile.goal || 'Cân bằng',
    activity: profile.activity || 'Văn phòng (Ít vận động)'
  });

  if (!isOpen) return null;

  const currentBMI = calculateBMI(Number(formData.weight), Number(formData.height));

  // Approximate TDEE calculation (Mifflin-St Jeor formula)
  const isMale = formData.gender === 'Nam';
  const approxBMR = 10 * Number(formData.weight) + 6.25 * Number(formData.height) - 5 * 26 + (isMale ? 5 : -161);
  const approxTDEE = Math.round(approxBMR * 1.25);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      height: Number(formData.height),
      weight: Number(formData.weight)
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff5238, #ff9100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Hồ Sơ Sức Khỏe & Thể Trạng</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cá nhân hoá đề xuất món ăn theo cơ thể bạn</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          
          {/* Real-time Health / BMI Card */}
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 145, 0, 0.08)', borderColor: 'rgba(255, 145, 0, 0.25)', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#ff9100" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Chỉ số BMI & Calo khuyến nghị</span>
              </div>
              <span className="glass-pill" style={{ color: currentBMI.color, borderColor: currentBMI.color, fontWeight: 700, padding: '3px 10px', fontSize: '0.8rem' }}>
                {currentBMI.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: currentBMI.color }}>
                {currentBMI.bmi}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Điểm BMI • Tiêu hao ước tính: <strong>~{approxTDEE} kcal/ngày</strong>
              </span>
            </div>

            {/* BMI Bar */}
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', marginTop: '10px' }}>
              <div style={{ width: '25%', background: '#38bdf8' }} title="Gầy (<18.5)" />
              <div style={{ width: '40%', background: '#10b981' }} title="Chuẩn (18.5 - 22.9)" />
              <div style={{ width: '20%', background: '#f59e0b' }} title="Tiền thừa cân (23 - 24.9)" />
              <div style={{ width: '15%', background: '#ef4444' }} title="Thừa cân (>=25)" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>Gầy</span>
              <span style={{ color: '#10b981' }}>Chuẩn</span>
              <span>Thừa cân</span>
            </div>
          </div>

          {/* Form fields: Name, Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên của bạn</label>
              <input 
                type="text" 
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Giới tính</label>
              <div style={{ display: 'flex', gap: '8px', height: '46px' }}>
                {['Nam', 'Nữ'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    style={{
                      flex: 1,
                      borderRadius: 'var(--radius-md)',
                      border: formData.gender === g ? '1px solid #ff7a18' : '1px solid rgba(255,255,255,0.1)',
                      background: formData.gender === g ? 'rgba(255,122,24,0.2)' : 'rgba(255,255,255,0.04)',
                      color: formData.gender === g ? '#ffb74d' : 'var(--text-muted)',
                      fontWeight: formData.gender === g ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Height & Weight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Chiều cao (cm)</label>
              <input 
                type="number" 
                className="form-input"
                min="100"
                max="230"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cân nặng (kg)</label>
              <input 
                type="number" 
                className="form-input"
                min="30"
                max="200"
                step="0.5"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Health / Diet Goal Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={16} color="#ff9100" />
              Mục tiêu ăn uống & dinh dưỡng
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOALS.map(g => {
                const isSelected = formData.goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setFormData({ ...formData, goal: g.id })}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${g.color}` : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{g.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isSelected ? g.color : '#ffffff' }}>
                        {g.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {g.desc}
                      </div>
                    </div>
                    {isSelected && <Check size={18} color={g.color} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1 }} 
              onClick={onClose}
            >
              Đóng
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 2 }}
            >
              <Check size={18} /> Lưu Hồ Sơ
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
