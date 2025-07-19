import React, { useState, useEffect } from 'react';
import { X, Database, RefreshCw, Download, Upload, AlertCircle, FileText } from 'lucide-react';

interface DatabaseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const DatabaseViewModal: React.FC<DatabaseViewModalProps> = ({ 
  isOpen, 
  onClose, 
  isDarkMode 
}) => {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const fetchDatabaseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/db-dump');
      if (!response.ok) {
        throw new Error('Failed to fetch database data');
      }
      const data = await response.json();
      setDbData(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!dbData) return;
    
    // Create a clean export object with all table data
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        application: 'RSS Reader'
      },
      data: {}
    };
    
    // Dynamically include all tables from the database dump
    Object.keys(dbData).forEach(key => {
      if (key !== 'timestamp' && Array.isArray(dbData[key])) {
        exportData.data[key] = dbData[key];
      }
    });
    
    // Create and download the file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rss-reader-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Store the file and show warning modal
    setPendingImportFile(file);
    setShowImportWarning(true);
    
    // Reset the file input
    event.target.value = '';
  };

  const handleImportConfirm = async () => {
    if (!pendingImportFile) return;
    
    setImporting(true);
    setError(null);
    setImportSuccess(null);
    setShowImportWarning(false);
    
    try {
      const text = await pendingImportFile.text();
      const importData = JSON.parse(text);
      
      // Validate the import structure
      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid import file format: missing data object');
      }
      
      // Send import request to server
      const response = await fetch('http://localhost:3001/api/db-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }
      
      const result = await response.json();
      setImportSuccess(`Successfully imported ${result.totalRecords} records across ${result.tablesProcessed} tables`);
      
      // Refresh the database view
      await fetchDatabaseData();
      
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
      setPendingImportFile(null);
    }
  };

  const handleImportCancel = () => {
    setShowImportWarning(false);
    setPendingImportFile(null);
  };

  useEffect(() => {
    if (isOpen) {
      fetchDatabaseData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderTable = (title: string, data: any[]) => (
    <div className="mb-8">
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <Database className="w-5 h-5 mr-2" />
        {title} ({data.length} rows)
      </h3>
      {data.length === 0 ? (
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No data in this table
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full border rounded-lg ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <thead className={`${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className={`px-4 py-2 text-left text-sm font-medium border-b ${
                    isDarkMode 
                      ? 'text-gray-300 border-gray-600' 
                      : 'text-gray-700 border-gray-300'
                  }`}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className={`${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className={`px-4 py-2 text-sm border-b ${
                      isDarkMode 
                        ? 'text-gray-300 border-gray-600' 
                        : 'text-gray-900 border-gray-300'
                    }`}>
                      {value === null ? (
                        <span className={`italic ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          null
                        </span>
                      ) : (
                        String(value)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
        <div className={`rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <Database className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Database View
              </h2>
              {dbData && (
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last updated: {new Date(dbData.timestamp).toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {dbData && (
                <>
                  <button
                    onClick={handleExport}
                    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                  
                  <label className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    importing
                      ? isDarkMode
                        ? 'border-gray-600 text-gray-500 bg-gray-800 cursor-not-allowed'
                        : 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                      : isDarkMode
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}>
                    <Upload className="w-4 h-4 mr-2" />
                    {importing ? 'Importing...' : 'Import'}
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFileSelect}
                      disabled={importing}
                      className="hidden"
                    />
                  </label>
                </>
              )}
              
              <button
                onClick={fetchDatabaseData}
                disabled={loading}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
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
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
            {importSuccess && (
              <div className={`border rounded-md p-4 mb-6 ${
                isDarkMode 
                  ? 'bg-green-900/20 border-green-800 text-green-300' 
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  <p>{importSuccess}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin">
                  <RefreshCw className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <span className={`ml-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Loading database data...
                </span>
              </div>
            )}

            {error && (
              <div className={`border rounded-md p-4 mb-6 ${
                isDarkMode 
                  ? 'bg-red-900/20 border-red-800 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>Error: {error}</p>
                </div>
              </div>
            )}

            {dbData && !loading && (
              <div>
                {renderTable('Categories', dbData.categories)}
                {renderTable('Feeds', dbData.feeds)}
                {renderTable('Stories', dbData.stories)}
                {renderTable('API Keys', dbData.apiKeys || [])}
                {renderTable('Reactions', dbData.reactions || [])}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Warning Modal */}
      {showImportWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[70]">
          <div className={`rounded-lg shadow-xl max-w-md w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ⚠️ CRITICAL WARNING
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className={`mb-4 font-medium ${
                isDarkMode ? 'text-red-300' : 'text-red-700'
              }`}>
                This will PERMANENTLY DELETE ALL current data in your database!
              </p>
              
              <div className={`mb-4 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <p className="mb-2">The following will be completely wiped:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All RSS feeds and their configurations</li>
                  <li>All categories</li>
                  <li>All stories and articles</li>
                  <li>All reactions and prompts</li>
                  <li>All API key configurations</li>
                </ul>
              </div>
              
              <p className={`mb-4 text-sm font-medium ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
                This action CANNOT be undone!
              </p>
              
              <p className={`mb-6 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Consider exporting your current database first as a backup.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleImportCancel}
                  className={`px-4 py-2 border rounded-md transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel Import
                </button>
                <button
                  onClick={handleImportConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Yes, Wipe & Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};