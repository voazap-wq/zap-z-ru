import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Theme } from '../../types';
import IconButton from './IconButton';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, isDarkMode } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const options: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Светлая тема', icon: 'light_mode' },
    { value: 'dark', label: 'Тёмная тема', icon: 'dark_mode' },
    { value: 'system', label: 'Вариант по умолчанию', icon: 'tonality' },
  ];
  
  const handleSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  const currentIcon = isDarkMode ? 'dark_mode' : 'light_mode';

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton onClick={() => setIsOpen(!isOpen)} aria-label="Сменить тему">
        <span className="material-icons">{currentIcon}</span>
      </IconButton>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center w-full px-4 py-2 text-sm text-left transition-colors duration-150 ${
                theme === option.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="material-icons mr-3 text-lg">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
