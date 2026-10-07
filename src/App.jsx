import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Sparkles, Utensils, History as HistoryIcon, User, Settings, Activity, UserPlus, Users, LogOut } from 'lucide-react';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import HistoryPage from './pages/History';
import AccountModal from './components/AccountModal';
import AuthGate from './components/AuthGate';
import { useStorage, calculateBMI } from './hooks/useStorage';

function AppLayout() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('create');
  const { profile, isLoggedIn, logout } = useStorage();

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
              <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px', background: 'rgba(255, 145, 0, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                {profile.avatar || '🧑‍💻'}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile.name || 'Hồ Sơ Của Bạn'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{profile.username || 'danvanphong'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button 
                onClick={openSwitchAccount}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Đổi tài khoản khác"
              >
                <Users size={16} />
              </button>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
            <button 
              className="btn btn-secondary"
              style={{ padding: '7px 6px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={openEditProfile}
              title="Chỉnh sửa thể trạng hiện tại"
            >
              <Activity size={13} /> Sửa thể trạng
            </button>
            <button 
              className="btn btn-primary"
              style={{ padding: '7px 6px', fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={openCreateAccount}
              title="Tạo tài khoản mới & Khai báo thể trạng"
            >
              <UserPlus size={13} /> Tạo TK mới
            </button>
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
            <button 
              className="glass-pill"
              style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(255,145,0,0.14)', borderColor: '#ff9100', color: '#ffa726' }}
              onClick={openCreateAccount}
              title="Tạo tài khoản mới & khai báo thể trạng"
            >
              <UserPlus size={13} />
              <span>Tạo TK</span>
            </button>

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
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
