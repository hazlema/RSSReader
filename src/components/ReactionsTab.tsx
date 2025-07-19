// ReactionsTab.tsx
import React, { useState } from 'react';
import { Plus, Edit2, Save, Trash2 } from 'lucide-react';

interface ReactionsTabProps {
  reactions: any[];
  onSendMessage: (message: any) => void;
  isDarkMode: boolean;
}

export const ReactionsTab: React.FC<ReactionsTabProps> = ({ reactions, onSendMessage, isDarkMode }) => {
  const [newReaction, setNewReaction] = useState({ type: '', prompt: '' });
  const [editingReaction, setEditingReaction] = useState<any>(null);

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

  return (
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
        {reactions?.map((reaction: any) => (
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
  );
};