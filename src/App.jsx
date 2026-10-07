import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Sparkles, Utensils, History as HistoryIcon, User, Settings, Activity, UserPlus, Users, LogOut } from 'lucide-react';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import HistoryPage from './pages/History';
import AccountModal from './components/AccountModal';
import AuthGate from './components/AuthGate';
import { StorageProvider, useStorage, calculateBMI } from './hooks/useStorage';

function AppLayout() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('create');
  const { profile, isLoggedIn, isAdmin, logout } = useStorage();

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
          <div style={{ width: '44px', height: '44px', minWidth: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #bbf246 0%, #a3e635 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(187, 242, 70, 0.45)' }}>
            <span style={{ fontSize: '1.5rem' }}>🍲</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, overflow: 'hidden' }}>
            <div className="brand-title" style={{ fontSize: '1.35rem', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
              Nay Ăn Gì
            </div>
            <div>
              <span className="brand-badge" style={{ fontSize: '0.62rem', padding: '2px 8px', letterSpacing: '0.04em' }}>
                NUTRIGO DIET • AI
              </span>
            </div>
          </div>
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

        {/* Nutrigo Promo Card in Sidebar */}
        <div className="sidebar-promo-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.4rem' }}>🥗</span>
            <span className="sidebar-promo-badge">NUTRIGO AI</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '12px', background: isAdmin ? 'rgba(255, 193, 7, 0.2)' : 'rgba(187, 242, 70, 0.35)', border: isAdmin ? '1px solid #ffc107' : '1px solid rgba(187, 242, 70, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                {profile.avatar || (isAdmin ? '👑' : '🧑‍💻')}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.name || 'Hồ Sơ Của Bạn'}
                  </div>
                  {isAdmin && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      ADMIN
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{profile.username || 'user'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Only Admin can view and switch between all user accounts */}
              {isAdmin && (
                <button 
                  onClick={openSwitchAccount}
                  style={{ background: '#fef3c7', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', color: '#b45309', cursor: 'pointer', padding: '4px' }}
                  title="👑 Quản trị tất cả tài khoản thành viên"
                >
                  <Users size={15} />
                </button>
              )}
              <button 
                onClick={logout}
                style={{ background: '#ffe4e6', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '6px', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}
                title="Đăng xuất (Khóa ứng dụng)"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Thể trạng (BMI):</span>
            <span style={{ color: bmiInfo.color, fontWeight: 700 }}>
              {bmiInfo.bmi} ({bmiInfo.status})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Mục tiêu:</span>
            <span style={{ color: '#ea580c', fontWeight: 700 }}>
              {profile.goal || 'Cân bằng'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button 
              className="btn btn-secondary"
              style={{ flex: 1, padding: '7px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={openEditProfile}
              title="Chỉnh sửa hồ sơ thể trạng của tôi"
            >
              <Activity size={13} /> Sửa thể trạng
            </button>
            {isAdmin && (
              <button 
                className="btn btn-primary"
                style={{ flex: 1, padding: '7px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
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
        <header className="mobile-only-header" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🍲</span>
            <div>
              <h1 className="brand-title" style={{ fontSize: '1.15rem' }}>Nay Ăn Gì</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isAdmin && (
              <button 
                className="glass-pill"
                style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(255,193,7,0.14)', borderColor: '#ffc107', color: '#ffc107' }}
                onClick={openSwitchAccount}
                title="👑 Quản trị tất cả tài khoản"
              >
                <Users size={13} />
                <span>Quản trị</span>
              </button>
            )}

            <button 
              className="glass-pill"
              style={{ padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
              onClick={openEditProfile}
            >
              <span style={{ fontSize: '1rem', marginRight: '2px' }}>{profile.avatar || '🧑‍💻'}</span>
              <span style={{ color: bmiInfo.color }}>BMI {bmiInfo.bmi}</span>
            </button>

            <button 
              onClick={logout}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Đăng xuất"
            >
              <LogOut size={14} />
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
