import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface VisibilityFilterProps {
  selectedFilter: 'filtered' | 'all';
  onFilterChange: (filter: 'filtered' | 'all') => void;
  isDarkMode: boolean;
}

export const VisibilityFilter: React.FC<VisibilityFilterProps> = ({
  selectedFilter,
  onFilterChange,
  isDarkMode
}) => {
  const options = [
    { value: 'filtered', label: 'Filtered', icon: Eye },
    { value: 'all', label: 'All', icon: EyeOff }
  ] as const;

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex rounded-lg border ${
        isDarkMode 
          ? 'border-gray-600 bg-gray-800' 
          : 'border-gray-300 bg-white'
      }`}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedFilter === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                isSelected
                  ? isDarkMode
                    ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } ${
                !isSelected && isDarkMode ? 'border-r border-gray-600 last:border-r-0' : ''
              } ${
                !isSelected && !isDarkMode ? 'border-r border-gray-300 last:border-r-0' : ''
              }`}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};