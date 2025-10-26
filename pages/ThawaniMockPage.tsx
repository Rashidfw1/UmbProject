import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { SpinnerIcon } from '../components/Icons';

const ThawaniCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const context = useContext(AppContext);
    
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (!context || !orderId) return;
        const { updateOrderStatus } = context;

        const processPayment = () => {
            if (status === 'success') {
                updateOrderStatus(orderId, 'Processing');
                navigate(`/order-confirmation/${orderId}`);
            } else {
                updateOrderStatus(orderId, 'Payment Failed');
                alert('Payment failed or was cancelled. Please try again.');
                navigate('/cart');
            }
        };

        // Simulate processing delay
        const timer = setTimeout(processPayment, 2000);

        return () => clearTimeout(timer);

    }, [status, orderId, navigate, context]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center items-center min-h-[60vh]">
            <SpinnerIcon className="w-12 h-12 text-brand-gold animate-spin" />
            <h1 className="text-2xl font-semibold mt-4">
                {status === 'success' ? 'Finalizing your order...' : 'Handling payment status...'}
            </h1>
            <p>Please wait, you will be redirected shortly.</p>
        </div>
    );
};

export default ThawaniCallbackPage;
