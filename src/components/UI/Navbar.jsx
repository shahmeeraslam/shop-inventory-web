import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ensure the path accurately targets your context file

// ==========================================
// SEMI-COMPONENT 1: Brand Logo Identity
// ==========================================
function NavLogo({ onNavigate }) {
  return (
    <div 
      onClick={() => onNavigate('dashboard')} 
      className="flex items-center gap-2 cursor-pointer select-none group"
    >
      <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
        <span className="text-white font-bold text-lg">A</span>
      </div>
      <span className="text-lg font-black tracking-tight text-slate-900 sm:block hidden">
        The Archive
      </span>
    </div>
  );
}

// ==========================================
// SEMI-COMPONENT 2: Desktop Links Menu
// ==========================================
function DesktopMenu({ currentScreen, onNavigate }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'add-item', label: 'Add Stock', icon: '➕' },
    { id: 'import-sheet', label: 'Scan & Import', icon: '📥' }, 
    { id: 'billing', label: 'Invoicing & Bills', icon: '💳' },
    { id: 'billing-history', label: 'Ledger History', icon: '📑' }, 
  ];

  return (
    <div className="hidden md:flex items-center gap-1">
      {links.map((link) => {
        const isActive = currentScreen === link.id;
        return (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-slate-100 text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// SEMI-COMPONENT 3: User Clearance Profile Badge
// ==========================================
function UserProfileBlock({ user, onLogout }) {
  const getInitials = (fullName) => {
    if (!fullName) return 'OP';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-slate-100">
      <div className="flex flex-col text-right">
        <span className="text-xs font-black text-slate-900 tracking-tight">
          {user?.name || 'System Operator'}
        </span>
        <span className="text-[10px] font-mono font-bold text-teal-600 uppercase tracking-wider">
          Sys Admin
        </span>
      </div>
      
      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center font-bold text-slate-700 text-xs shadow-inner select-none">
        {getInitials(user?.name)}
      </div>

      <button
        onClick={onLogout}
        className="text-xs font-mono font-bold text-rose-500 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-slate-200/40 hover:border-rose-200/40 transition-all cursor-pointer"
        title="Terminate Secure Session"
      >
        LOGOUT
      </button>
    </div>
  );
}

// ==========================================
// SEMI-COMPONENT 4: Mobile Sidebar Toggle Trigger
// ==========================================
function MobileMenuToggle({ isOpen, setIsOpen }) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
    >
      {isOpen ? (
        <span className="text-xl font-bold leading-none block w-6 h-6">✕</span>
      ) : (
        <span className="text-xl font-bold leading-none block w-6 h-6">☰</span>
      )}
    </button>
  );
}

// ==========================================
// MAIN REUSABLE SUITE: The Connected Navbar
// ==========================================
export default function Navbar({ currentScreen, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleMobileNav = (screenId) => {
    onNavigate(screenId);
    setIsMobileMenuOpen(false); 
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'OP';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Block Identity */}
          <NavLogo onNavigate={onNavigate} />

          {/* Right Interface Alignment Cluster */}
          <div className="flex items-center gap-4">
            {/* Middle Desktop Actions */}
            <DesktopMenu currentScreen={currentScreen} onNavigate={onNavigate} />

            {/* Premium Clearance Profile Tracker */}
            <UserProfileBlock user={user} onLogout={logout} />

            {/* Right Mobile Drawer Activation Interface */}
            <MobileMenuToggle isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
          </div>

        </div>
      </div>

      {/* ==========================================
          SEMI-COMPONENT 5: Mobile Responsive Drawer 
          ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1.5 shadow-lg animate-fadeIn">
          <button
            onClick={() => handleMobileNav('dashboard')}
            className={`w-full text-left p-3 rounded-xl text-sm font-bold flex items-center gap-3 cursor-pointer ${
              currentScreen === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <span>📊</span> Dashboard
          </button>
          <button
            onClick={() => handleMobileNav('add-item')}
            className={`w-full text-left p-3 rounded-xl text-sm font-bold flex items-center gap-3 cursor-pointer ${
              currentScreen === 'add-item' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <span>➕</span> Add Stock Item
          </button>
          <button
            onClick={() => handleMobileNav('import-sheet')}
            className={`w-full text-left p-3 rounded-xl text-sm font-bold flex items-center gap-3 cursor-pointer ${
              currentScreen === 'import-sheet' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <span>📥</span> Scan & Import
          </button>
          <button
            onClick={() => handleMobileNav('billing')}
            className={`w-full text-left p-3 rounded-xl text-sm font-bold flex items-center gap-3 cursor-pointer ${
              currentScreen === 'billing' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <span>💳</span> Invoicing & Bills
          </button>
          <button
            onClick={() => handleMobileNav('billing-history')}
            className={`w-full text-left p-3 rounded-xl text-sm font-bold flex items-center gap-3 cursor-pointer ${
              currentScreen === 'billing-history' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <span>📑</span> Ledger History
          </button>
          
          {/* Mobile Profile Visual Anchor & Logout Module */}
          {/* CHANGED: Swapped visibility class to md:hidden to match outer drawer logic */}
          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between px-3 md:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[11px]">
                {getInitials(user?.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900">
                  {user?.name || 'System Operator'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Sys Admin
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="text-xs font-mono font-bold text-rose-500 bg-rose-50/60 px-3 py-1.5 rounded-lg border border-rose-100"
            >
              LOGOUT
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}