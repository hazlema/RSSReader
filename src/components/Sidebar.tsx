import React from 'react';
import { Folder, Hash, Clock } from 'lucide-react';

interface SidebarProps {
	categories: any[];
	selectedCategory: string | null;
	onCategorySelect: (categoryId: string | null) => void;
	isDarkMode: boolean;
	nextPollCountdown: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
	categories,
	selectedCategory,
	onCategorySelect,
	isDarkMode,
	nextPollCountdown
}) => {
	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
	};

	return (
		<div className={`w-64 shadow-sm border-r h-full transition-colors ${isDarkMode
				? 'bg-gray-800 border-gray-700'
				: 'bg-white border-gray-200'
			} flex flex-col`}>
			<div className="p-4">
				<h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
					Categories
				</h2>

				<div className="space-y-2">
					<button
						onClick={() => onCategorySelect(null)}
						className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${selectedCategory === null
								? isDarkMode
									? 'bg-blue-900/30 text-blue-400'
									: 'bg-blue-50 text-blue-700'
								: isDarkMode
									? 'text-gray-300 hover:bg-gray-700'
									: 'text-gray-700 hover:bg-gray-50'
							}`}
					>
						<Hash className="w-4 h-4 mr-3" />
						All Stories
					</button>

					{categories.map((category) => (
						<button
							key={category.uid}
							onClick={() => onCategorySelect(category.uid.toString())}
							className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${selectedCategory === category.uid.toString()
									? isDarkMode
										? 'bg-blue-900/30 text-blue-400'
										: 'bg-blue-50 text-blue-700'
									: isDarkMode
										? 'text-gray-300 hover:bg-gray-700'
										: 'text-gray-700 hover:bg-gray-50'
								}`}
						>
							<Folder className="w-4 h-4 mr-3" />
							{category.title}
						</button>
					))}
				</div>
			</div>

			{/* Countdown Timer */}
			<div className={`mt-auto p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
				}`}>
				<div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
					}`}>
					<div className="flex items-center space-x-2">
						<Clock className="w-4 h-4" />
						<span>Next refresh in:</span>
					</div>
					<div className={`text-lg font-mono font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
						}`}>
						{formatTime(nextPollCountdown)}
					</div>
				</div>
			</div>
		</div>
	);
};