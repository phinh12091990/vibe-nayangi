import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Sparkles, Utensils, History as HistoryIcon, User, Settings, Activity, UserPlus, Users, LogOut, Sun, Moon } from 'lucide-react';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import HistoryPage from './pages/History';
import AccountModal from './components/AccountModal';
import AuthGate from './components/AuthGate';
import BrandLogo from './components/BrandLogo';
import { StorageProvider, useStorage, calculateBMI } from './hooks/useStorage';

function AppLayout() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('create');
  const { profile, isLoggedIn, isAdmin, logout, theme, toggleTheme } = useStorage();

  const bmiInfo = calculateBMI(Number(profile.weight), Number(profile.height));

  const openCreateAccount = () => {
    setModalTab('create');
    setModalOpen(true);
  };

  const openEditProfile = () => {
    setModalTab('edit');
    setModalOpen(true);
  };

  const openSwitchAccount = () => {
    setModalTab('switch');
    setModalOpen(true);
  };

  // Lock entire application if user is not registered / logged in!
  if (!isLoggedIn) {
    return <AuthGate />;
  }

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Visible on screen width >= 1024px) */}
      <aside className="desktop-sidebar">
        {/* Brand */}
        <div className="sidebar-logo">
          <BrandLogo size={44} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="brand-title" style={{ fontSize: '1.25rem', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                Nay Ăn Gì
              </div>
              <span className="brand-badge" style={{ fontSize: '0.6rem', padding: '2px 7px', letterSpacing: '0.04em' }}>
                TRỢ LÝ BỮA ĂN • AI
              </span>
            </div>
            <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Dinh dưỡng & Thực đơn chuẩn vóc dáng
            </div>
          </div>
        </div>

        {/* Theme Switcher Pill in Sidebar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Giao diện
          </span>
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

        {/* Navigation Menu */}
        <nav className="sidebar-nav-list">
          <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '6px 0 4px 10px' }}>
            Menu Điều Hướng
          </div>
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Sparkles size={19} />
            <span>Quay Món Thông Minh</span>
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Utensils size={19} />
            <span>Sổ Món Thực Đơn</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <HistoryIcon size={19} />
            <span>Nhật Ký & Thống Kê</span>
          </NavLink>
        </nav>

        {/* Sidebar Promo Card */}
        <div className="sidebar-promo-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.4rem' }}>🥗</span>
            <span className="sidebar-promo-badge">TRỢ LÝ AI</span>
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
            Chăm Sóc Dinh Dưỡng Chuẩn Cá Nhân Hóa
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            Tối ưu calo và TDEE khoa học cho từng bữa ăn mỗi ngày.
          </div>
        </div>

        {/* Profile / Account Card in Sidebar */}
        <div className="sidebar-profile-card">
          {/* Row 1: Avatar, Name, Role and Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                minWidth: '42px', 
                borderRadius: '12px', 
                background: isAdmin ? 'rgba(245, 158, 11, 0.18)' : 'rgba(187, 242, 70, 0.22)', 
                border: isAdmin ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(187, 242, 70, 0.4)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.4rem',
                boxShadow: 'var(--shadow-xs)'
              }}>
                {profile.avatar || (isAdmin ? '👑' : '🧑‍💻')}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25 }}>
                    {profile.name || 'Hồ Sơ Của Bạn'}
                  </span>
                  {isAdmin && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.16)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      ADMIN
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  @{profile.username || 'user'}
                </div>
              </div>
            </div>

            {/* Quick Actions (Switch & Logout) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {isAdmin && (
                <button 
                  onClick={openSwitchAccount}
                  style={{ background: 'rgba(245, 158, 11, 0.14)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', color: '#f59e0b', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="👑 Quản trị tất cả tài khoản thành viên"
                >
                  <Users size={14} />
                </button>
              )}
              <button 
                onClick={logout}
                style={{ background: 'rgba(244, 63, 94, 0.14)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', color: '#f43f5e', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Đăng xuất (Khóa ứng dụng)"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* Quick Metrics mini tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.74rem' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: '1px' }}>Thể trạng (BMI)</div>
              <div style={{ color: bmiInfo.color, fontWeight: 800 }}>{bmiInfo.bmi} ({bmiInfo.status.split(' ')[0]})</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: '1px' }}>Mục tiêu</div>
              <div style={{ color: '#ea580c', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.goal || 'Cân bằng'}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
            <button 
              className="btn btn-secondary"
              style={{ flex: 1, padding: '7px 8px', fontSize: '0.76rem', justifyContent: 'center' }}
              onClick={openEditProfile}
              title="Chỉnh sửa hồ sơ thể trạng của tôi"
            >
              <Activity size={13} /> Sửa thể trạng
            </button>
            {isAdmin && (
              <button 
                className="btn btn-primary"
                style={{ flex: 1, padding: '7px 8px', fontSize: '0.76rem', justifyContent: 'center' }}
                onClick={openCreateAccount}
                title="Tạo tài khoản mới & Khai báo thể trạng"
              >
                <UserPlus size={13} /> + Thêm TK
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Responsive Desktop & Mobile) */}
      <div className="main-content-wrapper">
        
        {/* Mobile-only Top Brand Header */}
        <header className="mobile-only-header" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 0 }}>
            <BrandLogo size={32} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <h1 className="brand-title" style={{ fontSize: '1rem', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Nay Ăn Gì</h1>
                <span className="brand-badge" style={{ fontSize: '0.52rem', padding: '1px 5px', whiteSpace: 'nowrap' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap' }}>
                Dinh dưỡng & Vóc dáng
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            {isAdmin && (
              <button 
                className="glass-pill"
                style={{ padding: '5px 7px', fontSize: '0.72rem', cursor: 'pointer', background: 'rgba(255,193,7,0.14)', borderColor: '#ffc107', color: '#ffc107' }}
                onClick={openSwitchAccount}
                title="👑 Quản trị tất cả tài khoản"
              >
                <Users size={13} />
              </button>
            )}

            <button 
              className="glass-pill"
              style={{ padding: '4px 8px', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={openEditProfile}
              title="Xem hồ sơ thể trạng"
            >
              <span style={{ fontSize: '0.95rem' }}>{profile.avatar || '🧑‍💻'}</span>
              <span style={{ color: bmiInfo.color, fontWeight: 700 }}>{bmiInfo.bmi}</span>
            </button>

            {/* Quick Mobile Theme Switcher */}
            <button 
              type="button"
              onClick={toggleTheme}
              className="theme-icon-btn"
              style={{ width: '29px', height: '29px', padding: 0 }}
              title="Chuyển đổi Sáng / Tối"
            >
              {theme === 'light' ? <Sun size={14} color="#ea580c" /> : <Moon size={14} color="#bbf246" />}
            </button>

            <button 
              onClick={logout}
              style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', width: '29px', height: '29px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Đăng xuất"
            >
              <LogOut size={13} />
            </button>
          </div>
        </header>


        {/* Dynamic Route Pages */}
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                onOpenProfile={openEditProfile} 
                onOpenCreateAccount={openCreateAccount}
                onOpenSwitchAccount={openSwitchAccount}
              />
            } 
          />
          <Route path="/menu" element={<MenuPage />} />
          <Route 
            path="/history" 
            element={
              <HistoryPage 
                onOpenProfile={openEditProfile}
                onOpenCreateAccount={openCreateAccount}
                onOpenSwitchAccount={openSwitchAccount}
              />
            } 
          />
        </Routes>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION (Visible on screen width < 1024px) */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Sparkles size={22} />
          <span>Quay món</span>
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Utensils size={22} />
          <span>Sổ món</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <HistoryIcon size={22} />
          <span>Nhật ký</span>
        </NavLink>
      </nav>

      {/* 4. USER ACCOUNT & HEALTH PROFILE MODAL */}
      <AccountModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialTab={modalTab}
      />
    </>
  );
}

export default function App() {
  return (
    <StorageProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </StorageProvider>
  );
}
