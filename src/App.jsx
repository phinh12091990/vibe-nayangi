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
          <div style={{ width: '42px', height: '42px', minWidth: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff5238, #ff9100)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255, 82, 56, 0.4)' }}>
            <span style={{ fontSize: '1.5rem' }}>🍲</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, overflow: 'hidden' }}>
            <div className="brand-title" style={{ fontSize: '1.35rem', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
              Nay Ăn Gì
            </div>
            <div>
              <span className="brand-badge" style={{ fontSize: '0.65rem', padding: '2px 8px', letterSpacing: '0.04em' }}>
                AI ASSISTANT
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav-list">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', margin: '8px 0 4px 8px' }}>
            Menu Điều Hướng
          </div>
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Sparkles size={20} />
            <span>Quay Món Thông Minh</span>
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Utensils size={20} />
            <span>Sổ Món Thực Đơn</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <HistoryIcon size={20} />
            <span>Nhật Ký & Thống Kê</span>
          </NavLink>
        </nav>

        {/* Profile / Account Card in Sidebar */}
        <div className="sidebar-profile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', minWidth: '38px', borderRadius: '10px', background: isAdmin ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 145, 0, 0.18)', border: isAdmin ? '1px solid #ffc107' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                {profile.avatar || (isAdmin ? '👑' : '🧑‍💻')}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.name || 'Hồ Sơ Của Bạn'}
                  </div>
                  {isAdmin && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ffc107', background: 'rgba(255, 193, 7, 0.18)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                      ADMIN
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{profile.username || 'user'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {/* Only Admin can view and switch between all user accounts */}
              {isAdmin && (
                <button 
                  onClick={openSwitchAccount}
                  style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '6px', color: '#ffc107', cursor: 'pointer', padding: '4px' }}
                  title="👑 Quản trị tất cả tài khoản thành viên"
                >
                  <Users size={15} />
                </button>
              )}
              <button 
                onClick={logout}
                style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                title="Đăng xuất (Khóa ứng dụng)"
              >
                <LogOut size={16} />
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
            <span style={{ color: '#ffa000', fontWeight: 600 }}>
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
        <header className="mobile-only-header" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
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
