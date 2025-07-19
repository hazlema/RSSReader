import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StoryCard } from './components/StoryCard';
import { SettingsModal } from './components/SettingsModal';
import { DateRangeFilter } from './components/DateRangeFilter';
import { VisibilityFilter } from './components/VisibilityFilter';
import { PublishModal } from './components/PublishModal';
import { ApiKeyWarningModal } from './components/ApiKeyWarningModal';
import { UnpublishModal } from './components/UnpublishModal';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [settingsInitialTab, setSettingsInitialTab] = useState('feeds');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState<'all' | '24h' | '48h' | '72h'>('24h');
	const [isDarkMode, setIsDarkMode] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [nextPollCountdown, setNextPollCountdown] = useState(600); // 10 minutes in seconds
	const [visibilityFilter, setVisibilityFilter] = useState<'filtered' | 'all'>('filtered');
	const [publishModalOpen, setPublishModalOpen] = useState(false);
	const [selectedStoryForPublish, setSelectedStoryForPublish] = useState<any>(null);
	const [apiKeyWarningOpen, setApiKeyWarningOpen] = useState(false);
	const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);
	const [selectedStoryForUnpublish, setSelectedStoryForUnpublish] = useState<any>(null);

	const wsUrl = `ws://${window.location.hostname}:3001`;
	const { data, isConnected, error, sendMessage } = useWebSocket(wsUrl);

	const getDateCutoff = (range: string) => {
		if (range === 'all') return null;

		const now = new Date();
		const hours = {
			'24h': 24,
			'48h': 48,
			'72h': 72
		}[range] || 24;

		return new Date(now.getTime() - (hours * 60 * 60 * 1000));
	};
	const filteredStories = useMemo(() => {
		const cutoffDate = getDateCutoff(dateRange);

		let stories = selectedCategory
			? data.stories.filter(story => story.categories_uid?.toString() === selectedCategory)
			: data.stories;

		// Filter by date range
		if (cutoffDate) {
			stories = stories.filter(story => {
				const storyDate = new Date(story.last);
				return storyDate >= cutoffDate;
			});
		}

		// Filter by visibility
		if (visibilityFilter === 'filtered') {
			stories = stories.filter(story => story.visible);
		}

		// Filter by visibility
		if (visibilityFilter === 'filtered') {
			stories = stories.filter(story => story.visible);
		}

		// Always sort by date descending (newest first)
		return stories.sort((a, b) => {
			const dateA = new Date(a.last || 0).getTime();
			const dateB = new Date(b.last || 0).getTime();
			return dateB - dateA; // Descending order (newest first)
		});
	}, [data.stories, selectedCategory, dateRange, visibilityFilter]);

	const handleRefresh = () => {
		sendMessage({ type: 'refresh_feeds' });
	};

	const handleToggleVisibility = (uid: number, visible: boolean) => {
		sendMessage({
			type: 'update_story_visibility',
			payload: { uid, visible }
		});
	};

	const handleTogglePublished = (uid: number, published: boolean) => {
		sendMessage({
			type: 'update_story_published',
			payload: { uid, published }
		});
	};

	const handlePublishClick = (story: any) => {
		// Check if all API keys are configured
		const requiredApiKeys = ['XAI_API_KEY', 'BEARER', 'CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];
		const missingKeys = requiredApiKeys.filter(keyName => {
			const apiKey = data.apiKeys.find(key => key.key_name === keyName);
			return !apiKey || !apiKey.key_value || apiKey.key_value.trim() === '';
		});
		
		if (missingKeys.length > 0) {
			setApiKeyWarningOpen(true);
			return;
		}
		
		setSelectedStoryForPublish(story);
		setPublishModalOpen(true);
	};

	const handlePublishStory = (storyId: number, reactionText: string) => {
		// TODO: Send the reaction text to the server or handle publishing logic
		console.log('Publishing story:', storyId, 'with reaction:', reactionText);
		
		// For now, just mark the story as published
		handleTogglePublished(storyId, true);
		
		// Hide the story after publishing
		handleToggleVisibility(storyId, false);
	};

	const handleUnpublishClick = (story: any) => {
		setSelectedStoryForUnpublish(story);
		setUnpublishModalOpen(true);
	};

	const handleUnpublishStory = () => {
		if (selectedStoryForUnpublish) {
			// Mark the story as unpublished
			handleTogglePublished(selectedStoryForUnpublish.UID, false);
			
			// Make the story visible again
			handleToggleVisibility(selectedStoryForUnpublish.UID, true);
		}
	};
	// Countdown timer effect
	React.useEffect(() => {
		const interval = setInterval(() => {
			setNextPollCountdown(prev => {
				if (prev <= 1) {
					return 600; // Reset to 10 minutes
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Listen for refresh status updates
	React.useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			try {
				const message = JSON.parse(event.data);
				if (message.type === 'refresh_started') {
					setIsRefreshing(true);
					setNextPollCountdown(600); // Reset countdown when refresh starts
				} else if (message.type === 'refresh_completed') {
					setIsRefreshing(true);
					// Hide notification after 3 seconds
					setTimeout(() => setIsRefreshing(false), 3000);
				}
			} catch (error) {
				// Ignore parsing errors
			}
		};

		if (typeof window !== 'undefined') {
			const ws = new WebSocket(wsUrl);
			ws.addEventListener('message', handleMessage);
			return () => {
				ws.removeEventListener('message', handleMessage);
				ws.close();
			};
		}
	}, [wsUrl]);

	return (
		<div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
			<Header
				onSettingsClick={() => {
					setSettingsInitialTab('about');
					setIsSettingsOpen(true);
				}}
				onRefreshClick={handleRefresh}
				isConnected={isConnected}
				isDarkMode={isDarkMode}
				onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
			/>

			<div className="flex h-[calc(100vh-4rem)]">
				<Sidebar
					categories={data.categories}
					selectedCategory={selectedCategory}
					onCategorySelect={setSelectedCategory}
					isDarkMode={isDarkMode}
					nextPollCountdown={nextPollCountdown}
				/>

				<main className={`flex-1 overflow-y-auto p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
					{error && (
						<div className={`border rounded-md p-4 mb-6 ${isDarkMode
								? 'bg-red-900/20 border-red-800 text-red-300'
								: 'bg-red-50 border-red-200 text-red-800'
							}`}>
							<p>Error: {error}</p>
						</div>
					)}

					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
								{selectedCategory ? `Category: ${data.categories.find(cat => cat.uid.toString() === selectedCategory)?.title || 'Unknown'}` : 'All Stories'}
							</h1>
							<p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
								{filteredStories.length} stories available
							</p>
						</div>

						<div className="flex items-center space-x-4">
							<DateRangeFilter
								selectedRange={dateRange}
								onRangeChange={setDateRange}
								isDarkMode={isDarkMode}
							/>

							<VisibilityFilter
								selectedFilter={visibilityFilter}
								onFilterChange={setVisibilityFilter}
								isDarkMode={isDarkMode}
							/>
						</div>
					</div>

					<div className="space-y-4">
						{filteredStories.map((story) => (
							<StoryCard
								key={story.UID}
								story={story}
								onToggleVisibility={handleToggleVisibility}
								onTogglePublished={handleTogglePublished}
								onPublishClick={handlePublishClick}
								onUnpublishClick={handleUnpublishClick}
								isDarkMode={isDarkMode}
								feedLogo={story.feed_logo_url}
							/>
						))}
					</div>

					{filteredStories.length === 0 && (
						<div className="text-center py-12">
							<p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No stories available</p>
							<p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
								{dateRange !== 'all'
									? `No stories found in the last ${dateRange.replace('h', ' hours')}. Try expanding the date range or add some RSS feeds in the settings.`
									: 'Add some RSS feeds in the settings to get started'
								}
							</p>
						</div>
					)}
				</main>
			</div>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				data={data}
				onSendMessage={sendMessage}
				isDarkMode={isDarkMode}
				initialTab={settingsInitialTab}
			/>

			<PublishModal
				isOpen={publishModalOpen}
				onClose={() => {
					setPublishModalOpen(false);
					setSelectedStoryForPublish(null);
				}}
				story={selectedStoryForPublish}
				reactions={data.reactions || []}
				isDarkMode={isDarkMode}
				onPublish={handlePublishStory}
				onToggleVisibility={handleToggleVisibility}
			/>

			<ApiKeyWarningModal
				isOpen={apiKeyWarningOpen}
				onClose={() => setApiKeyWarningOpen(false)}
				onOpenSettings={() => {
					setSettingsInitialTab('api');
					setIsSettingsOpen(true);
				}}
				isDarkMode={isDarkMode}
			/>

			<UnpublishModal
				isOpen={unpublishModalOpen}
				onClose={() => {
					setUnpublishModalOpen(false);
					setSelectedStoryForUnpublish(null);
				}}
				onConfirm={handleUnpublishStory}
				story={selectedStoryForUnpublish}
				isDarkMode={isDarkMode}
			/>

			{/* Feed Refresh Notification */}
			<div className={`fixed bottom-4 right-4 transition-all duration-300 transform ${isRefreshing
					? 'translate-y-0 opacity-100'
					: 'translate-y-full opacity-0 pointer-events-none'
				}`}>
				<div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${isDarkMode
						? 'bg-gray-800 border border-gray-700 text-white'
						: 'bg-white border border-gray-200 text-gray-900'
					}`}>
					<div>
						<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
					<span className="text-sm font-medium">Refreshing feeds...</span>
				</div>
			</div>
		</div>
	);
}

export default App;