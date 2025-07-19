import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Save, Trash2, Settings, Rss, Hash, MessageSquare, Database, AlertCircle, CheckCircle, Key, Twitter } from 'lucide-react';
import { ApiKeyItem } from './ApiKeyItem';
import { DatabaseViewModal } from './DatabaseViewModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onSendMessage: (message: any) => void;
  isDarkMode: boolean;
  initialTab?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  data,
  onSendMessage,
  isDarkMode,
  initialTab = 'feeds'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [newFeed, setNewFeed] = useState({ name: '', url: '', categories_uid: '', logo_url: '' });
  const [newCategory, setNewCategory] = useState('');
  const [newReaction, setNewReaction] = useState({ type: '', prompt: '' });
  const [editingFeed, setEditingFeed] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingReaction, setEditingReaction] = useState<any>(null);
  const [editingXaiKey, setEditingXaiKey] = useState(false);
  const [editingTwitterKeys, setEditingTwitterKeys] = useState(false);
  const [xaiKeyValue, setXaiKeyValue] = useState('');
  const [twitterKeyValues, setTwitterKeyValues] = useState({
    BEARER: '',
    CONSUMER_KEY: '',
    CONSUMER_SECRET: '',
    ACCESS_TOKEN: '',
    ACCESS_SECRET: ''
  });
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    isValid: boolean;
    message: string;
  }>({ isOpen: false, isValid: false, message: '' });
  const [isDatabaseViewOpen, setIsDatabaseViewOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (data.apiKeys) {
      const xaiKey = data.apiKeys.find(key => key.key_name === 'XAI_API_KEY');
      if (xaiKey) {
        setXaiKeyValue(xaiKey.key_value || '');
      }

      const twitterKeys = ['BEARER', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];
      const newTwitterValues = { ...twitterKeyValues };
      twitterKeys.forEach(keyName => {
        const key = data.apiKeys.find(k => k.key_name === keyName);
        if (key) {
          newTwitterValues[keyName] = key.key_value || '';
        }
      });
      setTwitterKeyValues(newTwitterValues);
    }
  }, [data.apiKeys]);

  if (!isOpen) return null;

  const handleAddFeed = () => {
    if (newFeed.name && newFeed.url) {
      onSendMessage({
        type: 'add_feed',
        payload: {
          name: newFeed.name,
          url: newFeed.url,
          categories_uid: newFeed.categories_uid ? parseInt(newFeed.categories_uid) : null,
          logo_url: newFeed.logo_url || null
        }
      });
      setNewFeed({ name: '', url: '', categories_uid: '', logo_url: '' });
    }
  };

  const handleUpdateFeed = () => {
    if (editingFeed) {
      onSendMessage({
        type: 'update_feed',
        payload: {
          uid: editingFeed.uid,
          name: editingFeed.name,
          url: editingFeed.url,
          active: editingFeed.active,
          categories_uid: editingFeed.categories_uid,
          logo_url: editingFeed.logo_url
        }
      });
      setEditingFeed(null);
    }
  };

  const handleDeleteFeed = (uid: number) => {
    onSendMessage({ type: 'delete_feed', payload: { uid } });
  };

  const handleAddCategory = () => {
    if (newCategory) {
      onSendMessage({ type: 'add_category', payload: { title: newCategory } });
      setNewCategory('');
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      onSendMessage({
        type: 'update_category',
        payload: { uid: editingCategory.uid, title: editingCategory.title }
      });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (uid: number) => {
    onSendMessage({ type: 'delete_category', payload: { uid } });
  };

  const handleAddReaction = () => {
    if (newReaction.type && newReaction.prompt) {
      onSendMessage({
        type: 'add_reaction',
        payload: { type: newReaction.type, prompt: newReaction.prompt }
      });
      setNewReaction({ type: '', prompt: '' });
    }
  };

  const handleUpdateReaction = () => {
    if (editingReaction) {
      onSendMessage({
        type: 'update_reaction',
        payload: {
          uid: editingReaction.uid,
          type: editingReaction.type,
          prompt: editingReaction.prompt
        }
      });
      setEditingReaction(null);
    }
  };

  const handleDeleteReaction = (uid: number) => {
    onSendMessage({ type: 'delete_reaction', payload: { uid } });
  };

  const validateXaiKey = async (keyValue: string) => {
    try {
      const response = await fetch('/api/check-xapi');
      const result = await response.json();
      
      setValidationModal({
        isOpen: true,
        isValid: result.valid,
        message: result.valid 
          ? 'XAI API key is valid and working!' 
          : result.message || 'XAI API key validation failed'
      });
      
      return result.valid;
    } catch (error) {
      setValidationModal({
        isOpen: true,
        isValid: false,
        message: 'Unable to validate XAI API key. Please check your connection.'
      });
      return false;
    }
  };

  const handleSaveXaiKey = async () => {
    // Save the key first
    onSendMessage({
      type: 'update_api_key',
      payload: { keyName: 'XAI_API_KEY', keyValue: xaiKeyValue }
    });

    // Then validate it
    const isValid = await validateXaiKey(xaiKeyValue);
    
    if (isValid) {
      setEditingXaiKey(false);
    }
    // If invalid, keep editing mode so user can fix it
  };

  const handleSaveTwitterKeys = () => {
    Object.entries(twitterKeyValues).forEach(([keyName, keyValue]) => {
      onSendMessage({
        type: 'update_api_key',
        payload: { keyName, keyValue }
      });
    });
    setEditingTwitterKeys(false);
  };

  const handleCancelXaiEdit = () => {
    const xaiKey = data.apiKeys.find(key => key.key_name === 'XAI_API_KEY');
    setXaiKeyValue(xaiKey?.key_value || '');
    setEditingXaiKey(false);
  };

  const handleCancelTwitterEdit = () => {
    const twitterKeys = ['BEARER', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];
    const resetValues = { ...twitterKeyValues };
    twitterKeys.forEach(keyName => {
      const key = data.apiKeys.find(k => k.key_name === keyName);
      resetValues[keyName] = key?.key_value || '';
    });
    setTwitterKeyValues(resetValues);
    setEditingTwitterKeys(false);
  };

  const tabs = [
    { id: 'about', label: 'About', icon: Settings },
    { id: 'api', label: 'API Settings', icon: Key },
    { id: 'feeds', label: 'RSS Feeds', icon: Rss },
    { id: 'categories', label: 'Categories', icon: Hash },
    { id: 'reactions', label: 'Reactions', icon: MessageSquare },
    { id: 'purge', label: 'Purge Stories', icon: Trash2 }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Settings
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDatabaseViewOpen(true)}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <Database className="w-4 h-4 mr-2" />
                Database View
              </button>
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

          <div className="flex h-[calc(90vh-8rem)]">
            {/* Sidebar */}
            <div className={`w-64 border-r ${
              isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
            }`}>
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                        activeTab === tab.id
                          ? isDarkMode
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-blue-50 text-blue-700'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'about' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      About RSS Reader
                    </h3>
                    <button
                      onClick={() => setIsDatabaseViewOpen(true)}
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Database View
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Version
                      </h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        RSS Reader v0.1.5
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Total Feeds
                          </p>
                          <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {data.feeds?.length || 0}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Total Stories
                          </p>
                          <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {data.stories?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-8">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    API Configuration
                  </h3>

                  {/* XAI API Configuration */}
                  <div className={`border rounded-lg p-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          XAI API Configuration
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Used for AI-powered content generation and analysis
                        </p>
                      </div>
                      {!editingXaiKey && (
                        <button
                          onClick={() => setEditingXaiKey(true)}
                          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-600'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          XAI API Key
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type={editingXaiKey ? "text" : "password"}
                            value={xaiKeyValue}
                            onChange={(e) => setXaiKeyValue(e.target.value)}
                            placeholder="Enter your XAI API key"
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDarkMode
                                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                                : 'border-gray-300 bg-white text-gray-900'
                            }`}
                            readOnly={!editingXaiKey}
                          />
                          
                          {editingXaiKey && (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveXaiKey}
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelXaiEdit}
                                className={`px-3 py-2 border rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Twitter API Configuration */}
                  <div className={`border rounded-lg p-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className={`text-lg font-medium flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Twitter className="w-5 h-5 mr-2" />
                          Twitter/X API Configuration
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Required for social media integration and publishing
                        </p>
                      </div>
                      {!editingTwitterKeys && (
                        <button
                          onClick={() => setEditingTwitterKeys(true)}
                          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-600'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {Object.entries(twitterKeyValues).map(([keyName, keyValue]) => (
                        <div key={keyName}>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {keyName.replace(/_/g, ' ')}
                          </label>
                          <input
                            type={editingTwitterKeys ? "text" : "password"}
                            value={keyValue}
                            onChange={(e) => setTwitterKeyValues(prev => ({
                              ...prev,
                              [keyName]: e.target.value
                            }))}
                            placeholder={`Enter your ${keyName.replace(/_/g, ' ').toLowerCase()}`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDarkMode
                                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                                : 'border-gray-300 bg-white text-gray-900'
                            }`}
                            readOnly={!editingTwitterKeys}
                          />
                        </div>
                      ))}

                      {editingTwitterKeys && (
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={handleCancelTwitterEdit}
                            className={`px-4 py-2 border rounded-md transition-colors ${
                              isDarkMode
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveTwitterKeys}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save All
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'feeds' && (
                <div>
                  <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    RSS Feeds
                  </h3>
                  
                  {/* Add new feed form */}
                  <div className={`border rounded-lg p-4 mb-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Add New Feed
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Feed Name"
                        value={newFeed.name}
                        onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <input
                        type="url"
                        placeholder="RSS URL"
                        value={newFeed.url}
                        onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <select
                        value={newFeed.categories_uid}
                        onChange={(e) => setNewFeed({ ...newFeed, categories_uid: e.target.value })}
                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {data.categories?.map((category) => (
                          <option key={category.uid} value={category.uid}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        placeholder="Logo URL (optional)"
                        value={newFeed.logo_url}
                        onChange={(e) => setNewFeed({ ...newFeed, logo_url: e.target.value })}
                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>
                    <button
                      onClick={handleAddFeed}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feed
                    </button>
                  </div>

                  {/* Existing feeds */}
                  <div className="space-y-4">
                    {data.feeds?.map((feed) => (
                      <div key={feed.uid} className={`border rounded-lg p-4 ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                      }`}>
                        {editingFeed?.uid === feed.uid ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={editingFeed.name}
                                onChange={(e) => setEditingFeed({ ...editingFeed, name: e.target.value })}
                                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-800 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                              <input
                                type="url"
                                value={editingFeed.url}
                                onChange={(e) => setEditingFeed({ ...editingFeed, url: e.target.value })}
                                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-800 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                              <select
                                value={editingFeed.categories_uid || ''}
                                onChange={(e) => setEditingFeed({ ...editingFeed, categories_uid: e.target.value ? parseInt(e.target.value) : null })}
                                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-800 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              >
                                <option value="">Select Category</option>
                                {data.categories?.map((category) => (
                                  <option key={category.uid} value={category.uid}>
                                    {category.title}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="url"
                                value={editingFeed.logo_url || ''}
                                onChange={(e) => setEditingFeed({ ...editingFeed, logo_url: e.target.value })}
                                placeholder="Logo URL (optional)"
                                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              />
                            </div>
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingFeed.active}
                                  onChange={(e) => setEditingFeed({ ...editingFeed, active: e.target.checked ? 1 : 0 })}
                                  className="mr-2"
                                />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Active
                                </span>
                              </label>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleUpdateFeed}
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingFeed(null)}
                                className={`px-3 py-2 border rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {feed.name}
                              </h4>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {feed.url}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Category: {feed.category_name || 'None'} | Status: {feed.active ? 'Active' : 'Inactive'}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingFeed(feed)}
                                className={`p-2 rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFeed(feed.uid)}
                                className={`p-2 rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Categories
                  </h3>
                  
                  {/* Add new category form */}
                  <div className={`border rounded-lg p-4 mb-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Add New Category
                    </h4>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <button
                        onClick={handleAddCategory}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Existing categories */}
                  <div className="space-y-4">
                    {data.categories?.map((category) => (
                      <div key={category.uid} className={`border rounded-lg p-4 ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                      }`}>
                        {editingCategory?.uid === category.uid ? (
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              value={editingCategory.title}
                              onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode
                                  ? 'border-gray-600 bg-gray-800 text-white'
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                            <button
                              onClick={handleUpdateCategory}
                              className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
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
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {category.title}
                            </h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingCategory(category)}
                                className={`p-2 rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.uid)}
                                className={`p-2 rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reactions' && (
                <div>
                  <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Reaction Templates
                  </h3>
                  
                  {/* Add new reaction form */}
                  <div className={`border rounded-lg p-4 mb-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Add New Reaction
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Reaction Type (e.g., 'sarcastic', 'excited')"
                        value={newReaction.type}
                        onChange={(e) => setNewReaction({ ...newReaction, type: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <textarea
                        placeholder="Reaction Prompt (use [{story}] as placeholder for story title)"
                        value={newReaction.prompt}
                        onChange={(e) => setNewReaction({ ...newReaction, prompt: e.target.value })}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <button
                        onClick={handleAddReaction}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reaction
                      </button>
                    </div>
                  </div>

                  {/* Existing reactions */}
                  <div className="space-y-4">
                    {data.reactions?.map((reaction) => (
                      <div key={reaction.uid} className={`border rounded-lg p-4 ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                      }`}>
                        {editingReaction?.uid === reaction.uid ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editingReaction.type}
                              onChange={(e) => setEditingReaction({ ...editingReaction, type: e.target.value })}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode
                                  ? 'border-gray-600 bg-gray-800 text-white'
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                            <textarea
                              value={editingReaction.prompt}
                              onChange={(e) => setEditingReaction({ ...editingReaction, prompt: e.target.value })}
                              rows={3}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode
                                  ? 'border-gray-600 bg-gray-800 text-white'
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                            <div className="flex space-x-3">
                              <button
                                onClick={handleUpdateReaction}
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingReaction(null)}
                                className={`px-3 py-2 border rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {reaction.type}
                              </h4>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {reaction.prompt}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => setEditingReaction(reaction)}
                                className={`p-2 rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReaction(reaction.uid)}
                                className={`p-2 rounded-md transition-colors ${
                                  isDarkMode
                                    ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      {validationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className={`rounded-lg shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                {validationModal.isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {validationModal.isValid ? 'Validation Successful' : 'Validation Failed'}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className={`mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {validationModal.message}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={() => setValidationModal({ isOpen: false, isValid: false, message: '' })}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    validationModal.isValid
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : isDarkMode
                        ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database View Modal */}
      <DatabaseViewModal
        isOpen={isDatabaseViewOpen}
        onClose={() => setIsDatabaseViewOpen(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
};