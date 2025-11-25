// components/Layout.tsx
// components/Layout.tsx
import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, Home, Users, ChevronLeft, ChevronRight, Menu, X, ShieldCheck } from 'lucide-react';
import type { User as UserType } from './types/types';

interface LayoutProps {
  children: ReactNode;
  user: UserType;
  onLogout: () => void;
  role: 'instructor' | 'student';
}

export default function Layout({ children, user, onLogout, role }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const instructorNavItems = [
    { path: '/instructor', label: 'Dashboard', icon: Home },
    { path: '/instructor/reviews', label: 'Reviews', icon: Users },
  ];

  const studentNavItems = [
    { path: '/student', label: 'Dashboard', icon: Home },
  ];

  const navItems = role === 'instructor' ? instructorNavItems : studentNavItems;

  const isActivePath = (path: string) => {
    if (path === '/instructor' || path === '/student') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div 
        className={`fixed inset-y-0 left-0 bg-white shadow-lg transition-all duration-300 z-30 ${
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                <h1 className="text-lg font-semibold text-gray-900">
                  {role === 'instructor' ? 'Instructor Portal' : 'Student Portal'}
                </h1>
                <p className="text-sm text-gray-500 capitalize">{role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`font-medium transition-opacity duration-300 ${
                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className={`flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className={`flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${
                isSidebarOpen ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 ${
                isSidebarOpen ? 'opacity-100' : 'opacity-0'
              }`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-40 top-16 transition-all duration-300 ${
          isSidebarOpen ? 'left-60' : 'left-4'
        } w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg`}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isSidebarOpen ? 'pl-64' : 'pl-0'
      }`}>
        {/* Optional: Mobile menu button for small screens */}
        <div className="lg:hidden fixed top-9 right-4 z-40">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {children}
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}