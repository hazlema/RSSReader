// DatabaseManagementTab.tsx
import React from 'react';
import { Database } from 'lucide-react';

interface DatabaseManagementTabProps {
  isDarkMode: boolean;
  onOpenDbModal: () => void;
}

export const DatabaseManagementTab: React.FC<DatabaseManagementTabProps> = ({ isDarkMode, onOpenDbModal }) => {
  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Database Management
      </h3>
      <div className="space-y-4">
        <div className={`border rounded-lg p-4 ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
        }`}>
          <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Database Viewer
          </h4>
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View, export, and import database contents
          </p>
          <button
            onClick={onOpenDbModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Database className="w-4 h-4 mr-2" />
            Open Database Viewer
          </button>
        </div>
      </div>
    </div>
  );
};