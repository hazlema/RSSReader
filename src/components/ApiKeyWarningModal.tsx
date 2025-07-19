import React from 'react';
import { X, Key, Settings } from 'lucide-react';

interface ApiKeyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
}

export const ApiKeyWarningModal: React.FC<ApiKeyWarningModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  isDarkMode
}) => {
  if (!isOpen) return null;

  const handleOpenSettings = () => {
    onClose();
    onOpenSettings();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-lg shadow-xl max-w-md w-full ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Key className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              API Setup Required
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-500 hover:text-gray-300' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            To publish stories, you'll need to configure your API credentials first. This enables AI-powered content generation and social media publishing.
          </p>
          
          <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't worry - this is a one-time setup that takes just a few minutes!
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded-md transition-colors ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Maybe Later
            </button>
            <button
              onClick={handleOpenSettings}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Setup API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};