import React from 'react';
import { useState, useEffect } from 'react';
import { ExternalLink, Eye, EyeOff, Send, Image } from 'lucide-react';

interface StoryCardProps {
	story: any;
	onToggleVisibility: (uid: number, visible: boolean) => void;
	onTogglePublished: (uid: number, published: boolean) => void;
	onPublishClick?: (story: any) => void;
	onUnpublishClick?: (story: any) => void;
	isDarkMode: boolean;
	feedLogo?: string;
}

// Simple in-memory cache for thumbnails
const thumbnailCache = new Map<string, string | null>();
export const StoryCard: React.FC<StoryCardProps> = ({
	story,
	onToggleVisibility,
	onTogglePublished,
	onPublishClick,
	onUnpublishClick,
	isDarkMode,
	feedLogo
}) => {
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [thumbnailLoading, setThumbnailLoading] = useState(true);

	useEffect(() => {
		// Check cache first
		if (thumbnailCache.has(story.link)) {
			const cachedThumbnail = thumbnailCache.get(story.link);
			if (cachedThumbnail !== undefined) {
				setThumbnail(cachedThumbnail);
			} else {
				setThumbnail(null); // or some other default value
			}
			setThumbnailLoading(false);
			return;
		}

		const fetchThumbnail = async () => {
			setThumbnailLoading(true);

			try {
				// Use server-side thumbnail endpoint
				const apiUrl = `/api/thumbnail?url=${encodeURIComponent(story.link)}`;
				//console.log(`Fetching thumbnail from: ${apiUrl}`);

				const response = await fetch(apiUrl, {
					signal: AbortSignal.timeout(70000) // 70 second timeout
				});

				if (response.ok) {
					const data = await response.json();
					if (data.thumbnail) {
						//console.log(`Found thumbnail for ${story.title}: ${data.thumbnail}`);
						setThumbnail(data.thumbnail);
						thumbnailCache.set(story.link, data.thumbnail);
					} else {
						//console.log(`No thumbnail found for: ${story.title}`);
						thumbnailCache.set(story.link, null);
					}
				} else {
					console.error(`Thumbnail fetch failed for: ${story.title} - ${response.status}`);
					thumbnailCache.set(story.link, null);
				}

			} catch (error) {
				console.error('Thumbnail fetch error for', story.title, ':', error);
				thumbnailCache.set(story.link, null);
			}

			setThumbnailLoading(false);
		};

		fetchThumbnail();
	}, [story.link, story.title]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return {
			date: date.toLocaleDateString(),
			time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};
	};

	const { date, time } = formatDate(story.last);

	return (
		<div className={`rounded-lg shadow-sm border hover:shadow-md transition-all ${isDarkMode
			? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
			: 'bg-white border-gray-200'
			} ${!story.visible ? 'opacity-50' : ''
			}`}>
			<div className="flex gap-4 p-3">
				{/* Column 1: Thumbnail */}
				<div className="flex-shrink-0">
					<div className={`w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
						}`}>
						{thumbnailLoading ? (
							<div className="animate-pulse">
								<div className={`w-6 h-6 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
									}`} />
							</div>
						) : thumbnail ? (
							<img
								src={thumbnail}
								alt={story.title}
								className="w-full h-full object-cover"
								onError={() => {
									console.log('Image failed to load:', thumbnail);
									setThumbnail(null);
								}}
							/>
						) : feedLogo ? (
							<img
								src={feedLogo}
								alt={`${story.feed_name || 'Feed'} logo`}
								className="w-full h-full object-cover"
								onError={() => {
									console.log('Feed logo failed to load:', feedLogo);
								}}
							/>
						) : (
							<div className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
								}`}>
								<Image className="w-full h-full" />
							</div>
						)}
					</div>
				</div>

				{/* Column 2: Content */}
				<div className="flex-1 min-w-0">
					{/* Date/Time */}
					<div className={`flex items-center space-x-2 text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
						}`}>
						<span>{date}</span>
						<span>•</span>
						<span>{time}</span>
						<span className={`px-2 py-1 rounded-full text-xs ${isDarkMode
							? 'bg-blue-900/30 text-blue-400'
							: 'bg-blue-100 text-blue-800'
							}`}>
							{story.category_name || 'General'}
						</span>
						<span className={`px-2 py-1 rounded-full text-xs ${isDarkMode
							? 'bg-green-900/30 text-green-400'
							: 'bg-green-100 text-green-800'
							}`}>
							{story.feed_name || 'Unknown Source'}
						</span>
					</div>

					{/* Title */}
					<h3 className={`text-lg font-semibold mb-2 line-clamp-2 leading-[110%] ${isDarkMode ? 'text-white' : 'text-gray-900'
						}`}>
						{story.title}
					</h3>

					{/* Link */}
					<div className="mb-2">
						<a
							href={story.link}
							target="_blank"
							rel="noopener noreferrer"
							className={`text-sm hover:underline flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
								}`}
						>
							<ExternalLink className="w-3 h-3 mr-1" />
							Read full article
						</a>
					</div>

					{/* Buttons */}
					<div className="flex items-center space-x-3">
						{story.published ? (
							<button
								onClick={() => onUnpublishClick ? onUnpublishClick(story) : onTogglePublished(story.UID, false)}
								className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									isDarkMode
										? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
										: 'bg-green-100 text-green-700 hover:bg-green-200'
								}`}
							>
								<Send className="w-4 h-4 mr-1" />
								Published
							</button>
						) : (
							<button
								onClick={() => onPublishClick ? onPublishClick(story) : onTogglePublished(story.UID, true)}
								className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									isDarkMode
										? 'bg-blue-700 text-blue-300 hover:bg-blue-600'
										: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
								}`}
							>
								<Send className="w-4 h-4 mr-1" />
								Publish
							</button>
						)}

						<button
							onClick={() => onToggleVisibility(story.UID, !story.visible)}
							className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDarkMode
								? story.visible
									? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
									: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
								: story.visible
									? 'bg-red-100 text-red-700 hover:bg-red-200'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
						>
							{story.visible ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
							{story.visible ? 'Hide' : 'Show'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};