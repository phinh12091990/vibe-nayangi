import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Utensils, History as HistoryIcon } from 'lucide-react';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import HistoryPage from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>

      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Quay số</span>
        </NavLink>
        <NavLink to="/menu" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Utensils size={24} />
          <span>Sổ món</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <HistoryIcon size={24} />
          <span>Nhật ký</span>
        </NavLink>
      </nav>
    </BrowserRouter>
  );
}
