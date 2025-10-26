
import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import ProductCard from '../components/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const context = useContext(AppContext);
  const { getLocalized, t } = useLocalization();
  const { formatCurrency } = useCurrency();

  if (!context) return null;
  const { products, addToCart } = context;
  
  const product = products.find(p => p.id === id);

  if (!product) {
    return <div>Product not found</div>;
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div>
          <img src={product.imageUrl} alt={getLocalized(product.name)} className="w-full h-auto object-cover rounded-lg shadow-lg" />
        </div>
        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark">{getLocalized(product.name)}</h1>
          <p className="mt-4 text-3xl text-brand-gold font-sans">{formatCurrency(product.price)}</p>
          <p className="mt-6 text-brand-gray">{getLocalized(product.description)}</p>
          
          <div className="mt-8 flex items-center gap-4">
            <label htmlFor="quantity" className="font-semibold text-lg">{t('quantity')}:</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 p-2 border border-gray-300 rounded text-center text-lg"
            />
          </div>
          <button
            onClick={handleAddToCart}
            className="mt-8 w-full px-10 py-4 bg-brand-gold text-white font-semibold rounded-full hover:bg-opacity-90 transition-colors duration-300 text-lg"
          >
            {t('addToCart')}
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
          <div className="mt-20">
              <h2 className="text-2xl font-serif font-bold text-center text-brand-dark mb-8">{t('relatedProducts')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                  {relatedProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default ProductDetailPage;