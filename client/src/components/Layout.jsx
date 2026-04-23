import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Button, ConfirmModal } from '../ui';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar — white surface, visible shadow */}
      <nav className="sticky top-0 z-30 bg-card border-b border-line shadow-nav">
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base text-ink-900 tracking-tight">
              TaskFlow
            </span>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-btn
                  hover:bg-canvas transition-colors duration-150"
              >
                <Avatar name={user?.name} size="sm" />
                <span className="text-sm font-medium text-ink-700">{user?.name}</span>
                <svg className="w-3.5 h-3.5 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-52
                    bg-card border border-line rounded-card shadow-card-hover py-1">
                    <div className="px-4 py-2.5 border-b border-line">
                      <p className="text-[10px] text-ink-400 uppercase tracking-wider font-semibold">Signed in as</p>
                      <p className="text-sm font-semibold text-ink-900 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2.5 text-sm text-alert-600 font-medium
                        hover:bg-alert-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile logout — visible icon */}
            <div className="sm:hidden">
              <Button variant="ghost" size="sm" onClick={handleLogoutClick}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="info"
      />
    </div>
  );
}
