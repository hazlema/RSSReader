// SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Save, Trash2, Database, Key, MessageSquare, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DatabaseViewModal } from './DatabaseViewModal';
import { AboutTab } from './AboutTab';
import { ApiSettingsTab } from './ApiSettingsTab';
import { FeedsTab } from './FeedsTab';
import { CategoriesTab } from './CategoriesTab';
import { ReactionsTab } from './ReactionsTab';
import { PurgeTab } from './PurgeTab';

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
  initialTab = 'about'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
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
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDbModalOpen(true)}
                className={`flex items-center space-x-1 p-2 rounded-md transition-colors whitespace-nowrap ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Database className="w-5 h-5" />
                <span>Database Viewer</span>
              </button>
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
          </div>

          <div className="flex h-[calc(90vh-8rem)]">
            {/* Sidebar */}
            <div className={`w-64 border-r ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
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
            <div className={`flex-1 overflow-y-auto p-6 ${
                          isDarkMode
                            ? 'bg-gray-900'
                            : 'bg-gray-200'
                      }`}
                    >

              {activeTab === 'about' && (
                <AboutTab 
                  feeds={data.feeds}
                  stories={data.stories}
                  categories={data.categories}
                  isDarkMode={isDarkMode}
                />
              )}
              {activeTab === 'api' && (
                <ApiSettingsTab 
                  apiKeys={data.apiKeys}
                  onSendMessage={onSendMessage}
                  isDarkMode={isDarkMode}
                  validateXaiKey={validateXaiKey}
                />
              )}
              {activeTab === 'feeds' && (
                <FeedsTab 
                  feeds={data.feeds}
                  categories={data.categories}
                  onSendMessage={onSendMessage}
                  isDarkMode={isDarkMode}
                />
              )}
              {activeTab === 'categories' && (
                <CategoriesTab 
                  categories={data.categories}
                  onSendMessage={onSendMessage}
                  isDarkMode={isDarkMode}
                />
              )}
              {activeTab === 'reactions' && (
                <ReactionsTab 
                  reactions={data.reactions}
                  onSendMessage={onSendMessage}
                  isDarkMode={isDarkMode}
                />
              )}
              {activeTab === 'purge' && (
                <PurgeTab 
                  categories={data.categories}
                  onSendMessage={onSendMessage}
                  isDarkMode={isDarkMode}
                />
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