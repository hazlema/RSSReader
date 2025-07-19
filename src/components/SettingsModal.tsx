import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Save, Trash2, Database, Key, MessageSquare, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    categories_uid: '',
    logo_url: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [editingFeed, setEditingFeed] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [editingApiValues, setEditingApiValues] = useState<{ [key: string]: string }>({});
  const [editingReaction, setEditingReaction] = useState<any>(null);
  const [newReaction, setNewReaction] = useState({ type: '', prompt: '' });
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validationModal, setValidationModal] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });

  const validateXaiKey = async (keyValue: string) => {
    setValidationInProgress(true);
    
    // Wait a moment for the key to be saved, then validate
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/check-xapi');
        const result = await response.json();
        
        setValidationModal({
          show: true,
          success: result.valid,
          message: result.valid ? 'API key is valid!' : result.message || 'Invalid API key'
        });
      } catch (error) {
        setValidationModal({
          show: true,
          success: false,
          message: 'Failed to validate API key: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
      } finally {
        setValidationInProgress(false);
      }
    }, 1000);
  };

  const handleAddFeed = () => {
    if (!newFeed.name || !newFeed.url) return;
    
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
  };

  const handleUpdateFeed = () => {
    if (!editingFeed) return;
    
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
  };

  const handleDeleteFeed = (uid: number) => {
    onSendMessage({
      type: 'delete_feed',
      payload: { uid }
    });
  };

  const handleAddCategory = () => {
    if (!newCategory) return;
    
    onSendMessage({
      type: 'add_category',
      payload: { title: newCategory }
    });
    
    setNewCategory('');
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    
    onSendMessage({
      type: 'update_category',
      payload: {
        uid: editingCategory.uid,
        title: editingCategory.title
      }
    });
    
    setEditingCategory(null);
  };

  const handleDeleteCategory = (uid: number) => {
    onSendMessage({
      type: 'delete_category',
      payload: { uid }
    });
  };

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

  const handleAddReaction = () => {
    if (!newReaction.type || !newReaction.prompt) return;
    
    onSendMessage({
      type: 'add_reaction',
      payload: {
        type: newReaction.type,
        prompt: newReaction.prompt
      }
    });
    
    setNewReaction({ type: '', prompt: '' });
  };

  const handleUpdateReaction = () => {
    if (!editingReaction) return;
    
    onSendMessage({
      type: 'update_reaction',
      payload: {
        uid: editingReaction.uid,
        type: editingReaction.type,
        prompt: editingReaction.prompt
      }
    });
    
    setEditingReaction(null);
  };

  const handleDeleteReaction = (uid: number) => {
    onSendMessage({
      type: 'delete_reaction',
      payload: { uid }
    });
  };

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

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'api', label: 'API Settings', icon: Key },
    { id: 'feeds', label: 'RSS Feeds', icon: Plus },
    { id: 'categories', label: 'Categories', icon: Edit2 },
    { id: 'reactions', label: 'Reactions', icon: MessageSquare },
    { id: 'purge', label: 'Purge Stories', icon: Trash2 },
    { id: 'database', label: 'Database', icon: Database }
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
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-8rem)]">
            {/* Sidebar */}
            <div className={`w-64 border-r ${
              isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
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
                            ? 'text-gray-300 hover:bg-gray-700'
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
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    About RSS Reader
                  </h3>
                  <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p>
                      A modern RSS reader and news curation platform built with React, Node.js, and SQLite.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-2">Total Feeds</h4>
                        <p className="text-2xl font-bold">{data.feeds?.length || 0}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-2">Total Stories</h4>
                        <p className="text-2xl font-bold">{data.stories?.length || 0}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-2">Categories</h4>
                        <p className="text-2xl font-bold">{data.categories?.length || 0}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className="font-medium mb-2">Version</h4>
                        <p className="text-2xl font-bold">1.0.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    API Settings
                  </h3>
                  <div className="space-y-4">
                    {data.apiKeys?.map((apiKey: any) => (
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
              )}

              {activeTab === 'feeds' && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    RSS Feeds
                  </h3>
                  
                  {/* Add new feed form */}
                  <div className={`border rounded-lg p-4 mb-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Add New Feed
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                        {data.categories?.map((category: any) => (
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
                      disabled={!newFeed.name || !newFeed.url}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feed
                    </button>
                  </div>

                  {/* Existing feeds */}
                  <div className="space-y-4">
                    {data.feeds?.map((feed: any) => (
                      <div key={feed.uid} className={`border rounded-lg p-4 ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                      }`}>
                        {editingFeed?.uid === feed.uid ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
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
                                onChange={(e) => setEditingFeed({ ...editingFeed, categories_uid: parseInt(e.target.value) || null })}
                                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode
                                    ? 'border-gray-600 bg-gray-800 text-white'
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              >
                                <option value="">Select Category</option>
                                {data.categories?.map((category: any) => (
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
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingFeed.active}
                                  onChange={(e) => setEditingFeed({ ...editingFeed, active: e.target.checked ? 1 : 0 })}
                                  className="mr-2"
                                />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Active</span>
                              </label>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateFeed}
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              >
                                <Save className="w-4 h-4 mr-1" />
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
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {feed.url}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Category: {feed.category_name || 'None'} • Status: {feed.active ? 'Active' : 'Inactive'}
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
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Categories
                  </h3>
                  
                  {/* Add new category form */}
                  <div className={`border rounded-lg p-4 mb-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                        disabled={!newCategory}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                      </button>
                    </div>
                  </div>

                  {/* Existing categories */}
                  <div className="space-y-4">
                    {data.categories?.map((category: any) => (
                      <div key={category.uid} className={`border rounded-lg p-4 ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
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
                              <Save className="w-4 h-4 mr-1" />
                              Save
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
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Reaction Templates
                  </h3>
                  
                  {/* Add new reaction form */}
                  <div className={`border rounded-lg p-4 mb-6 ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Add New Reaction
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Reaction Type (e.g., '10. excited')"
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
                        disabled={!newReaction.type || !newReaction.prompt}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reaction
                      </button>
                    </div>
                  </div>

                  {/* Existing reactions */}
                  <div className="space-y-4">
                    {data.reactions?.map((reaction: any) => (
                      <div key={reaction.uid} className={`border rounded-lg p-4 ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                      }`}>
                        {editingReaction?.uid === reaction.uid ? (
                          <div className="space-y-3">
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
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateReaction}
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              >
                                <Save className="w-4 h-4 mr-1" />
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
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {reaction.type}
                              </h4>
                              <div className="flex space-x-2">
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
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {reaction.prompt}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'purge' && (
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
                          {data.categories?.map((category: any) => (
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
              )}

              {activeTab === 'database' && (
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
                        onClick={() => setDbModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Open Database Viewer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      {validationModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className={`rounded-lg shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                {validationModal.success ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  API Key Validation
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className={`mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {validationModal.message}
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setValidationModal({ show: false, success: false, message: '' })}
                  className={`px-4 py-2 border rounded-md transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Modal */}
      <DatabaseViewModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Validation Progress Overlay */}
      {validationInProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className={`rounded-lg p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                Validating API key...
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};