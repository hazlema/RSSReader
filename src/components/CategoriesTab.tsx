// CategoriesTab.tsx
import React, { useState } from 'react';
import { Plus, Edit2, Save, Trash2 } from 'lucide-react';

interface CategoriesTabProps {
  categories: any[];
  onSendMessage: (message: any) => void;
  isDarkMode: boolean;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ categories, onSendMessage, isDarkMode }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);

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

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Categories
      </h3>
      
      {/* Add new category form */}
      <div className={`border rounded-lg overflow-hidden ${
        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
      }`}>
        <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
          <h4 className="font-medium">
            Add New Category
          </h4>
        </div>
        <div className="p-3">
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
      </div>

      {/* Existing categories */}
      <div className={`border rounded-lg overflow-hidden ${
        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
      }`}>
        <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
          <h4 className="font-medium">
            Existing Categories
          </h4>
        </div>
        <div className="p-3 space-y-3">
          {categories?.map((category: any) => (
            <div key={category.uid}>
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
    </div>
  );
};