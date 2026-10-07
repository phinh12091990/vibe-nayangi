import { useState, useEffect } from 'react';
import { useStorage, calculateBMI, calculateTDEE } from '../hooks/useStorage';
import { triggerConfetti } from '../utils/confetti';
import { 
  X, Check, UserPlus, Users, UserCheck, Activity, Target, 
  ShieldAlert, Eye, EyeOff, Sparkles, Trash2, ArrowRight,
  Flame, Dumbbell, Compass, Heart
} from 'lucide-react';

const AVATARS = ['🧑‍💻', '👩‍💻', '🏃‍♂️', '🏃‍♀️', '🧘‍♂️', '🧘‍♀️', '🥗', '🍱', '🥑', '🥩', '🍲', '⚡'];

const GOALS = [
  { id: 'Cân bằng', label: 'Cân bằng lành mạnh', desc: 'Đa dạng 5 nhóm chất, ngừa bệnh văn phòng', icon: '🧘', color: '#10b981' },
  { id: 'Giảm cân', label: 'Giảm mỡ & Kiểm soát calo', desc: 'Ưu tiên rau củ, ức gà, giảm tinh bột', icon: '🥗', color: '#ff7a18' },
  { id: 'Tăng cơ', label: 'Tăng cơ & Bổ sung đạm', desc: 'Tối ưu thịt nạc, cá, trứng giàu protein', icon: '🥩', color: '#f43f5e' },
  { id: 'Thanh lọc', label: 'Thanh lọc & Nhẹ bụng', desc: 'Món nước thanh đạm, dễ tiêu hoá', icon: '🍃', color: '#06b6d4' }
];

const ACTIVITIES = [
  { id: 'Văn phòng (Ít vận động)', label: 'Ít vận động', desc: 'Ngồi văn phòng nhiều, ít tập luyện', icon: '🪑' },
  { id: 'Vận động nhẹ (1-3 ngày/tuần)', label: 'Vận động nhẹ', desc: 'Đi bộ, yoga 1-3 ngày/tuần', icon: '🚶' },
  { id: 'Vận động vừa (3-5 ngày/tuần)', label: 'Vận động vừa', desc: 'Chơi thể thao 3-5 ngày/tuần', icon: '🏃' },
  { id: 'Vận động nhiều (Gym/nặng)', label: 'Vận động nhiều', desc: 'Tập gym, thể lực 6-7 ngày/tuần', icon: '🏋️' }
];

const COMMON_ALLERGIES = ['Bò', 'Tôm', 'Mực', 'Cua', 'Đậu phộng', 'Trứng', 'Đậu nành', 'Sữa'];

export default function AccountModal({ isOpen, onClose, initialTab = 'create' }) {
  const { 
    accounts, currentAccountId, currentAccount, profile, isAdmin,
    createAccount, switchAccount, updateAccount, deleteAccount 
  } = useStorage();

  const [activeTab, setActiveTab] = useState(!isAdmin ? 'edit' : initialTab); // 'create' | 'edit' | 'switch'
  const [showPassword, setShowPassword] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for "Create Account"
  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    password: '',
    avatar: '🧑‍💻',
    age: 26,
    gender: 'Nam',
    height: 168,
    weight: 62,
    activity: 'Văn phòng (Ít vận động)',
    goal: 'Cân bằng',
    allergies: []
  });

  // Form State for "Edit Current Profile"
  const [editForm, setEditForm] = useState({
    name: profile.name || '',
    username: profile.username || '',
    avatar: profile.avatar || '🧑‍💻',
    age: profile.age || 26,
    gender: profile.gender || 'Nam',
    height: profile.height || 168,
    weight: profile.weight || 62,
    activity: profile.activity || 'Văn phòng (Ít vận động)',
    goal: profile.goal || 'Cân bằng',
    allergies: Array.isArray(profile.allergies) ? [...profile.allergies] : []
  });

  // Reset or sync when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(!isAdmin ? 'edit' : initialTab);
      setSuccessMsg('');
      setEditForm({
        name: profile.name || '',
        username: profile.username || '',
        avatar: profile.avatar || '🧑‍💻',
        age: profile.age || 26,
        gender: profile.gender || 'Nam',
        height: profile.height || 168,
        weight: profile.weight || 62,
        activity: profile.activity || 'Văn phòng (Ít vận động)',
        goal: profile.goal || 'Cân bằng',
        allergies: Array.isArray(profile.allergies) ? [...profile.allergies] : []
      });
    }
  }, [isOpen, initialTab, profile, isAdmin]);

  if (!isOpen) return null;

  // Real-time metrics calculations
  const targetForm = activeTab === 'create' ? createForm : editForm;
  const currentBMI = calculateBMI(Number(targetForm.weight), Number(targetForm.height));
  const currentTDEE = calculateTDEE(
    Number(targetForm.weight), 
    Number(targetForm.height), 
    Number(targetForm.age), 
    targetForm.gender, 
    targetForm.activity
  );

  // Toggle allergy in form
  const handleToggleFormAllergy = (allergy, isCreateMode = true) => {
    if (isCreateMode) {
      setCreateForm(prev => {
        const has = prev.allergies.includes(allergy);
        return {
          ...prev,
          allergies: has ? prev.allergies.filter(a => a !== allergy) : [...prev.allergies, allergy]
        };
      });
    } else {
      setEditForm(prev => {
        const has = prev.allergies.includes(allergy);
        return {
          ...prev,
          allergies: has ? prev.allergies.filter(a => a !== allergy) : [...prev.allergies, allergy]
        };
      });
    }
  };

  const handleAddCustomAllergy = (isCreateMode = true) => {
    const val = customAllergy.trim();
    if (!val) return;
    if (isCreateMode) {
      if (!createForm.allergies.includes(val)) {
        setCreateForm(prev => ({ ...prev, allergies: [...prev.allergies, val] }));
      }
    } else {
      if (!editForm.allergies.includes(val)) {
        setEditForm(prev => ({ ...prev, allergies: [...prev.allergies, val] }));
      }
    }
    setCustomAllergy('');
  };

  // Submit Create Account
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!createForm.name.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên thành viên.');
      return;
    }
    if (!createForm.password || createForm.password.trim().length < 4) {
      setErrorMsg('Vui lòng đặt mật khẩu bảo mật (tối thiểu 4 ký tự).');
      return;
    }

    try {
      const newAcc = createAccount({
        ...createForm,
        name: createForm.name.trim(),
        username: createForm.username.trim() || `user_${Date.now().toString().slice(-4)}`,
        password: createForm.password.trim(),
        height: Number(createForm.height),
        weight: Number(createForm.weight),
        age: Number(createForm.age)
      });

      triggerConfetti();
      setSuccessMsg(`Chào mừng ${newAcc.name}! Tài khoản và hồ sơ thể trạng đã được thiết lập thành công.`);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi tạo tài khoản.');
    }
  };

  // Submit Edit Profile
  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateAccount(currentAccountId, {
      ...editForm,
      height: Number(editForm.height),
      weight: Number(editForm.weight),
      age: Number(editForm.age)
    });
    setSuccessMsg('Hồ sơ sức khỏe & thể trạng đã được cập nhật thành công!');
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  // Switch Account
  const handleSwitchAccount = (accId) => {
    switchAccount(accId);
    setSuccessMsg('Đã chuyển đổi sang tài khoản mới!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '640px', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '20px 22px'
        }}
      >
        
        {/* Header with Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #ff5238, #ff9100)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255, 82, 56, 0.4)',
              fontSize: '1.4rem'
            }}>
              {targetForm.avatar || '🧑‍💻'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {activeTab === 'create' ? 'Tạo Tài Khoản Mới' : (activeTab === 'edit' ? 'Hồ Sơ Sức Khỏe & Thể Trạng' : 'Quản Lý Tài Khoản')}
                </h3>
                <span className="brand-badge" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                  {activeTab === 'create' ? 'KHAI BÁO THỂ TRẠNG' : 'CÁ NHÂN HÓA'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {activeTab === 'create' 
                  ? 'Đăng ký tài khoản và khai báo chỉ số cơ thể để AI gợi ý món ăn tối ưu'
                  : 'Tối ưu hóa các gợi ý món ăn chuẩn xác theo mục tiêu dinh dưỡng'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn-icon" 
            style={{ padding: '6px', background: 'rgba(255,255,255,0.06)' }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher Pills: Only Admin can access switch and create tabs */}
        {isAdmin ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => { setActiveTab('switch'); setSuccessMsg(''); }}
              className={`glass-pill ${activeTab === 'switch' ? 'active' : ''}`}
              style={{
                padding: '8px 6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                background: activeTab === 'switch' ? 'rgba(255, 193, 7, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: activeTab === 'switch' ? '#ffc107' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'switch' ? '#ffc107' : 'var(--text-muted)'
              }}
            >
              <Users size={14} />
              <span>👑 Quản trị TV ({accounts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('edit'); setSuccessMsg(''); }}
              className={`glass-pill ${activeTab === 'edit' ? 'active' : ''}`}
              style={{
                padding: '8px 6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                background: activeTab === 'edit' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: activeTab === 'edit' ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'edit' ? '#34d399' : 'var(--text-muted)'
              }}
            >
              <UserCheck size={14} />
              <span>Sửa thể trạng</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('create'); setSuccessMsg(''); }}
              className={`glass-pill ${activeTab === 'create' ? 'active' : ''}`}
              style={{
                padding: '8px 6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                background: activeTab === 'create' ? 'rgba(255, 145, 0, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: activeTab === 'create' ? '#ff9100' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'create' ? '#ffa726' : 'var(--text-muted)'
              }}
            >
              <UserPlus size={14} />
              <span>+ Thêm TV mới</span>
            </button>
          </div>
        ) : (
          <div style={{ padding: '8px 12px', background: 'rgba(255, 145, 0, 0.08)', border: '1px solid rgba(255, 145, 0, 0.2)', borderRadius: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', color: '#ffb74d', fontWeight: 700 }}>
              🔒 Hồ Sơ Cá Nhân Riêng Tư (Chỉ bạn có quyền truy cập)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              @{profile.username}
            </span>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMsg && (
          <div style={{ 
            padding: '10px 14px', 
            borderRadius: '10px', 
            background: 'rgba(34, 197, 94, 0.18)', 
            border: '1px solid rgba(34, 197, 94, 0.4)', 
            color: '#4ade80', 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '12px' 
          }}>
            <Sparkles size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMsg && (
          <div style={{ 
            padding: '10px 14px', 
            borderRadius: '10px', 
            background: 'rgba(239, 68, 68, 0.18)', 
            border: '1px solid rgba(239, 68, 68, 0.4)', 
            color: '#fca5a5', 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '12px' 
          }}>
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* ===================== TAB 1: CREATE ACCOUNT & DECLARE HEALTH PROFILE ===================== */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* SECTION A: ACCOUNT CREDENTIALS */}
              <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff9100', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={15} />
                  <span>1. Thông Tin Tài Khoản Mới</span>
                </div>

                {/* Avatar Picker Row */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Chọn hình đại diện / Biểu tượng:</label>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {AVATARS.map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setCreateForm(prev => ({ ...prev, avatar: av }))}
                        style={{
                          width: '38px',
                          height: '38px',
                          minWidth: '38px',
                          borderRadius: '10px',
                          border: createForm.avatar === av ? '2px solid #ff7a18' : '1px solid rgba(255,255,255,0.1)',
                          background: createForm.avatar === av ? 'rgba(255,122,24,0.25)' : 'rgba(255,255,255,0.04)',
                          fontSize: '1.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: createForm.avatar === av ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Username */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Họ & Tên hiển thị *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="VD: Minh Anh, Hoàng Nam..."
                      value={createForm.name}
                      onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      style={{ fontSize: '0.86rem', padding: '8px 12px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Tên đăng nhập (Username) *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="VD: minhanh_dev"
                      value={createForm.username}
                      onChange={e => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                      style={{ fontSize: '0.86rem', padding: '8px 12px' }}
                    />
                  </div>
                </div>

                {/* Password & Age */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Mật khẩu bảo mật *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="form-input"
                        placeholder="Tối thiểu 4 ký tự"
                        value={createForm.password}
                        onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={4}
                        style={{ fontSize: '0.86rem', padding: '8px 34px 8px 12px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Tuổi (Năm sinh)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      min="10"
                      max="100"
                      value={createForm.age}
                      onChange={e => setCreateForm(prev => ({ ...prev, age: e.target.value }))}
                      style={{ fontSize: '0.86rem', padding: '8px 12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: HEALTH & PHYSICAL PROFILE (KHAI BÁO THỂ TRẠNG TRỰC TIẾP) */}
              <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255, 145, 0, 0.05)', borderColor: 'rgba(255, 145, 0, 0.22)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff9100', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={15} />
                  <span>2. Khai Báo Hồ Sơ Sức Khỏe & Thể Trạng</span>
                </div>

                {/* Real-Time Live Health Metrics Dashboard Card */}
                <div style={{ 
                  background: 'rgba(15, 19, 35, 0.75)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  padding: '12px 14px', 
                  marginBottom: '12px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flame size={16} color="#ff9100" />
                      <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Chỉ Số Đo Lường Sức Khỏe Live:</span>
                    </div>
                    <span className="glass-pill" style={{ color: currentBMI.color, borderColor: currentBMI.color, fontWeight: 700, padding: '2px 8px', fontSize: '0.76rem' }}>
                      {currentBMI.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '2.1rem', fontWeight: 900, color: currentBMI.color, lineHeight: 1 }}>
                        {currentBMI.bmi}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Điểm BMI</span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      🔥 Calo tiêu hao ước tính: <strong style={{ color: '#ffa726' }}>~{currentTDEE} kcal/ngày</strong>
                    </div>
                  </div>

                  {/* Gradient BMI Spectrum Bar */}
                  <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', marginTop: '8px' }}>
                    <div style={{ width: '25%', background: '#38bdf8' }} title="Hơi gầy (<18.5)" />
                    <div style={{ width: '40%', background: '#10b981' }} title="Chuẩn cân đối (18.5 - 22.9)" />
                    <div style={{ width: '20%', background: '#f59e0b' }} title="Tiền thừa cân (23 - 24.9)" />
                    <div style={{ width: '15%', background: '#ef4444' }} title="Thừa cân (>=25)" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                    <span>Gầy (&lt;18.5)</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Chuẩn (18.5-22.9)</span>
                    <span>Thừa cân (&ge;25)</span>
                  </div>
                </div>

                {/* Gender, Height & Weight Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  
                  {/* Gender Selector */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Giới tính</label>
                    <div style={{ display: 'flex', gap: '4px', height: '40px' }}>
                      {['Nam', 'Nữ'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCreateForm(prev => ({ ...prev, gender: g }))}
                          style={{
                            flex: 1,
                            borderRadius: '8px',
                            border: createForm.gender === g ? '1px solid #ff7a18' : '1px solid rgba(255,255,255,0.1)',
                            background: createForm.gender === g ? 'rgba(255,122,24,0.2)' : 'rgba(255,255,255,0.04)',
                            color: createForm.gender === g ? '#ffb74d' : 'var(--text-muted)',
                            fontWeight: createForm.gender === g ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Height */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Chiều cao (cm)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      min="100"
                      max="230"
                      value={createForm.height}
                      onChange={e => setCreateForm(prev => ({ ...prev, height: e.target.value }))}
                      required
                      style={{ fontSize: '0.86rem', padding: '8px 10px', height: '40px' }}
                    />
                  </div>

                  {/* Weight */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Cân nặng (kg)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      min="30"
                      max="200"
                      step="0.5"
                      value={createForm.weight}
                      onChange={e => setCreateForm(prev => ({ ...prev, weight: e.target.value }))}
                      required
                      style={{ fontSize: '0.86rem', padding: '8px 10px', height: '40px' }}
                    />
                  </div>

                </div>

                {/* Activity Level Selector */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Mức độ vận động thể chất hàng ngày:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {ACTIVITIES.map(act => {
                      const isSelected = createForm.activity === act.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => setCreateForm(prev => ({ ...prev, activity: act.id }))}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid #ff9100' : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected ? 'rgba(255,145,0,0.14)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{act.icon}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#ffa726' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {act.label}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {act.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrition Goal Selector */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Target size={14} color="#ff9100" />
                    Mục tiêu ăn uống & vóc dáng mong muốn:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {GOALS.map(g => {
                      const isSelected = createForm.goal === g.id;
                      return (
                        <div
                          key={g.id}
                          onClick={() => setCreateForm(prev => ({ ...prev, goal: g.id }))}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isSelected ? `2px solid ${g.color}` : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '1.3rem' }}>{g.icon}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? g.color : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {g.label}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {g.desc}
                            </div>
                          </div>
                          {isSelected && <Check size={14} color={g.color} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Food Allergies / Dislikes */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <ShieldAlert size={14} color="#f87171" />
                    Dị ứng & Kiêng kỵ thực phẩm (AI sẽ tự động né):
                  </label>
                  
                  {/* Common allergy tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                    {COMMON_ALLERGIES.map(al => {
                      const isSelected = createForm.allergies.includes(al);
                      return (
                        <button
                          key={al}
                          type="button"
                          onClick={() => handleToggleFormAllergy(al, true)}
                          className={`glass-pill ${isSelected ? 'active' : ''}`}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(239, 68, 68, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                            borderColor: isSelected ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                            color: isSelected ? '#fca5a5' : 'var(--text-secondary)'
                          }}
                        >
                          {isSelected ? `✓ ${al}` : `+ ${al}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom allergy input */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Nhập dị ứng khác (nếu có)..."
                      value={customAllergy}
                      onChange={e => setCustomAllergy(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAllergy(true); } }}
                      style={{ fontSize: '0.8rem', padding: '6px 10px', height: '34px' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => handleAddCustomAllergy(true)}
                      style={{ padding: '6px 12px', fontSize: '0.78rem', height: '34px' }}
                    >
                      Thêm
                    </button>
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '10px 14px' }} 
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2, padding: '10px 14px', fontSize: '0.95rem' }}
                >
                  <Sparkles size={18} /> Hoàn Tất Tạo Tài Khoản
                </button>
              </div>

            </form>
          )}

          {/* ===================== TAB 2: EDIT CURRENT PROFILE ===================== */}
          {activeTab === 'edit' && (
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Account Quick Info */}
              <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={15} />
                  <span>Thông Tin Cá Nhân ({profile.name})</span>
                </div>

                {/* Avatar Picker Row */}
                <div style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Biểu tượng đại diện:</label>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {AVATARS.map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, avatar: av }))}
                        style={{
                          width: '36px',
                          height: '36px',
                          minWidth: '36px',
                          borderRadius: '8px',
                          border: editForm.avatar === av ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                          background: editForm.avatar === av ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.04)',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: editForm.avatar === av ? 'scale(1.1)' : 'scale(1)'
                        }}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Age */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Tên người dùng</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editForm.name}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      style={{ fontSize: '0.86rem', padding: '8px 12px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Tuổi</label>
                    <input 
                      type="number" 
                      className="form-input"
                      min="10"
                      max="100"
                      value={editForm.age}
                      onChange={e => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                      style={{ fontSize: '0.86rem', padding: '8px 12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Health & Fitness Metrics */}
              <div className="glass-panel" style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.22)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={15} />
                  <span>Thể Trạng & Dinh Dưỡng</span>
                </div>

                {/* BMI Dashboard Panel */}
                <div style={{ 
                  background: 'rgba(15, 19, 35, 0.75)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  padding: '12px 14px', 
                  marginBottom: '12px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Chỉ số BMI hiện tại:</span>
                    <span className="glass-pill" style={{ color: currentBMI.color, borderColor: currentBMI.color, fontWeight: 700, padding: '2px 8px', fontSize: '0.76rem' }}>
                      {currentBMI.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                    <span style={{ fontSize: '2.1rem', fontWeight: 900, color: currentBMI.color, lineHeight: 1 }}>
                      {currentBMI.bmi}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Calo tiêu hao hàng ngày: <strong style={{ color: '#ffa726' }}>~{currentTDEE} kcal</strong>
                    </span>
                  </div>

                  <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', marginTop: '8px' }}>
                    <div style={{ width: '25%', background: '#38bdf8' }} />
                    <div style={{ width: '40%', background: '#10b981' }} />
                    <div style={{ width: '20%', background: '#f59e0b' }} />
                    <div style={{ width: '15%', background: '#ef4444' }} />
                  </div>
                </div>

                {/* Gender, Height & Weight Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Giới tính</label>
                    <div style={{ display: 'flex', gap: '4px', height: '40px' }}>
                      {['Nam', 'Nữ'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, gender: g }))}
                          style={{
                            flex: 1,
                            borderRadius: '8px',
                            border: editForm.gender === g ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                            background: editForm.gender === g ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                            color: editForm.gender === g ? '#6ee7b7' : 'var(--text-muted)',
                            fontWeight: editForm.gender === g ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Chiều cao (cm)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      min="100"
                      max="230"
                      value={editForm.height}
                      onChange={e => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                      required
                      style={{ fontSize: '0.86rem', padding: '8px 10px', height: '40px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Cân nặng (kg)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      min="30"
                      max="200"
                      step="0.5"
                      value={editForm.weight}
                      onChange={e => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                      required
                      style={{ fontSize: '0.86rem', padding: '8px 10px', height: '40px' }}
                    />
                  </div>

                </div>

                {/* Activity Level Selector */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Mức độ vận động:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {ACTIVITIES.map(act => {
                      const isSelected = editForm.activity === act.id;
                      return (
                        <div
                          key={act.id}
                          onClick={() => setEditForm(prev => ({ ...prev, activity: act.id }))}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{act.icon}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#6ee7b7' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {act.label}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {act.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrition Goal */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Mục tiêu dinh dưỡng:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {GOALS.map(g => {
                      const isSelected = editForm.goal === g.id;
                      return (
                        <div
                          key={g.id}
                          onClick={() => setEditForm(prev => ({ ...prev, goal: g.id }))}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isSelected ? `2px solid ${g.color}` : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{ fontSize: '1.3rem' }}>{g.icon}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? g.color : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {g.label}
                            </div>
                          </div>
                          {isSelected && <Check size={14} color={g.color} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Dị ứng / Thực phẩm kiêng:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {COMMON_ALLERGIES.map(al => {
                      const isSelected = editForm.allergies.includes(al);
                      return (
                        <button
                          key={al}
                          type="button"
                          onClick={() => handleToggleFormAllergy(al, false)}
                          className={`glass-pill ${isSelected ? 'active' : ''}`}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(239, 68, 68, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                            borderColor: isSelected ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                            color: isSelected ? '#fca5a5' : 'var(--text-secondary)'
                          }}
                        >
                          {isSelected ? `✓ ${al}` : `+ ${al}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '10px 14px' }} 
                  onClick={onClose}
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2, padding: '10px 14px', fontSize: '0.95rem' }}
                >
                  <Check size={18} /> Lưu Thay Đổi Hồ Sơ
                </button>
              </div>

            </form>
          )}

          {/* ===================== TAB 3: SWITCH / MANAGE ACCOUNTS ===================== */}
          {activeTab === 'switch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Chọn tài khoản để đổi sang dữ liệu thể trạng và lịch sử ăn uống tương ứng:
              </div>

              {accounts.map(acc => {
                const isCurrent = acc.id === currentAccountId;
                const accBMI = calculateBMI(Number(acc.weight), Number(acc.height));

                return (
                  <div
                    key={acc.id}
                    className="glass-panel"
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: isCurrent ? '#ff9100' : 'rgba(255,255,255,0.08)',
                      background: isCurrent ? 'rgba(255, 145, 0, 0.12)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        borderRadius: '12px',
                        background: isCurrent ? 'linear-gradient(135deg, #ff5238, #ff9100)' : 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.35rem'
                      }}>
                        {acc.avatar || '🧑‍💻'}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                            {acc.name}
                          </span>
                          {isCurrent && (
                            <span className="glass-pill" style={{ color: '#4ade80', borderColor: '#4ade80', fontSize: '0.68rem', padding: '1px 6px', fontWeight: 700 }}>
                              ✓ Đang dùng
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span>BMI: <strong style={{ color: accBMI.color }}>{accBMI.bmi}</strong></span>
                          <span>•</span>
                          <span>Mục tiêu: <strong style={{ color: '#ffa000' }}>{acc.goal || 'Cân bằng'}</strong></span>
                          <span>•</span>
                          <span>{acc.height}cm / {acc.weight}kg</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {!isCurrent && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleSwitchAccount(acc.id)}
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          Chọn <ArrowRight size={13} />
                        </button>
                      )}

                      {accounts.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc muốn xoá tài khoản "${acc.name}" không?`)) {
                              deleteAccount(acc.id);
                            }
                          }}
                          title="Xóa tài khoản này"
                          style={{ color: '#f87171', padding: '6px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setActiveTab('create'); setSuccessMsg(''); }}
                style={{ width: '100%', padding: '10px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <UserPlus size={16} /> Tạo thêm tài khoản mới
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
