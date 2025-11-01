import React from 'react';

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ searchQuery, onSearchChange, onSearchFocus }) => {
  return (
    <div className="relative max-w-2xl mx-auto">
      <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">search</span>
      <input
        type="search"
        placeholder="Поиск по названию, артикулу, OEM..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onSearchFocus}
        className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-lg"
        aria-label="Поиск автозапчастей"
      />
    </div>
  );
};

export default SearchSection;