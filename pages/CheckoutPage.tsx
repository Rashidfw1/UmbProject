import React, { useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';

const CheckoutPage: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const navigate = useNavigate();

    if (!context || !context.user) {
        return <Navigate to="/" />;
    }
    
    if (context.cart.length === 0) {
        return <Navigate to="/products" />;
    }
    
    const { cartTotal, clearCart } = context;

    const handlePlaceOrder = () => {
        // This is where you would integrate with Thawani API.
        // For this mock, we'll simulate a successful payment and redirect.
        console.log("Placing order...");
        console.log("Total:", cartTotal);
        // Create a mock order ID
        const mockOrderId = `ORD-${Date.now()}`;
        // Clear cart and navigate to a mock Thawani page for redirection.
        clearCart();
        navigate(`/thawani/callback?status=success&order_id=${mockOrderId}`);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">{t('checkoutTitle')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{t('shippingInfo')}</h2>
                    {/* Shipping form would go here */}
                     <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <p className="font-semibold">{context.user.name}</p>
                        <p className="text-sm text-gray-500">{context.user.email}</p>
                     </div>
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold mb-4">{t('paymentMethod')}</h2>
                        <div className="border p-4 rounded-lg bg-white shadow-sm">
                           <p className="font-semibold">Thawani Gateway</p>
                           <p className="text-sm text-gray-500">You will be redirected to Thawani to complete your payment.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <h2 className="text-2xl font-semibold mb-4">{t('orderSummary')}</h2>
                    {/* Order summary would be more detailed here */}
                     <div className="flex justify-between font-bold text-xl border-t pt-4 mt-4">
                        <span>{t('total')}</span>
                        <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <button 
                        onClick={handlePlaceOrder}
                        className="w-full mt-6 py-3 bg-brand-gold text-white font-semibold rounded-md hover:bg-opacity-90"
                    >
                        {t('placeOrder')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
