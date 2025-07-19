import React, { useState } from 'react';
import { Edit2, Save, Eye, EyeOff } from 'lucide-react';

interface ApiKeyItemProps {
  apiKey: {
    key_name: string;
    key_value: string | null;
  };
  isDarkMode: boolean;
  isEditing: boolean;
  editingValue: string;
  onEdit: (keyName: string, value: string) => void;
  onSave: (keyName: string) => void;
  onCancel: (keyName: string) => void;
  onChange: (keyName: string, value: string) => void;
}

export const ApiKeyItem: React.FC<ApiKeyItemProps> = ({
  apiKey,
  isDarkMode,
  isEditing,
  editingValue,
  onEdit,
  onSave,
  onCancel,
  onChange
}) => {
  const [showValue, setShowValue] = useState(false);
  
  const currentValue = isEditing ? editingValue : apiKey.key_value;

  const getDescription = (keyName: string) => {
    if (keyName === 'XAI_API_KEY') {
      return 'Used for AI-powered content generation and analysis';
    }
    if (['BEARER', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'].includes(keyName)) {
      return 'Twitter/X API credentials for social media integration';
    }
    return '';
  };

  return (
    <div className={`border rounded-lg p-4 ${
      isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <label className={`block text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {apiKey.key_name.replace(/_/g, ' ')}
        </label>
        {!isEditing && (
          <button
            onClick={() => setShowValue(!showValue)}
            className={`p-1 rounded transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type={showValue || isEditing ? "text" : "password"}
          value={currentValue || ''}
          onChange={(e) => onChange(apiKey.key_name, e.target.value)}
          placeholder={`Enter your ${apiKey.key_name.replace(/_/g, ' ').toLowerCase()}`}
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode
              ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
              : 'border-gray-300 bg-white text-gray-900'
          } ${!isEditing && !showValue ? 'font-mono' : ''}`}
          readOnly={!isEditing}
        />
        
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(apiKey.key_name)}
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCancel(apiKey.key_name)}
              className={`px-3 py-2 border rounded-md transition-colors ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(apiKey.key_name, apiKey.key_value || '')}
            className={`p-2 rounded-md transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {getDescription(apiKey.key_name) && (
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {getDescription(apiKey.key_name)}
        </p>
      )}
    </div>
  );
};