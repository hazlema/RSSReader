import React from 'react';
import { X, AlertCircle, Undo2 } from 'lucide-react';

interface UnpublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  story: any;
  isDarkMode: boolean;
}

export const UnpublishModal: React.FC<UnpublishModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  story,
  isDarkMode
}) => {
  if (!isOpen || !story) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
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
            <AlertCircle className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Unpublish Story
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
            Are you sure you want to unpublish this story?
          </p>
          
          <div className={`p-3 rounded-lg mb-6 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h3 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {story.title}
            </h3>
          </div>
          
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            This will mark the story as unpublished and make it visible in your feed again.
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
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`inline-flex items-center px-4 py-2 rounded-md text-white transition-colors ${
                isDarkMode
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Unpublish Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};