
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import ProductCard from '../components/ProductCard';

const WishlistPage: React.FC = () => {
  const context = useContext(AppContext);
  const { t } = useLocalization();

  if (!context) return null;
  const { wishlist } = context;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">{t('yourWishlist')}</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center">
          <p className="text-brand-gray">{t('emptyWishlist')}</p>
          <Link
            to="/products"
            className="mt-6 inline-block px-8 py-3 bg-brand-gold text-white font-semibold rounded-full hover:bg-opacity-90 transition-colors duration-300"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;