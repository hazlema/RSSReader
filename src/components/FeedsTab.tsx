// FeedsTab.tsx
import React, { useState } from 'react';
import { Plus, Edit2, Save, Trash2, Power, PowerOff, ChevronDown } from 'lucide-react';

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

    const groupedFeeds = feeds.reduce((acc: { [key: string]: any[] }, feed) => {
        const name = feed.name || 'Unnamed';
        if (!acc[name]) acc[name] = [];
        acc[name].push(feed);
        return acc;
    }, {});

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(Object.keys(groupedFeeds)));

    const toggleGroup = (name: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(name)) {
                newSet.delete(name);
            } else {
                newSet.add(name);
            }
            return newSet;
        });
    };

    const handleSetEditingFeed = (feed: any | null) => {
        setEditingFeed(feed);
        if (feed) {
            setExpandedGroups(prev => new Set([...prev, feed.name]));
        }
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

    const handleToggleActive = (feed: any) => {
        onSendMessage({
            type: 'update_feed',
            payload: {
                uid: feed.uid,
                name: feed.name,
                url: feed.url,
                active: feed.active ? 0 : 1,
                categories_uid: feed.categories_uid,
                logo_url: feed.logo_url
            }
        });
    };

    const handleDeleteFeed = (uid: number) => {
        onSendMessage({
            type: 'delete_feed',
            payload: { uid }
        });
    };

    const getDomainName = function (hostname: string): string | null {
        const parts: string[] = hostname.split('.').filter(p => p.length > 0);
        if (parts.length < 2) {
            return hostname.charAt(0).toUpperCase() + hostname.slice(1);
        }
        let suffixLength: number = 1;
        const last: string = parts[parts.length - 1].toLowerCase();
        const secondLast: string = parts.length > 1 ? parts[parts.length - 2].toLowerCase() : '';
        const knownCompoundTLDs: Set<string> = new Set(['co', 'com', 'org', 'net', 'edu', 'gov', 'ac', 'me']);
        if (last.length === 2 && knownCompoundTLDs.has(secondLast)) {
            suffixLength = 2;
        }
        const domainIndex: number = parts.length - suffixLength - 1;
        if (domainIndex < 0) {
            return null;
        }
        const domain: string = parts[domainIndex];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    };

    const parseAndCapitalizeDomain = function (feedUrl: string): string | null {
        try {
            const parsedUrl: URL = new URL(feedUrl);
            const hostname: string = parsedUrl.hostname;
            return getDomainName(hostname);
        } catch (err: any) {
            console.error('Invalid URL:', err.message);
            return null;
        }
    };

    return (
        <div className={`space-y-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                RSS Feeds
            </h3>

            {/* Add new feed form */}
            <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}>
                <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-500">
                    <h4 className="font-medium">
                        Add New Feed
                    </h4>
                </div>
                <div className="p-3">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="url"
                            placeholder="RSS URL"
                            value={newFeed.url}
                            onChange={(e) => {
                                const newUrl = e.target.value;
                                const domain = parseAndCapitalizeDomain(newUrl);
                                setNewFeed(prev => ({
                                    ...prev,
                                    url: newUrl,
                                    ...(domain !== null ? { name: domain } : {})
                                }));
                            }}
                            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                                }`}
                        />
                        <input
                            type="text"
                            placeholder="Feed Name (e.g., Fox News)"
                            value={newFeed.name}
                            onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                                }`}
                        />
                        <select
                            value={newFeed.categories_uid}
                            onChange={(e) => setNewFeed({ ...newFeed, categories_uid: e.target.value })}
                            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
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
                            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
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
            </div>

            {/* Grouped existing feeds */}
            <div className="space-y-3">
                {Object.entries(groupedFeeds).map(([name, groupFeeds]) => {
                    const isExpanded = expandedGroups.has(name);
                    return (
                        <div key={name} className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                            }`}>
                            <button
                                onClick={() => toggleGroup(name)}
                                className={`w-full flex items-center justify-between bg-gray-800 text-white px-4 py-2 border-b border-gray-500 font-semibold`}
                            >
                                <div className="flex items-center">
                                    {groupFeeds[0].logo_url && (
                                        <img src={groupFeeds[0].logo_url} alt={name} className="w-6 h-6 mr-2 rounded" />
                                    )}
                                    {name}
                                </div>
                                <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                                <div className="p-3 space-y-1">
                                    {groupFeeds.map((feed) => (
                                        editingFeed?.uid === feed.uid ? (
                                            <div key={feed.uid} className="space-y-2 border-t pt-2 border-gray-600">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={editingFeed.name}
                                                        onChange={(e) => setEditingFeed({ ...editingFeed, name: e.target.value })}
                                                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                                                            }`}
                                                    />
                                                    <input
                                                        type="url"
                                                        value={editingFeed.url}
                                                        onChange={(e) => setEditingFeed({ ...editingFeed, url: e.target.value })}
                                                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
                                                            }`}
                                                    />
                                                    <select
                                                        value={editingFeed.categories_uid || ''}
                                                        onChange={(e) => setEditingFeed({ ...editingFeed, categories_uid: parseInt(e.target.value) || null })}
                                                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'
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
                                                        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
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
                                                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                                        >
                                                            <Save className="w-4 h-4 mr-1" />
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => handleSetEditingFeed(null)}
                                                            className={`px-3 py-1.5 border rounded-md transition-colors text-sm ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={feed.uid} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2">
                                                    {feed.logo_url && <img src={feed.logo_url} alt={feed.category_name} className="w-4 h-4 rounded" />}
                                                    <span>{feed.category_name || 'None'}</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleToggleActive(feed)}
                                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs transition-colors ${feed.active
                                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                            }`}
                                                    >
                                                        {feed.active ? <PowerOff className="w-3 h-3 mr-1" /> : <Power className="w-3 h-3 mr-1" />}
                                                        {feed.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSetEditingFeed(feed)}
                                                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFeed(feed.uid)}
                                                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                                            }`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};