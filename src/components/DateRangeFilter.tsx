import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateRangeFilterProps {
  selectedRange: 'all' | '24h' | '48h' | '72h';
  onRangeChange: (range: 'all' | '24h' | '48h' | '72h') => void;
  isDarkMode: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedRange,
  onRangeChange,
  isDarkMode
}) => {
  const options = [
    { value: 'all', label: 'All Time', icon: Calendar },
    { value: '24h', label: 'Last 24h', icon: Clock },
    { value: '48h', label: 'Last 48h', icon: Clock },
    { value: '72h', label: 'Last 72h', icon: Clock }
  ] as const;

  return (
    <>
      <div className={`flex rounded-lg border ${
        isDarkMode 
          ? 'border-gray-600 bg-gray-800' 
          : 'border-gray-300 bg-white'
      }`}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRange === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onRangeChange(option.value)}
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
    </>
  );
};