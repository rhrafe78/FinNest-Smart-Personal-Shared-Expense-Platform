import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0e17] text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0a0e17]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                  location.pathname === link.path ? 'text-brand-600 dark:text-brand-400 font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Link to="/app/dashboard">
                <Button variant="primary" size="md">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Create Free Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d131f] space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link to="/app/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Create Free Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Professional SaaS Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070a10] pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2 space-y-4">
              <Logo size="lg" />
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                FINNEST is the smart personal and shared expense management platform. Manage your money, split mess & household costs, settle debts easily, and stay in complete financial control.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Bank-grade Decimal Precision
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400">Personal Finance</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400">Shared Mess & Roommates</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400">Debt Simplification</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400">Recurring Bills</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400">Grocery Checklist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400">About FinNest</Link></li>
                <li><Link to="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400">Pricing Plans</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400">Contact Support</Link></li>
                <li><Link to="/how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400">Security & Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>&copy; {new Date().getFullYear()} FINNEST Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern personal & shared finance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
