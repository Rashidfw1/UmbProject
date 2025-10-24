
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';

const HomePage: React.FC = () => {
  const { t } = useLocalization();
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { products, homepageContent } = context;
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-white text-center">
        <div className="absolute inset-0">
            <img 
                src={homepageContent.heroImageUrl} 
                alt="Elegant Jewelry"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-serif font-bold animate-fade-in-down">{t('heroTitle')}</h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto animate-fade-in-up">{t('heroSubtitle')}</p>
          <Link
            to="/products"
            className="mt-8 inline-block px-10 py-4 bg-brand-gold text-white font-semibold rounded-full hover:bg-opacity-90 transition-transform hover:scale-105 duration-300"
          >
            {t('shopNow')}
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-brand-light/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-center text-brand-dark mb-8">{t('featuredProducts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;