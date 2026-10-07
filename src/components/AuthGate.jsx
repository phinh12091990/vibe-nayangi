import { useState } from 'react';
import { useStorage, calculateBMI, calculateTDEE } from '../hooks/useStorage';
import { triggerConfetti } from '../utils/confetti';
import { 
  Lock, Sparkles, UserPlus, LogIn, Activity, Target, 
  ShieldAlert, Eye, EyeOff, Check, Flame, ArrowRight, UserCheck,
  Sun, Moon
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

export default function AuthGate() {
  const { accounts, createAccount, loginWithCredentials, theme, toggleTheme } = useStorage();
  const [tab, setTab] = useState('login'); // Default is 'login' per user request
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loginUsername, setLoginUsername] = useState('');

  // Register Form State
  const [regForm, setRegForm] = useState({
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

  const bmiInfo = calculateBMI(Number(regForm.weight), Number(regForm.height));
  const tdeeVal = calculateTDEE(
    Number(regForm.weight),
    Number(regForm.height),
    Number(regForm.age),
    regForm.gender,
    regForm.activity
  );

  const handleToggleAllergy = (al) => {
    setRegForm(prev => {
      const has = prev.allergies.includes(al);
      return {
        ...prev,
        allergies: has ? prev.allergies.filter(a => a !== al) : [...prev.allergies, al]
      };
    });
  };

  const handleAddCustomAllergy = () => {
    const val = customAllergy.trim();
    if (val && !regForm.allergies.includes(val)) {
      setRegForm(prev => ({ ...prev, allergies: [...prev.allergies, val] }));
      setCustomAllergy('');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regForm.name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    const uname = (regForm.username || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!uname) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập (Username).');
      return;
    }

    if (uname === 'admin') {
      setErrorMsg("Tên đăng nhập 'admin' là tài khoản Quản trị viên hệ thống. Vui lòng chọn tên khác.");
      return;
    }

    const isExisted = accounts.some(a => (a.username || '').toLowerCase() === uname);
    if (isExisted) {
      setErrorMsg(`Tên đăng nhập "${uname}" đã có người sử dụng. Vui lòng chọn tên khác.`);
      return;
    }

    const pwd = (regForm.password || '').trim();
    if (!pwd || pwd.length < 4) {
      setErrorMsg('Vui lòng đặt mật khẩu bảo mật (tối thiểu 4 ký tự).');
      return;
    }

    if (pwd !== confirmPassword.trim()) {
      setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng nhập lại.');
      return;
    }

    try {
      createAccount({
        ...regForm,
        name: regForm.name.trim(),
        username: uname,
        password: pwd,
        height: Number(regForm.height),
        weight: Number(regForm.weight),
        age: Number(regForm.age)
      });
      triggerConfetti();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi tạo tài khoản.');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const uname = loginUsername.trim();
    const pwd = loginPassword.trim();
    if (!uname) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập (Username).');
      return;
    }
    if (!pwd) {
      setErrorMsg('Vui lòng nhập Mật khẩu để đăng nhập.');
      return;
    }
    const res = loginWithCredentials(uname, pwd);
    if (res.success) {
      triggerConfetti();
    } else {
      setErrorMsg(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="auth-gate-screen">
      <div className={`auth-gate-card ${tab === 'login' ? 'login-mode' : ''}`}>
        
        {/* Quick Theme Switcher on Auth Screen */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button 
            type="button" 
            onClick={toggleTheme} 
            className="theme-switch-pill" 
            title="Chuyển chế độ Sáng / Tối"
          >
            {theme === 'light' ? (
              <>
                <Sun size={13} color="#ea580c" />
                <span>☀️ Sáng</span>
              </>
            ) : (
              <>
                <Moon size={13} color="#bbf246" />
                <span>🌙 Tối</span>
              </>
            )}
          </button>
        </div>

        {/* Brand & Locked App Banner */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', border: '1px solid rgba(187, 242, 70, 0.7)', padding: '5px 14px', borderRadius: '20px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>🍲</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-dark)', letterSpacing: '0.02em' }}>NAY ĂN GÌ</span>
            <span className="brand-badge" style={{ fontSize: '0.62rem', padding: '2px 6px', background: 'var(--bg-card)', color: 'var(--primary-dark)' }}>NUTRIGO AI</span>
          </div>

          <h2 className="auth-header-title" style={{ fontWeight: 900, margin: '4px 0 8px', color: 'var(--text-main)' }}>
            {tab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Thiết Lập Tài Khoản & Thể Trạng'}
          </h2>

          <div className="auth-header-desc" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: tab === 'login' ? '#166534' : '#c2410c', background: tab === 'login' ? 'var(--primary-light)' : 'var(--accent-orange-light)', borderRadius: '10px', border: tab === 'login' ? '1px solid rgba(187,242,70,0.5)' : '1px solid rgba(255,122,24,0.3)' }}>
            <Lock size={14} style={{ flexShrink: 0 }} />
            <span>
              {tab === 'login' 
                ? 'Vui lòng đăng nhập để mở khóa thực đơn & dữ liệu cá nhân' 
                : 'Khai báo thể trạng để AI tính toán TDEE và gợi ý món ăn chuẩn xác'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs-row">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`glass-pill auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            style={{
              background: tab === 'login' ? 'var(--primary)' : 'var(--bg-surface)',
              borderColor: tab === 'login' ? 'var(--primary)' : 'var(--border-color)',
              color: tab === 'login' ? 'var(--primary-dark)' : 'var(--text-secondary)',
              fontWeight: tab === 'login' ? 800 : 600,
              boxShadow: tab === 'login' ? '0 4px 14px var(--primary-glow)' : 'var(--shadow-xs)'
            }}
          >
            <LogIn size={16} />
            <span>Đăng Nhập</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`glass-pill auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            style={{
              background: tab === 'register' ? 'var(--primary)' : 'var(--bg-surface)',
              borderColor: tab === 'register' ? 'var(--primary)' : 'var(--border-color)',
              color: tab === 'register' ? 'var(--primary-dark)' : 'var(--text-secondary)',
              fontWeight: tab === 'register' ? 800 : 600,
              boxShadow: tab === 'register' ? '0 4px 14px var(--primary-glow)' : 'var(--shadow-xs)'
            }}
          >
            <UserPlus size={16} />
            <span>Đăng Ký Tài Khoản</span>
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.18)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '12px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* ================= REGISTER VIEW ================= */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 1. Account Credentials */}
            <div className="glass-panel" style={{ padding: '16px', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#ea580c', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={15} />
                <span>1. Thông Tin Tài Khoản</span>
              </div>

              {/* Avatar Selector */}
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Chọn Avatar của bạn:</label>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegForm(prev => ({ ...prev, avatar: av }))}
                      style={{
                        width: '38px',
                        height: '38px',
                        minWidth: '38px',
                        borderRadius: '10px',
                        border: regForm.avatar === av ? '2px solid #bbf246' : '1px solid var(--border-color)',
                        background: regForm.avatar === av ? 'var(--primary-light)' : 'var(--bg-surface)',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: regForm.avatar === av ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-grid-2col" style={{ marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Họ và tên hiển thị *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="VD: Nguyễn Hoàng Nam" 
                    value={regForm.name} 
                    onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Tên đăng nhập (Username) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="VD: hoangnam" 
                    value={regForm.username} 
                    onChange={e => setRegForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="auth-grid-2col">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Mật khẩu bảo mật *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="form-input" 
                      placeholder="Tối thiểu 4 ký tự" 
                      value={regForm.password} 
                      onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={4}
                      style={{ paddingRight: '34px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Xác nhận mật khẩu *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      className="form-input" 
                      placeholder="Nhập lại mật khẩu" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={4}
                      style={{ paddingRight: '34px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                <Lock size={12} color="#10b981" />
                <span>Mật khẩu bảo mật riêng tư, không công khai với các tài khoản khác.</span>
              </div>
            </div>

            {/* 2. Health & Fitness Profile Declaration */}
            <div className="glass-panel" style={{ padding: '16px', background: '#ffffff', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} />
                <span>2. Khai Báo Hồ Sơ Sức Khỏe & Thể Trạng</span>
              </div>

              {/* Real-time Health Metrics Card */}
              <div style={{ background: '#fbf9f4', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={16} color="#ea580c" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Chỉ Số Thể Trạng Trực Tiếp:</span>
                  </div>
                  <span className="glass-pill" style={{ color: bmiInfo.color, borderColor: bmiInfo.color, fontWeight: 700, padding: '2px 8px', fontSize: '0.76rem' }}>
                    {bmiInfo.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: bmiInfo.color, lineHeight: 1 }}>{bmiInfo.bmi}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Điểm BMI</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Ước tính tiêu hao: <strong style={{ color: '#ea580c' }}>~{tdeeVal} kcal/ngày</strong>
                  </div>
                </div>

                <div style={{ height: '7px', borderRadius: '4px', background: '#ede7dc', overflow: 'hidden', display: 'flex', marginTop: '8px' }}>
                  <div style={{ width: '25%', background: '#38bdf8' }} />
                  <div style={{ width: '40%', background: '#10b981' }} />
                  <div style={{ width: '20%', background: '#f59e0b' }} />
                  <div style={{ width: '15%', background: '#ef4444' }} />
                </div>
              </div>

              {/* Gender, Age, Height & Weight in 4 columns */}
              <div className="auth-metrics-grid" style={{ marginBottom: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Giới tính</label>
                  <div style={{ display: 'flex', gap: '4px', height: '40px' }}>
                    {['Nam', 'Nữ'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setRegForm(prev => ({ ...prev, gender: g }))}
                        style={{
                          flex: 1,
                          borderRadius: '8px',
                          border: regForm.gender === g ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                          background: regForm.gender === g ? 'var(--primary)' : '#ffffff',
                          color: regForm.gender === g ? 'var(--primary-dark)' : 'var(--text-secondary)',
                          fontWeight: regForm.gender === g ? 800 : 500,
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
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Tuổi</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="10" 
                    max="100" 
                    value={regForm.age} 
                    onChange={e => setRegForm(prev => ({ ...prev, age: e.target.value }))}
                    required
                    style={{ height: '40px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Cao (cm)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="100" 
                    max="230" 
                    value={regForm.height} 
                    onChange={e => setRegForm(prev => ({ ...prev, height: e.target.value }))}
                    required
                    style={{ height: '40px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Nặng (kg)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="30" 
                    max="200" 
                    step="0.5" 
                    value={regForm.weight} 
                    onChange={e => setRegForm(prev => ({ ...prev, weight: e.target.value }))}
                    required
                    style={{ height: '40px' }}
                  />
                </div>
              </div>

              {/* Nutrition Goal */}
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Mục tiêu dinh dưỡng & vóc dáng:</label>
                <div className="auth-goals-grid">
                  {GOALS.map(g => {
                    const isSelected = regForm.goal === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => setRegForm(prev => ({ ...prev, goal: g.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isSelected ? `2px solid ${g.color}` : '1px solid var(--border-color)',
                          background: isSelected ? '#fbf9f4' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{g.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isSelected ? g.color : 'var(--text-main)', lineHeight: 1.3 }}>
                            {g.label}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '2px' }}>
                            {g.desc}
                          </div>
                        </div>
                        {isSelected && <Check size={16} color={g.color} style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Level */}
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Mức độ vận động:</label>
                <div className="auth-activities-grid">
                  {ACTIVITIES.map(act => {
                    const isSelected = regForm.activity === act.id;
                    return (
                      <div
                        key={act.id}
                        onClick={() => setRegForm(prev => ({ ...prev, activity: act.id }))}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #16a34a' : '1px solid var(--border-color)',
                          background: isSelected ? '#f4fce3' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{act.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#166534' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

              {/* Allergies */}
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Dị ứng / Thực phẩm kiêng (AI tự động né):</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {COMMON_ALLERGIES.map(al => {
                    const isSelected = regForm.allergies.includes(al);
                    return (
                      <button
                        key={al}
                        type="button"
                        onClick={() => handleToggleAllergy(al)}
                        className={`glass-pill ${isSelected ? 'active' : ''}`}
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          background: isSelected ? '#ffe4e6' : '#ffffff',
                          borderColor: isSelected ? '#f43f5e' : 'var(--border-color)',
                          color: isSelected ? '#f43f5e' : 'var(--text-secondary)',
                          fontWeight: isSelected ? 700 : 500
                        }}
                      >
                        {isSelected ? `✓ ${al}` : `+ ${al}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '1rem',
                fontWeight: 800,
                justifyContent: 'center',
                boxShadow: '0 6px 20px var(--primary-glow)'
              }}
            >
              <Sparkles size={18} /> ĐĂNG KÝ TÀI KHOẢN & MỞ KHÓA NGAY
            </button>

            {/* Switch to Login Link */}
            <div style={{ marginTop: '10px', padding: '12px', borderRadius: '12px', background: '#f4fce3', border: '1px dashed rgba(187, 242, 70, 0.7)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Đã có tài khoản từ trước?
              </div>
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#15803d',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'underline'
                }}
              >
                <LogIn size={15} />
                <span>Đăng nhập tại đây</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </form>
        )}

        {/* ================= LOGIN VIEW ================= */}
        {tab === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="glass-panel" style={{ padding: '16px 18px', background: '#fbf9f4', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.04em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={15} />
                  <span>Thông Tin Đăng Nhập</span>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Tên đăng nhập (Username) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: hoangnam, admin..."
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    required
                    style={{ fontSize: '0.92rem', padding: '10px 14px', height: '44px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '4px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Mật khẩu bảo mật *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Nhập mật khẩu của bạn..."
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      style={{ fontSize: '0.92rem', padding: '10px 40px 10px 14px', height: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                      title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 800, justifyContent: 'center' }}
              >
                <LogIn size={18} /> ĐĂNG NHẬP VÀO ỨNG DỤNG
              </button>

              {/* Call-to-action when user doesn't have an account */}
              <div style={{ marginTop: '8px', padding: '14px', borderRadius: '12px', background: '#fef7e9', border: '1px dashed #f59e0b', textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Chưa có tài khoản trên hệ thống?
                </div>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(''); }}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    fontSize: '0.88rem',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <UserPlus size={16} />
                  <span>Đăng ký tài khoản & Khai báo thể trạng</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            {/* Privacy Protection Note */}
            <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Lock size={13} color="#10b981" />
              <span>Hệ thống bảo mật dữ liệu riêng tư & an toàn tuyệt đối.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
