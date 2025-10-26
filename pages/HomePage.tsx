import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';

const HomePage: React.FC = () => {
  const { getLocalized } = useLocalization();
  const context = useContext(AppContext);
  
  // Using the global isLoading flag is the correct way to handle the initial loading state.
  if (!context || context.isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  const { products, homepageContent } = context;

  // After loading is complete, we can safely check for the content.
  if (!homepageContent) {
     return (
      <div className="flex justify-center items-center h-[70vh]">
        <p>Could not load homepage content.</p>
      </div>
    );
  }
  
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[450px] flex items-center justify-center text-white text-center">
        <div className="absolute inset-0">
            <img 
                src={homepageContent.heroImageUrl} 
                alt="Elegant Jewelry"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold animate-fade-in-down">{getLocalized(homepageContent.heroTitle)}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in-up">{getLocalized(homepageContent.heroSubtitle)}</p>
          <Link
            to="/products"
            className="mt-8 inline-block px-8 sm:px-10 py-3 sm:py-4 bg-brand-gold text-white font-semibold rounded-full hover:bg-opacity-90 transition-transform hover:scale-105 duration-300"
          >
            {getLocalized(homepageContent.shopNowButton)}
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-brand-light/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">{getLocalized(homepageContent.featuredProductsTitle)}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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