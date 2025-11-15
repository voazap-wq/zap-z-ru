
import React from 'react';
import CategoryCard from './CategoryCard';
import ProductSlider from './ProductSlider';
import { useAppContext } from '../../hooks/useAppContext';
import NewsSlider from './NewsSlider';
import PromoBannerSlider from './PromoBannerSlider';
import SearchSection from '../layout/SearchSection';

interface HomePageProps {
  onCategorySelect: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCategorySelect, searchQuery, onSearchChange, onSearchFocus }) => {
  const { products, categories, news, homepageBlocks } = useAppContext();
  const featuredProducts = products.slice(0, 8); // Use more products for the slider

  const sections = {
    promo_banner: (
      <PromoBannerSlider key="promo_banner" />
    ),
    search: (
      <SearchSection 
        key="search"
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSearchFocus={onSearchFocus}
      />
    ),
    categories: (
      <section key="categories">
        <h2 className="text-2xl font-bold mb-6 text-center">Категории товаров</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} onClick={() => onCategorySelect(category.id)} />
          ))}
        </div>
      </section>
    ),
    featured: (
      <section key="featured">
        <h2 className="text-2xl font-bold mb-6 text-center">Популярные товары</h2>
        <ProductSlider products={featuredProducts} />
      </section>
    ),
    news: (
      <section key="news">
        <h2 className="text-2xl font-bold mb-6 text-center">Новости и акции</h2>
        <NewsSlider articles={news} />
      </section>
    ),
  };

  return (
    <div className="space-y-12">
      {homepageBlocks.filter(block => block.enabled).map(block => sections[block.id])}
    </div>
  );
};

export default HomePage;
