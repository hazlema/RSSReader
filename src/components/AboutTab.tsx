// AboutTab.tsx
import React from 'react';
import packageJson from '../../package.json'; // Adjust the path if AboutTab.tsx is in a different directory (e.g., src/components)

interface AboutTabProps {
    feeds: any[];
    stories: any[];
    categories: any[];
    isDarkMode: boolean;
}

export const AboutTab: React.FC<AboutTabProps> = ({ feeds, stories, categories, isDarkMode }) => {
    const findOldestDate = (stories: any[]) => {
        if (!Array.isArray(stories) || stories.length === 0) {
            return null; // Or throw an error, depending on requirements
        }

        let oldestDate = null;

        for (const story of stories) {
            if (story && story.last) {
                const date = new Date(story.last);
                if (!isNaN(date.getTime())) { // Check if valid date
                    if (oldestDate === null || date < oldestDate) {
                        oldestDate = date;
                    }
                }
            }
        }

        if (oldestDate === null) {
            return null;
        }

        const currentDate = new Date('2025-07-19');
        const diffTime = currentDate - oldestDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
    };

    const oldestStoryDate = findOldestDate(stories);

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
                    <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
                            <h4 className="font-medium">Total Feeds</h4>
                        </div>
                        <div className="p-4">
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feeds?.length || 0}</p>
                        </div>
                    </div>
                    <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
                            <h4 className="font-medium">Total Stories</h4>
                        </div>
                        <div className="p-4">
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stories?.length || 0}</p>
                        </div>
                    </div>
                    <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
                            <h4 className="font-medium">Categories</h4>
                        </div>
                        <div className="p-4">
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{categories?.length || 0}</p>
                        </div>
                    </div>
                    <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
                            <h4 className="font-medium">Version</h4>
                        </div>
                        <div className="p-4">
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{packageJson.version}</p>
                        </div>
                    </div>
                    <div className={`border rounded-lg overflow-hidden col-span-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
                            <h4 className="font-medium">Time Since Oldest Story</h4>
                        </div>
                        <div className="p-4">
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {oldestStoryDate ? oldestStoryDate : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};