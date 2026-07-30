import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, DollarSign, LogOut, Shield, ScrollText } from 'lucide-react';
import './Admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/icon.png" alt="DrPumpkinHead" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/commissions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={18} /> Commissions
          </NavLink>
          <NavLink to="/admin/clients" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={18} /> Clients
          </NavLink>
          <NavLink to="/admin/prices" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <DollarSign size={18} /> Price List
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Shield size={18} /> Users
          </NavLink>
          <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <ScrollText size={18} /> Audit Logs
          </NavLink>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
