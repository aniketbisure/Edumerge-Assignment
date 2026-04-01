import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Briefcase,
  CreditCard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'admission_officer', 'management'] },
    { name: 'Applicants', path: '/applicants', icon: <Users size={20} />, roles: ['admin', 'admission_officer'] },
    { name: 'Master Setup', path: '/master-setup', icon: <Settings size={20} />, roles: ['admin'] },
    { name: 'Programs', path: '/programs', icon: <Briefcase size={20} />, roles: ['admin'] },
    { name: 'Payroll', path: '/payroll', icon: <CreditCard size={20} />, roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-navy-700">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-headings font-bold text-accent">edumerge</span>
          </Link>
          <div className="mt-4 px-2 py-1 bg-navy-800 rounded-full text-xs inline-block text-accent border border-accent/20">
            {user?.role?.toUpperCase()?.replace('_', ' ') || 'USER'}
          </div>
        </div>

        <nav className="mt-8 px-4 flex-grow space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:bg-navy-800 hover:text-white'}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-navy-800 hover:text-white rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 uppercase tracking-tight font-headings">
            School Admission CRM
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
