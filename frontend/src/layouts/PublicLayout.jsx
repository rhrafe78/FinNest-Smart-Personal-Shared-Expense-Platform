import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowRight, ShieldCheck, Sparkles, Mail, Globe } from 'lucide-react';

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
    { name: 'ফিচারসমূহ', path: '/features' },
    { name: 'কীভাবে কাজ করে', path: '/how-it-works' },
    { name: 'প্রাইসিং', path: '/pricing' },
    { name: 'আমাদের সম্পর্কে', path: '/about' },
    { name: 'যোগাযোগ', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 selection:bg-brand-600 selection:text-white relative">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                  location.pathname === link.path ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Link to="/app/dashboard">
                <Button variant="primary" size="sm" className="font-semibold text-xs px-4 py-2">
                  ড্যাশবোর্ডে যান <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs">
                    লগইন
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="font-semibold text-xs px-4 py-2">
                    ফ্রি অ্যাকাউন্ট খুলুন
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
          <div className="md:hidden px-4 pt-2 pb-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link to="/app/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full text-xs font-semibold">
                    ড্যাশবোর্ডে যান
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-xs font-semibold">
                      লগইন
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full text-xs font-semibold">
                      ফ্রি অ্যাকাউন্ট খুলুন
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

      {/* Ultra-Clean SaaS Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b13] pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 pb-12">
            {/* Brand column */}
            <div className="md:col-span-4 space-y-5">
              <Logo size="lg" />
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                FINNEST is the dual-engine financial SaaS built for modern personal budgeting, roommate mess cost-splitting, and intelligent debt settlement.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Bank-Grade Decimal Math Precision</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">All Systems Operational (99.9% Uptime)</span>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://github.com/rhrafe78/FinNest-Smart-Personal-Shared-Expense-Platform"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-50 dark:hover:bg-slate-800/80 transition-all"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-50 dark:hover:bg-slate-800/80 transition-all"
                  aria-label="Twitter"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-50 dark:hover:bg-slate-800/80 transition-all"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                  </svg>
                </a>
                <Link
                  to="/contact"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-50 dark:hover:bg-slate-800/80 transition-all"
                  aria-label="Contact"
                >
                  <Mail className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product Column */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Features & Solutions
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Personal Expense Tracker</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Bachelor & Mess Cost Splitting</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Debt Simplification Engine</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Recurring Utilities & Rent Bills</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Shared Grocery Checklist</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Financial Health Analytics</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform & Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">How FinNest Works</Link></li>
                <li><Link to="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Pricing & Plans</Link></li>
                <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About Our Platform</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">24/7 Help & Support</Link></li>
                <li><Link to="/features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Multi-Currency (BDT, USD)</Link></li>
              </ul>
            </div>

            {/* Legal / Security Column */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Security & Trust
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Security Overview</Link></li>
                <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Report an Issue</Link></li>
              </ul>
              <div className="pt-2">
                <span className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  v1.2.0 &bull; Cloud SaaS
                </span>
              </div>
            </div>
          </div>

          {/* Elegant SaaS Bottom Bar */}
          <div className="pt-8 mt-2 border-t border-slate-200/90 dark:border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            {/* Left: Brand note & Copyright */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">&copy; {new Date().getFullYear()} FINNEST Inc.</span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span>All rights reserved.</span>
            </div>

            {/* Right: Essential Legal Links & Live Status Pill */}
            <div className="flex items-center gap-3.5 flex-wrap justify-center md:justify-end text-slate-500 dark:text-slate-400">
              <Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">
                Privacy
              </Link>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">
                Terms
              </Link>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium">
                Support
              </Link>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Systems Active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
