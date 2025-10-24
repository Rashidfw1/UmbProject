
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
// Fix: Use relative paths for local module imports.
import { Product } from '../types';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { CartIcon, HeartIcon, HeartIconFilled } from './Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const context = useContext(AppContext);
  const { t, getLocalized } = useLocalization();
  const { formatCurrency } = useCurrency();

  if (!context) return null;
  const { addToCart, addToWishlist, isProductInWishlist } = context;
  
  const inWishlist = isProductInWishlist(product.id);

  return (
    <div className="group relative bg-white border border-gray-200/50 rounded-xl overflow-hidden shadow-subtle transition-shadow duration-300 hover:shadow-lifted">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden">
          <img
            src={product.imageUrl}
            alt={getLocalized(product.name)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-brand-dark truncate text-center">
          <Link to={`/product/${product.id}`} className="hover:text-brand-gold transition-colors">
            {getLocalized(product.name)}
          </Link>
        </h3>
        <p className="mt-1 text-brand-gold font-sans font-medium text-xl text-center">{formatCurrency(product.price)}</p>
      </div>

      {/* Action Buttons: Visible on mobile, slide-up on desktop hover */}
       <div className="border-t border-gray-100 p-2 md:absolute md:bottom-0 md:left-0 md:w-full md:bg-white/80 md:backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-300">
          <div className="flex justify-center gap-2">
            <button
                onClick={() => addToCart(product, 1)}
                className="flex-1 bg-white border border-brand-dark text-brand-dark px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
                aria-label="Add to Cart"
            >
                <CartIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('addToCart')}</span>
            </button>
            <button
                onClick={() => addToWishlist(product)}
                className="bg-white border border-gray-300 p-3 rounded-full text-brand-dark hover:border-brand-gold hover:text-brand-gold transition-colors duration-300"
                aria-label="Add to Wishlist"
            >
                {inWishlist ? <HeartIconFilled className="w-5 h-5 text-brand-gold" /> : <HeartIcon className="w-5 h-5" />}
            </button>
          </div>
      </div>
    </div>
  );
};

export default ProductCard;