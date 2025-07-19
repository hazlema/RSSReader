// PurgeTab.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PurgeTabProps {
  categories: any[];
  onSendMessage: (message: any) => void;
  isDarkMode: boolean;
}

export const PurgeTab: React.FC<PurgeTabProps> = ({ categories, onSendMessage, isDarkMode }) => {
  const handlePurgeStories = (type: string, payload?: any) => {
    const confirmMessage = {
      'all': 'Are you sure you want to delete ALL stories? This cannot be undone.',
      'category': 'Are you sure you want to delete all stories from this category?',
      'old_stories': `Are you sure you want to delete all stories older than ${payload?.days} days?`,
      'source': 'Are you sure you want to delete all stories from this source?'
    }[type];

    if (!confirm(confirmMessage)) return;

    const messageType = {
      'all': 'purge_all_stories',
      'category': 'purge_category_stories',
      'old_stories': 'purge_old_stories',
      'source': 'purge_source_stories'
    }[type];

    onSendMessage({
      type: messageType,
      payload
    });
  };

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Purge Stories
      </h3>
      <div className={`border rounded-md p-4 mb-6 ${
        isDarkMode 
          ? 'bg-red-900/20 border-red-800 text-red-300' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <p className="font-medium">Warning: These actions cannot be undone!</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className={`border rounded-lg p-4 ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
        }`}>
          <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Purge All Stories
          </h4>
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Delete all stories from the database
          </p>
          <button
            onClick={() => handlePurgeStories('all')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Purge All Stories
          </button>
        </div>

        <div className={`border rounded-lg p-4 ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
        }`}>
          <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Purge by Category
          </h4>
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Delete all stories from a specific category
          </p>
          <div className="flex space-x-3">
            <select
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              onChange={(e) => {
                if (e.target.value) {
                  handlePurgeStories('category', { categories_uid: parseInt(e.target.value) });
                  e.target.value = '';
                }
              }}
            >
              <option value="">Select Category to Purge</option>
              {categories?.map((category: any) => (
                <option key={category.uid} value={category.uid}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
        }`}>
          <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Purge Old Stories
          </h4>
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Delete stories older than a specified number of days
          </p>
          <div className="flex space-x-3">
            <input
              type="number"
              placeholder="Days"
              min="1"
              className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const days = parseInt((e.target as HTMLInputElement).value);
                  if (days > 0) {
                    handlePurgeStories('old_stories', { days });
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                const days = parseInt(input.value);
                if (days > 0) {
                  handlePurgeStories('old_stories', { days });
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Purge Old Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};