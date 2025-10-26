
import React, { useState, useContext } from 'react';
import ProductCard from '../components/ProductCard';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { translations } from '../data/localization';

const ProductsPage: React.FC = () => {
  const { t } = useLocalization();
  const context = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!context) return null;
  const { products } = context;
  
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">{t('allProducts')}</h1>
      
      {/* Category Filter */}
      <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
              selectedCategory === category
                ? 'bg-brand-gold text-white'
                : 'bg-white text-brand-dark shadow-sm hover:bg-gray-100'
            }`}
          >
            {t(category as keyof typeof translations['en'])}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;