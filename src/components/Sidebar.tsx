'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  BarChart3,
  CalendarCheck,
  Settings,
  Users,
  LogOut,
  Moon,
  Sun,
  Activity,
  Languages,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const traderLinks: SidebarLink[] = [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/trades', labelKey: 'nav.trades', icon: BookOpen },
    { href: '/trades/new', labelKey: 'nav.new_trade', icon: PlusCircle, shortcut: 'N' },
    { href: '/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
    { href: '/reviews', labelKey: 'nav.reviews', icon: CalendarCheck },
    { href: '/settings', labelKey: 'nav.settings', icon: Settings },
  ];

  const adminLinks: SidebarLink[] = [
    { href: '/users', labelKey: 'nav.users', icon: Users },
    { href: '/admin/analytics', labelKey: 'nav.system_analytics', icon: BarChart3 },
    { href: '/admin/settings', labelKey: 'nav.global_options', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : traderLinks;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen select-none shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">TRADEX</h1>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {isAdmin ? t('nav.admin_console') : t('nav.pro_trader')}
            </span>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
            isAdmin
              ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
          }`}
        >
          {user?.role || 'Guest'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href) && link.href !== '/trades');

          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{t(link.labelKey)}</span>
              </div>
              {link.shortcut && (
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-400 rounded">
                  {link.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area with Theme & Language Toggles */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Trader'}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Switch Language / ቋንቋ ቀይር"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'en' ? 'አማ' : 'EN'}</span>
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav.sign_out')}</span>
        </button>
      </div>
    </aside>
  );
};
