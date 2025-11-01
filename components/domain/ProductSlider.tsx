import React, { useRef } from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import IconButton from '../ui/IconButton';

interface ProductSliderProps {
  products: Product[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Calculate scroll amount based on the width of a single item
      const itemWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 0;
      const scrollAmount = itemWidth + 16; // Item width + gap (space-x-4 = 1rem = 16px)

      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative group -mx-4 px-4">
      <div
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
      >
        {products.map(product => (
          <div key={product.id} className="snap-start flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.33%-0.67rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between left-0 px-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <IconButton
          onClick={() => scroll('left')}
          className="bg-white dark:bg-gray-800 shadow-lg pointer-events-auto"
          aria-label="Previous products"
        >
          <span className="material-icons">chevron_left</span>
        </IconButton>
        <IconButton
          onClick={() => scroll('right')}
          className="bg-white dark:bg-gray-800 shadow-lg pointer-events-auto"
          aria-label="Next products"
        >
          <span className="material-icons">chevron_right</span>
        </IconButton>
      </div>
    </div>
  );
};

export default ProductSlider;