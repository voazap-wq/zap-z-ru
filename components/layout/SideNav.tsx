
import React from 'react';
import { Category } from '../../types';

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onNavigate: () => void;
}

const NavLink: React.FC<{ icon: string; text: string; onClick: () => void; }> = ({ icon, text, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="flex items-center p-4 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <span className="material-icons mr-4">{icon}</span>
        <span>{text}</span>
    </a>
);


export const SideNav: React.FC<SideNavProps> = ({ isOpen, onClose, categories, onNavigate }) => {
  
  const handleCategoryClick = () => {
    onNavigate();
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <nav
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Каталоги</h2>
          <button onClick={onClose} className="md:hidden">
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="p-4 space-y-2">
            {categories.map(cat => (
                <NavLink key={cat.id} icon="label" text={cat.name} onClick={handleCategoryClick} />
            ))}
        </div>
      </nav>
    </>
  );
};
