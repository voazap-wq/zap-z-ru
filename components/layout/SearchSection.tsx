import React from 'react';

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ searchQuery, onSearchChange, onSearchFocus }) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchFocus();
  };

  return (
    <section>
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl mx-auto">
            <input
                type="search"
                placeholder="Введите код запчасти или VIN номер автомобиля"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onSearchFocus}
                className="w-full pl-5 pr-16 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all text-base"
                aria-label="Поиск автозапчастей"
            />
            <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary hover:bg-primary-dark rounded-full text-white transition-colors flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
                aria-label="Найти"
            >
                <span className="material-icons">search</span>
            </button>
        </form>
    </section>
  );
};

export default SearchSection;