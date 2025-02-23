import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bot, MessageSquare, Settings, Menu, X } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkAdminStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAdminStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoading(true);
      
      if (!session) {
        setIsAdmin(false);
        return;
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select()
        .eq('email', session.user.email)
        .single();

      setIsAdmin(!!adminUser);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }
  
  const menuItems = [
    { to: '/', icon: MessageSquare, label: 'Chats' },
    ...(!isLoading && isAdmin ? [{ to: '/admin', icon: Settings, label: 'Admin' }] : [])
  ];

  const MenuItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        location.pathname === to
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="h-full bg-gray-50 flex overscroll-none">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 lg:w-64 flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 p-3 lg:p-4">
        <div className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3">
          <Bot className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">SPARKY</h1>
            <p className="text-xs text-gray-500">Smart Professional Appliance Repair Knowledge System</p>
          </div>
        </div>
        <nav className="mt-6 lg:mt-8 flex flex-col gap-2">
          {menuItems.map((item) => (
            <MenuItem key={item.to} {...item} />
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 ios-safe-area-fix android-safe-area-fix">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-base font-bold text-gray-900 truncate max-w-[180px]">SPARKY</h1>
              <p className="text-xs text-gray-500">Smart Professional Appliance Repair Knowledge System</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white z-40 transform transition-transform md:hidden safe-area-inset-bottom ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-base font-bold text-gray-900 truncate max-w-[140px]">SPARKY</h1>
              <p className="text-xs text-gray-500">Smart Professional Appliance Repair Knowledge System</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-3 sm:p-4 flex flex-col gap-2">
          {menuItems.map(item => <MenuItem key={item.to} {...item} />)}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}