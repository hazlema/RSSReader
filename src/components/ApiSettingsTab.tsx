// ApiSettingsTab.tsx
import React, { useState } from 'react';
import { ApiKeyItem } from './ApiKeyItem'; // Assuming this is in the same directory or adjust path

interface ApiSettingsTabProps {
  apiKeys: any[];
  onSendMessage: (message: any) => void;
  isDarkMode: boolean;
  validateXaiKey: (keyValue: string) => void;
}

export const ApiSettingsTab: React.FC<ApiSettingsTabProps> = ({ apiKeys, onSendMessage, isDarkMode, validateXaiKey }) => {
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [editingApiValues, setEditingApiValues] = useState<{ [key: string]: string }>({});

  const handleSaveApiKey = (keyName: string) => {
    const keyValue = editingApiValues[keyName] || '';
    
    onSendMessage({
      type: 'update_api_key',
      payload: { keyName, keyValue }
    });
    
    setEditingApiKey(null);
    setEditingApiValues(prev => ({ ...prev, [keyName]: '' }));
    
    // Validate XAI API key after saving
    if (keyName === 'XAI_API_KEY' && keyValue.trim()) {
      validateXaiKey(keyValue);
    }
  };

  const handleEditApiKey = (keyName: string, currentValue: string) => {
    setEditingApiKey(keyName);
    setEditingApiValues(prev => ({ ...prev, [keyName]: currentValue }));
  };

  const handleCancelApiKeyEdit = (keyName: string) => {
    setEditingApiKey(null);
    setEditingApiValues(prev => ({ ...prev, [keyName]: '' }));
  };

  const handleApiKeyChange = (keyName: string, value: string) => {
    setEditingApiValues(prev => ({ ...prev, [keyName]: value }));
  };

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        API Settings
      </h3>
      <div className="space-y-4">
        {apiKeys?.map((apiKey: any) => (
          <ApiKeyItem
            key={apiKey.key_name}
            apiKey={apiKey}
            isDarkMode={isDarkMode}
            isEditing={editingApiKey === apiKey.key_name}
            editingValue={editingApiValues[apiKey.key_name] || ''}
            onEdit={handleEditApiKey}
            onSave={handleSaveApiKey}
            onCancel={handleCancelApiKeyEdit}
            onChange={handleApiKeyChange}
          />
        ))}
      </div>
    </div>
  );
};