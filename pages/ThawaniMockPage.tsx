import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ThawaniMockPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (status === 'success' && orderId) {
            // Redirect to the actual order confirmation page
            setTimeout(() => {
                navigate(`/order-confirmation?orderId=${orderId}`);
            }, 2000); // Simulate processing time
        } else {
            // Handle failure or cancellation
             setTimeout(() => {
                navigate(`/cart`); // Redirect back to cart on failure
            }, 2000);
        }
    }, [status, orderId, navigate]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">
                    {status === 'success' ? 'Processing your payment...' : 'Payment failed...'}
                </h1>
                <p>Please wait while we redirect you.</p>
            </div>
        </div>
    );
};

export default ThawaniMockPage;
