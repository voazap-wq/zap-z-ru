import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Product } from '../../types';
import SearchResults from './SearchResults';

interface SearchSectionProps {
  onSearchSubmit: (query: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearchSubmit }) => {
  const { products } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  // FIX: Correctly typed the ref to match the <form> element it's attached to.
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsResultsVisible(false);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filtered = products.filter(
      p => p.name.toLowerCase().includes(lowercasedQuery) || p.sku.toLowerCase().includes(lowercasedQuery)
    );
    setResults(filtered.slice(0, 10)); // Limit to 10 results
    setIsResultsVisible(true);
  }, [query, products]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsResultsVisible(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  const handleInputFocus = () => {
    if (query.trim().length > 0) {
        setIsResultsVisible(true);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearchSubmit(query);
      setIsResultsVisible(false);
  };

  return (
    <section>
      <form ref={searchRef} onSubmit={handleSearchSubmit}>
        <div className="relative max-w-3xl mx-auto">
          <input
            type="search"
            placeholder="Поиск по названию, артикулу или VIN"
            value={query}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            className="w-full pl-5 pr-16 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all text-base"
            aria-label="Поиск автозапчастей"
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label="Найти"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary rounded-full text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-icons">search</span>
          </button>
          
          {isResultsVisible && (
              <SearchResults 
                  products={results}
                  query={query}
                  onClose={() => setIsResultsVisible(false)}
              />
          )}
        </div>
      </form>
    </section>
  );
};

export default SearchSection;
