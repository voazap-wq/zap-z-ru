
import React, { useRef } from 'react';
import { NewsArticle } from '../../types';
import NewsCard from './NewsCard';
import IconButton from '../ui/IconButton';

interface NewsSliderProps {
  articles: NewsArticle[];
}

const NewsSlider: React.FC<NewsSliderProps> = ({ articles }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 0;
      const scrollAmount = itemWidth + 24; // Item width + gap (space-x-6 = 1.5rem = 24px)

      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="relative group -mx-4 px-4">
      <div
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
      >
        {articles.map(article => (
          <div key={article.id} className="snap-start flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            <NewsCard article={article} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between left-0 px-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <IconButton
          onClick={() => scroll('left')}
          className="bg-white dark:bg-gray-800 shadow-lg pointer-events-auto"
          aria-label="Предыдущие новости"
        >
          <span className="material-icons">chevron_left</span>
        </IconButton>
        <IconButton
          onClick={() => scroll('right')}
          className="bg-white dark:bg-gray-800 shadow-lg pointer-events-auto"
          aria-label="Следующие новости"
        >
          <span className="material-icons">chevron_right</span>
        </IconButton>
      </div>
    </div>
  );
};

export default NewsSlider;
