import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Sparkles,
  Circle
} from 'lucide-react';
import { Button, Badge, Avatar, AvatarFallback } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = role === 'ADMIN' || role === 'MANAGER';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    ...(isAuthenticated ? [
      { href: '/dashboard', label: 'My Bookings', icon: LayoutDashboard },
      { href: '/events', label: 'My Events', icon: Sparkles },
    ] : []),
    ...(isAdmin ? [
      { href: '/admin/dashboard', label: 'Admin Panel', icon: Settings },
    ] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div 
              className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-80"
              onClick={() => navigate('/')}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-sm">
                <Circle className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-2xl font-bold text-neutral-900 tracking-tight">
                Motive
              </span>
              <Badge variant="outline" className="ml-1 text-xs bg-primary-50 text-primary-700 border-primary-200">
                MICE
              </Badge>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href || 
                  (link.href !== '/dashboard' && location.pathname.startsWith(link.href));
                return (
                  <button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {role && (
                    <Badge 
                      variant="outline" 
                      className="hidden border-white/30 bg-white/10 text-white sm:inline-flex"
                    >
                      {role}
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-white/30">
                      <AvatarFallback className="text-xs">
                        {user?.name?.slice(0, 1) || user?.email?.slice(0, 1) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="hidden text-white/90 hover:bg-white/10 hover:text-white sm:flex"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:from-primary-700 hover:to-primary-800"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="rounded-lg p-2 text-white/90 hover:bg-white/10 md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-primary-700/50 backdrop-blur md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.href}
                    onClick={() => {
                      navigate(link.href);
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10"
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </button>
                );
              })}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-white/90 hover:bg-white/10"
                  >
                    <User className="h-5 w-5" />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 bg-white/20 text-white hover:bg-white/30"
                  >
                    <Sparkles className="h-5 w-5" />
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700">
                <Circle className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-semibold text-gray-900">Motive</span>
              <Badge variant="outline" className="text-xs bg-primary-50 text-primary-700 border-primary-200">
                MICE
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 Motive — Professional Event Planning Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
