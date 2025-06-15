import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-blue-600 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-white hover:bg-blue-700 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center ml-4 lg:ml-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <div className="w-5 h-5 bg-blue-600 rounded-sm"></div>
              </div>
              <h1 className="text-xl font-bold text-white">Network Earnings</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            New Referral
          </button>
          
          <div className="relative">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">3</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-white font-medium">Alex</div>
              <div className="text-blue-200 text-sm">Premium Referrer</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;