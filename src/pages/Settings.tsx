import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">Manage your account and preferences</p>
        </div>
      </div>

      {/* Placeholder for Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Coming Soon</h3>
        <p className="text-gray-500">Account settings and configuration options will be available here.</p>
      </div>
    </div>
  );
};

export default Settings;