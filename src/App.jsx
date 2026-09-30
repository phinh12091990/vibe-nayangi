import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Sparkles, Utensils, History as HistoryIcon, User, Settings, Activity } from 'lucide-react';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import HistoryPage from './pages/History';
import ProfileModal from './components/ProfileModal';
import { useStorage, calculateBMI } from './hooks/useStorage';

function AppLayout() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { profile } = useStorage();

  const bmiInfo = calculateBMI(Number(profile.weight), Number(profile.height));

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

        {/* Profile / Body Metrics Card in Sidebar */}
        <div className="sidebar-profile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 145, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#ff9100" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                {profile.name || 'Hồ Sơ Của Bạn'}
              </span>
            </div>
            <button 
              onClick={() => setProfileModalOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              title="Chỉnh sửa thể trạng & mục tiêu"
            >
              <Settings size={16} />
            </button>
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

          <button 
            className="btn btn-secondary"
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', marginTop: '4px' }}
            onClick={() => setProfileModalOpen(true)}
          >
            <Activity size={14} /> Cập nhật thể trạng
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Responsive Desktop & Mobile) */}
      <div className="main-content-wrapper">
        
        {/* Mobile-only Top Brand Header */}
        <header className="mobile-only-header" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem' }}>🍲</span>
            <div>
              <h1 className="brand-title" style={{ fontSize: '1.25rem' }}>Nay Ăn Gì</h1>
            </div>
          </div>

          <button 
            className="glass-pill"
            style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
            onClick={() => setProfileModalOpen(true)}
          >
            <User size={14} color="#ff9100" />
            <span style={{ color: bmiInfo.color }}>BMI: {bmiInfo.bmi}</span>
          </button>
        </header>

        {/* Dynamic Route Pages */}
        <Routes>
          <Route path="/" element={<HomePage onOpenProfile={() => setProfileModalOpen(true)} />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/history" element={<HistoryPage onOpenProfile={() => setProfileModalOpen(true)} />} />
        </Routes>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION (Visible on screen width < 1024px) */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Sparkles size={22} />
          <span>Quay số</span>
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

      {/* 4. USER PROFILE MODAL */}
      <ProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
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
