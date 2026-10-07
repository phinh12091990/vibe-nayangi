import { useState } from 'react';
import { useStorage, calculateBMI, calculateTDEE } from '../hooks/useStorage';
import { triggerConfetti } from '../utils/confetti';
import { 
  Lock, Sparkles, UserPlus, LogIn, Activity, Target, 
  ShieldAlert, Eye, EyeOff, Check, Flame, ArrowRight, UserCheck
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
  const { accounts, createAccount, login, createDemoAccount } = useStorage();
  const [tab, setTab] = useState('register'); // 'register' | 'login'
  const [showPassword, setShowPassword] = useState(false);
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
    if (!regForm.name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    createAccount({
      ...regForm,
      name: regForm.name.trim(),
      username: regForm.username.trim() || `user_${Date.now().toString().slice(-4)}`,
      height: Number(regForm.height),
      weight: Number(regForm.weight),
      age: Number(regForm.age)
    });

    triggerConfetti();
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const uname = loginUsername.trim().toLowerCase();
    const found = accounts.find(a => (a.username || '').toLowerCase() === uname || (a.name || '').toLowerCase() === uname);
    if (found) {
      login(found.id);
      triggerConfetti();
    } else {
      setErrorMsg('Không tìm thấy tài khoản với tên đăng nhập này.');
    }
  };

  const handleQuickDemo = () => {
    createDemoAccount();
    triggerConfetti();
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(255, 122, 24, 0.15) 0%, rgba(10, 13, 24, 0.98) 70%)',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: 'linear-gradient(180deg, rgba(20, 25, 46, 0.92) 0%, rgba(13, 16, 30, 0.96) 100%)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255, 145, 0, 0.3)',
        borderRadius: '24px',
        padding: '28px 24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 122, 24, 0.18)',
        boxSizing: 'border-box'
      }}>
        
        {/* Brand & Locked App Banner */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 145, 0, 0.12)', border: '1px solid rgba(255, 145, 0, 0.3)', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🍲</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffa726', letterSpacing: '0.02em' }}>NAY ĂN GÌ</span>
            <span className="brand-badge" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>AI ASSISTANT</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.85rem)', fontWeight: 900, margin: '6px 0', lineHeight: 1.25, background: 'linear-gradient(135deg, #ffffff 40%, #ffb74d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Thiết Lập Tài Khoản & Khai Báo Thể Trạng
          </h2>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ffb74d', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255, 145, 0, 0.08)', padding: '6px 12px', borderRadius: '10px', marginTop: '4px' }}>
            <Lock size={15} />
            <span>Vui lòng đăng ký tài khoản để mở khóa gợi ý thực đơn & dữ liệu dinh dưỡng</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`glass-pill ${tab === 'register' ? 'active' : ''}`}
            style={{
              padding: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              justifyContent: 'center',
              cursor: 'pointer',
              background: tab === 'register' ? 'rgba(255, 145, 0, 0.22)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: tab === 'register' ? '#ff9100' : 'rgba(255, 255, 255, 0.1)',
              color: tab === 'register' ? '#ffa726' : 'var(--text-muted)'
            }}
          >
            <UserPlus size={16} />
            <span>Đăng Ký Tài Khoản Mới</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`glass-pill ${tab === 'login' ? 'active' : ''}`}
            style={{
              padding: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              justifyContent: 'center',
              cursor: 'pointer',
              background: tab === 'login' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: tab === 'login' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
              color: tab === 'login' ? '#38bdf8' : 'var(--text-muted)'
            }}
          >
            <LogIn size={16} />
            <span>Đăng Nhập ({accounts.length})</span>
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
            <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff9100', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                        border: regForm.avatar === av ? '2px solid #ff7a18' : '1px solid rgba(255,255,255,0.1)',
                        background: regForm.avatar === av ? 'rgba(255,122,24,0.25)' : 'rgba(255,255,255,0.04)',
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

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '10px' }}>
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
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Tên đăng nhập (Username)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="VD: hoangnam" 
                    value={regForm.username} 
                    onChange={e => setRegForm(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="form-input" 
                      placeholder="Mật khẩu tài khoản" 
                      value={regForm.password} 
                      onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
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
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Tuổi</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="10" 
                    max="100" 
                    value={regForm.age} 
                    onChange={e => setRegForm(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* 2. Health & Fitness Profile Declaration */}
            <div className="glass-panel" style={{ padding: '14px', background: 'rgba(255, 145, 0, 0.05)', borderColor: 'rgba(255, 145, 0, 0.22)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#ff9100', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} />
                <span>2. Khai Báo Hồ Sơ Sức Khỏe & Thể Trạng</span>
              </div>

              {/* Real-time Health Metrics Card */}
              <div style={{ background: 'rgba(15, 19, 35, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={16} color="#ff9100" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>Chỉ Số Thể Trạng Trực Tiếp:</span>
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
                    Ước tính tiêu hao: <strong style={{ color: '#ffa726' }}>~{tdeeVal} kcal/ngày</strong>
                  </div>
                </div>

                <div style={{ height: '7px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', marginTop: '8px' }}>
                  <div style={{ width: '25%', background: '#38bdf8' }} />
                  <div style={{ width: '40%', background: '#10b981' }} />
                  <div style={{ width: '20%', background: '#f59e0b' }} />
                  <div style={{ width: '15%', background: '#ef4444' }} />
                </div>
              </div>

              {/* Gender, Height & Weight */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
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
                          border: regForm.gender === g ? '1px solid #ff7a18' : '1px solid rgba(255,255,255,0.1)',
                          background: regForm.gender === g ? 'rgba(255,122,24,0.2)' : 'rgba(255,255,255,0.04)',
                          color: regForm.gender === g ? '#ffb74d' : 'var(--text-muted)',
                          fontWeight: regForm.gender === g ? 700 : 500,
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
                    value={regForm.height} 
                    onChange={e => setRegForm(prev => ({ ...prev, height: e.target.value }))}
                    required
                    style={{ height: '40px' }}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {GOALS.map(g => {
                    const isSelected = regForm.goal === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => setRegForm(prev => ({ ...prev, goal: g.id }))}
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
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? g.color : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {g.label}
                          </div>
                          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {g.desc}
                          </div>
                        </div>
                        {isSelected && <Check size={14} color={g.color} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Level */}
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>Mức độ vận động:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {ACTIVITIES.map(act => {
                    const isSelected = regForm.activity === act.id;
                    return (
                      <div
                        key={act.id}
                        onClick={() => setRegForm(prev => ({ ...prev, activity: act.id }))}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #ff9100' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(255,145,0,0.14)' : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{act.icon}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isSelected ? '#ffa726' : '#ffffff' }}>{act.label}</span>
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
                boxShadow: '0 8px 24px rgba(255, 82, 56, 0.5)'
              }}
            >
              <Sparkles size={18} /> ĐĂNG KÝ TÀI KHOẢN & MỞ KHÓA NGAY
            </button>

            {/* Quick Demo Option */}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleQuickDemo}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Hoặc trải nghiệm nhanh với tài khoản mẫu (Dân Văn Phòng) ⚡
              </button>
            </div>

          </form>
        )}

        {/* ================= LOGIN VIEW ================= */}
        {tab === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {accounts.length > 0 ? (
              <div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Tài khoản đã lưu trên thiết bị của bạn (Bấm để đăng nhập ngay):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {accounts.map(acc => {
                    const accBmi = calculateBMI(Number(acc.weight), Number(acc.height));
                    return (
                      <div
                        key={acc.id}
                        className="glass-panel"
                        onClick={() => { login(acc.id); triggerConfetti(); }}
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderColor: 'rgba(255, 145, 0, 0.25)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 145, 0, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                            {acc.avatar || '🧑‍💻'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{acc.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              @{acc.username} • BMI {accBmi.bmi} • {acc.goal}
                            </div>
                          </div>
                        </div>

                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                          Đăng nhập <ArrowRight size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                Chưa có tài khoản nào được lưu trên thiết bị này. Vui lòng bấm sang tab <strong>Đăng Ký Tài Khoản</strong> để tạo tài khoản mới.
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ marginTop: '8px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Hoặc đăng nhập theo Tên đăng nhập (Username):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập username của bạn..."
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
                    Đăng nhập
                  </button>
                </div>
              </div>
            </form>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleQuickDemo}
              style={{ width: '100%', padding: '10px', marginTop: '4px', justifyContent: 'center' }}
            >
              ⚡ Trải nghiệm nhanh với tài khoản mẫu
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
