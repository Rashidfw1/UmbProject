import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';

const OrderConfirmationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { t } = useLocalization();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center min-h-[60vh]">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">{t('thankYou')}</h1>
            <p className="text-lg text-gray-600 mb-2">{t('orderSuccess')}</p>
            {orderId && (
                <p className="text-gray-800">
                    {t('yourOrderId')} <span className="font-semibold font-mono text-brand-gold">{orderId}</span>
                </p>
            )}
             <Link
                to="/products"
                className="mt-8 inline-block px-8 py-3 bg-brand-gold text-white font-semibold rounded-full hover:bg-opacity-90"
             >
                {t('continueShopping')}
            </Link>
        </div>
    );
};

export default OrderConfirmationPage;
