import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import {
  LayoutDashboard,
  Orbit,
  BookOpen,
  Bot,
  Compass,
  HelpCircle,
  Repeat,
  FolderArchive,
  BarChart3,
  Award,
  Settings,
  Flame,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Universe', path: '/universe', icon: Orbit },
  { name: 'My Subjects', path: '/subjects', icon: BookOpen },
  { name: 'AI Tutor', path: '/tutor', icon: Bot },
  { name: 'Learning Paths', path: '/paths', icon: Compass },
  { name: 'Quiz Center', path: '/quizzes', icon: HelpCircle },
  { name: 'Revision Center', path: '/revisions', icon: Repeat },
  { name: 'Resource Library', path: '/resources', icon: FolderArchive },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Achievements', path: '/achievements', icon: Award },
  { name: 'Profile & Settings', path: '/profile', icon: Settings },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getAll();
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.warn('Notification fetch warning');
      }
    };
    fetchNotifs();
  }, [location.pathname]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Mark read warning');
    }
  };

  const currentLevel = user?.level || 1;
  const currentXp = user?.xp || 100;
  const levelProgress = Math.min(100, Math.round(((currentXp % 300) / 300) * 100));

  return (
    <div className="flex h-screen bg-cosmic-darkest text-slate-100 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950/90 border-r border-cosmic-border backdrop-blur-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-4 py-4 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cosmic-indigo to-cosmic-violet p-0.5 shadow-cosmic-sm flex items-center justify-center shrink-0">
              <Orbit className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  MINDMAP AI
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                  KNOWLEDGE UNIVERSE
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cosmic-violet/25 to-cosmic-indigo/20 text-white border border-cosmic-violet/40 shadow-cosmic-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Gamified Level & XP Pill in Sidebar Footer */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-cosmic-violet flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Level {currentLevel}</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">{currentXp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cosmic-indigo to-cosmic-violet transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* User Profile / Logout footer */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Cosmic Student'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-slate-950/70 border-b border-cosmic-border backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Action / Breadcrumb indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-medium text-slate-200">Cosmic Knowledge Laboratory</span>
              <span>/</span>
              <span className="capitalize text-cosmic-violet">
                {location.pathname.replace('/', '') || 'Overview'}
              </span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center space-x-3">
            {/* Streak Counter */}
            <div
              title={`${user?.streak || 1} Day Learning Streak`}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-400 text-xs font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Flame className="w-4 h-4 animate-bounce" />
              <span>{user?.streak || 1}d Streak</span>
            </div>

            {/* Notifications Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              {/* Notification Popover Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200">Notifications ({unreadCount})</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                            n.read ? 'bg-slate-900/40 border-slate-800/40 text-slate-400' : 'bg-slate-900 border-cosmic-violet/40 text-slate-200'
                          }`}
                        >
                          <div className="font-semibold text-white mb-0.5">{n.title}</div>
                          <div className="text-[11px] leading-relaxed">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-cosmic-darkest p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
