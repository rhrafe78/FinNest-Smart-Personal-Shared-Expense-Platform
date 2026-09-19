import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  Home,
  CalendarDays,
  ShoppingCart,
  BarChart3,
  Bell,
  User,
  Plus,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Users2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

// Quick action modals
import { AddExpenseModal } from '../components/modals/AddExpenseModal';
import { AddIncomeModal } from '../components/modals/AddIncomeModal';
import { AddSharedExpenseModal } from '../components/modals/AddSharedExpenseModal';
import { CreateHouseholdModal } from '../components/modals/CreateHouseholdModal';
import { RecordSettlementModal } from '../components/modals/RecordSettlementModal';
import { AddBudgetModal } from '../components/modals/AddBudgetModal';
import { AddSavingsGoalModal } from '../components/modals/AddSavingsGoalModal';
import { AddBillModal } from '../components/modals/AddBillModal';

export const AppLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, quickLoginDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'expense', 'income', 'shared_expense', 'household', 'settlement', 'budget', 'goal', 'bill'

  useEffect(() => {
    // Fetch unread notifications count
    api.get('/notifications/unread-count/')
      .then((res) => setUnreadCount(res.data.unread_count || 0))
      .catch(() => {});
  }, [location.pathname]);

  const navGroups = [
    {
      group: 'প্রধান মেন্যু (Main)',
      items: [
        { name: 'ড্যাশবোর্ড ও আজকের হিসাব', shortName: 'ড্যাশবোর্ড', path: '/app/dashboard', icon: LayoutDashboard },
        { name: 'মেস ও রুমমেট হিসাব', shortName: 'মেস হিসাব', path: '/app/households', icon: Home },
        { name: 'দৈনিক খরচের খাতা (History)', shortName: 'খরচের খাতা', path: '/app/transactions', icon: Receipt },
      ],
    },
    {
      group: 'অন্যান্য ফিচার (More Tools)',
      items: [
        { name: 'মাসিক বাজেট ও সঞ্চয়', shortName: 'বাজেট ও সঞ্চয়', path: '/app/budgets', icon: PiggyBank },
        { name: 'আয়-ব্যয় রিপোর্ট ও গ্রাফ', shortName: 'রিপোর্ট', path: '/app/analytics', icon: BarChart3 },
        { name: 'মেস বাজার লিস্ট ও বিল', shortName: 'বাজার ও বিল', path: '/app/groceries', icon: ShoppingCart },
      ],
    },
    {
      group: 'সেটিংস ও নোটিফিকেশন',
      items: [
        { name: 'নোটিফিকেশন', shortName: 'নোটিফিকেশন', path: '/app/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
        { name: 'বেতন ও প্রোফাইল সেটিংস', shortName: 'প্রোফাইল', path: '/app/profile', icon: User },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0e17] text-slate-900 dark:text-slate-100">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0d131f] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
          <Logo size="md" to="/app/dashboard" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Buttons inside sidebar */}
        <div className="p-3.5 space-y-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full shadow-md shadow-brand-500/20 font-bold text-xs"
            icon={Plus}
            onClick={() => setActiveModal('expense')}
          >
            + আজকের খরচ লিখুন
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full font-bold text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
            icon={Home}
            onClick={() => setActiveModal('shared_expense')}
          >
            + মেসের খরচ যোগ
          </Button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {grp.group}
              </span>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Pill in Sidebar bottom */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.full_name || user?.username}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0a0e17]/90 backdrop-blur-md px-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                <span className="sm:hidden">{navGroups.flatMap((g) => g.items).find((i) => i.path === location.pathname)?.shortName || 'FinNest'}</span>
                <span className="hidden sm:inline">{navGroups.flatMap((g) => g.items).find((i) => i.path === location.pathname)?.name || 'FinNest'}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Quick 1-Tap Buttons on Header - Cleanly hidden on small mobile screens */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
              icon={Home}
              onClick={() => setActiveModal('shared_expense')}
            >
              মেসের খরচ
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex text-xs font-bold shadow-md shadow-brand-500/20"
              icon={Plus}
              onClick={() => setActiveModal('expense')}
            >
              খরচ লিখুন
            </Button>

            {/* Notifications Bell */}
            <Link
              to="/app/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{user?.full_name || user?.username}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  </div>

                  <Link
                    to="/app/profile"
                    className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    ⚙️ বেতন ও প্রোফাইল সেটিংস
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> লগ আউট (Sign Out)
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar - Super Friendly & Easy */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0d131f]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-[66px] pb-2 pt-1 px-2 shadow-2xl">
          <Link
            to="/app/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              location.pathname === '/app/dashboard'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">হোম</span>
          </Link>

          <Link
            to="/app/households"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              location.pathname === '/app/households'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">মেস গ্রুপ</span>
          </Link>

          {/* Center Floating Action Button */}
          <button
            onClick={() => setActiveModal('expense')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center -mt-6 shadow-lg shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all"
            title="খরচ লিখুন"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          <Link
            to="/app/transactions"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              location.pathname === '/app/transactions'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px]">খরচের খাতা</span>
          </Link>

          <Link
            to="/app/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              location.pathname === '/app/profile'
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">প্রোফাইল</span>
          </Link>
        </nav>
      </div>

      {/* Global Quick Action Modals */}
      <AddIncomeModal
        isOpen={activeModal === 'income'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
      <AddExpenseModal
        isOpen={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
      <AddSharedExpenseModal
        isOpen={activeModal === 'shared_expense'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
      <CreateHouseholdModal
        isOpen={activeModal === 'household'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
      <RecordSettlementModal
        isOpen={activeModal === 'settlement'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
      <AddBudgetModal
        isOpen={activeModal === 'budget'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
      <AddSavingsGoalModal
        isOpen={activeModal === 'goal'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
      <AddBillModal
        isOpen={activeModal === 'bill'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};
