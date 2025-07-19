import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, Database, AlertTriangle, Key } from 'lucide-react';
import { DatabaseViewModal } from './DatabaseViewModal';
import { ApiKeyItem } from './ApiKeyItem';
import packageJson from '../../package.json';

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
	const [editingFeed, setEditingFeed] = useState<any>(null);
	const [editingCategory, setEditingCategory] = useState<any>(null);
	const [newFeed, setNewFeed] = useState({ name: '', url: '', categories_uid: '', logo_url: '' });
	const [newCategory, setNewCategory] = useState({ title: '' });
	const [isDatabaseViewOpen, setIsDatabaseViewOpen] = useState(false);
	const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
	const [purgeType, setPurgeType] = useState<'all' | 'category' | '7days' | 'source'>('7days');
	const [purgeCategory, setPurgeCategory] = useState('');
	const [purgeSource, setPurgeSource] = useState('');
	const [editingApiKeys, setEditingApiKeys] = useState<{[key: string]: string}>({});
	const [newReaction, setNewReaction] = useState({ type: '', prompt: '' });
	const [editingReaction, setEditingReaction] = useState<any>(null);
	const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

	// Calculate stats for About tab
	const calculateStats = () => {
		const configuredApiKeys = (data.apiKeys || []).filter(key => key.key_value && key.key_value.trim() !== '').length;
		const storyCount = (data.stories || []).length;
		const categoryCount = (data.categories || []).length;
		const feedCount = (data.feeds || []).length;
		
		// Find oldest story
		let oldestStoryAge = 'No stories';
		if (data.stories && data.stories.length > 0) {
			const oldestStory = data.stories.reduce((oldest, story) => {
				const storyDate = new Date(story.last || 0);
				const oldestDate = new Date(oldest.last || 0);
				return storyDate < oldestDate ? story : oldest;
			});
			
			if (oldestStory.last) {
				const ageInDays = Math.floor((Date.now() - new Date(oldestStory.last).getTime()) / (1000 * 60 * 60 * 24));
				oldestStoryAge = ageInDays === 0 ? 'Today' : `${ageInDays} day${ageInDays === 1 ? '' : 's'} ago`;
			}
		}
		
		return {
			configuredApiKeys,
			storyCount,
			categoryCount,
			feedCount,
			oldestStoryAge
		};
	};

	// Update active tab when initialTab changes
	React.useEffect(() => {
		if (isOpen) {
			setActiveTab(initialTab === 'feeds' ? 'about' : initialTab);
		}
	}, [isOpen, initialTab]);

	if (!isOpen) return null;

	const validateUrl = (url: string): boolean => {
		try {
			const urlObj = new URL(url);
			return ['http:', 'https:'].includes(urlObj.protocol);
		} catch {
			return false;
		}
	};

	const validateFeedForm = () => {
		const errors: {[key: string]: string} = {};
		
		if (!newFeed.name.trim()) {
			errors.feedName = 'Feed name is required';
		}
		
		if (!newFeed.url.trim()) {
			errors.feedUrl = 'RSS URL is required';
		} else if (!validateUrl(newFeed.url)) {
			errors.feedUrl = 'Please enter a valid HTTP or HTTPS URL';
		}
		
		if (!newFeed.categories_uid) {
			errors.feedCategory = 'Category is required';
		}
		
		if (newFeed.logo_url && !validateUrl(newFeed.logo_url)) {
			errors.feedLogoUrl = 'Please enter a valid HTTP or HTTPS URL for the logo';
		}
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const validateCategoryForm = () => {
		const errors: {[key: string]: string} = {};
		
		if (!newCategory.title.trim()) {
			errors.categoryTitle = 'Category name is required';
		}
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const validateReactionForm = () => {
		const errors: {[key: string]: string} = {};
		
		if (!newReaction.type.trim()) {
			errors.reactionType = 'Reaction type is required';
		}
		
		if (!newReaction.prompt.trim()) {
			errors.reactionPrompt = 'Reaction prompt is required';
		}
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};
	const handleAddFeed = () => {
		if (validateFeedForm()) {
			onSendMessage({
				type: 'add_feed',
				payload: newFeed
			});
			setNewFeed({ name: '', url: '', categories_uid: '', logo_url: '' });
			setValidationErrors({});
		}
	};

	const handleUpdateFeed = () => {
		if (editingFeed) {
			onSendMessage({
				type: 'update_feed',
				payload: editingFeed
			});
			setEditingFeed(null);
		}
	};

	const handleDeleteFeed = (uid: number) => {
		onSendMessage({
			type: 'delete_feed',
			payload: { uid }
		});
	};

	const handleAddCategory = () => {
		if (validateCategoryForm()) {
			onSendMessage({
				type: 'add_category',
				payload: newCategory
			});
			setNewCategory({ title: '' });
			setValidationErrors({});
		}
	};

	const handleUpdateCategory = () => {
		if (editingCategory) {
			onSendMessage({
				type: 'update_category',
				payload: editingCategory
			});
			setEditingCategory(null);
		}
	};

	const handleDeleteCategory = (uid: number) => {
		onSendMessage({
			type: 'delete_category',
			payload: { uid }
		});
	};

	const handlePurgeStories = () => {
		if (purgeType === '7days') {
			onSendMessage({
				type: 'purge_old_stories',
				payload: { days: 7 }
			});
		} else if (purgeType === 'category' && purgeCategory) {
			onSendMessage({
				type: 'purge_category_stories',
				payload: { categories_uid: purgeCategory }
			});
		} else if (purgeType === 'source' && purgeSource) {
			onSendMessage({
				type: 'purge_source_stories',
				payload: { source_uid: purgeSource }
			});
		} else if (purgeType === 'all') {
			onSendMessage({
				type: 'purge_all_stories'
			});
		}
		setShowPurgeConfirm(false);
		setPurgeCategory('');
		setPurgeSource('');
	};

	const handleUpdateApiKey = (keyName: string, keyValue: string) => {
		onSendMessage({
			type: 'update_api_key',
			payload: { keyName, keyValue }
		});
	};

	const handleAddReaction = () => {
		if (validateReactionForm()) {
			onSendMessage({
				type: 'add_reaction',
				payload: newReaction
			});
			setNewReaction({ type: '', prompt: '' });
			setValidationErrors({});
		}
	};

	const handleUpdateReaction = () => {
		if (editingReaction) {
			onSendMessage({
				type: 'update_reaction',
				payload: editingReaction
			});
			setEditingReaction(null);
		}
	};

	const handleDeleteReaction = (uid: number) => {
		onSendMessage({
			type: 'delete_reaction',
			payload: { uid }
		});
	};

	const handleApiKeyChange = (keyName: string, value: string) => {
		setEditingApiKeys(prev => ({
			...prev,
			[keyName]: value
		}));
	};

	const saveApiKey = (keyName: string) => {
		const value = editingApiKeys[keyName];
		if (value !== undefined) {
			handleUpdateApiKey(keyName, value);
			setEditingApiKeys(prev => {
				const newState = { ...prev };
				delete newState[keyName];
				return newState;
			});
		}
	};

	return (
		<React.Fragment>
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<div className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'
					}`}>
					<div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
						}`}>
						<h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
							Settings
						</h2>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => setIsDatabaseViewOpen(true)}
								className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${isDarkMode
										? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
										: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
									}`}
							>
								<Database className="w-4 h-4 mr-2" />
								View Database
							</button>
							<button
								onClick={onClose}
								className={`transition-colors ${isDarkMode
										? 'text-gray-500 hover:text-gray-300'
										: 'text-gray-400 hover:text-gray-600'
									}`}
							>
								<X className="w-6 h-6" />
							</button>
						</div>
					</div>

					<div className="flex h-[calc(90vh-8rem)]">
						{/* Tabs */}
						<div className={`w-48 border-r ${isDarkMode
								? 'border-gray-700 bg-gray-900'
								: 'border-gray-200 bg-gray-50'
							}`}>
							<nav className="p-4 space-y-2">
								<button
									onClick={() => setActiveTab('about')}
									className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === 'about'
											? isDarkMode
												? 'bg-blue-900/30 text-blue-400'
												: 'bg-blue-100 text-blue-700'
											: isDarkMode
												? 'text-gray-300 hover:bg-gray-800'
												: 'text-gray-700 hover:bg-gray-100'
										}`}
								>
									About
								</button>
								<button
									onClick={() => setActiveTab('api')}
									className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === 'api'
											? isDarkMode
												? 'bg-blue-900/30 text-blue-400'
												: 'bg-blue-100 text-blue-700'
											: isDarkMode
												? 'text-gray-300 hover:bg-gray-800'
												: 'text-gray-700 hover:bg-gray-100'
										}`}
								>
									API Settings
								</button>
								<button
									onClick={() => setActiveTab('feeds')}
									className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === 'feeds'
											? isDarkMode
												? 'bg-blue-900/30 text-blue-400'
												: 'bg-blue-100 text-blue-700'
											: isDarkMode
												? 'text-gray-300 hover:bg-gray-800'
												: 'text-gray-700 hover:bg-gray-100'
										}`}
								>
									RSS Feeds
								</button>
								<button
									onClick={() => setActiveTab('categories')}
									className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === 'categories'
											? isDarkMode
												? 'bg-blue-900/30 text-blue-400'
												: 'bg-blue-100 text-blue-700'
											: isDarkMode
												? 'text-gray-300 hover:bg-gray-800'
												: 'text-gray-700 hover:bg-gray-100'
										}`}
								>
									Categories
								</button>
								<button
									onClick={() => setActiveTab('reactions')}
									className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === 'reactions'
											? isDarkMode
												? 'bg-blue-900/30 text-blue-400'
												: 'bg-blue-100 text-blue-700'
											: isDarkMode
												? 'text-gray-300 hover:bg-gray-800'
												: 'text-gray-700 hover:bg-gray-100'
										}`}
								>
									Reactions
								</button>
								<button
									onClick={() => setActiveTab('purge')}
									className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeTab === 'purge'
											? isDarkMode
												? 'bg-blue-900/30 text-blue-400'
												: 'bg-blue-100 text-blue-700'
											: isDarkMode
												? 'text-gray-300 hover:bg-gray-800'
												: 'text-gray-700 hover:bg-gray-100'
										}`}
								>
									Purge Stories
								</button>
							</nav>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto">
							{activeTab === 'about' && (
								<div className="p-6">
									<div className="max-w-2xl">
										<h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
											About News Curator
										</h3>
										
										{/* Project Info */}
										<div className={`mb-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
												{/* Logo Column */}
												<div className="flex justify-center md:justify-start">
													<img 
														src="/logo.png" 
														alt="News Curator Logo" 
														className="w-24 h-24 object-contain"
													/>
												</div>
												
												{/* Project Info Column */}
												<div className="space-y-3">
													<div className="flex items-center justify-between">
														<span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
															Developer:
														</span>
														<span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
															Frosty and Bolt ⚡
														</span>
													</div>
													
													<div className="flex items-center justify-between">
														<span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
															Version:
														</span>
														<span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
															{packageJson.version}
														</span>
													</div>
													
													<div className="flex items-center justify-between">
														<span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
															GitHub:
														</span>
														<a 
															href="https://github.com/hazlema/RSSReader" 
															target="_blank" 
															rel="noopener noreferrer"
															className={`hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
														>
															View Repository
														</a>
													</div>
												</div>
											</div>
										</div>
										
										<br />
										
										{/* Statistics */}
										<div>
											<h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
												Statistics
											</h4>
											
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{(() => {
													const stats = calculateStats();
													return (
														<>
															<div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
																<div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
																	{stats.configuredApiKeys}
																</div>
																<div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
																	API Keys Configured
																</div>
															</div>
															
															<div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
																<div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
																	{stats.storyCount.toLocaleString()}
																</div>
																<div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
																	Total Stories
																</div>
															</div>
															
															<div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
																<div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
																	{stats.categoryCount}
																</div>
																<div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
																	Categories
																</div>
															</div>
															
															<div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
																<div className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
																	{stats.feedCount}
																</div>
																<div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
																	RSS Feeds
																</div>
															</div>
															
															<div className={`p-4 rounded-lg border md:col-span-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
																<div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
																	{stats.oldestStoryAge}
																</div>
																<div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
																	Age of Oldest Story
																</div>
															</div>
														</>
													);
												})()}
											</div>
										</div>
									</div>
								</div>
							)}

							{activeTab === 'feeds' && (
								<div className="p-6">
									<div className="mb-6">
										<h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											Add New Feed
										</h3>
										<div className="space-y-4">
											<div>
												<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													Feed Name *
												</label>
												<input
													type="text"
													placeholder="Feed name"
													value={newFeed.name}
													onChange={(e) => setNewFeed(prev => ({ ...prev, name: e.target.value }))}
													className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
															? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
															: 'border-gray-300 bg-white text-gray-900'
														} ${validationErrors.feedName ? 'border-red-500' : ''
														}`}
												/>
												{validationErrors.feedName && (
													<p className="text-red-500 text-sm mt-1">{validationErrors.feedName}</p>
												)}
											</div>

											<div>
												<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													RSS URL *
												</label>
												<input
													type="url"
													placeholder="RSS URL"
													value={newFeed.url}
													onChange={(e) => setNewFeed(prev => ({ ...prev, url: e.target.value }))}
													className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
															? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
															: 'border-gray-300 bg-white text-gray-900'
														} ${validationErrors.feedUrl ? 'border-red-500' : ''
														}`}
												/>
												{validationErrors.feedUrl && (
													<p className="text-red-500 text-sm mt-1">{validationErrors.feedUrl}</p>
												)}
											</div>

											<div>
												<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													Category *
												</label>
												<select
													value={newFeed.categories_uid}
													onChange={(e) => setNewFeed(prev => ({ ...prev, categories_uid: e.target.value }))}
													className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
															? 'border-gray-600 bg-gray-700 text-white'
															: 'border-gray-300 bg-white text-gray-900'
														} ${validationErrors.feedCategory ? 'border-red-500' : ''
														}`}
												>
													<option value="">Select Category</option>
													{data.categories.map((category: any) => (
														<option key={category.uid} value={category.uid}>
															{category.title}
														</option>
													))}
												</select>
												{validationErrors.feedCategory && (
													<p className="text-red-500 text-sm mt-1">{validationErrors.feedCategory}</p>
												)}
											</div>

											<div>
												<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													Logo URL (optional)
												</label>
												<input
													type="url"
													placeholder="Logo URL (optional)"
													value={newFeed.logo_url}
													onChange={(e) => setNewFeed(prev => ({ ...prev, logo_url: e.target.value }))}
													className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
															? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
															: 'border-gray-300 bg-white text-gray-900'
														} ${validationErrors.feedLogoUrl ? 'border-red-500' : ''
														}`}
												/>
												{validationErrors.feedLogoUrl && (
													<p className="text-red-500 text-sm mt-1">{validationErrors.feedLogoUrl}</p>
												)}
											</div>

											<div className="pt-2">
												<button
													onClick={handleAddFeed}
													className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
												>
													<Plus className="w-4 h-4 mr-2" />
													Add Feed
												</button>
											</div>
										</div>
									</div>

									<div>
										<h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											Existing Feeds
										</h3>
										<div>
											{data.feeds.map((feed: any) => (
												<div key={feed.uid} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
													{editingFeed?.uid === feed.uid ? (
														<div className={`space-y-3 p-4 rounded-lg w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
															}`}>
															<div>
																<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
																	}`}>
																	Feed Name
																</label>
																<input
																	type="text"
																	value={editingFeed.name}
																	onChange={(e) => setEditingFeed((prev: any) => ({ ...prev, name: e.target.value }))}
																	className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
																			? 'border-gray-600 bg-gray-800 text-white'
																			: 'border-gray-300 bg-white text-gray-900'
																		}`}
																/>
															</div>
															<div>
																<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
																	}`}>
																	RSS URL
																</label>
																<input
																	type="url"
																	value={editingFeed.url}
																	onChange={(e) => setEditingFeed((prev: any) => ({ ...prev, url: e.target.value }))}
																	className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
																			? 'border-gray-600 bg-gray-800 text-white'
																			: 'border-gray-300 bg-white text-gray-900'
																		}`}
																/>
															</div>
															<div>
																<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
																	}`}>
																	Logo URL
																</label>
																<input
																	type="url"
																	placeholder="Logo URL (optional)"
																	value={editingFeed.logo_url || ''}
																	onChange={(e) => setEditingFeed((prev: any) => ({ ...prev, logo_url: e.target.value }))}
																	className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
																			? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
																			: 'border-gray-300 bg-white text-gray-900'
																		}`}
																/>
															</div>
															<div>
																<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
																	}`}>
																	Category
																</label>
																<select
																	value={editingFeed.categories_uid || ''}
																	onChange={(e) => setEditingFeed((prev: any) => ({ ...prev, categories_uid: e.target.value ? parseInt(e.target.value) : null }))}
																	className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
																			? 'border-gray-600 bg-gray-800 text-white'
																			: 'border-gray-300 bg-white text-gray-900'
																		}`}
																>
																	<option value="">Select Category</option>
																	{data.categories.map((category: any) => (
																		<option key={category.uid} value={category.uid}>
																			{category.title}
																		</option>
																	))}
																</select>
															</div>
															<div className="flex items-center space-x-3">
																<label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
																	}`}>
																	<input
																		type="checkbox"
																		checked={editingFeed.active}
																		onChange={(e) => setEditingFeed((prev: any) => ({ ...prev, active: e.target.checked ? 1 : 0 }))}
																		className="mr-2"
																	/>
																	Active
																</label>
																<button
																	onClick={handleUpdateFeed}
																	className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
																>
																	<Save className="w-4 h-4 mr-1" />
																	Save
																</button>
																<button
																	onClick={() => setEditingFeed(null)}
																	className={`px-3 py-1 border rounded-md transition-colors ${isDarkMode
																			? 'border-gray-600 text-gray-300 hover:bg-gray-600'
																			: 'border-gray-300 text-gray-700 hover:bg-gray-50'
																		}`}
																>
																	Cancel
																</button>
															</div>
														</div>
													) : (
														<>
															<div className="flex items-center space-x-3">
																<h4
																	className={`font-medium cursor-pointer transition-colors hover:text-yellow-500 ${isDarkMode ? 'text-white' : 'text-gray-900'
																		}`}
																	title={feed.url}
																>
																	{feed.name}
																</h4>
																<span className={`inline-block px-2 py-1 rounded-full text-sm ${isDarkMode
																		? isDarkMode
																			? 'bg-blue-900/30 text-blue-400'
																			: 'bg-blue-100 text-blue-800'
																		: isDarkMode
																			? 'bg-red-900/30 text-red-400'
																			: 'bg-red-100 text-red-800'
																	}`}>
																	{feed.category_name || 'No Category'}
																</span>
																<span className={`inline-block px-2 py-1 rounded-full text-xs ${feed.active
																		? isDarkMode
																			? 'bg-green-900/30 text-green-400'
																			: 'bg-green-100 text-green-800'
																		: isDarkMode
																			? 'bg-red-900/30 text-red-400'
																			: 'bg-red-100 text-red-800'
																	}`}>
																	{feed.active ? 'Active' : 'Inactive'}
																</span>
															</div>
															<div className="flex items-center space-x-2">
																<button
																	onClick={() => setEditingFeed(feed)}
																	className={`p-2 rounded-md transition-colors ${isDarkMode
																			? 'text-gray-500 hover:text-gray-300 hover:bg-gray-600'
																			: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
																		}`}
																>
																	<Edit2 className="w-4 h-4" />
																</button>
																<button
																	onClick={() => handleDeleteFeed(feed.uid)}
																	className={`p-2 rounded-md transition-colors ${isDarkMode
																			? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
																			: 'text-red-400 hover:text-red-600 hover:bg-red-50'
																		}`}
																>
																	<Trash2 className="w-4 h-4" />
																</button>
															</div>
														</>
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							)}

							{activeTab === 'categories' && (
								<div className="p-6">
									<div className="mb-6">
										<h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											Add New Category
										</h3>
										<div className="flex space-x-4">
											<input
												type="text"
												placeholder="Category name"
												value={newCategory.title}
												onChange={(e) => setNewCategory(prev => ({ ...prev, title: e.target.value }))}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														handleAddCategory();
													}
												}}
												className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
														? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
														: 'border-gray-300 bg-white text-gray-900'
													} ${validationErrors.categoryTitle ? 'border-red-500' : ''
													}`}
											/>
											<button
												onClick={handleAddCategory}
												className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
											>
												<Plus className="w-4 h-4 mr-2" />
												Add Category
											</button>
										</div>
										{validationErrors.categoryTitle && (
											<p className="text-red-500 text-sm mt-1">{validationErrors.categoryTitle}</p>
										)}
									</div>

									<div>
										<h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											Existing Categories
										</h3>
										<div>
											{data.categories.map((category: any) => (
												<div key={category.uid} className={`flex items-center justify-between py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
													} last:border-b-0`}>
													{editingCategory?.uid === category.uid ? (
														<div className={`space-y-3 p-4 rounded-lg w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
															}`}>
															<input
																type="text"
																value={editingCategory.title}
																onChange={(e) => setEditingCategory((prev: any) => ({ ...prev, title: e.target.value }))}
																className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
																		? 'border-gray-600 bg-gray-800 text-white'
																		: 'border-gray-300 bg-white text-gray-900'
																	}`}
															/>
															<div className="flex items-center space-x-3">
																<button
																	onClick={handleUpdateCategory}
																	className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
																>
																	<Save className="w-4 h-4 mr-1" />
																	Save
																</button>
																<button
																	onClick={() => setEditingCategory(null)}
																	className={`px-3 py-1 border rounded-md transition-colors ${isDarkMode
																			? 'border-gray-600 text-gray-300 hover:bg-gray-600'
																			: 'border-gray-300 text-gray-700 hover:bg-gray-50'
																		}`}
																>
																	Cancel
																</button>
															</div>
														</div>
													) : (
														<>
															<h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
																}`}>
																{category.title}
															</h4>
															<div className="flex items-center space-x-2">
																<button
																	onClick={() => setEditingCategory(category)}
																	className={`p-2 rounded-md transition-colors ${isDarkMode
																			? 'text-gray-500 hover:text-gray-300 hover:bg-gray-600'
																			: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
																		}`}
																>
																	<Edit2 className="w-4 h-4" />
																</button>
																<button
																	onClick={() => handleDeleteCategory(category.uid)}
																	className={`p-2 rounded-md transition-colors ${isDarkMode
																			? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
																			: 'text-red-400 hover:text-red-600 hover:bg-red-50'
																		}`}
																>
																	<Trash2 className="w-4 h-4" />
																</button>
															</div>
														</>
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							)}

							{activeTab === 'reactions' && (
								<div className="p-6">
									<div className="mb-6">
										<h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											Add New Reaction
										</h3>
										<div className="space-y-4">
											<div>
												<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													Type *
												</label>
												<input
													type="text"
													placeholder="Reaction type (e.g., positive, negative, neutral)"
													value={newReaction.type}
													onChange={(e) => setNewReaction(prev => ({ ...prev, type: e.target.value }))}
													className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
															? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
															: 'border-gray-300 bg-white text-gray-900'
														} ${validationErrors.reactionType ? 'border-red-500' : ''
														}`}
												/>
												{validationErrors.reactionType && (
													<p className="text-red-500 text-sm mt-1">{validationErrors.reactionType}</p>
												)}
											</div>

											<div>
												<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													Prompt *
												</label>
												<textarea
													placeholder="Reaction prompt text"
													value={newReaction.prompt}
													onChange={(e) => setNewReaction(prev => ({ ...prev, prompt: e.target.value }))}
													rows={3}
													className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
															? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
															: 'border-gray-300 bg-white text-gray-900'
														} ${validationErrors.reactionPrompt ? 'border-red-500' : ''
														}`}
												/>
												{validationErrors.reactionPrompt && (
													<p className="text-red-500 text-sm mt-1">{validationErrors.reactionPrompt}</p>
												)}
											</div>

											<div className="pt-2">
												<button
													onClick={handleAddReaction}
													className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
												>
													<Plus className="w-4 h-4 mr-2" />
													Add Reaction
												</button>
											</div>
										</div>
									</div>

									<div>
										<h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											Existing Reactions
										</h3>
										<div>
											{(data.reactions || []).map((reaction: any) => (
												<div key={reaction.uid} className={`flex items-start justify-between py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
													} last:border-b-0`}>
													{editingReaction?.uid === reaction.uid ? (
														<div className={`space-y-3 p-4 rounded-lg w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
															}`}>
															<div>
																<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
																	}`}>
																	Type
																</label>
																<input
																	type="text"
																	value={editingReaction.type}
																	onChange={(e) => setEditingReaction((prev: any) => ({ ...prev, type: e.target.value }))}
																	className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
																			? 'border-gray-600 bg-gray-800 text-white'
																			: 'border-gray-300 bg-white text-gray-900'
																		}`}
																/>
															</div>
															<div>
																<label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
																	}`}>
																	Prompt
																</label>
																<textarea
																	value={editingReaction.prompt}
																	onChange={(e) => setEditingReaction((prev: any) => ({ ...prev, prompt: e.target.value }))}
																	rows={3}
																	className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
																			? 'border-gray-600 bg-gray-800 text-white'
																			: 'border-gray-300 bg-white text-gray-900'
																		}`}
																/>
															</div>
															<div className="flex items-center space-x-3">
																<button
																	onClick={handleUpdateReaction}
																	className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
																>
																	<Save className="w-4 h-4 mr-1" />
																	Save
																</button>
																<button
																	onClick={() => setEditingReaction(null)}
																	className={`px-3 py-1 border rounded-md transition-colors ${isDarkMode
																			? 'border-gray-600 text-gray-300 hover:bg-gray-600'
																			: 'border-gray-300 text-gray-700 hover:bg-gray-50'
																		}`}
																>
																	Cancel
																</button>
															</div>
														</div>
													) : (
														<>
															<div className="flex-1">
																<h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
																	}`}>
																	{reaction.type}
																</h4>
																<p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
																	}`}>
																	{reaction.prompt}
																</p>
															</div>
															<div className="flex items-center space-x-2 ml-4">
																<button
																	onClick={() => setEditingReaction(reaction)}
																	className={`p-2 rounded-md transition-colors ${isDarkMode
																			? 'text-gray-500 hover:text-gray-300 hover:bg-gray-600'
																			: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
																		}`}
																>
																	<Edit2 className="w-4 h-4" />
																</button>
																<button
																	onClick={() => handleDeleteReaction(reaction.uid)}
																	className={`p-2 rounded-md transition-colors ${isDarkMode
																			? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
																			: 'text-red-400 hover:text-red-600 hover:bg-red-50'
																		}`}
																>
																	<Trash2 className="w-4 h-4" />
																</button>
															</div>
														</>
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							)}

							{activeTab === 'purge' && (
								<div className="p-6">
									<div className="mb-6">
										<h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											<AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
											Purge Stories
										</h3>
										<p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
											}`}>
											Warning: This action cannot be undone. Stories will be permanently deleted from the database.
										</p>

										<div className="space-y-4">
											<div>
												<label className={`flex items-center space-x-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													<input
														type="radio"
														name="purgeType"
														value="7days"
														checked={purgeType === '7days'}
														onChange={(e) => setPurgeType(e.target.value as 'all' | 'category' | '7days' | 'source')}
														className="text-red-600"
													/>
													<span>Purge stories older than 7 days</span>
												</label>
											</div>

											<div>
												<label className={`flex items-center space-x-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													<input
														type="radio"
														name="purgeType"
														value="category"
														checked={purgeType === 'category'}
														onChange={(e) => setPurgeType(e.target.value as 'all' | 'category' | '7days' | 'source')}
														className="text-red-600"
													/>
													<span>Purge stories from specific category</span>
												</label>

												{purgeType === 'category' && (
													<div className="mt-3 ml-6">
														<select
															value={purgeCategory}
															onChange={(e) => setPurgeCategory(e.target.value)}
															className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode
																	? 'border-gray-600 bg-gray-700 text-white'
																	: 'border-gray-300 bg-white text-gray-900'
																}`}
														>
															<option value="">Select Category</option>
															{data.categories.map((category: any) => (
																<option key={category.uid} value={category.uid}>
																	{category.title}
																</option>
															))}
														</select>
													</div>
												)}
											</div>

											<div>
												<label className={`flex items-center space-x-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													<input
														type="radio"
														name="purgeType"
														value="source"
														checked={purgeType === 'source'}
														onChange={(e) => setPurgeType(e.target.value as 'all' | 'category' | '7days' | 'source')}
														className="text-red-600"
													/>
													<span>Purge stories from specific source</span>
												</label>

												{purgeType === 'source' && (
													<div className="mt-3 ml-6">
														<select
															value={purgeSource}
															onChange={(e) => setPurgeSource(e.target.value)}
															className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode
																	? 'border-gray-600 bg-gray-700 text-white'
																	: 'border-gray-300 bg-white text-gray-900'
																}`}
														>
															<option value="">Select Source</option>
															{data.feeds.map((feed: any) => (
																<option key={feed.uid} value={feed.uid}>
																	{feed.name}
																</option>
															))}
														</select>
													</div>
												)}
											</div>

											<div>
												<label className={`flex items-center space-x-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
													}`}>
													<input
														type="radio"
														name="purgeType"
														value="all"
														checked={purgeType === 'all'}
														onChange={(e) => setPurgeType(e.target.value as 'all' | 'category' | '7days' | 'source')}
														className="text-red-600"
													/>
													<span>Purge all stories</span>
												</label>
											</div>
										</div>

										<button
											onClick={() => setShowPurgeConfirm(true)}
											disabled={(purgeType === 'category' && !purgeCategory) || (purgeType === 'source' && !purgeSource)}
											className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Purge Stories
										</button>
									</div>
								</div>
							)}

							{activeTab === 'api' && (
								<div className="p-6">
									<div className="mb-6">
										<h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'
											}`}>
											<Key className="w-5 h-5 mr-2" />
											API Configuration
										</h3>
										<p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
											}`}>
											Configure your API keys for AI features and social media integration.
										</p>

										<div className="space-y-6">
											{(data.apiKeys || []).map((apiKey: any) => (
												<ApiKeyItem
													key={apiKey.key_name}
													apiKey={apiKey}
													isDarkMode={isDarkMode}
													isEditing={editingApiKeys.hasOwnProperty(apiKey.key_name)}
													editingValue={editingApiKeys[apiKey.key_name] || ''}
													onEdit={(keyName, value) => handleApiKeyChange(keyName, value)}
													onSave={saveApiKey}
													onCancel={(keyName) => {
														setEditingApiKeys(prev => {
															const newState = { ...prev };
															delete newState[keyName];
															return newState;
														});
													}}
													onChange={handleApiKeyChange}
												/>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Purge Confirmation Modal */}
			{showPurgeConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
					<div className={`rounded-lg shadow-xl max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'
						}`}>
						<div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
							}`}>
							<div className="flex items-center space-x-3">
								<AlertTriangle className="w-6 h-6 text-red-500" />
								<h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
									}`}>
									Confirm Purge
								</h3>
							</div>
						</div>

						<div className="p-6">
							<p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								{purgeType === '7days'
									? 'Are you sure you want to delete all stories older than 7 days? This action cannot be undone.'
									: purgeType === 'category'
										? `Are you sure you want to delete all stories from the "${data.categories.find((cat: any) => cat.uid.toString() === purgeCategory)?.title}" category? This action cannot be undone.`
										: purgeType === 'source'
											? `Are you sure you want to delete all stories from the "${data.feeds.find((feed: any) => feed.uid.toString() === purgeSource)?.name}" source? This action cannot be undone.`
											: 'Are you sure you want to delete ALL stories? This action cannot be undone.'
								}
							</p>

							<div className="flex justify-end space-x-3">
								<button
									onClick={() => setShowPurgeConfirm(false)}
									className={`px-4 py-2 border rounded-md transition-colors ${isDarkMode
											? 'border-gray-600 text-gray-300 hover:bg-gray-700'
											: 'border-gray-300 text-gray-700 hover:bg-gray-50'
										}`}
								>
									Cancel
								</button>
								<button
									onClick={handlePurgeStories}
									className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
								>
									Yes, Purge Stories
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<DatabaseViewModal
				isOpen={isDatabaseViewOpen}
				onClose={() => setIsDatabaseViewOpen(false)}
				isDarkMode={isDarkMode}
			/>
		</React.Fragment>
	);
};