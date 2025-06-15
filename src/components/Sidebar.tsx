import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Share, 
  RotateCcw, 
  DollarSign, 
  BarChart3, 
  Megaphone, 
  Settings,
  X,
  Plus
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Network', href: '/network', icon: Users },
    { name: 'Share Referral', href: '/share', icon: Share },
    { name: 'Referral History', href: '/history', icon: RotateCcw },
    { name: 'Earnings', href: '/earnings', icon: DollarSign },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'Lead Management', href: '/leads', icon: Users },
    { name: 'Admin Overview', href: '/admin', icon: BarChart3 },
    { name: 'Dispute Resolution', href: '/disputes', icon: RotateCcw },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        <div className="flex items-center justify-between h-16 px-6 border-b lg:hidden">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 lg:mt-0">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 px-4">
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Create New Referral
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;