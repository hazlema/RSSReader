// ApiSettingsTab.tsx
import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

interface ApiSettingsTabProps {
  apiKeys: any[];
  onSendMessage: (message: any) => void;
  isDarkMode: boolean;
  validateXaiKey: (keyValue: string) => void;
}

export const ApiSettingsTab: React.FC<ApiSettingsTabProps> = ({ apiKeys, onSendMessage, isDarkMode, validateXaiKey }) => {
  const [editingGroup, setEditingGroup] = useState<'xai' | 'twitter' | null>(null);
  const [editingApiValues, setEditingApiValues] = useState<{ [key: string]: string }>({});

  const xaiKeys = apiKeys.filter(apiKey => apiKey.key_name === 'XAI_API_KEY');
  const twitterKeys = apiKeys.filter(apiKey => [
    'ACCESS_SECRET',
    'ACCESS_TOKEN',
    'CONSUMER_KEY',
    'CONSUMER_SECRET',
    'BEARER'
  ].includes(apiKey.key_name));

  const handleApiKeyChange = (keyName: string, value: string) => {
    setEditingApiValues(prev => ({ ...prev, [keyName]: value }));
  };

  const handleEditGroup = (group: 'xai' | 'twitter') => {
    setEditingGroup(group);
    const groupKeys = group === 'xai' ? xaiKeys : twitterKeys;
    const values = {};
    groupKeys.forEach(key => {
      values[key.key_name] = key.key_value || '';
    });
    setEditingApiValues(values);
  };

  const handleCancelGroup = () => {
    setEditingGroup(null);
    setEditingApiValues({});
  };

  const handleSaveGroup = (group: 'xai' | 'twitter') => {
    Object.keys(editingApiValues).forEach(keyName => {
      const keyValue = editingApiValues[keyName] || '';
      onSendMessage({
        type: 'update_api_key',
        payload: { keyName, keyValue }
      });
    });

    if (group === 'xai') {
      const xaiKey = editingApiValues['XAI_API_KEY'];
      if (xaiKey && xaiKey.trim()) {
        validateXaiKey(xaiKey);
      }
    }
    // TODO: Validate Twitter keys if function available

    setEditingGroup(null);
    setEditingApiValues({});
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        API Settings
      </h3>
      
      {/* xAI API Keys */}
      <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
      }`}>
        <div className="bg-gray-800 text-white px-4 py-3 border-b border-gray-500">
          <h4 className="font-medium">
            xAI API Keys
          </h4>
        </div>
        <div className="p-4 space-y-2">
          {xaiKeys.map((apiKey: any) => (
            <div key={apiKey.key_name} className="flex items-center justify-between">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{apiKey.key_name}</span>
              {editingGroup === 'xai' ? (
                <input
                  type="text"
                  value={editingApiValues[apiKey.key_name] || ''}
                  onChange={(e) => handleApiKeyChange(apiKey.key_name, e.target.value)}
                  className={`px-3 py-1 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-800 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              ) : (
                <span>{apiKey.key_value ? '********' : 'Not set'}</span>
              )}
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex justify-end space-x-2">
          {editingGroup === 'xai' ? (
            <>
              <button
                onClick={() => handleSaveGroup('xai')}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-1" />
                Save & Validate
              </button>
              <button
                onClick={handleCancelGroup}
                className={`px-3 py-1.5 border rounded-md transition-colors ${
                  isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEditGroup('xai')}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Twitter API Keys */}
      <div className={`border rounded-lg overflow-hidden ${
        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
      }`}>
        <div className="bg-gray-800 text-white px-4 py-3 border-b border-gray-500">
          <h4 className="font-medium">
            Twitter API Keys
          </h4>
        </div>
        <div className="p-4 space-y-2">
          {twitterKeys.map((apiKey: any) => (
            <div key={apiKey.key_name} className="flex items-center justify-between">
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{apiKey.key_name}</span>
              {editingGroup === 'twitter' ? (
                <input
                  type="text"
                  value={editingApiValues[apiKey.key_name] || ''}
                  onChange={(e) => handleApiKeyChange(apiKey.key_name, e.target.value)}
                  className={`px-3 py-1 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-800 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              ) : (
                <span>{apiKey.key_value ? '********' : 'Not set'}</span>
              )}
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex justify-end space-x-2">
          {editingGroup === 'twitter' ? (
            <>
              <button
                onClick={() => handleSaveGroup('twitter')}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-1" />
                Save & Validate
              </button>
              <button
                onClick={handleCancelGroup}
                className={`px-3 py-1.5 border rounded-md transition-colors ${
                  isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEditGroup('twitter')}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};