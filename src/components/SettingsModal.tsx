import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Save, Trash2, AlertCircle, CheckCircle, Wand2, Database } from 'lucide-react';
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
  const [editingFeed, setEditingFeed] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingReaction, setEditingReaction] = useState<number | null>(null);
  const [editingXaiGroup, setEditingXaiGroup] = useState(false);
  const [editingTwitterGroup, setEditingTwitterGroup] = useState(false);
  const [editingValues, setEditingValues] = useState<any>({});
  const [newReaction, setNewReaction] = useState({ type: '', prompt: '' });
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    isValid: boolean;
    message: string;
  }>({ isOpen: false, isValid: false, message: '' });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'about', label: 'About', icon: '📰' },
    { id: 'api', label: 'API Settings', icon: '🔑' },
    { id: 'feeds', label: 'RSS Feeds', icon: '📡' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'reactions', label: 'Reactions', icon: '💭' },
    { id: 'purge', label: 'Purge Stories', icon: '🗑️' }
  ];

  const handleAddFeed = () => {
    if (newFeed.name && newFeed.url && newFeed.categories_uid) {
      onSendMessage({
        type: 'add_feed',
        payload: {
          name: newFeed.name,
          url: newFeed.url,
          categories_uid: parseInt(newFeed.categories_uid),
          logo_url: newFeed.logo_url || null
        }
      });
      setNewFeed({ name: '', url: '', categories_uid: '', logo_url: '' });
    }
  };

  const handleUpdateFeed = (feed: any) => {
    onSendMessage({
      type: 'update_feed',
      payload: {
        uid: feed.uid,
        name: editingValues.name,
        url: editingValues.url,
        active: editingValues.active,
        categories_uid: parseInt(editingValues.categories_uid),
        logo_url: editingValues.logo_url || null
      }
    });
    setEditingFeed(null);
    setEditingValues({});
  };

  const handleDeleteFeed = (uid: number) => {
    if (confirm('Are you sure you want to delete this feed?')) {
      onSendMessage({ type: 'delete_feed', payload: { uid } });
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onSendMessage({ type: 'add_category', payload: { title: newCategory.trim() } });
      setNewCategory('');
    }
  };

  const handleUpdateCategory = (category: any) => {
    onSendMessage({
      type: 'update_category',
      payload: { uid: category.uid, title: editingValues.title }
    });
    setEditingCategory(null);
    setEditingValues({});
  };

  const handleDeleteCategory = (uid: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      onSendMessage({ type: 'delete_category', payload: { uid } });
    }
  };

  const validateXaiApiKey = async () => {
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

  const handleSaveXaiGroup = async () => {
    // Save the XAI API key
    onSendMessage({
      type: 'update_api_key',
      payload: { keyName: 'XAI_API_KEY', keyValue: editingValues.XAI_API_KEY || '' }
    });
    
    // Wait a moment for the save to complete, then validate
    setTimeout(async () => {
      const isValid = await validateXaiApiKey();
      if (isValid) {
        setEditingXaiGroup(false);
        setEditingValues({});
      }
    }, 500);
  };

  const handleSaveTwitterGroup = () => {
    const twitterKeys = ['BEARER', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];
    
    twitterKeys.forEach(keyName => {
      onSendMessage({
        type: 'update_api_key',
        payload: { keyName, keyValue: editingValues[keyName] || '' }
      });
    });
    
    setEditingTwitterGroup(false);
    setEditingValues({});
  };

  const handleEditXaiGroup = () => {
    const xaiKey = data.apiKeys.find(key => key.key_name === 'XAI_API_KEY');
    setEditingValues({ XAI_API_KEY: xaiKey?.key_value || '' });
    setEditingXaiGroup(true);
  };

  const handleEditTwitterGroup = () => {
    const twitterKeys = ['BEARER', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];
    const values = {};
    twitterKeys.forEach(keyName => {
      const apiKey = data.apiKeys.find(key => key.key_name === keyName);
      values[keyName] = apiKey?.key_value || '';
    });
    setEditingValues(values);
    setEditingTwitterGroup(true);
  };

  const handleCancelXaiGroup = () => {
    setEditingXaiGroup(false);
    setEditingValues({});
  };

  const handleCancelTwitterGroup = () => {
    setEditingTwitterGroup(false);
    setEditingValues({});
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

  const handleUpdateReaction = (reaction: any) => {
    onSendMessage({
      type: 'update_reaction',
      payload: {
        uid: reaction.uid,
        type: editingValues.type,
        prompt: editingValues.prompt
      }
    });
    setEditingReaction(null);
    setEditingValues({});
  };

  const handleDeleteReaction = (uid: number) => {
    if (confirm('Are you sure you want to delete this reaction?')) {
      onSendMessage({ type: 'delete_reaction', payload: { uid } });
    }
  };

  const handlePurgeAllStories = () => {
    if (confirm('Are you sure you want to delete ALL stories? This action cannot be undone.')) {
      onSendMessage({ type: 'purge_all_stories' });
    }
  };

  const handlePurgeCategoryStories = (categoryId: number, categoryName: string) => {
    if (confirm(`Are you sure you want to delete all stories from "${categoryName}"? This action cannot be undone.`)) {
      onSendMessage({ type: 'purge_category_stories', payload: { categories_uid: categoryId } });
    }
  };

  const handlePurgeOldStories = (days: number) => {
    if (confirm(`Are you sure you want to delete all stories older than ${days} days? This action cannot be undone.`)) {
      onSendMessage({ type: 'purge_old_stories', payload: { days } });
    }
  };

  const handlePurgeSourceStories = (sourceId: number, sourceName: string) => {
    if (confirm(`Are you sure you want to delete all stories from "${sourceName}"? This action cannot be undone.`)) {
      onSendMessage({ type: 'purge_source_stories', payload: { source_uid: sourceId } });
    }
  };

  const renderApiSettings = () => {
    const xaiKey = data.apiKeys.find(key => key.key_name === 'XAI_API_KEY');
    const twitterKeys = ['BEARER', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];

    return (
      <div className="space-y-8">
        {/* XAI API Configuration */}
        <div className={`border rounded-lg p-6 ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                XAI API Configuration
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Used for AI-powered content generation and analysis
              </p>
            </div>
            {!editingXaiGroup && (
              <button
                onClick={handleEditXaiGroup}
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

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                XAI API Key
              </label>
              <input
                type={editingXaiGroup ? "text" : "password"}
                value={editingXaiGroup ? (editingValues.XAI_API_KEY || '') : (xaiKey?.key_value || '')}
                onChange={(e) => editingXaiGroup && setEditingValues({...editingValues, XAI_API_KEY: e.target.value})}
                placeholder="Enter your XAI API key"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900'
                } ${!editingXaiGroup ? 'font-mono' : ''}`}
                readOnly={!editingXaiGroup}
              />
            </div>

            {editingXaiGroup && (
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveXaiGroup}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save & Validate
                </button>
                <button
                  onClick={handleCancelXaiGroup}
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

        {/* Twitter/X API Configuration */}
        <div className={`border rounded-lg p-6 ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Twitter/X API Configuration
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Twitter/X API credentials for social media integration
              </p>
            </div>
            {!editingTwitterGroup && (
              <button
                onClick={handleEditTwitterGroup}
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

          <div className="space-y-4">
            {twitterKeys.map((keyName) => {
              const apiKey = data.apiKeys.find(key => key.key_name === keyName);
              return (
                <div key={keyName}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {keyName.replace(/_/g, ' ')}
                  </label>
                  <input
                    type={editingTwitterGroup ? "text" : "password"}
                    value={editingTwitterGroup ? (editingValues[keyName] || '') : (apiKey?.key_value || '')}
                    onChange={(e) => editingTwitterGroup && setEditingValues({...editingValues, [keyName]: e.target.value})}
                    placeholder={`Enter your ${keyName.replace(/_/g, ' ').toLowerCase()}`}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900'
                    } ${!editingTwitterGroup ? 'font-mono' : ''}`}
                    readOnly={!editingTwitterGroup}
                  />
                </div>
              );
            })}

            {editingTwitterGroup && (
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveTwitterGroup}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={handleCancelTwitterGroup}
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
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📰 News Curator - RSS Reader Application
              </h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                A modern, full-featured RSS reader and news curation platform built with React, Node.js, and SQLite.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📊 Statistics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>Total Feeds:</span>
                    <span className="font-medium">{data.feeds?.length || 0}</span>
                  </div>
                  <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>Categories:</span>
                    <span className="font-medium">{data.categories?.length || 0}</span>
                  </div>
                  <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>Total Stories:</span>
                    <span className="font-medium">{data.stories?.length || 0}</span>
                  </div>
                  <div className={`flex justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span>Visible Stories:</span>
                    <span className="font-medium">{data.stories?.filter(s => s.visible)?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  🔧 Database Tools
                </h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  View, export, and import your database
                </p>
                <button
                  onClick={() => setShowDatabaseModal(true)}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Open Database View
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ✨ Key Features
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• RSS feed management with automatic refresh</li>
                <li>• Story curation with visibility controls</li>
                <li>• AI-powered content publishing</li>
                <li>• Dark/light theme support</li>
                <li>• Real-time updates via WebSocket</li>
                <li>• Database import/export functionality</li>
              </ul>
            </div>
          </div>
        );

      case 'api':
        return renderApiSettings();

      case 'feeds':
        return (
          <div className="space-y-6">
            <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Feed
              </h3>
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
                  {data.categories.map((category) => (
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

            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Existing Feeds ({data.feeds.length})
              </h3>
              {data.feeds.map((feed) => (
                <div
                  key={feed.uid}
                  className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                >
                  {editingFeed === feed.uid ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingValues.name || ''}
                          onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'border-gray-600 bg-gray-800 text-white'
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        />
                        <input
                          type="url"
                          value={editingValues.url || ''}
                          onChange={(e) => setEditingValues({ ...editingValues, url: e.target.value })}
                          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'border-gray-600 bg-gray-800 text-white'
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        />
                        <select
                          value={editingValues.categories_uid || ''}
                          onChange={(e) => setEditingValues({ ...editingValues, categories_uid: e.target.value })}
                          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'border-gray-600 bg-gray-800 text-white'
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        >
                          {data.categories.map((category) => (
                            <option key={category.uid} value={category.uid}>
                              {category.title}
                            </option>
                          ))}
                        </select>
                        <input
                          type="url"
                          placeholder="Logo URL (optional)"
                          value={editingValues.logo_url || ''}
                          onChange={(e) => setEditingValues({ ...editingValues, logo_url: e.target.value })}
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
                            checked={editingValues.active}
                            onChange={(e) => setEditingValues({ ...editingValues, active: e.target.checked })}
                            className="mr-2"
                          />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Active</span>
                        </label>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleUpdateFeed(feed)}
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingFeed(null);
                            setEditingValues({});
                          }}
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
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {feed.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            feed.active
                              ? isDarkMode
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-green-100 text-green-800'
                              : isDarkMode
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {feed.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isDarkMode
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {feed.category_name}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {feed.url}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingFeed(feed.uid);
                            setEditingValues({
                              name: feed.name,
                              url: feed.url,
                              active: feed.active,
                              categories_uid: feed.categories_uid,
                              logo_url: feed.logo_url || ''
                            });
                          }}
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
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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
        );

      case 'categories':
        return (
          <div className="space-y-6">
            <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Category
              </h3>
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

            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Existing Categories ({data.categories.length})
              </h3>
              {data.categories.map((category) => (
                <div
                  key={category.uid}
                  className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                >
                  {editingCategory === category.uid ? (
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={editingValues.title || ''}
                        onChange={(e) => setEditingValues({ ...editingValues, title: e.target.value })}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <button
                        onClick={() => handleUpdateCategory(category)}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setEditingValues({});
                        }}
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
                          onClick={() => {
                            setEditingCategory(category.uid);
                            setEditingValues({ title: category.title });
                          }}
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
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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
        );

      case 'reactions':
        return (
          <div className="space-y-6">
            <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Reaction
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Reaction Type (e.g., 'excited', 'skeptical')"
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
                  rows={4}
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

            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Existing Reactions ({data.reactions?.length || 0})
              </h3>
              {(data.reactions || []).map((reaction) => (
                <div
                  key={reaction.uid}
                  className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                >
                  {editingReaction === reaction.uid ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingValues.type || ''}
                        onChange={(e) => setEditingValues({ ...editingValues, type: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <textarea
                        value={editingValues.prompt || ''}
                        onChange={(e) => setEditingValues({ ...editingValues, prompt: e.target.value })}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-white'
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleUpdateReaction(reaction)}
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingReaction(null);
                            setEditingValues({});
                          }}
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
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {reaction.type}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingReaction(reaction.uid);
                              setEditingValues({
                                type: reaction.type,
                                prompt: reaction.prompt
                              });
                            }}
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
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {reaction.prompt}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'purge':
        return (
          <div className="space-y-6">
            <div className={`border border-red-300 rounded-lg p-4 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  ⚠️ Danger Zone
                </h3>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                These actions permanently delete stories and cannot be undone. Use with caution.
              </p>
            </div>

            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Purge All Stories
                </h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Delete all stories from the database. This will not affect your feeds or categories.
                </p>
                <button
                  onClick={handlePurgeAllStories}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Purge All Stories
                </button>
              </div>

              <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Purge Stories by Category
                </h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Delete all stories from a specific category.
                </p>
                <div className="space-y-2">
                  {data.categories.map((category) => (
                    <div key={category.uid} className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {category.title}
                      </span>
                      <button
                        onClick={() => handlePurgeCategoryStories(category.uid, category.title)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Purge
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Purge Old Stories
                </h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Delete stories older than a specified number of days.
                </p>
                <div className="flex space-x-2">
                  {[7, 30, 90].map((days) => (
                    <button
                      key={days}
                      onClick={() => handlePurgeOldStories(days)}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>

              <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Purge Stories by Source
                </h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Delete all stories from a specific RSS feed.
                </p>
                <div className="space-y-2">
                  {data.feeds.map((feed) => (
                    <div key={feed.uid} className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {feed.name}
                      </span>
                      <button
                        onClick={() => handlePurgeSourceStories(feed.uid, feed.name)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Purge
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h2>
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
            <div className={`w-64 border-r overflow-y-auto ${
              isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id
                        ? isDarkMode
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-blue-50 text-blue-700'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {showDatabaseModal && (
        <DatabaseViewModal
          isOpen={showDatabaseModal}
          onClose={() => setShowDatabaseModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

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
                  {validationModal.isValid ? 'API Key Valid' : 'API Key Invalid'}
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
                  {validationModal.isValid ? 'Great!' : 'OK'}
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