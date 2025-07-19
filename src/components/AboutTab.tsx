// AboutTab.tsx
import React from 'react';

interface AboutTabProps {
  feeds: any[];
  stories: any[];
  categories: any[];
  isDarkMode: boolean;
}

export const AboutTab: React.FC<AboutTabProps> = ({ feeds, stories, categories, isDarkMode }) => {
  return (
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
            <p className="text-2xl font-bold">{feeds?.length || 0}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className="font-medium mb-2">Total Stories</h4>
            <p className="text-2xl font-bold">{stories?.length || 0}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className="font-medium mb-2">Categories</h4>
            <p className="text-2xl font-bold">{categories?.length || 0}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className="font-medium mb-2">Version</h4>
            <p className="text-2xl font-bold">1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};