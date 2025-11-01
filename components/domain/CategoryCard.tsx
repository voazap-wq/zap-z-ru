import React from 'react';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  // Define the gradient overlay. It starts dark at the bottom and fades to transparent.
  const gradientOverlay = 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)';
  
  return (
    <div
      onClick={onClick}
      role="button"
      aria-label={category.name}
      className="group relative flex h-48 cursor-pointer items-end justify-center overflow-hidden rounded-lg bg-cover bg-center text-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
      style={{ backgroundImage: `${gradientOverlay}, url(${category.imageUrl})` }}
    >
      {/* The background image and gradient are now combined, so we only need a container for the text */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-bold drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          {category.name}
        </h3>
      </div>
    </div>
  );
};

export default CategoryCard;
