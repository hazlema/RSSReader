// FeedsTab.tsx
import React, { useState } from 'react';
import { Plus, Edit2, Save, Trash2 } from 'lucide-react';

interface FeedsTabProps {
  feeds: any[];
  categories: any[];
  onSendMessage: (message: any) => void;
  isDarkMode: boolean;
}

export const FeedsTab: React.FC<FeedsTabProps> = ({ feeds, categories, onSendMessage, isDarkMode }) => {
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    categories_uid: '',
    logo_url: ''
  });
  const [editingFeed, setEditingFeed] = useState<any>(null);

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

  return (
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
            {categories?.map((category: any) => (
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
        {feeds?.map((feed: any) => (
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
                    {categories?.map((category: any) => (
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
  );
};