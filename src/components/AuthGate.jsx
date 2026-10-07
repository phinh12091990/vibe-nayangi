import { useState } from 'react';
import { useStorage, calculateBMI, calculateTDEE } from '../hooks/useStorage';
import { triggerConfetti } from '../utils/confetti';
import BrandLogo from './BrandLogo';
import FoodCaptcha from './FoodCaptcha';
import { 
  Lock, Sparkles, UserPlus, LogIn, Activity, Target, 
  ShieldAlert, Eye, EyeOff, Check, Flame, ArrowRight, UserCheck,
  Sun, Moon, User, Info, ShieldCheck, HelpCircle, CheckCircle2
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

/**
 * Flashlight Toggle Button with left-pointing rays (Images 1 & 2)
 */
function FlashlightButton({ isOn, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`btn-flashlight-toggle ${isOn ? 'illuminated' : ''}`}
      title={isOn ? "Tắt đèn pin / Ẩn mật khẩu" : "Bật đèn pin / Soi mật khẩu"}
    >
      <svg 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill={isOn ? "#fef08a" : "none"} 
        stroke={isOn ? "#eab308" : "currentColor"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="flashlight-svg"
      >
        <path d="M19 15V9a1 1 0 0 0-1-1h-6l-4-3v14l4-3h6a1 1 0 0 0 1-1z" />
        <line x1="19" y1="10" x2="22" y2="10" />
        <line x1="19" y1="14" x2="22" y2="14" />
        {isOn && (
          <>
            <line x1="3" y1="8" x2="1" y2="7" stroke="#eab308" strokeWidth="2" />
            <line x1="3" y1="12" x2="0" y2="12" stroke="#eab308" strokeWidth="2" />
            <line x1="3" y1="16" x2="1" y2="17" stroke="#eab308" strokeWidth="2" />
          </>
        )}
      </svg>
    </button>
  );
}

/**
 * Landscape Illustration Card matching sample (Images 1, 2, 3)
 * Full rich vector artwork: layered crisp mountains, pine forest silhouetted horizon,
 * glowing crater moon/sun, soft misty fog, floating nutrient badges.
 */
function AuthLandscape({ theme, lang }) {
  const isDark = theme !== 'light';

  return (
    <div className={`auth-landscape-card ${isDark ? 'night' : 'day'}`}>
      <div className="landscape-sky">
        
        {/* Soft background ambient glow */}
        <div className="landscape-ambient-radial" />

        {/* Celestial body: Moon in Night, Sun in Day */}
        {isDark ? (
          <div className="landscape-celestial moon" title="Mặt trăng đêm Nay Ăn Gì">
            <div className="moon-glow" />
            <div className="moon-sphere">
              <span className="moon-crater c1" />
              <span className="moon-crater c2" />
              <span className="moon-crater c3" />
              <span className="moon-crater c4" />
            </div>
          </div>
        ) : (
          <div className="landscape-celestial sun" title="Mặt trời rạng rỡ Nay Ăn Gì">
            <div className="sun-aura" />
            <div className="sun-sphere" />
          </div>
        )}

        {/* Twinkling stars & constellations in night mode */}
        {isDark && (
          <div className="landscape-stars">
            <span className="star s1">✦</span>
            <span className="star s2">·</span>
            <span className="star s3">✦</span>
            <span className="star s4">·</span>
            <span className="star s5">✦</span>
            <span className="star s6">·</span>
            <span className="star s7">✦</span>
            <span className="star s8">·</span>
          </div>
        )}

        {/* Layered Crisp Geometric Mountain Peaks (Exact match to sample 1 & 2) */}
        <svg className="landscape-mountains" viewBox="0 0 500 360" preserveAspectRatio="none">
          <defs>
            {/* Back Mountain Gradients */}
            <linearGradient id="backMtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#2a3b53" : "#bfdbfe"} />
              <stop offset="100%" stopColor={isDark ? "#141e2e" : "#93c5fd"} />
            </linearGradient>
            
            {/* Mid Mountain Gradients */}
            <linearGradient id="midMtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#1e293b" : "#6ee7b7"} />
              <stop offset="100%" stopColor={isDark ? "#0f172a" : "#34d399"} />
            </linearGradient>

            {/* Front Peak Gradients */}
            <linearGradient id="frontMtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#121b29" : "#10b981"} />
              <stop offset="100%" stopColor={isDark ? "#080d14" : "#059669"} />
            </linearGradient>
          </defs>

          {/* Layer 1: Distant majestic mountain ridges */}
          <path 
            d="M-50 360 L90 140 L190 220 L310 110 L430 210 L550 360 Z" 
            fill="url(#backMtnGrad)" 
            opacity="0.75"
          />

          {/* Shaded facets for 3D realism on back peaks */}
          <path 
            d="M90 140 L190 220 L140 360 L-50 360 Z" 
            fill={isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(59, 130, 246, 0.2)"} 
          />
          <path 
            d="M310 110 L430 210 L380 360 L240 360 Z" 
            fill={isDark ? "rgba(15, 23, 42, 0.55)" : "rgba(37, 99, 235, 0.25)"} 
          />

          {/* Layer 2: Middle dramatic peaks */}
          <path 
            d="M-50 360 L40 210 L160 135 L270 230 L390 150 L550 360 Z" 
            fill="url(#midMtnGrad)" 
            opacity="0.9"
          />
          <path 
            d="M160 135 L270 230 L220 360 L80 360 Z" 
            fill={isDark ? "rgba(10, 15, 25, 0.6)" : "rgba(5, 150, 105, 0.25)"} 
          />

          {/* Layer 3: Foreground sweeping ridges with pine silhouettes */}
          <path 
            d="M-50 360 L110 220 L230 280 L350 205 L550 360 Z" 
            fill="url(#frontMtnGrad)" 
          />

          {/* Silhouette Pine Trees array along slopes */}
          <g fill={isDark ? "#05090f" : "#064e3b"} opacity="0.95">
            {/* Left slope pines */}
            <polygon points="20,270 12,295 28,295" />
            <polygon points="32,260 22,290 42,290" />
            <polygon points="46,252 35,285 57,285" />
            <polygon points="60,245 48,280 72,280" />
            <polygon points="76,240 64,275 88,275" />
            <polygon points="92,235 80,272 104,272" />
            
            {/* Mid ridge pines */}
            <polygon points="260,265 248,295 272,295" />
            <polygon points="278,255 264,290 292,290" />
            <polygon points="295,245 280,285 310,285" />
            <polygon points="315,235 300,275 330,275" />
            <polygon points="335,225 320,268 350,268" />
            <polygon points="352,218 338,260 366,260" />
            <polygon points="370,228 356,268 384,268" />
            <polygon points="390,240 376,278 404,278" />
          </g>
        </svg>

        {/* Ambient Lake / Valley Reflection Mist */}
        <div className="landscape-mist-fog" />
      </div>

      {/* Floating Nutrition Tags (Top Left) */}
      <div className="landscape-badges">
        <span className="floating-badge fb1">
          {lang === 'vi' ? '🥗 Calo chuẩn' : '🥗 Calorie Goal'}
        </span>
        <span className="floating-badge fb2">
          {lang === 'vi' ? '🥑 Dinh dưỡng AI' : '🥑 AI Nutrition'}
        </span>
      </div>

      {/* Overlay Description Content matching sample */}
      <div className="landscape-content-overlay">
        <div className="landscape-brand-row">
          <BrandLogo size={34} />
          <div>
            <h3 className="landscape-title">Nay Ăn Gì</h3>
            <span className="landscape-subtitle-tag">TRỢ LÝ BỮA ĂN AI</span>
          </div>
        </div>
        <p className="landscape-desc">
          {lang === 'vi' 
            ? 'Đăng nhập để nhận gợi ý món ngon chuẩn dinh dưỡng, theo dõi mục tiêu calo và quản lý thực đơn cá nhân.'
            : 'Sign in to get personalized nutritional meal suggestions and track your daily calorie balance.'}
        </p>
      </div>
    </div>
  );
}

export default function AuthGate() {
  const { accounts, createAccount, loginWithCredentials, theme, toggleTheme } = useStorage();
  const [tab, setTab] = useState('login'); // Default is 'login' per user request
  const [lang, setLang] = useState('vi'); // 'vi' | 'en'

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotTip, setShowForgotTip] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // CAPTCHA State
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Mouse cursor flashlight tracking (Buổi tối / Dark mode: chuột rê tới đâu đèn rọi sáng)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);

  const handleCardMouseMove = (e) => {
    if (theme === 'light') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Register Form State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
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
      setErrorMsg(lang === 'vi' ? 'Vui lòng nhập họ và tên của bạn.' : 'Please enter your full name.');
      return;
    }

    const uname = (regForm.username || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!uname) {
      setErrorMsg(lang === 'vi' ? 'Vui lòng nhập Tên đăng nhập (Username).' : 'Please enter a username.');
      return;
    }

    if (uname === 'admin') {
      setErrorMsg(lang === 'vi' ? "Tên đăng nhập 'admin' là tài khoản Quản trị viên hệ thống. Vui lòng chọn tên khác." : "'admin' is reserved for system administrator.");
      return;
    }

    const isExisted = accounts.some(a => (a.username || '').toLowerCase() === uname);
    if (isExisted) {
      setErrorMsg(lang === 'vi' ? `Tên đăng nhập "${uname}" đã có người sử dụng. Vui lòng chọn tên khác.` : `Username "${uname}" already exists.`);
      return;
    }

    const pwd = (regForm.password || '').trim();
    if (!pwd || pwd.length < 4) {
      setErrorMsg(lang === 'vi' ? 'Vui lòng đặt mật khẩu bảo mật (tối thiểu 4 ký tự).' : 'Password must be at least 4 characters.');
      return;
    }

    if (pwd !== confirmPassword.trim()) {
      setErrorMsg(lang === 'vi' ? 'Mật khẩu xác nhận không khớp! Vui lòng nhập lại.' : 'Passwords do not match!');
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

  // Submit Login credentials
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const uname = loginUsername.trim();
    const pwd = loginPassword.trim();
    if (!uname) {
      setErrorMsg(lang === 'vi' ? 'Vui lòng nhập Tên đăng nhập hoặc Email.' : 'Please enter your username or email.');
      return;
    }
    if (!pwd) {
      setErrorMsg(lang === 'vi' ? 'Vui lòng nhập Mật khẩu bảo mật.' : 'Please enter your password.');
      return;
    }

    // Check credentials first
    const found = accounts.find(a => 
      (a.username || '').toLowerCase() === uname.toLowerCase() || 
      (a.name || '').toLowerCase() === uname.toLowerCase() ||
      (a.email || '').toLowerCase() === uname.toLowerCase()
    );

    if (!found || found.password !== pwd) {
      setErrorMsg(lang === 'vi' ? 'Tên đăng nhập hoặc mật khẩu không chính xác.' : 'Invalid username or password.');
      return;
    }

    // If credentials are valid but CAPTCHA not verified yet -> Prompt Food CAPTCHA!
    if (!isCaptchaVerified) {
      setShowCaptcha(true);
      return;
    }

    // Both credentials & CAPTCHA verified -> Login!
    const res = loginWithCredentials(uname, pwd);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      triggerConfetti();
    }
  };

  // CAPTCHA solved successfully
  const handleCaptchaSuccess = () => {
    setIsCaptchaVerified(true);
    setShowCaptcha(false);
    const uname = loginUsername.trim();
    const pwd = loginPassword.trim();
    if (uname && pwd) {
      const res = loginWithCredentials(uname, pwd);
      if (res.success) {
        triggerConfetti();
      }
    }
  };

  return (
    <div className="auth-gate-screen">
      
      {/* ================= 1. LOGIN SPLIT-CARD VIEW (Matching Images 1, 2, 3, 4) ================= */}
      {tab === 'login' ? (
        <div 
          className={`auth-gate-split-card ${theme === 'dark' ? 'night-interactive' : ''}`}
          onMouseMove={handleCardMouseMove}
          style={{
            '--mouse-x': `${mousePos.x}%`,
            '--mouse-y': `${mousePos.y}%`
          }}
        >
          {/* Dynamic Flashlight Beam Spotlight covering the card in Dark Mode */}
          {theme === 'dark' && (
            <div 
              className="night-mouse-flashlight-beam"
              style={{
                background: `radial-gradient(circle 180px at ${mousePos.x}% ${mousePos.y}%, rgba(254, 240, 138, 0.15) 0%, rgba(254, 240, 138, 0.05) 50%, transparent 80%)`
              }}
            />
          )}
          
          {/* Left Side: Landscape Sky Art (Sun / Moon) */}
          <div className="auth-split-left">
            <AuthLandscape theme={theme} lang={lang} />
          </div>

          {/* Right Side: Login Form with Flashlight Password & CAPTCHA */}
          <div className="auth-split-right">
            
            {/* Top Control Bar: Language Switch & Theme Toggle */}
            <div className="auth-top-controls">
              <div className="auth-lang-pills">
                <button
                  type="button"
                  className={`auth-lang-pill ${lang === 'vi' ? 'active' : ''}`}
                  onClick={() => setLang('vi')}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  type="button"
                  className={`auth-lang-pill ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => setLang('en')}
                >
                  🇬🇧 English
                </button>
              </div>

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

            {/* Main Form Content */}
            <div className="auth-form-body">
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <h2 className="auth-main-heading">
                  {lang === 'vi' ? 'Đăng nhập' : 'Log in'}
                </h2>
              </div>

              {errorMsg && (
                <div className="auth-error-banner">
                  <ShieldAlert size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Email / Username Input */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-text-input"
                      placeholder={lang === 'vi' ? 'Tên đăng nhập hoặc Email...' : 'Username or email...'}
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Input with FLASHLIGHT BEAM INTERACTION (Rê chuột tới đâu đèn pin sáng soi mật khẩu) */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div 
                    className={`auth-input-wrapper password-flashlight-field ${(showLoginPassword || isPasswordHovered) ? 'beam-on' : ''}`}
                    onMouseEnter={() => setIsPasswordHovered(true)}
                    onMouseLeave={() => setIsPasswordHovered(false)}
                  >
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type={(showLoginPassword || isPasswordHovered) ? 'text' : 'password'}
                      className="auth-text-input password-input-element"
                      placeholder={lang === 'vi' ? 'Nhập mật khẩu...' : 'Enter password...'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                    <div className="flashlight-beam-light" />
                    <FlashlightButton 
                      isOn={showLoginPassword || isPasswordHovered} 
                      onToggle={() => setShowLoginPassword(!showLoginPassword)} 
                    />
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="auth-options-row">
                  <label className="auth-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={e => setRememberMe(e.target.checked)} 
                      style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span>{lang === 'vi' ? 'Ghi nhớ tài khoản' : 'Remember me'}</span>
                  </label>

                  <button 
                    type="button" 
                    className="auth-link-btn"
                    onClick={() => setShowForgotTip(!showForgotTip)}
                  >
                    {lang === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                  </button>
                </div>

                {showForgotTip && (
                  <div className="auth-hint-card">
                    <HelpCircle size={14} color="#f59e0b" />
                    <span>
                      {lang === 'vi' 
                        ? 'Tài khoản Quản trị mẫu: admin / admin hoặc đăng ký tài khoản mới bên dưới.'
                        : 'Default Admin: admin / admin or register a new profile below.'}
                    </span>
                  </div>
                )}

                {/* Food CAPTCHA Quick Status Pill */}
                <button
                  type="button"
                  onClick={() => setShowCaptcha(true)}
                  className={`captcha-status-pill ${isCaptchaVerified ? 'verified' : ''}`}
                  title="Nhấn để mở xác thực CAPTCHA món ăn"
                >
                  {isCaptchaVerified ? (
                    <>
                      <CheckCircle2 size={15} color="#10b981" />
                      <span>{lang === 'vi' ? 'CAPTCHA Món Ăn: Đã xác thực ✓' : 'Food CAPTCHA: Verified ✓'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} color="#ea580c" />
                      <span>{lang === 'vi' ? 'Xác thực CAPTCHA Món Ăn (Chạm để mở)' : 'Verify Food CAPTCHA (Tap to open)'}</span>
                    </>
                  )}
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-auth-submit"
                >
                  <span>{lang === 'vi' ? 'Đăng nhập' : 'Log in'}</span>
                  <ArrowRight size={17} />
                </button>

                {/* Switch to Register */}
                <div className="auth-switch-footer">
                  <span>{lang === 'vi' ? 'Bạn chưa có tài khoản? ' : "Don't have an account? "}</span>
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setErrorMsg(''); }}
                    className="auth-switch-link"
                  >
                    {lang === 'vi' ? 'Đăng ký ngay' : 'Sign up'}
                  </button>
                </div>

              </form>
            </div>

          </div>

        </div>
      ) : (

        /* ================= 2. REGISTER FULL FORM VIEW (Tạo hồ sơ thể trạng AI) ================= */
        <div className="auth-gate-card">
          
          {/* Top Utility Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrandLogo size={40} />
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>Nay Ăn Gì</span>
                <span className="brand-badge" style={{ fontSize: '0.6rem', padding: '1px 6px', marginLeft: '6px' }}>
                  {lang === 'vi' ? 'ĐĂNG KÝ HỒ SƠ' : 'CREATE PROFILE'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Switch Pills */}
              <div className="auth-lang-pills">
                <button
                  type="button"
                  className={`auth-lang-pill ${lang === 'vi' ? 'active' : ''}`}
                  onClick={() => setLang('vi')}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  type="button"
                  className={`auth-lang-pill ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => setLang('en')}
                >
                  🇬🇧 English
                </button>
              </div>

              <button 
                type="button" 
                onClick={toggleTheme} 
                className="theme-switch-pill" 
                title={lang === 'vi' ? 'Chuyển chế độ Sáng / Tối' : 'Toggle Light / Dark mode'}
              >
                {theme === 'light' ? (
                  <>
                    <Sun size={13} color="#ea580c" />
                    <span>{lang === 'vi' ? '☀️ Sáng' : '☀️ Light'}</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} color="#bbf246" />
                    <span>{lang === 'vi' ? '🌙 Tối' : '🌙 Dark'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="auth-error-banner" style={{ marginBottom: '16px' }}>
              <ShieldAlert size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ marginBottom: '2px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 3px 0' }}>
                {lang === 'vi' ? 'Thiết Lập Tài Khoản & Thể Trạng' : 'Create Profile & Health Metrics'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {lang === 'vi' 
                  ? 'Khai báo chỉ số cơ thể để AI tính toán TDEE và gợi ý bữa ăn chuẩn xác.' 
                  : 'Enter your body metrics for AI to compute TDEE and tailored diet plans.'}
              </p>
            </div>

            {/* 1. Account Credentials */}
            <div className="glass-panel" style={{ padding: '14px', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#ea580c', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={15} />
                <span>{lang === 'vi' ? '1. Thông Tin Tài Khoản' : '1. Account Credentials'}</span>
              </div>

              {/* Avatar Selector */}
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '5px' }}>
                  {lang === 'vi' ? 'Chọn Avatar của bạn:' : 'Choose your Avatar:'}
                </label>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegForm(prev => ({ ...prev, avatar: av }))}
                      style={{
                        width: '36px',
                        height: '36px',
                        minWidth: '36px',
                        borderRadius: '10px',
                        border: regForm.avatar === av ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: regForm.avatar === av ? 'var(--primary-light)' : 'var(--bg-card)',
                        fontSize: '1.2rem',
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
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>
                    {lang === 'vi' ? 'Họ và tên hiển thị *' : 'Display Full Name *'}
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={lang === 'vi' ? 'VD: Nguyễn Hoàng Nam' : 'e.g. Alex Johnson'} 
                    value={regForm.name} 
                    onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>
                    {lang === 'vi' ? 'Tên đăng nhập (Username) *' : 'Username *'}
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={lang === 'vi' ? 'VD: hoangnam (viết liền)' : 'e.g. alexj (no spaces)'} 
                    value={regForm.username} 
                    onChange={e => setRegForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="auth-grid-2col">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>
                    {lang === 'vi' ? 'Mật khẩu bảo mật *' : 'Password *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="form-input" 
                      placeholder={lang === 'vi' ? 'Ít nhất 4 ký tự...' : 'At least 4 characters...'} 
                      value={regForm.password} 
                      onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      style={{ paddingRight: '36px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.76rem' }}>
                    {lang === 'vi' ? 'Xác nhận mật khẩu *' : 'Confirm Password *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      className="form-input" 
                      placeholder={lang === 'vi' ? 'Nhập lại mật khẩu...' : 'Re-enter password...'} 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      style={{ paddingRight: '36px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Body Metrics */}
            <div className="glass-panel" style={{ padding: '14px', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.04em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} />
                <span>{lang === 'vi' ? '2. Chỉ Số Cơ Thể & Thể Trạng AI' : '2. Body Metrics & AI Health'}</span>
              </div>

              <div className="auth-metrics-grid" style={{ marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>
                    {lang === 'vi' ? 'Tuổi' : 'Age'}
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={regForm.age} 
                    onChange={e => setRegForm(prev => ({ ...prev, age: e.target.value }))}
                    min="10" 
                    max="100" 
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>
                    {lang === 'vi' ? 'Giới tính' : 'Gender'}
                  </label>
                  <select 
                    className="form-input" 
                    value={regForm.gender} 
                    onChange={e => setRegForm(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="Nam">{lang === 'vi' ? 'Nam' : 'Male'}</option>
                    <option value="Nữ">{lang === 'vi' ? 'Nữ' : 'Female'}</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>
                    {lang === 'vi' ? 'Cao (cm)' : 'Height (cm)'}
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={regForm.height} 
                    onChange={e => setRegForm(prev => ({ ...prev, height: e.target.value }))}
                    min="100" 
                    max="220" 
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.74rem' }}>
                    {lang === 'vi' ? 'Nặng (kg)' : 'Weight (kg)'}
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={regForm.weight} 
                    onChange={e => setRegForm(prev => ({ ...prev, weight: e.target.value }))}
                    min="30" 
                    max="200" 
                    required
                  />
                </div>
              </div>

              {/* BMI Live Preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>BMI: {bmiInfo.bmi}</span>
                  <span style={{ fontSize: '0.74rem', color: bmiInfo.color, fontWeight: 700 }}>({bmiInfo.label})</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff7a18' }}>
                  🔥 TDEE: {tdeeVal} {lang === 'vi' ? 'kcal/ngày' : 'kcal/day'}
                </div>
              </div>
            </div>

            {/* Submit Register Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.96rem',
                fontWeight: 800,
                justifyContent: 'center',
                boxShadow: '0 6px 20px var(--primary-glow)'
              }}
            >
              <Sparkles size={16} /> {lang === 'vi' ? 'HOÀN TẤT ĐĂNG KÝ HỒ SƠ' : 'COMPLETE REGISTRATION'}
            </button>

            {/* Switch Back to Login */}
            <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <span>{lang === 'vi' ? 'Đã có tài khoản? ' : 'Already have an account? '}</span>
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ea580c',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.84rem'
                }}
              >
                {lang === 'vi' ? 'Đăng nhập tại đây →' : 'Sign in here →'}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ================= 3. FOOD CAPTCHA MODAL (Matching Image 5) ================= */}
      {showCaptcha && (
        <FoodCaptcha
          onSuccess={handleCaptchaSuccess}
          onClose={() => setShowCaptcha(false)}
          theme={theme}
          toggleTheme={toggleTheme}
          lang={lang}
          onLangChange={setLang}
        />
      )}

    </div>
  );
}
