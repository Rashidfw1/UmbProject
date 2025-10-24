import React, { useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { useLocalization } from '../hooks/useLocalization';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const textQuery = searchParams.get('q')?.toLowerCase() || '';
  const imageResultIdsParam = searchParams.get('imageResults');
  const { getLocalized, t } = useLocalization();
  const context = useContext(AppContext);
  
  if (!context) return null;
  const { products } = context;

  const searchResults = useMemo(() => {
    if (textQuery) {
        return products.filter(product =>
            getLocalized(product.name).toLowerCase().includes(textQuery) ||
            getLocalized(product.description).toLowerCase().includes(textQuery) ||
            product.category.toLowerCase().includes(textQuery)
        );
    }
    if (imageResultIdsParam) {
        const ids = imageResultIdsParam.split(',');
        return products.filter(p => ids.includes(p.id));
    }
    return [];
  }, [textQuery, imageResultIdsParam, products, getLocalized]);


  const pageTitle = textQuery 
    ? <>{t('searchresultsFor')}: <span className="text-brand-gold">"{textQuery}"</span></>
    : <>{t('similarProducts')}</>;
    
  const noResultsMessage = textQuery ? t('noProductsFound') : t('noSimilarProducts');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">
        {pageTitle}
      </h1>
      
      {(textQuery || imageResultIdsParam) && searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {searchResults.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        (textQuery || imageResultIdsParam) && <p className="text-center text-brand-gray">{noResultsMessage}</p>
      )}
    </div>
  );
};

export default SearchPage;